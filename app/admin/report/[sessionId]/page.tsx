"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import KeywordCloud from '../../../../components/KeywordCloud';
import SimpleRadarChart from '../../../../components/chart/SimpleRadarChart';

interface SessionFullData {
  session: any;
  analyses: any[];
  feedbacks: any[];
  recipes: any[];
  confirmed: any[];
  formattedPhone: string;
  userId: string;
  sessionId: string;
}

interface GeneratedReport {
  executiveSummary: string;
  personalityAnalysis: string;
  fragranceJourney: string;
  recommendationReason: string;
  futureGuidance: string;
  personalMessage: string;
  technicalNotes: string;
  qualityScore: number;
  confidenceLevel: string;
}

// 노트북 레이아웃 설정
const NOTEBOOK_LAYOUT = {
  container: { width: 800, height: 600 },
  elements: {
    image: { x: 30, y: 110, width: 155, height: 185 },
    traitChart: { x: 30, y: 295, width: 155, height: 185 }, // 이미지 바로 아래, 같은 사이즈
    colorPalette: { x: 30, y: 462, width: 155, height: 80 }, // 레이더 차트 바로 아래
    name: { x: 290, y: 120, width: 120, height: 35 }, // 위로 15px 이동, width 180->120으로 축소, height 증가
    gender: { x: 290, y: 155, width: 100, height: 30 }, // 왼쪽으로 20px 이동 (310 -> 290)
    keywords: { x: 175, y: 205, width: 170, height: 90 },
    radarChart: { x: 40, y: 300, width: 160, height: 160 },
    features: { x: 185, y: 330, width: 180, height: 90 },
    colorType: { x: 185, y: 460, width: 180, height: 120 },
    // 오른쪽 페이지 (SCENT PROFILE)
    fragranceNotes: { x: 550, y: 115, width: 320, height: 100 },
    scentChart: { x: 440, y: 220, width: 320, height: 180 },
    seasonTime: { x: 427, y: 433, width: 340, height: 200 },
  }
};

// 자동 크기 조정 텍스트 컴포넌트
interface AutoResizeTextProps {
  text: string;
  maxWidth: number;
  style?: React.CSSProperties;
}

const AutoResizeText: React.FC<AutoResizeTextProps> = ({ text, maxWidth, style = {} }) => {
  const [fontSize, setFontSize] = useState(14);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // 더 정교한 폰트 크기 계산 로직
    const textLength = text.length;
    let calculatedFontSize = 14;

    // 다양한 경우의 수를 고려한 반응형 폰트 크기 조정
    if (textLength <= 3) {
      calculatedFontSize = 14; // 매우 짧은 이름 (예: 김완빈)
    } else if (textLength <= 5) {
      calculatedFontSize = 13; // 짧은 이름 (예: 김완빈이)
    } else if (textLength <= 7) {
      calculatedFontSize = 12; // 보통 이름 (예: 김완빈입니다)
    } else if (textLength <= 9) {
      calculatedFontSize = 10; // 긴 이름
    } else if (textLength <= 12) {
      calculatedFontSize = 8; // 매우 긴 이름
    } else if (textLength <= 15) {
      calculatedFontSize = 7; // 극도로 긴 이름
    } else if (textLength <= 18) {
      calculatedFontSize = 6; // 초과 긴 이름
    } else {
      calculatedFontSize = 5; // 최소 폰트 크기
    }

    // 최소/최대 폰트 크기 제한
    calculatedFontSize = Math.max(5, Math.min(14, calculatedFontSize));

    setFontSize(calculatedFontSize);
  }, [text, maxWidth]);

  return (
    <span
      ref={textRef}
      style={{
        fontSize: `${fontSize}px`,
        maxWidth: `${maxWidth}px`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        ...style
      }}
    >
      {text}
    </span>
  );
};

// 노트북 요소 컴포넌트
interface NotebookElementProps {
  elementKey: keyof typeof NOTEBOOK_LAYOUT.elements;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const NotebookElement: React.FC<NotebookElementProps> = ({ 
  elementKey, 
  children, 
  className = "",
  style = {} 
}) => {
  const config = NOTEBOOK_LAYOUT.elements[elementKey];
  if (!config) return null;
  
  return (
    <div 
      className={`notebook-element ${className}`}
      style={{
        position: 'absolute',
        left: `${config.x}px`,
        top: `${config.y}px`,
        width: `${config.width}px`,
        height: `${config.height}px`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default function ReportPage() {
  const params = useParams();
  const [sessionData, setSessionData] = useState<SessionFullData | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      const fullSessionId = params.sessionId as string;
      const underscoreIndex = fullSessionId.indexOf('_');
      if (underscoreIndex === -1) {
        throw new Error('잘못된 세션 ID 형식입니다.');
      }
      
      const userId = fullSessionId.substring(0, underscoreIndex);
      const sessionId = fullSessionId.substring(underscoreIndex + 1);
      
      console.log('파싱된 데이터:', { userId, sessionId, fullSessionId });

      const response = await fetch('/api/admin-firestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionData(data.data);
        
        const session = data.data.session;
        if (session?.generatedReport) {
          console.log('캐시된 AI 보고서 발견:', session.generatedReport);
          setGeneratedReport(session.generatedReport);
        } else {
          console.log('AI 보고서 생성 스킵 (API 오류로 인해)');
        }
      } else {
        setError(data.error || '데이터 로드 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로드 오류');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '알 수 없음';
    
    let date;
    if (typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '알 수 없음';
    }
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 안전한 문자열 변환 함수
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      try {
        return Object.entries(value)
          .map(([key, val]) => `${key}: ${safeStringify(val)}`)
          .join(', ');
      } catch {
        return '[객체]';
      }
    }
    return String(value);
  };



  // 특성 바 차트 컴포넌트
  const ScentBarChart = ({ characteristics }: { characteristics: any }) => {
    if (!characteristics) return null;

    const scentData = [
      { name: '시트러스', value: characteristics.citrus || 0, color: '#FCD34D', emoji: '🍋' },
      { name: '플로럴', value: characteristics.floral || 0, color: '#F472B6', emoji: '🌸' },
      { name: '우디', value: characteristics.woody || 0, color: '#FB923C', emoji: '🌳' },
      { name: '머스크', value: characteristics.musk || 0, color: '#A78BFA', emoji: '✨' },
      { name: '프루티', value: characteristics.fruity || 0, color: '#EF4444', emoji: '🍎' },
      { name: '스파이시', value: characteristics.spicy || 0, color: '#F97316', emoji: '🌶️' }
    ];

    return (
      <div style={{ marginTop: '16px' }}>
        {scentData.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', marginRight: '6px' }}>{item.emoji}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', width: '50px', color: '#374151' }}>
              {item.name}
            </span>
            <div style={{ 
              flex: 1, 
              height: '16px', 
              background: '#F3F4F6', 
              borderRadius: '8px', 
              marginLeft: '8px',
              marginRight: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(item.value / 10) * 100}%`,
                height: '100%',
                background: item.color,
                borderRadius: '8px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151', width: '20px' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // 계절/시간 아이콘 컴포넌트
  const SeasonTimeIcons = () => {
    // 실제 데이터에서 주요 카테고리와 점수 추출
    const getCategoryInfo = () => {
      // 여러 경로에서 향수 카테고리 데이터 찾기
      const characteristics = sessionData?.session?.imageAnalysis?.matchingPerfumes?.[0]?.persona?.categories ||
                             sessionData?.analyses?.[0]?.scentCategories || 
                             sessionData?.analyses?.[0]?.fragranceCharacteristics ||
                             sessionData?.session?.imageAnalysis?.scentCategories ||
                             sessionData?.session?.imageAnalysis?.fragranceCharacteristics;
      
      if (!characteristics) {
        console.log('프린트 보고서: 향수 카테고리 데이터를 찾을 수 없습니다.');
        return { categoryName: 'citrus', score: 5 }; // 기본값
      }
      
      const entries = Object.entries(characteristics);
      const sorted = entries.sort(([, a], [, b]) => (b as number) - (a as number));
      const [categoryName, score] = sorted[0] || ['citrus', 5];
      
      console.log('프린트 보고서: 카테고리 정보 추출 완료', { categoryName, score });
      return { categoryName, score: score as number };
    };

    const { categoryName, score } = getCategoryInfo();

    // 계절 추천 로직 - 점수에 따른 차등 추천 (절대 4개 모두 선택 안 됨)
    const getSeasonRecommendation = () => {
      if (categoryName === 'citrus') {
        if (score >= 8) return ['여름'];           // 매우 강함: 1개
        if (score >= 6) return ['봄', '여름'];     // 강함: 2개
        return ['봄', '여름', '가을'];             // 보통: 3개 (겨울 제외)
      } else if (categoryName === 'fruity') {
        if (score >= 8) return ['여름'];           
        if (score >= 6) return ['봄', '여름'];     
        return ['봄', '여름', '가을'];             
      } else if (categoryName === 'woody') {
        if (score >= 8) return ['겨울'];           
        if (score >= 6) return ['가을', '겨울'];   
        return ['여름', '가을', '겨울'];           // 봄 제외
      } else if (categoryName === 'spicy') {
        if (score >= 8) return ['겨울'];           
        if (score >= 6) return ['가을', '겨울'];   
        return ['여름', '가을', '겨울'];           
      } else if (categoryName === 'floral') {
        if (score >= 8) return ['봄'];             
        if (score >= 6) return ['봄', '여름'];     
        return ['봄', '여름', '가을'];             
      } else { // musky or unknown
        if (score >= 8) return ['겨울'];           
        if (score >= 6) return ['가을', '겨울'];   
        return ['봄', '가을', '겨울'];             // 여름 제외
      }
    };

    // 시간대 추천 로직 - 점수에 따른 차등 추천 (절대 4개 모두 선택 안 됨)
    const getTimeRecommendation = () => {
      if (categoryName === 'citrus') {
        if (score >= 8) return ['오전'];           // 매우 상쾌함
        if (score >= 6) return ['오전', '오후'];   
        return ['오전', '오후', '저녁'];           // 밤 제외
      } else if (categoryName === 'fruity') {
        if (score >= 8) return ['오전'];           
        if (score >= 6) return ['오전', '오후'];   
        return ['오전', '오후', '저녁'];           
      } else if (categoryName === 'woody') {
        if (score >= 8) return ['밤'];             // 매우 깊음
        if (score >= 6) return ['저녁', '밤'];     
        return ['오후', '저녁', '밤'];             // 오전 제외
      } else if (categoryName === 'musky') {
        if (score >= 8) return ['밤'];             
        if (score >= 6) return ['저녁', '밤'];     
        return ['오후', '저녁', '밤'];             
      } else if (categoryName === 'floral') {
        if (score >= 8) return ['오후'];           // 우아한 시간
        if (score >= 6) return ['오전', '오후'];   
        return ['오전', '오후', '저녁'];           
      } else { // spicy or unknown
        if (score >= 8) return ['저녁'];           // 강렬한 시간
        if (score >= 6) return ['저녁', '밤'];     
        return ['오전', '저녁', '밤'];             // 오후 제외
      }
    };

    const seasonRecommendation = getSeasonRecommendation();
    const timeRecommendation = getTimeRecommendation();

    return (
      <div style={{ display: 'flex', gap: '16px', marginTop: '0px' }}>
        <div>
          <div style={{ 
            background: 'white', 
            border: '2px solid #000000',
            borderRadius: '12px', 
            padding: '12px 8px',
            display: 'flex',
            gap: '0px',
            justifyContent: 'center'
          }}>
            {['봄', '여름', '가을', '겨울'].map((season, idx) => {
              const isRecommended = seasonRecommendation.includes(season);
              const emojis = ['🌸', '☀️', '🍂', '❄️'];
              
              return (
                <div key={season} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: isRecommended ? '#374151' : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>{emojis[idx]}</div>
                  <div style={{ fontSize: '8px', color: '#6B7280' }}>{season}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <div style={{ 
            background: 'white', 
            border: '2px solid #000000',
            borderRadius: '12px', 
            padding: '12px 8px',
            display: 'flex',
            gap: '0px',
            justifyContent: 'center'
          }}>
            {['오전', '오후', '저녁', '밤'].map((time, idx) => {
              const isRecommended = timeRecommendation.includes(time);
              const emojis = ['🌅', '☀️', '🌆', '🌙'];
              
              return (
                <div key={time} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: isRecommended ? '#374151' : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>{emojis[idx]}</div>
                  <div style={{ fontSize: '8px', color: '#6B7280' }}>{time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: '#6B7280' }}>보고서 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center', color: '#EF4444' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>❌</div>
          <div>오류: {error || '데이터를 찾을 수 없습니다.'}</div>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: '#6366F1',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              marginTop: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const { session } = sessionData;

  return (
    <>
      {/* 노트북 스타일 프린트 보고서 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&family=Nanum+Gothic:wght@400;700;800&family=Nanum+Pen+Script&display=swap');
        
        @page {
          size: A4 landscape;
          margin: 0;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          background: #F9FAFB !important;
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        .notebook-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          background: #F9FAFB !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .notebook-wrapper {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 800px !important;
          height: 600px !important;
          background: url('/background.svg') center center !important;
          background-size: 800px 600px !important;
          background-repeat: no-repeat !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
          overflow: hidden !important;
          display: flex !important;
          margin: 0 !important;
          padding: 0 !important;
          min-width: 800px !important;
          min-height: 600px !important;
          max-width: 800px !important;
          max-height: 600px !important;
        }
        
        .content-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 800px !important;
          height: 600px !important;
          padding: 40px !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          margin: 0 !important;
        }
        
        .notebook-element {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
        }
        
        .image-area {
          border: 2px dashed #000000 !important;
          background: rgba(0, 0, 0, 0.1) !important;
          border-radius: 8px !important;
        }
        
        .main-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 8px !important;
        }
        
        .image-placeholder {
          width: 100% !important;
          height: 100% !important;
          background: #F3F4F6 !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 48px !important;
          color: #9CA3AF !important;
        }
        
        .action-buttons {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          display: flex;
          gap: 12px;
        }
        
        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn-back {
          background: rgba(0,0,0,0.8);
          color: white;
          backdrop-filter: blur(10px);
        }
        
        .btn-back:hover {
          background: rgba(0,0,0,0.9);
          transform: translateY(-2px);
        }
        
        .btn-print {
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          color: #374151;
        }
        
        .btn-print:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(252, 211, 77, 0.4);
        }
        
        /* 모든 화면 크기에서 동일한 고정 스타일 강제 */
        @media screen and (max-width: 1200px), 
               screen and (max-height: 800px),
               screen and (min-width: 1px) {
          .notebook-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
            background: #F9FAFB !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .notebook-wrapper {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 800px !important;
            height: 600px !important;
            background: url('/background.svg') center center !important;
            background-size: 800px 600px !important;
            background-repeat: no-repeat !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
            overflow: hidden !important;
            display: flex !important;
            margin: 0 !important;
            padding: 0 !important;
            min-width: 800px !important;
            min-height: 600px !important;
            max-width: 800px !important;
            max-height: 600px !important;
          }
          
          .notebook-element {
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }
          
          .image-area {
            border: 2px dashed #000000 !important;
            background: rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
          }
        }

        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            width: 100vw !important;
            height: 100vh !important;
          }
          
          .notebook-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 0 !important;
          }
          
          .action-buttons {
            display: none !important;
          }
          
          .notebook-wrapper {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 800px !important;
            height: 600px !important;
            background: url('/background.svg') center center !important;
            background-size: 800px 600px !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-shadow: none !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            display: flex !important;
            margin: 0 !important;
            padding: 0 !important;
            min-width: 800px !important;
            min-height: 600px !important;
            max-width: 800px !important;
            max-height: 600px !important;
          }
          
          .notebook-element {
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }
          
          .image-area {
            border: 2px dashed #000000 !important;
            background: rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
          }
          
          .content-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 800px !important;
            height: 600px !important;
            padding: 40px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* 액션 버튼들 */}
      <div className="action-buttons">
        <button 
          onClick={() => window.history.back()}
          className="btn btn-back"
        >
          ← 뒤로 가기
        </button>
        <button 
          onClick={() => window.print()}
          className="btn btn-print"
        >
          🖨️ 프린트하기
        </button>
      </div>

      {/* 배경 위에 컴포넌트들 배치 */}
      <div className="notebook-container">
        <div className="notebook-wrapper">
          {/* 새로운 시스템으로 이미지 영역 배치 */}
          <NotebookElement elementKey="image" className="image-area">
            {session?.imageUrl ? (
              <img 
                src={session.imageUrl} 
                alt="최애 이미지" 
                className="main-image"
              />
            ) : (
              <div className="image-placeholder">
                🖼️
              </div>
            )}
          </NotebookElement>
          
          {/* NAME 영역 */}
          <NotebookElement elementKey="name">
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              height: '100%',
              width: '80%',
              overflow: 'hidden'
            }}>
              {/* 실제 이름 값 - 고정 폰트 크기 */}
              <span style={{
                fontSize: '14px',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                fontWeight: '600', 
                color: '#1F2937',
                lineHeight: '1.2'
              }}>
                {sessionData?.analyses?.[0]?.idolInfo?.name || sessionData?.analyses?.[0]?.name || session?.idolName || session?.name || '김완빈'}
              </span>
            </div>
          </NotebookElement>
          
          {/* GENDER 영역 */}
          <NotebookElement elementKey="gender">
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',  // 왼쪽 정렬 추가
              gap: '0px',
              height: '100%',
              paddingLeft: '0px'  // 패딩 제거
            }}>
              {/* 실제 성별 값 */}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1F2937',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                marginLeft: '0px',  // 마진 제거
                paddingLeft: '0px', // 패딩 제거
                textAlign: 'left'   // 텍스트 왼쪽 정렬
              }}>
                {sessionData?.analyses?.[0]?.idolInfo?.gender || sessionData?.analyses?.[0]?.gender || session?.gender || '남성'}
              </span>
            </div>
          </NotebookElement>
          
          {/* KEYWORDS 영역 */}
          <NotebookElement elementKey="keywords">
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              height: '100%'
            }}>
              {/* 키워드 클라우드 */}
              <div style={{ 
                flex: 1,
                width: '100%',
                height: '60px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid transparent'
              }}>
                <KeywordCloud 
                  keywords={sessionData?.analyses?.[0]?.matchingKeywords || session?.keywords || ['활발함', '밝음', '청량함']} 
                  scattered={true}
                  minFontSize={0.5}
                  maxFontSize={0.7}
                  spreadRange={60}
                  minDistance={15}
                />
              </div>
            </div>
          </NotebookElement>

          {/* TRAIT CHART 영역 */}
          <NotebookElement elementKey="traitChart">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* 분석 결과에서 traits 데이터 가져오기 */}
              {sessionData?.analyses?.[0]?.traits ? (
                <SimpleRadarChart 
                  traits={sessionData.analyses[0].traits} 
                  size={160}
                />
              ) : (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6B7280'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>특성 분석 데이터</span>
                  <span style={{ fontSize: '12px' }}>분석 중...</span>
                </div>
              )}
            </div>
          </NotebookElement>

          {/* FEATURES 영역 */}
          <NotebookElement elementKey="features">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px'
            }}>
              {/* 상위 3개 특성 표시 */}
              <div style={{
                background: 'white',
                border: '2px solid #374151',
                borderRadius: '12px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {sessionData?.analyses?.[0]?.traits ? (() => {
                  // 특성 데이터에서 상위 3개 추출
                  const traits = sessionData.analyses[0].traits;
                  const traitNames: Record<string, string> = {
                    sexy: '섹시함',
                    cute: '귀여움',
                    charisma: '카리스마',
                    darkness: '다크함',
                    freshness: '청량함',
                    elegance: '우아함',
                    freedom: '자유로움',
                    luxury: '럭셔리함',
                    purity: '순수함',
                    uniqueness: '독특함'
                  };

                  const sortedTraits = Object.entries(traits)
                    .map(([key, value]) => ({
                      key,
                      name: traitNames[key] || key,
                      value: Number(value) || 0
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3);

                  return sortedTraits.map((trait, index) => (
                    <div key={trait.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '8px',
                          fontWeight: '700'
                        }}>{index + 1}</span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '900',
                        color: '#374151'
                      }}>{trait.name}</span>
                    </div>
                  ));
                })() : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#6B7280'
                  }}>
                    <span style={{ fontSize: '12px' }}>분석 중...</span>
                  </div>
                )}
              </div>
            </div>
          </NotebookElement>

          {/* COLOR TYPE 영역 */}
          <NotebookElement elementKey="colorType">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '6px'
            }}>
              {/* COLOR TYPE 내용 */}
              <div style={{
                background: 'white',
                border: '2px solid #374151',
                borderRadius: '12px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px'
              }}>
                {/* 컬러 타입 헤더 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: sessionData?.analyses?.[0]?.personalColor?.palette?.[0] || '#FFC0CB',
                    border: '1px solid #374151',
                    flexShrink: 0
                  }}></div>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '700', 
                    color: '#374151',
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {sessionData?.analyses?.[0]?.personalColor?.season && sessionData?.analyses?.[0]?.personalColor?.tone
                      ? `${sessionData.analyses[0].personalColor.season.toUpperCase()} ${sessionData.analyses[0].personalColor.tone.toUpperCase()}`
                      : 'SPRING LIGHT'}
                  </span>
                </div>
                
                {/* 컬러 타입 설명 */}
                <div style={{
                  textAlign: 'left',
                  marginTop: '0px',
                  fontSize: '9px',
                  color: '#374151',
                  lineHeight: '1.4',
                  letterSpacing: '-0.2px'
                } as React.CSSProperties}>
                  {/* 동적 데이터 사용 예시 */}
                  {sessionData?.analyses?.[0]?.personalColor?.description || 
                   '"봄 웜톤의 따스하고 부드러운 라이트 톤! 밝은 파스텔 핑크빛 스타일링이 찰떡궁합!"'}
                </div>
              </div>
            </div>
          </NotebookElement>

          {/* COLOR PALETTE 영역 */}
          <NotebookElement elementKey="colorPalette">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px'
            }}>
              {/* 컬러 팔레트 */}
              <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '6px',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* 기본 컬러 팔레트 (분석 결과가 있으면 해당 데이터 사용) */}
                {sessionData?.analyses?.[0]?.personalColor?.palette ? 
                  sessionData.analyses[0].personalColor.palette.map((color: string, index: number) => (
                    <div 
                      key={index}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={color}
                    />
                  )) : 
                  // 기본 팔레트
                  ['#FFC0CB', '#FFFFFF', '#F3E5F5', '#F8BBD0', '#FCE4EC'].map((color, index) => (
                    <div 
                      key={index}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={color}
                    />
                  ))
                }
              </div>
            </div>
          </NotebookElement>

                    {/* SCENT PROFILE 영역 - 오른쪽 페이지 */}
          <NotebookElement elementKey="fragranceNotes">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px'
            }}>

                
              {/* 향수 노트들 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flex: 1
              }}>
                {/* TOP NOTE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '6px 12px 4px 12px',
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#000000',
                      fontFamily: '"Noto Sans KR", "Nanum Gothic", "Malgun Gothic", sans-serif'
                    }}>
                      {sessionData?.matchingPerfumes?.[0]?.persona?.mainScent?.name || 
                       sessionData?.analyses?.[0]?.matchingPerfumes?.[0]?.persona?.mainScent?.name || 
                       sessionData?.confirmed?.[0]?.mainScent?.name || 
                       '블랙베리'}
                    </span>
                  </div>
                </div>

                {/* MIDDLE NOTE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                <div style={{ 
                    padding: '3px 12px 4px 12px',
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#000000',
                      fontFamily: '"Noto Sans KR", "Nanum Gothic", "Malgun Gothic", sans-serif'
                    }}>
                      {sessionData?.matchingPerfumes?.[0]?.persona?.subScent1?.name || 
                       sessionData?.analyses?.[0]?.matchingPerfumes?.[0]?.persona?.subScent1?.name || 
                       sessionData?.confirmed?.[0]?.subScent1?.name || 
                       '월계수잎'}
                    </span>
                  </div>
                </div>

                {/* BASE NOTE */}
                  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '4px 12px',
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#000000',
                      fontFamily: '"Noto Sans KR", "Nanum Gothic", "Malgun Gothic", sans-serif'
                    }}>
                      {sessionData?.matchingPerfumes?.[0]?.persona?.subScent2?.name || 
                       sessionData?.analyses?.[0]?.matchingPerfumes?.[0]?.persona?.subScent2?.name || 
                       sessionData?.confirmed?.[0]?.subScent2?.name || 
                       '시더우드'}
                    </span>
              </div>
          </div>
              </div>
            </div>
          </NotebookElement>

          {/* 향료 그래프 영역 */}
          <NotebookElement elementKey="scentChart">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px'
            }}>
              {/* 향료 분석 결과 표시 */}
              <ScentBarChart 
                characteristics={
                  sessionData?.analyses?.[0]?.scentCategories || 
                  sessionData?.analyses?.[0]?.fragranceCharacteristics || {
                    citrus: 8,
                    floral: 2,
                    woody: 3,
                    musk: 3,
                    fruity: 6,
                    spicy: 3
                  }
                } 
              />
            </div>
          </NotebookElement>

          {/* 계절/시간대 영역 */}
          <NotebookElement elementKey="seasonTime">
            <div style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '34px 22px'
            }}>
              <SeasonTimeIcons />
            </div>
          </NotebookElement>
        </div>
      </div>
    </>
  );
} 