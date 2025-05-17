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
import { Perfume } from '../types/perfume';

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PerfumeRadarChartProps {
  perfume: Perfume;
}

const PerfumeRadarChart: React.FC<PerfumeRadarChartProps> = ({ perfume }) => {
  const { characteristics } = perfume;
  
  const data = {
    labels: ['시트러스', '플로럴', '우디', '머스크', '프루티', '스파이시'],
    datasets: [
      {
        label: perfume.name,
        data: [
          characteristics.citrus,
          characteristics.floral,
          characteristics.woody,
          characteristics.musk,
          characteristics.fruity,
          characteristics.spicy,
        ],
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
        suggestedMax: 9,
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Radar data={data} options={options} />
    </div>
  );
};

export default PerfumeRadarChart;