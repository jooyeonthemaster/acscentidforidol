'use client';

import React from 'react';
import { PersonalColor } from '../types/perfume';

interface PersonalColorDisplayProps {
  personalColor: PersonalColor;
}

const PersonalColorDisplay: React.FC<PersonalColorDisplayProps> = ({ personalColor }) => {
  // 시즌에 따른 한글 이름 매핑
  const seasonNameMap = {
    'spring': '봄 웜톤',
    'summer': '여름 쿨톤',
    'autumn': '가을 웜톤',
    'winter': '겨울 쿨톤'
  };
  
  // 톤에 따른 한글 이름 매핑
  const toneNameMap = {
    'bright': '밝은',
    'light': '라이트',
    'mute': '뮤트',
    'deep': '딥'
  };
  
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-2">퍼스널 컬러</h3>
      
      <div className="flex flex-col">
        <div className="mb-2">
          <span className="font-medium">컬러 타입:</span>{' '}
          <span className="bg-yellow-100 px-2 py-0.5 rounded text-gray-800">
            {toneNameMap[personalColor.tone]} {seasonNameMap[personalColor.season]}
          </span>
        </div>
        
        <div className="text-sm mb-3">
          {personalColor.description}
        </div>
        
        {/* 컬러 팔레트 */}
        <div className="flex space-x-2 mt-1">
          {personalColor.palette.map((color, index) => (
            <div 
              key={index}
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalColorDisplay; 