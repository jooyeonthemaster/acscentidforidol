import React from 'react';
import Image from 'next/image';
import { CHARACTER_IMAGES } from '../constants/images';

interface ErrorStateProps {
  error: string;
  onRestart: () => void;
  t: (key: string) => string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRestart, t }) => {
  return (
    <div className="relative bg-white rounded-3xl border-4 border-dashed border-red-200 p-6 mb-6 shadow-md overflow-hidden">
      <p className="text-center text-red-600 mb-4">{error}</p>
      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-500 transition font-medium text-sm"
        >
          {t('result.restart')}
        </button>
      </div>
      
      {/* 오른쪽 하단 캐릭터 - 슬픈 표정 */}
      <div className="absolute -right-4 bottom-0 w-24 h-24">
        <Image 
          src={CHARACTER_IMAGES.SAD}
          alt={t('result.sadCharacterAlt')}
          width={100}
          height={100}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};