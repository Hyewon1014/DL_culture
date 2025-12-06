import React, { useRef, useState } from 'react';

const LandingPage = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const [language, setLanguage] = useState("ko");
    const [nationality, setNationality] = useState("Korea");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file, language, nationality);
        }
    };

    // ... (startCamera, stopCamera 함수는 기존과 동일)
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCameraOpen(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
        } catch (err) {
            alert("카메라 권한을 확인해주세요.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };
    // ...

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
                // ⚠️ 수정됨: 카메라 캡처 시에도 언어/국적 전달
                onUpload(file, language, nationality);
                stopCamera();
            }, 'image/jpeg');
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>문화재 AI 도슨트</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                사진을 찍으면 당신의 언어와 문화에 맞춰<br />친절하게 설명해드립니다.
            </p>

            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <label>언어:</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "5px" }}>
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <label>국적:</label>
                    <select value={nationality} onChange={(e) => setNationality(e.target.value)} style={{ padding: "5px" }}>
                        <option value="Korea">한국 (Korea)</option>
                        <option value="USA">미국 (USA)</option>
                        <option value="Japan">일본 (Japan)</option>
                        <option value="China">중국 (China)</option>
                        <option value="France">프랑스 (France)</option>
                        <option value="Germany">독일 (Germany)</option>
                    </select>
                </div>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => fileInputRef.current.click()}>사진 업로드</button>
                <button className="btn-secondary" onClick={startCamera}>카메라 켜기</button>
            </div>

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
