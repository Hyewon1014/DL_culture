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

  // 언어/국적 저장
  const [language, setLanguage] = useState("ko");
  const [nationality, setNationality] = useState("KR");

  // LandingPage → 이미지 + 언어 + 국적 받아오도록 수정됨
  const handleImageUpload = async (file, selectedLang, selectedNation) => {
    setLanguage(selectedLang);
    setNationality(selectedNation);

    setSelectedImage(URL.createObjectURL(file));
    setCurrentView('loading');

    try {
      const result = await analyzeImage(file, electedLang, selectedNation);
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
    <div className="app-container" style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
      
      {/* 1) 첫 화면 */}
      {currentView === 'landing' && (
        <LandingPage onUpload={handleImageUpload} />
      )}

      {/* 2) 로딩 화면 */}
      {currentView === 'loading' && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="loader" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <h2>문화재를 분석하고 있습니다...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      )}

      {/* 3) 결과 화면 */}
      {currentView === 'result' && analysisResult && (
        <ResultPage
          result={analysisResult}
          image={selectedImage}
          onReset={handleReset}
          onChat={() => setCurrentView('chat')}
        />
      )}

      {/* 4) 챗봇 화면 */}
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
