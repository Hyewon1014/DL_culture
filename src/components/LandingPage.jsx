import React, { useRef, useState } from 'react';

const LandingPage = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // 언어 + 국적 상태 추가
    const [language, setLanguage] = useState("ko");
    const [nationality, setNationality] = useState("Korea");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file, language, nationality);  // 언어 + 국적 추가 전달
        }
    };

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
                onUpload(file, language, nationality);  // 언어 + 국적 추가 전달
                stopCamera();
            }, 'image/jpeg');
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                문화재 찾기
            </h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                사진을 찍거나 업로드하여<br />우리 문화재의 이야기를 들어보세요.
            </p>

            {/* 언어 + 국적 선택 UI */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ marginRight: '10px' }}>언어 선택:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ padding: "6px", borderRadius: "6px" }}
                >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                </select>

                <br /><br />

                <label style={{ marginRight: '10px' }}>국적 선택:</label>
                <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    style={{ padding: "6px", borderRadius: "6px" }}
                >
                    <option value="Korea">한국</option>
                    <option value="USA">미국</option>
                    <option value="Japan">일본</option>
                    <option value="China">중국</option>
                    <option value="France">프랑스</option>
                </select>
            </div>

            {/* 업로드 영역 */}
            <div
                style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s'
                }}
                onClick={() => fileInputRef.current.click()}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                <p>여기를 클릭하여 사진 업로드</p>
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => fileInputRef.current.click()}>
                    사진 업로드
                </button>
                <button className="btn-secondary" onClick={startCamera}>
                    카메라 켜기
                </button>
            </div>

            {/* Camera Modal */}
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
