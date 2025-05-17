import { NextRequest, NextResponse } from 'next/server';
import { PerfumePersona } from '@/app/types/perfume';
import perfumePersonas from '@/app/data/perfumePersonas';

// 피드백 데이터 인터페이스
interface PerfumeFeedback {
  perfumeId: string;
  retentionPercentage: number; // 향 유지 비율 (0%, 20%, 40%, 60%, 80%, 100%)
  intensity: number;           // 향의 강도 (1-5)
  sweetness: number;           // 단맛 (1-5)
  bitterness: number;          // 쓴맛 (1-5)
  sourness: number;            // 시큼함 (1-5)
  freshness: number;           // 신선함 (1-5)
  notes: string;               // 추가 코멘트
}

// 노트 조정 정보
interface NoteAdjustment {
  type: 'base' | 'increase' | 'reduce';
  noteId?: string;
  noteName?: string;
  description: string;
  amount: string;
}

// 향수 조정 추천 인터페이스
interface AdjustmentRecommendation {
  perfumeId: string;
  perfumeName: string;
  baseRetention: number;
  baseAmount: string;
  adjustments: NoteAdjustment[];
  totalAdjustments: number;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const feedback: PerfumeFeedback = await request.json();
    
    if (!feedback.perfumeId) {
      return NextResponse.json(
        { error: '향수 ID는 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 해당 향수 찾기
    const perfume = perfumePersonas.personas.find(
      (p: PerfumePersona) => p.id === feedback.perfumeId
    );
    
    if (!perfume) {
      return NextResponse.json(
        { error: '해당 향수를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 향수 조정 추천 생성
    const recommendations = generateAdjustmentRecommendations(feedback, perfume);
    
    // 결과 반환
    return NextResponse.json({
      success: true,
      feedback,
      recommendations
    });
  } catch (error) {
    console.error('피드백 처리 오류:', error);
    return NextResponse.json(
      { error: '피드백 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 향수 조정 추천 생성 함수
 */
function generateAdjustmentRecommendations(
  feedback: PerfumeFeedback, 
  perfume: PerfumePersona
): AdjustmentRecommendation {
  const adjustments: NoteAdjustment[] = [];
  
  // 기존 향수 유지 비율에 따른 기본 배합량 계산
  const baseRetention = feedback.retentionPercentage / 100;
  const baseAmount = 50 * baseRetention; // 기본 50ml 가정
  
  // 기본 향수 조정 정보
  adjustments.push({
    type: 'base',
    description: `기존 향수 베이스`,
    amount: `${baseAmount.toFixed(1)}ml`
  });
  
  // 향의 강도 조정 (3이 기본값)
  if (feedback.intensity > 3) {
    // 농도 증가
    const increaseAmount = (feedback.intensity - 3) * 2; // 단계당 2ml 증가
    adjustments.push({
      type: 'increase',
      noteId: 'intensity',
      noteName: '향 농도',
      description: `향의 농도 증가`,
      amount: `${increaseAmount.toFixed(1)}ml`
    });
  } else if (feedback.intensity < 3) {
    // 농도 감소 (희석)
    const increaseAmount = (3 - feedback.intensity) * 5; // 단계당 5ml의 희석액 추가
    adjustments.push({
      type: 'increase',
      noteId: 'dilution',
      noteName: '희석액',
      description: `향 희석을 위한 무향 베이스 추가`,
      amount: `${increaseAmount.toFixed(1)}ml`
    });
  }
  
  // 단맛 조정 (3이 기본값)
  if (feedback.sweetness > 3) {
    // 단맛 증가
    const sweetIncreaseAmount = (feedback.sweetness - 3) * 1.5;
    adjustments.push({
      type: 'increase',
      noteId: 'vanilla',
      noteName: '바닐라',
      description: `바닐라 노트 추가 (단맛 증가)`,
      amount: `${sweetIncreaseAmount.toFixed(1)}g`
    });
  } else if (feedback.sweetness < 3) {
    // 단맛 감소
    const sweetReduceAmount = (3 - feedback.sweetness) * 0.5;
    
    // 우디 계열 노트 추가
    adjustments.push({
      type: 'increase',
      noteId: 'wood',
      noteName: '샌달우드',
      description: `우디 노트 추가 (단맛 상쇄)`,
      amount: `${sweetReduceAmount.toFixed(1)}g`
    });
  }
  
  // 쓴맛 조정 (3이 기본값)
  if (feedback.bitterness > 3) {
    // 쓴맛 증가
    const bitterIncreaseAmount = (feedback.bitterness - 3) * 1.2;
    adjustments.push({
      type: 'increase',
      noteId: 'coffee',
      noteName: '커피 / 카카오',
      description: `커피/카카오 노트 추가 (쓴맛 증가)`,
      amount: `${bitterIncreaseAmount.toFixed(1)}g`
    });
  } else if (feedback.bitterness < 3) {
    // 쓴맛 감소
    const bitterReduceAmount = (3 - feedback.bitterness) * 1.0;
    adjustments.push({
      type: 'increase',
      noteId: 'honey',
      noteName: '허니',
      description: `허니 노트 추가 (쓴맛 상쇄)`,
      amount: `${bitterReduceAmount.toFixed(1)}g`
    });
  }
  
  // 시큼함 조정 (3이 기본값)
  if (feedback.sourness > 3) {
    // 시큼함 증가
    const sourIncreaseAmount = (feedback.sourness - 3) * 1.3;
    adjustments.push({
      type: 'increase',
      noteId: 'citrus',
      noteName: '시트러스',
      description: `시트러스 노트 추가 (시큼함 증가)`,
      amount: `${sourIncreaseAmount.toFixed(1)}g`
    });
  } else if (feedback.sourness < 3) {
    // 시큼함 감소
    const sourReduceAmount = (3 - feedback.sourness) * 0.8;
    adjustments.push({
      type: 'increase',
      noteId: 'amber',
      noteName: '앰버',
      description: `앰버 노트 추가 (시큼함 상쇄)`,
      amount: `${sourReduceAmount.toFixed(1)}g`
    });
  }
  
  // 신선함 조정 (3이 기본값)
  if (feedback.freshness > 3) {
    // 신선함 증가
    const freshIncreaseAmount = (feedback.freshness - 3) * 1.5;
    adjustments.push({
      type: 'increase',
      noteId: 'mint',
      noteName: '민트 / 유칼립투스',
      description: `민트/유칼립투스 노트 추가 (신선함 증가)`,
      amount: `${freshIncreaseAmount.toFixed(1)}g`
    });
  } else if (feedback.freshness < 3) {
    // 따뜻한 느낌 증가 (신선함 감소)
    const freshReduceAmount = (3 - feedback.freshness) * 1.2;
    adjustments.push({
      type: 'increase',
      noteId: 'warm',
      noteName: '시나몬 / 바닐라',
      description: `따뜻한 노트 추가 (신선함 감소)`,
      amount: `${freshReduceAmount.toFixed(1)}g`
    });
  }
  
  // 설명 생성
  const explanation = generateExplanation(feedback, adjustments, perfume);
  
  return {
    perfumeId: perfume.id,
    perfumeName: perfume.name,
    baseRetention: feedback.retentionPercentage,
    baseAmount: `${baseAmount.toFixed(1)}ml`,
    adjustments,
    totalAdjustments: adjustments.length,
    explanation
  };
}

/**
 * 향수 조정 설명 생성 함수
 */
function generateExplanation(
  feedback: PerfumeFeedback, 
  adjustments: NoteAdjustment[], 
  perfume: PerfumePersona
): string {
  // 기본 향수 유지 비율 텍스트
  let baseText;
  if (feedback.retentionPercentage === 100) {
    baseText = `${perfume.name} 향수의 기본 배합을 그대로 유지합니다.`;
  } else if (feedback.retentionPercentage === 0) {
    baseText = `${perfume.name} 향수의 기본 배합을 완전히 변경합니다.`;
  } else {
    baseText = `${perfume.name} 향수의 기본 배합을 ${feedback.retentionPercentage}% 유지합니다.`;
  }
  
  // 조정 설명 텍스트
  const adjustmentTexts = adjustments
    .filter(adj => adj.type !== 'base') // 기본 베이스는 제외
    .map(adj => {
      if (adj.type === 'increase') {
        return `${adj.noteName}을(를) ${adj.amount} 추가하여 ${adj.description.split('(')[1]?.replace(')', '') || adj.description}`;
      } else if (adj.type === 'reduce') {
        return `${adj.noteName}을(를) ${adj.amount} 감소시켜 ${adj.description.split('(')[1]?.replace(')', '') || adj.description}`;
      }
      return '';
    })
    .filter(text => text.length > 0);
  
  // 조정이 없는 경우
  if (adjustmentTexts.length === 0) {
    return `${baseText} 추가 조정 없이 원래의 배합 그대로 유지합니다.`;
  }
  
  // 조정 내용 텍스트 생성
  return `${baseText} 여기에 ${adjustmentTexts.join(', ')}의 변화를 주어 고객님의 취향에 맞게 조정합니다.`;
} 