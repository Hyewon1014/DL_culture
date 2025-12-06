import React, { useRef, useState } from 'react';

const LandingPage = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // 언어/국적 상태 (로컬 상태)
    const [language, setLanguage] = useState("ko");
    const [nationality, setNationality] = useState("Korea");

    // ✅ 필수 함수: 파일 업로드 처리 함수 (누락되었던 부분)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // App.jsx의 onUpload 함수 호출
            onUpload(file, language, nationality);
        }
    };
    
    // --- 카메라 관련 함수 정의 ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCameraOpen(true);
            setTimeout(() => { 
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                onUpload(file, language, nationality);
                stopCamera();
            }, 'image/jpeg');
        }
    };
    // ----------------------------

    return (
        <div className="glass-panel animate-fade-in">
            <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                Culture AI 도슨트
            </h1>
            <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                사진을 찍거나 업로드하여, 당신의 문화에 맞춘 설명을 들어보세요.
            </p>

            {/* --- 언어 + 국적 선택 UI --- */}
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
                        className="custom-select" 
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

            {/* 파일 인풋 (hidden) - 여기서 handleFileChange가 호출됨 */}
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
            />

            {/* --- 버튼 영역 --- */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => fileInputRef.current.click()}>
                    🖼️ 파일로 시작
                </button>
                <button className="btn-secondary" onClick={startCamera}>
                    📸 카메라 촬영
                </button>
            </div>

            {/* --- Camera Modal (로직 유지) --- */}
            {isCameraOpen && (
                <div className="camera-modal-overlay">
                    <div className="camera-modal-content">
                        <button className="btn-close" onClick={stopCamera}>&times;</button>
                        <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        <div className="camera-controls">
                            <button className="btn-capture" onClick={captureImage}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
