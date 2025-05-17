'use client';

import React from 'react';

interface KeywordCloudProps {
  keywords: string[];
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
  // 키워드 하나의 배경색 랜덤 선택
  const getRandomColor = () => {
    const colors = [
      'bg-yellow-100', 'bg-blue-100', 'bg-green-100', 
      'bg-pink-100', 'bg-purple-100', 'bg-orange-100',
      'bg-teal-100', 'bg-indigo-100', 'bg-red-100'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 모든 키워드에 대한 색상을 고정하기 위해 메모이제이션
  const keywordColors = React.useMemo(() => {
    return keywords.reduce((acc, keyword) => {
      acc[keyword] = getRandomColor();
      return acc;
    }, {} as Record<string, string>);
  }, [keywords]);
  
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        키워드가 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className={`${keywordColors[keyword]} px-3 py-1 rounded-full text-sm font-medium text-gray-800 shadow-sm`}
        >
          {keyword}
        </div>
      ))}
    </div>
  );
};

export default KeywordCloud; 