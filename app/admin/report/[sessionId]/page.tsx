"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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
      // userId_sessionId 형태로 파싱 (예: 01049297430_session_1747987296608_tf245b1)
      const underscoreIndex = fullSessionId.indexOf('_');
      if (underscoreIndex === -1) {
        throw new Error('잘못된 세션 ID 형식입니다.');
      }
      
      const userId = fullSessionId.substring(0, underscoreIndex);
      const sessionId = fullSessionId.substring(underscoreIndex + 1);
      
      console.log('파싱된 데이터:', { userId, sessionId, fullSessionId });

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionData(data.data);
        
        // 캐시된 AI 보고서가 있는지 확인
        const session = data.data.session;
        if (session?.generatedReport) {
          console.log('캐시된 AI 보고서 발견:', session.generatedReport);
          setGeneratedReport(session.generatedReport);
        } else {
          // 캐시된 보고서가 없으면 새로 생성 (하지만 API 오류로 인해 스킵)
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

  // 안전한 배열 렌더링 함수
  const renderSafeArray = (data: any, maxItems: number = 6): React.ReactNode[] => {
    if (!data) return [];
    
    try {
      // 배열인 경우
      if (Array.isArray(data)) {
        return data.slice(0, maxItems).map((item, index) => (
          <span key={index} className="category-tag">
            {safeStringify(item)}
          </span>
        ));
      }
      
      // 객체인 경우
      if (typeof data === 'object') {
        return Object.entries(data).slice(0, maxItems).map(([key, value], index) => (
          <span key={index} className="category-tag">
            {key}: {safeStringify(value)}
          </span>
        ));
      }
      
      // 기타 타입
      return [
        <span key={0} className="category-tag">
          {safeStringify(data)}
        </span>
      ];
    } catch (error) {
      console.error('렌더링 오류:', error);
      return [
        <span key={0} className="category-tag">
          [렌더링 오류]
        </span>
      ];
    }
  };

  // 특성 점수를 원형 진행률로 표시하는 컴포넌트
  const CircularProgress = ({ value, label }: { value: number; label: string }) => {
    const radius = 18;
    const strokeWidth = 3;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${value * circumference / 10} ${circumference}`;

    return (
      <div className="circular-progress">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#f3f4f6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#fbbf24"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={0}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>
        <div className="progress-content">
          <div className="progress-value">{value}</div>
        </div>
        <div className="progress-label">{label}</div>
      </div>
    );
  };

  const TraitsGrid = ({ traits }: { traits: any }) => {
    const traitNames: { [key: string]: string } = {
      sexy: '섹시함',
      cute: '귀여움',
      charisma: '카리스마',
      darkness: '신비로움',
      freshness: '상쾌함',
      elegance: '우아함',
      freedom: '자유로움',
      luxury: '고급스러움',
      purity: '순수함',
      uniqueness: '독특함'
    };

    return (
      <div className="traits-grid">
        {Object.entries(traits).slice(0, 6).map(([key, value]) => (
          <CircularProgress 
            key={key} 
            value={value as number} 
            label={traitNames[key] || key} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg">보고서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-6">❌ 오류 발생</div>
          <p className="text-gray-600 mb-6 text-lg">{error || '데이터를 찾을 수 없습니다.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 font-bold text-lg transition-colors"
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
      {/* A5 가로 고정 스타일 */}
      <style jsx global>{`
        /* A5 가로: 210mm x 148mm */
        @page {
          size: 210mm 148mm;
          margin: 0;
        }
        
        .report-container {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .a5-page {
          width: 210mm;
          height: 148mm;
          background: white;
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          position: relative;
          border: 2px solid #fbbf24;
        }
        
        .page-section {
          width: 50%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .left-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
          color: #92400e;
          padding: 12mm;
          box-sizing: border-box;
          position: relative;
        }
        
        .right-section {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          padding: 12mm;
          box-sizing: border-box;
        }
        
        /* 배경 패턴 */
        .left-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.05) 1px, transparent 1px);
          background-size: 20px 20px, 15px 15px;
          opacity: 0.6;
        }
        
        /* 최애 이미지 스타일 */
        .idol-image-container {
          width: 100%;
          height: 45mm;
          background: rgba(255,255,255,0.3);
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 8px;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(251, 191, 36, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .idol-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 6px;
          border: 1px dashed rgba(251, 191, 36, 0.4);
        }
        
        /* 헤더 스타일 */
        .report-header {
          text-align: center;
          margin-bottom: 8px;
        }
        
        .brand-title {
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 2px;
          color: #92400e;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .report-subtitle {
          font-size: 8px;
          opacity: 0.8;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        /* 정보 카드 (왼쪽) */
        .info-card-left {
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(5px);
          border-radius: 6px;
          padding: 6px;
          margin-bottom: 6px;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .info-label-left {
          font-size: 7px;
          opacity: 0.7;
          margin-bottom: 2px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .info-value-left {
          font-size: 9px;
          font-weight: 700;
        }
        
        /* 원형 진행률 */
        .traits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 8px 0;
        }
        
        .circular-progress {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .progress-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .progress-value {
          font-size: 8px;
          font-weight: 900;
          color: #92400e;
        }
        
        .progress-label {
          font-size: 6px;
          text-align: center;
          margin-top: 4px;
          opacity: 0.8;
          font-weight: 600;
          line-height: 1;
        }
        
        /* 섹션 제목 (왼쪽) */
        .section-title-left {
          font-size: 10px;
          font-weight: 800;
          margin: 8px 0 6px 0;
          padding-bottom: 3px;
          border-bottom: 1px solid rgba(251, 191, 36, 0.4);
          position: relative;
        }
        
        .section-title-left::after {
          content: '✨';
          position: absolute;
          right: 0;
          top: 0;
          font-size: 8px;
        }
        
        /* 오른쪽 섹션 스타일 */
        .section-title-right {
          font-size: 12px;
          font-weight: 800;
          color: #92400e;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 2px solid #fbbf24;
          position: relative;
        }
        
        .section-title-right::after {
          content: '🌟';
          position: absolute;
          right: 0;
          top: 0;
          font-size: 10px;
        }
        
        /* 향수 카드 */
        .perfume-card-new {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
        }
        
        .perfume-card-new::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #fff, #fef3c7, #fff);
        }
        
        .perfume-name-new {
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 4px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .perfume-description-new {
          font-size: 8px;
          line-height: 1.4;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        
        /* 정보 카드 (오른쪽) */
        .info-card-right {
          background: white;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 6px;
          border: 1px solid #fbbf24;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .info-card-right:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }
        
        .info-label-right {
          font-size: 7px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .info-value-right {
          font-size: 9px;
          font-weight: 700;
          color: #374151;
        }
        
        /* 태그 스타일 */
        .category-tag {
          display: inline-block;
          background: rgba(255,255,255,0.3);
          color: #92400e;
          padding: 2px 4px;
          border-radius: 8px;
          font-size: 6px;
          font-weight: 600;
          margin: 1px;
          border: 1px solid rgba(251, 191, 36, 0.4);
          backdrop-filter: blur(3px);
        }
        
        .category-tag-right {
          display: inline-block;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 7px;
          font-weight: 600;
          margin: 1px;
          box-shadow: 0 1px 4px rgba(251, 191, 36, 0.3);
        }
        
        /* 버튼 스타일 */
        .action-buttons {
          position: fixed;
          top: 15px;
          left: 15px;
          z-index: 1000;
          display: flex;
          gap: 8px;
        }
        
        .btn {
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 11px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .btn-back {
          background: rgba(0,0,0,0.7);
          color: white;
          backdrop-filter: blur(10px);
        }
        
        .btn-back:hover {
          background: rgba(0,0,0,0.8);
          transform: translateY(-1px);
        }
        
        .btn-print {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
        }
        
        .btn-print:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
        }
        
        /* AI 분석 텍스트 */
        .ai-analysis {
          background: white;
          border-radius: 8px;
          padding: 8px;
          font-size: 7px;
          line-height: 1.4;
          color: #374151;
          border-left: 3px solid #fbbf24;
          margin: 6px 0;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
        }
        
        /* 프린트용 숨김 */
        .no-print {
          display: block;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .report-container {
            padding: 0;
            min-height: auto;
            background: white !important;
          }
          
          .a5-page {
            box-shadow: none;
            border-radius: 0;
            page-break-after: always;
            border: none;
          }
          
          .no-print {
            display: none !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        /* 반응형 조정 */
        @media (max-width: 1200px) {
          .a5-page {
            transform: scale(0.8);
          }
        }
        
        @media (max-width: 900px) {
          .a5-page {
            transform: scale(0.6);
          }
        }
      `}</style>

      <div className="report-container">
        {/* 상단 버튼 (화면용) */}
        <div className="action-buttons no-print">
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

        {/* A5 고정 페이지 */}
        <div className="a5-page">
          {/* 왼쪽 섹션 - 최애 이미지 + AI 분석 */}
          <div className="page-section left-section">
            <div className="report-header">
              <div className="brand-title">AC'SCENT</div>
              <div className="report-subtitle">최애 이미지 분석 보고서</div>
            </div>

            {/* 최애 이미지 */}
            <div className="idol-image-container">
              {session?.imageUrl ? (
                <img 
                  src={session.imageUrl} 
                  alt="최애 이미지" 
                  className="idol-image"
                />
              ) : (
                <div className="image-placeholder">
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>🖼️</div>
                  <div style={{ fontSize: '7px', opacity: '0.7' }}>최애 이미지</div>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="info-card-left">
              <div className="info-label-left">고객명</div>
              <div className="info-value-left">{session?.customerName || '정보 없음'}</div>
            </div>
            
            <div className="info-card-left">
              <div className="info-label-left">분석 일시</div>
              <div className="info-value-left">{formatDate(session?.createdAt || session?.updatedAt)}</div>
            </div>

            {/* 성격 특성 분석 */}
            {session?.imageAnalysis?.traits && (
              <>
                <div className="section-title-left">성격 특성 분석</div>
                <TraitsGrid traits={session.imageAnalysis.traits} />
              </>
            )}

            {/* 추천 향 카테고리 */}
            {session?.imageAnalysis?.scentCategories && (
              <>
                <div className="section-title-left">추천 향 카테고리</div>
                <div style={{ marginBottom: '15px' }}>
                  {renderSafeArray(session.imageAnalysis.scentCategories)}
                </div>
              </>
            )}
          </div>

          {/* 오른쪽 섹션 - 향수 추천 및 결과 */}
          <div className="page-section right-section">
            <div className="report-header">
              <div className="section-title-right">향수 추천 결과</div>
            </div>

            {/* 추천 향수 */}
            {session?.imageAnalysis?.matchingPerfumes && (
              <>
                <div className="section-title-right">추천 향수</div>
                {(() => {
                  const perfumes = session.imageAnalysis.matchingPerfumes;
                  
                  try {
                    // 배열인 경우
                    if (Array.isArray(perfumes) && perfumes.length > 0) {
                      return perfumes.slice(0, 1).map((perfume: any, index: number) => (
                        <div key={index} className="perfume-card-new">
                          <div className="perfume-name-new">{safeStringify(perfume?.name || '향수명 없음')}</div>
                          <div className="perfume-description-new">{safeStringify(perfume?.description || '설명 없음')}</div>
                          {perfume?.persona && typeof perfume.persona === 'object' && (
                            <div style={{ fontSize: '7px', opacity: '0.8', marginTop: '4px' }}>
                              {Object.entries(perfume.persona).slice(0, 3).map(([key, value]) => (
                                <span key={key} style={{ marginRight: '6px' }}>
                                  {key}: {safeStringify(value)}/10
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ));
                    }
                    
                    // 객체인 경우 (단일 향수)
                    if (typeof perfumes === 'object' && perfumes !== null) {
                      return (
                        <div className="perfume-card-new">
                          <div className="perfume-name-new">{safeStringify(perfumes?.name || '향수명 없음')}</div>
                          <div className="perfume-description-new">{safeStringify(perfumes?.description || '설명 없음')}</div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="perfume-card-new">
                        <div className="perfume-name-new">추천 향수 정보 없음</div>
                      </div>
                    );
                  } catch (error) {
                    console.error('향수 렌더링 오류:', error);
                    return (
                      <div className="perfume-card-new">
                        <div className="perfume-name-new">향수 렌더링 오류</div>
                      </div>
                    );
                  }
                })()}
              </>
            )}

            {/* 고객 피드백 */}
            {session?.feedback && (
              <>
                <div className="section-title-right">고객 피드백</div>
                <div className="info-card-right">
                  <div className="info-label-right">전체 평점</div>
                  <div className="info-value-right">⭐ {session.feedback.overallRating || 'N/A'}/5</div>
                </div>
                {session.feedback.impression && (
                  <div className="info-card-right">
                    <div className="info-label-right">첫인상</div>
                    <div className="info-value-right">{session.feedback.impression}</div>
                  </div>
                )}
              </>
            )}

            {/* 맞춤 레시피 */}
            {session?.improvedRecipe && (
              <>
                <div className="section-title-right">맞춤 레시피</div>
                <div className="ai-analysis">
                  {typeof session.improvedRecipe === 'object' 
                    ? `${session.improvedRecipe.overallExplanation || '피드백을 반영한 맞춤형 향수 레시피가 생성되었습니다.'}`
                    : session.improvedRecipe.toString().substring(0, 120) + '...'
                  }
                </div>
              </>
            )}

            {/* AI 전문가 분석 (캐시된 경우만) */}
            {generatedReport && (
              <>
                <div className="section-title-right">전문가 추천 사유</div>
                <div className="ai-analysis">
                  {generatedReport.recommendationReason}
                </div>
                
                <div className="section-title-right">개인 메시지</div>
                <div className="ai-analysis" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderLeft: '4px solid #fbbf24' }}>
                  💌 {generatedReport.personalMessage}
                </div>
              </>
            )}

            {/* 로딩 상태 (AI 보고서 생성 중) */}
            {reportLoading && (
              <div style={{ textAlign: 'center', margin: '12px 0', color: '#6b7280' }}>
                <div style={{ fontSize: '8px', marginBottom: '4px' }}>
                  AI 분석 보고서 생성 중...
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '2px', 
                  background: '#e5e7eb', 
                  borderRadius: '1px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    borderRadius: '1px',
                    animation: 'loading 2s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 