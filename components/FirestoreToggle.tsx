"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FirestoreToggleProps {
  onToggle?: (useFirestore: boolean) => void;
  defaultValue?: boolean;
  className?: string;
}

export default function FirestoreToggle({ 
  onToggle, 
  defaultValue = false, 
  className = "" 
}: FirestoreToggleProps) {
  const [useFirestore, setUseFirestore] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 설정 로드
    const savedSetting = localStorage.getItem('useFirestore');
    if (savedSetting !== null) {
      setUseFirestore(JSON.parse(savedSetting));
    }
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      const newValue = !useFirestore;
      setUseFirestore(newValue);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('useFirestore', JSON.stringify(newValue));
      
      // 부모 컴포넌트에 알림
      if (onToggle) {
        onToggle(newValue);
      }
      
      // 페이지 새로고침 여부 확인
      if (window.confirm('변경사항을 적용하려면 페이지를 새로고침해야 합니다. 지금 새로고침하시겠습니까?')) {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('설정 변경 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700">
        데이터베이스:
      </span>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs ${!useFirestore ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
          Realtime DB
        </span>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useFirestore ? 'bg-blue-600' : 'bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <motion.span
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
            animate={{
              x: useFirestore ? 24 : 4
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        </button>
        
        <span className={`text-xs ${useFirestore ? 'text-blue-900 font-semibold' : 'text-gray-500'}`}>
          🔥 Firestore
        </span>
      </div>
      
      {useFirestore && (
        <div className="flex items-center gap-1">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            ⚡ 고성능
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
            💰 저비용
          </span>
        </div>
      )}
      
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
      )}
    </div>
  );
}