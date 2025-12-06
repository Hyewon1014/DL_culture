// Python Backend Service

// 이미지 분석 요청 — 언어/국적 추가됨
export const analyzeImage = async (file, language, nationality) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);      // 추가됨
    formData.append('nationality', nationality); // 추가됨

    try {
        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error("Analysis Error:", error);
        if (error.message.includes("Failed to fetch")) {
            alert("백엔드 서버가 연결되지 않았습니다. 'backend' 폴더에서 'uvicorn main:app --reload'를 실행해주세요.");
        }
        throw error;
    }
};


// AI 챗봇 — 언어/국적 추가
export const chatWithAI = async (message, context, history, language, nationality) => {
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                message: message,
                context: context.name || "알 수 없는 문화재",
                language: language,        // 추가됨
                nationality: nationality   // 추가됨
            }),
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Chat Error:", error);
        return "죄송합니다. AI 서버와 연결할 수 없습니다.";
    }
};
