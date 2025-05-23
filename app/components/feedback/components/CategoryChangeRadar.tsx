import React from 'react';
import { Radar } from 'react-chartjs-2';
import { PerfumeFeedback, GeminiPerfumeSuggestion, PerfumePersona, CategoryDataPoint } from '@/app/types/perfume';

interface CategoryChangeRadarProps {
  feedback: PerfumeFeedback;
  recipe: GeminiPerfumeSuggestion | null;
  originalPerfume: PerfumePersona;
}

const CategoryChangeRadar: React.FC<CategoryChangeRadarProps> = ({ feedback, recipe, originalPerfume }) => {
  const labels = ['시트러스', '플로럴', '우디', '머스크', '프루티', '스파이시'];

  // "변경 전" 데이터: originalPerfume.categories 사용
  const beforeData = originalPerfume?.categories ? labels.map(label => {
    const key = Object.keys(originalPerfume.categories).find(k => 
      k.toLowerCase() === label.toLowerCase() || 
      (label === '시트러스' && k === 'citrus') ||
      (label === '플로럴' && k === 'floral') ||
      (label === '우디' && k === 'woody') ||
      (label === '머스크' && k === 'musky') ||
      (label === '프루티' && k === 'fruity') ||
      (label === '스파이시' && k === 'spicy')
    ) as keyof typeof originalPerfume.categories;
    return key ? originalPerfume.categories[key] : 0;
  }) : [0,0,0,0,0,0];

  // "변경 후" 데이터: recipe.adjustedCategoryGraphData 사용
  const afterData = recipe?.adjustedCategoryGraphData ? labels.map(label => {
    const dataPoint = recipe.adjustedCategoryGraphData.find(d => d.axis === label);
    return dataPoint ? dataPoint.value : 0;
  }) : beforeData; // recipe가 없으면 beforeData를 사용 (또는 [0,0,0,0,0,0])

  const data = {
    labels,
    datasets: [
      {
        label: '변경 전',
        data: beforeData,
        backgroundColor: 'rgba(100, 100, 255, 0.2)',
        borderColor: 'rgba(100, 100, 255, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(100, 100, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(100, 100, 255, 1)',
      },
      {
        label: '변경 후 (AI 추천)',
        data: afterData,
        backgroundColor: 'rgba(255, 150, 100, 0.2)',
        borderColor: 'rgba(255, 150, 100, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(255, 150, 100, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 150, 100, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 10, // 카테고리 점수 최대값
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          color: '#333'
        },
        ticks: {
          display: false, // 수치 표시는 생략
          stepSize: 2
        }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#333',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          }
        }
      },
      tooltip: {
        enabled: true,
        usePointStyle: true,
      }
    }
  };

  return <Radar data={data} options={options} />;
};

export default CategoryChangeRadar; 