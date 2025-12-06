import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/aiService';

const ChatInterface = ({ data, onBack }) => {
    const { result, language, nationality } = data; // App.jsx에서 넘겨준 데이터 구조

    const welcomeMessages = {
        ko: `안녕하세요! ${result.name}에 대해 더 궁금한 점이 있으신가요?`,
        en: `Hello! What else would you like to know about ${result.name}?`,
        jp: `こんにちは！ ${result.name} について他に知りたいことはありますか？`,
        zh: `你好！ 关于 ${result.name} 还有什么想了解的吗？`
    };

    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: welcomeMessages[language] || welcomeMessages.en }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // ⚠️ 수정됨: aiService.js의 chatWithAI(userId, message, language) 대신
            // 여기서는 message, contextName, language, nationality 순서로 전달합니다.
            const reply = await chatWithAI(
                input,          // 질문
                result.name,    // 문화재 이름 (context)
                language,       // 언어
                nationality     // 국적
            );

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "오류가 발생했습니다. 다시 시도해주세요." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: '0' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                <span style={{ fontWeight: 'bold' }}>{result.name} ({nationality} 모드)</span>
                <div style={{ width: '20px' }}></div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? '#007bff' : '#f1f3f5',
                        color: msg.role === 'user' ? '#fff' : '#333',
                        padding: '10px 15px',
                        borderRadius: '15px',
                        maxWidth: '80%'
                    }}>
                        {msg.content}
                    </div>
                ))}
                {isLoading && <div style={{ alignSelf: 'flex-start', color: '#999', fontSize: '0.9rem' }}>...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="질문을 입력하세요..."
                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }}
                />
                <button onClick={handleSend} disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>전송</button>
            </div>
        </div>
    );
};

export default ChatInterface;
