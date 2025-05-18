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
}

const PerfumeRadarChart: React.FC<PerfumeRadarChartProps> = ({ perfumeId }) => {
  // 기본 데이터
  const data = {
    labels: ['시트러스', '플로럴', '우디', '머스크', '프루티', '스파이시'],
    datasets: [
      {
        label: '향수 특성',
        data: [6, 8, 4, 5, 7, 3],
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