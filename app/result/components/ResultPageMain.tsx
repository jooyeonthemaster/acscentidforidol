"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

// Hooks
import { useResultData } from '../hooks/useResultData';

// Components
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { UserImageDisplay } from './UserImageDisplay';
import { TwitterNameDisplay } from './TwitterNameDisplay';
import { TabNavigation } from './TabNavigation';
import { AnalysisTab } from './AnalysisTab';
import { PerfumeTab } from './PerfumeTab';
import { ActionButtons } from './ActionButtons';

// Constants
import { CHARACTER_IMAGES } from '../constants/images';

export default function ResultPageMain() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslationContext();
  const [activeTab, setActiveTab] = useState<'analysis' | 'perfume'>('analysis');

  // 데이터 로딩 커스텀 훅 사용
  const {
    loading,
    error,
    isLoaded,
    userImage,
    twitterName,
    displayedAnalysis
  } = useResultData(t, currentLanguage);

  const handleRestart = () => {
    router.push('/');
  };

  const handleFeedback = () => {
    router.push('/feedback');
  };

  return (
    <div className="min-h-screen bg-amber-50 pt-6 pb-10 px-4">
      {/* 페이지 로딩 시 등장 애니메이션 적용된 컨테이너 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        {/* 헤더 */}
        <div className="relative flex justify-center mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-center mb-1">
              <span className="bg-yellow-300 px-3 py-1 inline-block rounded-lg">
                AC'SCENT IDENTITY
              </span>
            </h1>
            <p className="text-gray-800 text-sm">{t('result.intro')}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState t={t} />
        ) : error ? (
          <ErrorState error={error} onRestart={handleRestart} t={t} />
        ) : displayedAnalysis ? (
          <>
            {/* 사용자 업로드 이미지 표시 */}
            {userImage && (
              <UserImageDisplay userImage={userImage} t={t} />
            )}
            
            {/* 트위터스타일 닉네임 표시 */}
            <TwitterNameDisplay twitterName={twitterName} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 mb-6 shadow-md"
            >
              {/* 왼쪽 위 점 장식 */}
              <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 오른쪽 아래 캐릭터 */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="absolute -right-4 bottom-0 w-24 h-24"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image 
                    src={CHARACTER_IMAGES.CUTE}
                    alt={t('result.cuteCharacterAlt')}
                    width={100}
                    height={100}
                    className="object-contain"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    priority
                  />
                </div>
              </motion.div>
              
              {/* 왼쪽 하단 장식 */}
              <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 탭 선택 */}
              <TabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                t={t} 
              />

              {/* 탭 내용 */}
              <AnimatePresence mode="wait">
                {activeTab === 'analysis' && (
                  <AnalysisTab 
                    displayedAnalysis={displayedAnalysis} 
                    t={t} 
                  />
                )}

                {activeTab === 'perfume' && (
                  <PerfumeTab 
                    displayedAnalysis={displayedAnalysis} 
                    currentLanguage={currentLanguage}
                    t={t} 
                  />
                )}
              </AnimatePresence>
              
              {/* 버튼 영역 */}
              <ActionButtons 
                onFeedback={handleFeedback}
                onRestart={handleRestart}
                t={t}
              />
            </motion.div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}