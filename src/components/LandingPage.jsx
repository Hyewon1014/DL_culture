import React, { useRef, useState } from 'react';

const LandingPage = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    // ... (videoRef, canvasRef, isCameraOpen 등 기존 로직 유지)

    // 언어/국적 상태
    const [language, setLanguage] = useState("ko");
    const [nationality, setNationality] = useState("Korea");

    // ... (handleFileChange, startCamera, stopCamera, captureImage 등 기존 로직 유지)
    // 💡 참고: onUpload 시 language, nationality를 전달하는 로직은 이미 반영됨.

    return (
        <div className="glass-panel animate-fade-in">
            <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                Culture AI 도슨트
            </h1>
            <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                사진을 찍거나 업로드하여, 당신의 문화에 맞춘 설명을 들어보세요.
            </p>

            {/* --- 언어 + 국적 선택 UI (고급 스타일링 적용) --- */}
            <div style={{ 
                marginBottom: '3rem', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '25px',
                padding: '1rem',
                borderRadius: '12px'
            }}>
                <div style={{ textAlign: 'left', width: '40%' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>🗣️ 설명 언어:</label>
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="custom-select" /* CSS에서 추가 스타일링 가능 */
                    >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                    </select>
                </div>

                <div style={{ textAlign: 'left', width: '40%' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>🌍 문화권 (국적):</label>
                    <select 
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="custom-select"
                    >
                        <option value="Korea">한국 (Korea)</option>
                        <option value="USA">미국 (USA)</option>
                        <option value="Japan">일본 (Japan)</option>
                        <option value="China">중국 (China)</option>
                        <option value="France">프랑스 (France)</option>
                        <option value="Germany">독일 (Germany)</option>
                    </select>
                </div>
            </div>

            {/* --- 업로드 영역 --- */}
            <div
                style={{
                    border: '3px dashed var(--glass-border)',
                    borderRadius: '20px',
                    padding: '3rem',
                    marginBottom: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖼️</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>여기를 클릭하여 사진 업로드</p>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

            {/* --- 버튼 영역 --- */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => fileInputRef.current.click()}>
                    🖼️ 파일로 시작
                </button>
                <button className="btn-secondary" onClick={startCamera}>
                    📸 카메라 촬영
                </button>
            </div>

            {/* ... (Camera Modal 로직 유지) ... */}
        </div>
    );
};

export default LandingPage;
