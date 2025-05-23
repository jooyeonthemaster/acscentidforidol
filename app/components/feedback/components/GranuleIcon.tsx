import React from 'react';

// 향료 방울 아이콘 컴포넌트
const GranuleIcon = ({ index, scentName, category }: { index: number; scentName: string; category: string }) => {
  // 향료별로 다른 색상 부여
  const getGradient = () => {
    const gradients = [
      'from-amber-200 to-amber-400',
      'from-blue-200 to-blue-400',
      'from-pink-200 to-pink-400',
      'from-green-200 to-green-400',
      'from-purple-200 to-purple-400'
    ];
    
    // 향료 이름 기반으로 고정 색상 할당 (같은 향료는 항상 같은 색상)
    const nameHash = scentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[nameHash % gradients.length];
  };
  
  return (
    <div 
      className={`w-6 h-6 rounded-full bg-gradient-to-r ${getGradient()} flex items-center justify-center text-xs shadow-sm border border-white`}
      title={`${scentName} (${category}) 향료 방울 #${index + 1}`}
    >
      {index + 1}
    </div>
  );
};

export default GranuleIcon; 