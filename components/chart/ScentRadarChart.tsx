'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { ScentCategoryScores } from '@/app/types/perfume';
import { motion } from 'framer-motion';

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ScentRadarChartProps {
  categories: ScentCategoryScores;
  title?: string;
  showAnimation?: boolean;
}

const ScentRadarChart: React.FC<ScentRadarChartProps> = ({ 
  categories, 
  title = '향 카테고리 프로필',
  showAnimation = true
}) => {
  // 카테고리 이름 매핑
  const categoryNames: Record<keyof ScentCategoryScores, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 카테고리 색상 매핑
  const categoryColors: Record<keyof ScentCategoryScores, string> = {
    citrus: '#F9D423', // 노란색
    floral: '#FF4E50', // 분홍색
    woody: '#8A5A44', // 갈색
    musky: '#736CED', // 보라색
    fruity: '#FC913A', // 오렌지색
    spicy: '#C04848'  // 붉은색
  };
  
  // 가장 높은 값을 가진 카테고리 찾기
  const entries = Object.entries(categories);
  const maxCategory = entries.reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: '', value: 0 }
  );
  
  // Chart.js 데이터 구성
  const data = {
    labels: Object.keys(categories).map(key => categoryNames[key as keyof ScentCategoryScores]),
    datasets: [
      {
        label: '향 강도',
        data: Object.values(categories),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointBackgroundColor: Object.keys(categories).map(key => 
          categoryColors[key as keyof ScentCategoryScores]
        ),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
      },
    ],
  };
  
  // Chart.js 옵션 구성
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2
        }
      },
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const WrapperComponent = showAnimation ? motion.div : 'div';
  
  return (
    <WrapperComponent
      {...(showAnimation ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
      } : {})}
      className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      
      <div className="w-full max-w-md">
        <Radar data={data} options={options} />
      </div>
      
      {/* 주요 향 카테고리 표시 */}
      <div className="mt-4 bg-gray-50 p-3 rounded-lg text-center">
        <p className="text-sm text-gray-600">주요 향 카테고리</p>
        <p className="font-medium text-lg" style={{ color: categoryColors[maxCategory.key as keyof ScentCategoryScores] || '#333' }}>
          {categoryNames[maxCategory.key as keyof ScentCategoryScores] || maxCategory.key} ({maxCategory.value}/10)
        </p>
      </div>
      
      {/* 카테고리 배지 */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {Object.entries(categories).map(([key, value]) => (
          <div 
            key={key} 
            className="px-2 py-1 bg-white rounded-full text-xs border flex items-center gap-1 shadow-sm"
            style={{ borderColor: categoryColors[key as keyof ScentCategoryScores] || '#ddd' }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryColors[key as keyof ScentCategoryScores] || '#ddd' }}
            />
            <span className="font-medium">
              {categoryNames[key as keyof ScentCategoryScores]}: {value}
            </span>
          </div>
        ))}
      </div>
    </WrapperComponent>
  );
};

export default ScentRadarChart; 