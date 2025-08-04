import React from 'react';
import Image from 'next/image';
import { CHARACTER_IMAGES } from '../constants/images';

interface LoadingStateProps {
  t: (key: string) => string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ t }) => {
  return (
    <div className="relative bg-white rounded-3xl border-4 border-dashed border-yellow-200 p-6 mb-6 shadow-md overflow-hidden">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex space-x-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-4 h-4 rounded-full bg-yellow-200 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-center text-gray-700">{t('result.loading')}</p>
      </div>
      
      {/* 오른쪽 하단 캐릭터 */}
      <div className="absolute -right-4 bottom-0 w-24 h-24">
        <Image 
          src={CHARACTER_IMAGES.CUTE}
          alt={t('result.cuteCharacterAlt')}
          width={100}
          height={100}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};