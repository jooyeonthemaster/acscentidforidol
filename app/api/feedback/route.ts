import { NextRequest, NextResponse } from 'next/server';
import { PerfumePersona, PerfumeFeedback, PerfumeCategory, CategoryPreference, FragranceCharacteristic, CharacteristicValue, SpecificScent } from '@/app/types/perfume';
import perfumePersonas from '@/app/data/perfumePersonas';
import { saveSessionFeedback } from '../../../lib/firebaseApi';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';

// 향 카테고리 Enum
const PerfumeCategoryEnum = z.enum(['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy']);

// 카테고리 선호도 Enum
const CategoryPreferenceEnum = z.enum(['increase', 'decrease', 'maintain']);

// 향 특성 Enum
const FragranceCharacteristicEnum = z.enum(['weight', 'sweetness', 'freshness', 'uniqueness']);

// 특성 값 Enum
const CharacteristicValueEnum = z.enum(['veryLow', 'low', 'medium', 'high', 'veryHigh']);

// 특정 향 스키마
const SpecificScentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  ratio: z.number().optional(),
  action: z.enum(['add', 'remove']).optional(),
  adjustmentType: z.enum(['add', 'remove']).optional(),
  description: z.string().optional(),
});

// 피드백 데이터 스키마 (Zod) - PerfumeFeedback 인터페이스에 맞게 수정
const feedbackSchema = z.object({
  // 세션 정보
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  // 필수 필드
  perfumeId: z.string().min(1, "향수 ID는 필수입니다"),
  perfumeName: z.string().optional(),
  impression: z.string().optional(),
  overallRating: z.number().min(1).max(5).optional(),
  retentionPercentage: z.number().min(0).max(100).optional(),
  categoryPreferences: z.record(PerfumeCategoryEnum, CategoryPreferenceEnum).optional(),
  userCharacteristics: z.record(FragranceCharacteristicEnum, CharacteristicValueEnum).optional(),
  scentCategoryPreferences: z.record(z.string(), z.enum(['increase', 'decrease', 'keep', 'remove'])).optional(),
  specificScents: z.array(SpecificScentSchema).optional(),
  specificScentAdjustments: z.array(SpecificScentSchema).optional(),
  notes: z.string().optional(),
  additionalComments: z.string().optional(),
  submittedAt: z.string().optional(),
});

// 피드백 저장 구조
interface StoredFeedback extends PerfumeFeedback {
  id: string;
  timestamp: string;
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

// 커스텀 향수 레시피 인터페이스
interface CustomPerfumeRecipe {
  basedOn: string;
  recipe10ml: ScentComponent[];
  recipe50ml: ScentComponent[];
  description: string;
  testGuide?: {
    instructions: string;
    combinations?: { scents: string[]; ratio: string }[];
    scentMixtures?: Array<{ name: string; ratio: number }>;
  };
  explanation?: {
    rationale: string;
    expectedResult: string;
    recommendation: string;
  };
}

// 향수 레시피 구성 요소
interface ScentComponent {
  name: string;
  amount: string;
  percentage?: number;
}

// 피드백 데이터 저장 경로
const FEEDBACK_DATA_PATH = path.join(process.cwd(), 'data', 'feedback.json');

// 서버리스 환경 감지 (Vercel 등)
const isServerlessEnvironment = process.env.VERCEL || process.env.SERVERLESS === 'true';

/**
 * 피드백 데이터를 파일에 저장하는 함수
 */
async function saveFeedback(feedback: StoredFeedback): Promise<void> {
  // 서버리스 환경에서는 파일 저장 스킵
  if (isServerlessEnvironment) {
    console.log('서버리스 환경에서 파일 저장을 건너뜁니다:', feedback.id);
    return;
  }

  try {
    // 디렉토리 확인 및 생성
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 기존 피드백 데이터 불러오기
    let feedbacks: StoredFeedback[] = [];
    if (fs.existsSync(FEEDBACK_DATA_PATH)) {
      const data = fs.readFileSync(FEEDBACK_DATA_PATH, 'utf-8');
      feedbacks = JSON.parse(data);
    }

    // 새 피드백 추가
    feedbacks.push(feedback);

    // 파일에 저장
    fs.writeFileSync(FEEDBACK_DATA_PATH, JSON.stringify(feedbacks, null, 2));
    console.log(`피드백 저장 완료: ${feedback.id}`);
  } catch (error) {
    console.error('피드백 저장 오류:', error);
    // 서버리스 환경에서는 저장 실패가 치명적 오류가 아니므로 예외를 발생시키지 않음
    if (!isServerlessEnvironment) {
      throw new Error('피드백 데이터를 저장하는데 실패했습니다');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const data = await request.json();
    
    // Zod로 데이터 유효성 검증
    const validationResult = feedbackSchema.safeParse(data);
    
    if (!validationResult.success) {
      // 유효성 검증 실패
      return NextResponse.json(
        { 
          error: '유효하지 않은 피드백 데이터입니다', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    // validatedData는 Zod의 검증을 통과한 데이터
    const validatedData = validationResult.data;
    
    // PerfumeFeedback 타입에 맞게 변환
    const feedback: PerfumeFeedback = {
      perfumeId: validatedData.perfumeId,
      perfumeName: validatedData.perfumeName,
      impression: validatedData.impression,
      overallRating: validatedData.overallRating,
      retentionPercentage: validatedData.retentionPercentage,
      categoryPreferences: validatedData.categoryPreferences as Record<PerfumeCategory, CategoryPreference> | undefined,
      userCharacteristics: validatedData.userCharacteristics as Record<FragranceCharacteristic, CharacteristicValue> | undefined,
      scentCategoryPreferences: validatedData.scentCategoryPreferences,
      specificScents: validatedData.specificScents,
      specificScentAdjustments: validatedData.specificScentAdjustments,
      notes: validatedData.notes,
      additionalComments: validatedData.additionalComments,
      submittedAt: validatedData.submittedAt,
    };
    
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
    
    // 피드백 데이터에 ID와 타임스탬프 추가하여 저장
    const storedFeedback: StoredFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    try {
      // 기존 파일 저장 방식
      await saveFeedback(storedFeedback);
    } catch (saveError) {
      // 저장 실패 로그만 남기고 계속 진행
      console.error('피드백 데이터 저장 실패:', saveError);
    }
    
    // Firebase에 세션 기반 피드백 저장
    if (validatedData.userId && validatedData.sessionId) {
      try {
        await saveSessionFeedback(validatedData.userId, validatedData.sessionId, {
          ...feedback,
          recommendations: recommendations
        });
        console.log('Firebase에 세션 피드백 저장 완료');
      } catch (firebaseError) {
        console.error('Firebase 피드백 저장 오류:', firebaseError);
        // Firebase 저장 실패해도 계속 진행
      }
    }
    
    // 결과 반환
    return NextResponse.json({
      success: true,
      feedback: storedFeedback,
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
 * 모든 피드백 데이터를 가져오는 API
 */
export async function GET() {
  try {
    // 서버리스 환경에서는 빈 배열 반환
    if (isServerlessEnvironment || !fs.existsSync(FEEDBACK_DATA_PATH)) {
      return NextResponse.json({ feedbacks: [] });
    }
    
    const data = fs.readFileSync(FEEDBACK_DATA_PATH, 'utf-8');
    const feedbacks: StoredFeedback[] = JSON.parse(data);
    
    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error('피드백 조회 오류:', error);
    return NextResponse.json(
      { error: '피드백 데이터를 불러오는데 실패했습니다.' },
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
  const baseRetention = (feedback.retentionPercentage || 100) / 100;
  const baseAmount = 50 * baseRetention; // 기본 50ml 가정
  
  // 기본 향수 조정 정보
  adjustments.push({
    type: 'base',
    description: `기존 향수 베이스`,
    amount: `${baseAmount.toFixed(1)}ml`
  });
  
  // 향 특성 조정 (카테고리 선호도 기반)
  if (feedback.categoryPreferences) {
    Object.entries(feedback.categoryPreferences).forEach(([category, preference]) => {
      if (preference === 'increase') {
        // 해당 카테고리 향 증가
        const increaseAmount = 3 * baseRetention; // 카테고리당 3ml 기준 (비율에 따라 조정)
        adjustments.push({
          type: 'increase',
          noteId: category,
          noteName: getCategoryDisplayName(category as PerfumeCategory),
          description: `${getCategoryDisplayName(category as PerfumeCategory)} 증가`,
          amount: `${increaseAmount.toFixed(1)}ml`
        });
      } else if (preference === 'decrease') {
        // 다른 카테고리를 추가하여 상대적으로 감소 효과
        const categoryToIncrease = getOppositeCategory(category as PerfumeCategory);
        const increaseAmount = 2 * baseRetention; // 상대적 감소를 위한 증가량
        adjustments.push({
          type: 'increase',
          noteId: categoryToIncrease,
          noteName: getCategoryDisplayName(categoryToIncrease),
          description: `${getCategoryDisplayName(category as PerfumeCategory)} 감소를 위한 조정`,
          amount: `${increaseAmount.toFixed(1)}ml`
        });
      }
      // maintain은 아무 조정 없음
    });
  }
  
  // 사용자 특성 조정
  if (feedback.userCharacteristics) {
    Object.entries(feedback.userCharacteristics).forEach(([characteristic, value]) => {
      if (value !== 'medium') { // 중간값이 아닌 경우에만 조정
        const adjustmentAmount = getCharacteristicAdjustmentAmount(value, baseRetention);
        const direction = isIncreaseDirection(value) ? '증가' : '감소';
        
        adjustments.push({
          type: 'increase',
          noteId: characteristic,
          noteName: getCharacteristicNote(characteristic as FragranceCharacteristic, value),
          description: `${getCharacteristicDisplayName(characteristic as FragranceCharacteristic)} ${direction}`,
          amount: `${adjustmentAmount.toFixed(1)}ml`
        });
      }
    });
  }
  
  // 특정 향료 추가
  if (feedback.specificScents && feedback.specificScents.length > 0) {
    feedback.specificScents.forEach(scent => {
      if (scent.action === 'add' && scent.ratio) {
        const scentAmount = (scent.ratio / 100) * 5 * baseRetention; // 최대 5ml 기준으로 비율 적용
        adjustments.push({
          type: 'increase',
          noteId: scent.id || scent.name,
          noteName: scent.name,
          description: `특별 요청 향료 추가`,
          amount: `${scentAmount.toFixed(1)}ml`
        });
      }
    });
  }
  
  // 설명 생성
  const explanation = generateExplanation(feedback, adjustments, perfume);
  
  return {
    perfumeId: perfume.id,
    perfumeName: perfume.name,
    baseRetention: feedback.retentionPercentage || 100,
    baseAmount: `${baseAmount.toFixed(1)}ml`,
    adjustments,
    totalAdjustments: adjustments.length,
    explanation
  };
}

/**
 * 카테고리 표시 이름 가져오기
 */
function getCategoryDisplayName(category: PerfumeCategory): string {
  const displayNames: Record<PerfumeCategory, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  return displayNames[category] || category;
}

/**
 * 상반되는 카테고리 가져오기
 */
function getOppositeCategory(category: PerfumeCategory): PerfumeCategory {
  const opposites: Record<PerfumeCategory, PerfumeCategory> = {
    citrus: 'woody',
    floral: 'spicy',
    woody: 'citrus',
    musky: 'fruity',
    fruity: 'musky',
    spicy: 'floral'
  };
  return opposites[category] || 'woody';
}

/**
 * 특성 조정 양 계산
 */
function getCharacteristicAdjustmentAmount(value: CharacteristicValue, baseRetention: number): number {
  const adjustmentValues: Record<CharacteristicValue, number> = {
    veryLow: 1.0,
    low: 2.0,
    medium: 0.0,
    high: 2.0,
    veryHigh: 3.0
  };
  return adjustmentValues[value] * baseRetention;
}

/**
 * 증가 방향인지 확인
 */
function isIncreaseDirection(value: CharacteristicValue): boolean {
  return value === 'high' || value === 'veryHigh';
}

/**
 * 특성에 맞는 노트 가져오기
 */
function getCharacteristicNote(characteristic: FragranceCharacteristic, value: CharacteristicValue): string {
  // 특성과 값에 따른 향료 매핑
  const noteMap: Record<FragranceCharacteristic, Record<CharacteristicValue, string>> = {
    weight: {
      veryLow: '베르가못',
      low: '시트러스 블렌드',
      medium: '중간 노트',
      high: '바닐라',
      veryHigh: '앰버 블렌드'
    },
    sweetness: {
      veryLow: '우디 블렌드',
      low: '허브 블렌드',
      medium: '중간 노트',
      high: '바닐라',
      veryHigh: '허니 블렌드'
    },
    freshness: {
      veryLow: '스파이스 블렌드',
      low: '앰버 블렌드',
      medium: '중간 노트',
      high: '시트러스 블렌드',
      veryHigh: '민트 블렌드'
    },
    uniqueness: {
      veryLow: '머스크 블렌드',
      low: '로즈 블렌드',
      medium: '중간 노트',
      high: '이국적 블렌드',
      veryHigh: '스모키 블렌드'
    }
  };
  
  return noteMap[characteristic][value];
}

/**
 * 특성 표시 이름 가져오기
 */
function getCharacteristicDisplayName(characteristic: FragranceCharacteristic): string {
  const displayNames: Record<FragranceCharacteristic, string> = {
    weight: '무게감',
    sweetness: '달콤함',
    freshness: '청량감',
    uniqueness: '독특함'
  };
  return displayNames[characteristic] || characteristic;
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
  const retentionPercentage = feedback.retentionPercentage || 100;
  let baseText;
  if (retentionPercentage === 100) {
    baseText = `${perfume.name} 향수의 기본 배합을 그대로 유지합니다.`;
  } else if (retentionPercentage === 0) {
    baseText = `${perfume.name} 향수의 기본 배합을 완전히 변경합니다.`;
  } else {
    baseText = `${perfume.name} 향수의 기본 배합을 ${retentionPercentage}% 유지합니다.`;
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