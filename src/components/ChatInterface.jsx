import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/aiService';

const ChatInterface = ({ data, onBack }) => {
    const { result, language, nationality } = data;

    // 초기 메시지를 언어에 맞게 설정
    const welcomeMessages = {
        ko: `안녕하세요! ${result.name}에 대해 무엇이 궁금하신가요?`,
        en: `Hello! What would you like to know about ${result.name}?`,
        jp: `こんにちは！ ${result.name} について何を知りたいですか？`,
        zh: `你好！ 想了解关于 ${result.name} 的什么内容？`
    };

    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([
        { role: 'assistant', content: welcomeMessages[language] || welcomeMessages.ko }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseContent = await chatWithAI(
                input,
                { result, language, nationality },
                messages
            );

            const aiMessage = { role: 'assistant', content: responseContent };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: "죄송합니다. 오류가 발생했습니다." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: '0' }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button className="btn-secondary" onClick={onBack} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                    ← 뒤로
                </button>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {result.name} 챗봇
                </span>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            color: msg.role === 'user' ? '#000' : '#fff',
                            padding: '10px 15px',
                            borderRadius: '12px',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                        }}
                    >
                        {msg.content}
                    </div>
                ))}

                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', color: '#aaa', fontSize: '0.9rem' }}>
                        답변 작성 중...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="궁금한 점을 물어보세요..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        outline: 'none'
                    }}
                />
                <button className="btn-primary" onClick={handleSend} disabled={isLoading}>
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
