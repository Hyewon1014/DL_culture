// Flask(FastAPI) 서버 주소
const API_BASE_URL = 'http://127.0.0.1:8000';

// 1. 이미지 분석 요청
export const analyzeImage = async (file, language, nationality) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('nationality', nationality); // 백엔드 스키마와 일치

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return data;
    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

// 2. AI 챗봇 대화 요청
export const chatWithAI = async (message, contextName, language, nationality) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: contextName || "문화재",
                language: language,
                nationality: nationality
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reply;
        
    } catch (error) {
        console.error("Chat Error:", error);
        return "죄송합니다. 서버와 연결할 수 없습니다.";
    }
};
