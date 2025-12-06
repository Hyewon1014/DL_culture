// aiService.js

// Flask 서버 주소 (기본 포트 5000)
const API_BASE_URL = 'http://127.0.0.1:5000';

// 1. 이미지 분석 요청
export const analyzeImage = async (file, language, nationality) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    formData.append('country', nationality); 

    try {
        // 엔드포인트 수정: /predict -> /analyze
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Backend Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error("Analysis Error:", error);
        if (error.message.includes("Failed to fetch")) {
            alert("Flask 서버가 켜져있지 않습니다. 터미널에서 'python app.py'를 실행했는지 확인해주세요.");
        }
        throw error;
    }
};


// 2. AI 챗봇 (후속 질문)

export const chatWithAI = async (userId, message, language) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId, 
                question: message, 
                language: language
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Backend Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response; 
        
    } catch (error) {
        console.error("Chat Error:", error);
        throw error; 
    }
};
