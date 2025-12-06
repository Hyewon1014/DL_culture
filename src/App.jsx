import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ResultPage from './components/ResultPage';
import ChatInterface from './components/ChatInterface';
import { analyzeImage } from './services/aiService';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // 언어/국적 상태
  const [language, setLanguage] = useState("ko");
  const [nationality, setNationality] = useState("Korea");

  // 이미지 분석 요청 함수
  const handleImageUpload = async (file, selectedLang, selectedNation) => {
    // 선택된 값으로 상태 업데이트
    setLanguage(selectedLang);
    setNationality(selectedNation);

    setSelectedImage(URL.createObjectURL(file));
    setCurrentView('loading');

    try {
      // ⚠️ 수정됨: 언어와 국적 정보를 함께 전달
      const result = await analyzeImage(file, selectedLang, selectedNation);
      setAnalysisResult(result);
      setCurrentView('result');
    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다: " + error.message);
      setCurrentView('landing');
    }
  };

  const handleReset = () => {
    setCurrentView('landing');
    setAnalysisResult(null);
    setSelectedImage(null);
  };

  return (
    <div className="app-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      
      {currentView === 'landing' && (
        <LandingPage onUpload={handleImageUpload} />
      )}

      {currentView === 'loading' && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loader" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>AI가 문화재를 분석 중입니다...</h2>
          <p>{nationality} 문화권에 맞춘 해설을 생성하고 있습니다.</p>
        </div>
      )}

      {currentView === 'result' && analysisResult && (
        <ResultPage
          result={analysisResult}
          image={selectedImage}
          onReset={handleReset}
          onChat={() => setCurrentView('chat')}
        />
      )}

      {currentView === 'chat' && (
        <ChatInterface
          data={{
            result: analysisResult,
            language,
            nationality,
          }}
          onBack={() => setCurrentView('result')}
        />
      )}
    </div>
  );
}

export default App;
