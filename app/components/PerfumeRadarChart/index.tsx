"use client";

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Perfume } from '../../types/perfume';

// Chart.js 라이브러리 설정
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PerfumeRadarChartProps {
  perfumeId?: string;
  perfume?: Perfume;
}

const PerfumeRadarChart: React.FC<PerfumeRadarChartProps> = ({ perfumeId, perfume }) => {
  // 향수 특성 데이터 (기본값 또는 perfume에서 가져온 값)
  const characteristics = perfume ? perfume.characteristics : {
    citrus: 6,
    floral: 8,
    woody: 4,
    musky: 5,
    fruity: 7,
    spicy: 3
  };
  
  // 한글 카테고리 이름
  const categoryNames: Record<string, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 차트 데이터
  const data = {
    labels: Object.keys(characteristics).map(cat => categoryNames[cat] || cat),
    datasets: [
      {
        label: '향수 특성',
        data: Object.values(characteristics),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 10,
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Radar data={data} options={options} />
    </div>
  );
};

export default PerfumeRadarChart;