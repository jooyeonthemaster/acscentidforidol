"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslationContext();
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const handleStart = () => {
    router.push('/info');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50 p-0 overflow-x-hidden">
      {/* 큰 카드 컨테이너 - 380픽셀로 고정 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.6 }}
        className="relative w-[380px] h-auto bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 pt-10 pb-12 shadow-lg"
        style={{ maxHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* 왼쪽 위 점 장식 */}
        <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 오른쪽 아래 캐릭터 */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
          className="absolute -right-4 bottom-32 w-24 h-24"
        >
        
        </motion.div>
        
        {/* 왼쪽 하단 장식 */}
        <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 상단 로고 및 제목 영역 */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-40 h-40 -mb-4 relative"
          >
            <img 
              src="/logo.png" 
              alt="PPUDUCK Logo" 
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </motion.div>
          
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-xs font-bold text-gray-900 mb-1 tracking-wider">
              {t('service.title')}
            </h2>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              <span className="bg-yellow-300 px-1 py-1 inline-block">
                {t('service.subtitle')}
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-gray-900 text-base text-center mt-1"
          >
            {t('service.description').split('<br />').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('service.description').split('<br />').length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.p>
        </div>
        
        {/* 중간 컨텐츠 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3 mb-5"
        >
          <div className="bg-yellow-50 rounded-xl border-2 border-yellow-100 p-3 mb-4">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center text-sm">
              <span className="text-base mr-2">💖</span>
              {t('landing.target.title')}
            </h3>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="mr-2 text-yellow-500 font-bold">•</span>
                <span className="text-gray-900 text-sm">{t('landing.target.1')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-yellow-500 font-bold">•</span>
                <span className="text-gray-900 text-sm">{t('landing.target.2')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-yellow-500 font-bold">•</span>
                <span className="text-gray-900 text-sm">{t('landing.target.3')}</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 rounded-xl border-2 border-yellow-100 p-3">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center text-sm">
              <span className="text-base mr-2">🎯</span>
              {t('landing.howto.title')}
            </h3>
            <ol className="space-y-1">
              <li className="flex items-center">
                <div className="bg-yellow-300 w-6 h-6 rounded-full flex items-center justify-center text-gray-900 font-bold mr-2 text-[11px]">1</div>
                <span className="text-gray-900 text-sm">{t('landing.howto.step1')}</span>
              </li>
              <li className="flex items-center">
                <div className="bg-yellow-300 w-6 h-6 rounded-full flex items-center justify-center text-gray-900 font-bold mr-2 text-[11px]">2</div>
                <span className="text-gray-900 text-sm">{t('landing.howto.step2')}</span>
              </li>
              <li className="flex items-center">
                <div className="bg-yellow-300 w-6 h-6 rounded-full flex items-center justify-center text-gray-900 font-bold mr-2 text-[11px]">3</div>
                <span className="text-gray-900 text-sm">{t('landing.howto.step3')}</span>
              </li>
            </ol>
          </div>
        </motion.div>
        
        {/* 하단 버튼 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-gray-800 text-gray-800 font-bold py-2 px-8 rounded-full shadow-sm flex items-center"
          >
            {t('landing.cta')}
            <span className="ml-1 text-lg">»</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}