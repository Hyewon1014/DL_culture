from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from torchvision import transforms
from PIL import Image
import io
from model import get_model
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# 환경 변수 로드 (.env 파일이 현재 폴더에 있다고 가정하고 로드)
# 현재 구조에서는 culture_project 루트에 main.py가 있으므로 './.env'를 사용합니다.
load_dotenv('./.env')

app = FastAPI()

# ⚠️ Gemini API 설정 (경고 방지 및 설정)
API_KEY = os.getenv("VITE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("Warning: VITE_API_KEY not found in .env. Gemini functions will use fallback descriptions.")

# CORS 설정 (프론트엔드와 통신 허용 - 모든 출처 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 로컬 및 외부 접속 모두 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 및 클래스 로드 설정
MODEL_PATH = 'culture_model.pth'
CLASS_NAMES_PATH = 'class_names.txt'
# GPU/CPU 자동 감지 (학교 서버에서는 cuda:0, 로컬에서는 cpu)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

model = None
class_names = []

# 고정 설명 데이터 (Gemini 실패 시 백업용)
DESCRIPTIONS_PATH = 'descriptions.json'
DESCRIPTIONS = {}

def load_descriptions():
    global DESCRIPTIONS
    if os.path.exists(DESCRIPTIONS_PATH):
        with open(DESCRIPTIONS_PATH, 'r', encoding='utf-8') as f:
            DESCRIPTIONS = json.load(f)
    else:
        print("descriptions.json not found. Using empty descriptions.")

load_descriptions()

def load_artifacts():
    global model, class_names
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, 'r', encoding='utf-8') as f:
            class_names = [line.strip() for line in f.readlines()]
            
        try:
            # 모델 구조 로드
            model = get_model(len(class_names))
            
            if os.path.exists(MODEL_PATH):
                # ⚠️ map_location=device 사용: 
                # GPU에서 로드 시 cuda, CPU에서 로드 시 cpu 자동 선택
                model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
                model.to(device)
                model.eval()
                print(f"✅ Model loaded successfully on {device}.")
            else:
                print("❌ Model file not found.")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            
    else:
        print("❌ Class names file not found.")

load_artifacts()

def transform_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return transform(image).unsqueeze(0)

# --------------------------
#        PREDICT API
# --------------------------

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    language: str = Form(...),
    nationality: str = Form(...)
):
    print(f"📌 Predict Request: language={language}, nationality={nationality}")

    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded.")
    
    # 1. Vision AI: 이미지 분류
    image_bytes = await file.read()
    tensor = transform_image(image_bytes).to(device)
    
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        topk_probs, topk_indices = torch.topk(probabilities, min(4, len(class_names)))
        
    predicted_index = topk_indices[0][0].item()
    confidence_score = int(topk_probs[0][0].item() * 100)
    class_name = class_names[predicted_index]

    # 2. Generative AI: 맞춤형 설명 생성
    description = ""
    if API_KEY:
        try:
            # 안정적인 1.5 Flash 모델 사용
            model_ai = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            당신은 한국 문화유산 전문 가이드입니다.
            
            [상황]
            - 대상 문화재: {class_name}
            - 관람객 국적: {nationality}
            - 사용 언어: {language}
            
            [요청]
            1. 위 문화재에 대해 {language}로 설명해주세요.
            2. 설명 중간에 {nationality} 문화권의 유명한 건축물, 역사, 또는 개념에 빗대어 이해하기 쉬운 비유(Metaphor)를 반드시 포함하세요.
            3. 3~4문장으로 간결하고 친절하게 작성하세요.
            """
            
            response = model_ai.generate_content(prompt)
            description = response.text.strip()
            print("✅ Gemini description generated")
            
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            description = DESCRIPTIONS.get(class_name, f"AI 설명을 생성할 수 없습니다. ({class_name})")
    else:
        # API 키 없을 때 백업 설명 사용
        description = DESCRIPTIONS.get(class_name, f"API 키가 없어 설명을 생성할 수 없습니다. ({class_name})")

    # 다른 후보군 (Alternatives)
    alternatives = []
    for i in range(1, len(topk_indices[0])):
        idx = topk_indices[0][i].item()
        prob = int(topk_probs[0][i].item() * 100)
        alternatives.append({
            "name": class_names[idx],
            "confidence": prob
        })
    
    return {
        "name": class_name,
        "description": description,
        "matchPercentage": confidence_score,
        "alternatives": alternatives,
        "language": language,
        "nationality": nationality
    }

# --------------------------
#        CHAT API
# --------------------------

class ChatRequest(BaseModel):
    message: str
    context: str
    language: str
    nationality: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API Key not configured for chat.")
    
    try:
        model_ai = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        당신은 한국 문화재 챗봇 도우미입니다.
        
        - 현재 보고 있는 문화재: {request.context}
        - 사용자 언어: {request.language}
        - 사용자 국적: {request.nationality}
        - 사용자 질문: {request.message}

        답변 가이드:
        1. 반드시 {request.language}로 답변하세요.
        2. {request.nationality} 사람의 문화적 배경을 고려하여 친절하게 답변하세요.
        3. 질문에 대한 답변과 함께, 관련된 흥미로운 사실을 짧게 덧붙여주세요.
        """

        response = model_ai.generate_content(prompt)
        return {"reply": response.text}

    except Exception as e:
        print(f"Chat Error: {e}")
        return {"reply": "죄송합니다. 오류가 발생하여 답변할 수 없습니다."}

@app.get("/")
def read_root():
    return {"message": "CultureFinder Backend is running"}
