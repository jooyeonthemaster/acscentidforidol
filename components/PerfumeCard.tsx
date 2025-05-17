import React from 'react';
import { Perfume } from '../types/perfume';
import { getCategoryKoreanName } from '../utils/perfumeUtils';

interface PerfumeCardProps {
  perfume: Perfume;
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold">{perfume.name}</h2>
      <p className="text-gray-500">{perfume.id}</p>
      
      <div className="mt-2">
        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          {getCategoryKoreanName(perfume.category)} 계열
        </span>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold">메인 향: {perfume.mainScent.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{perfume.mainScent.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <h3 className="font-semibold">서브향 1: {perfume.subScent1.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{perfume.subScent1.description}</p>
        </div>
        <div>
          <h3 className="font-semibold">서브향 2: {perfume.subScent2.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{perfume.subScent2.description}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold">향 특성</h3>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div>시트러스: {perfume.characteristics.citrus}</div>
          <div>플로럴: {perfume.characteristics.floral}</div>
          <div>우디: {perfume.characteristics.woody}</div>
          <div>머스크: {perfume.characteristics.musk}</div>
          <div>프루티: {perfume.characteristics.fruity}</div>
          <div>스파이시: {perfume.characteristics.spicy}</div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold">향 묘사</h3>
        <p className="text-sm text-gray-600 mt-1">{perfume.description}</p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold">추천 대상</h3>
        <p className="text-sm text-gray-600 mt-1">{perfume.recommendation}</p>
      </div>
    </div>
  );
};

export default PerfumeCard;