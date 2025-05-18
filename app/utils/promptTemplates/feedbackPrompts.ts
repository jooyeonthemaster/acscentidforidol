import { PerfumeFeedback, ScentComponent, TestGuide, CustomPerfumeRecipe, PerfumeCategory, CategoryPreference, FragranceCharacteristic, CharacteristicValue } from '@/app/types/perfume';

/**
 * 커스텀 향수 레시피 생성을 위한 프롬프트 템플릿
 * 
 * @param feedback 사용자가 제출한 피드백 데이터
 * @returns 프롬프트 문자열
 */
export function generateCustomPerfumePrompt(feedback: PerfumeFeedback): string {
  // 향 카테고리 선호도 처리
  const categoryPreferences = feedback.categoryPreferences 
    ? Object.entries(feedback.categoryPreferences)
      .map(([category, preference]) => `- ${category}: ${preference}`)
      .join('\n')
    : '';

  // 특정 향 조정 처리
  const specificScents = feedback.specificScents?.length
    ? feedback.specificScents
      .map(scent => `- ${scent.action === 'add' ? '추가' : '제거'}: ${scent.name}${scent.description ? ` (${scent.description})` : ''}`)
      .join('\n')
    : '';

  // 향 특성 처리
  const characteristicPreferences = feedback.userCharacteristics
    ? Object.entries(feedback.userCharacteristics)
      .map(([characteristic, value]) => `- ${characteristic}: ${value}`)
      .join('\n')
    : '';

  // 기존 향 유지 비율
  const retentionPercentage = feedback.retentionPercentage || 50;

  return `
당신은 전문 조향사입니다. 사용자의 피드백을 바탕으로 커스텀 향수 레시피를 생성해야 합니다.

## 피드백 정보
- 기본 향수: ${feedback.perfumeName || '미지정 향수'} (ID: ${feedback.perfumeId})
- 첫인상: ${feedback.impression || '평가 없음'}
- 기존 향 유지 비율: ${retentionPercentage}%

## 향 카테고리 선호도
${categoryPreferences || '카테고리 선호도 없음'}

## 향 특성 조정
${characteristicPreferences || '특성 조정 없음'}

## 특정 향 조정
${specificScents || '특정 향 조정 없음'}

## 추가 코멘트
${feedback.notes || '추가 코멘트 없음'}

## 요구사항:
1. 피드백을 바탕으로 10ml와 50ml 용량의 향수에 대한 향료 배합량 레시피를 제안하세요.
   - 10ml 향수: 총 1g의 향료 사용 (향료 비율 유지)
   - 50ml 향수: 총 5g의 향료 사용 (향료 비율 유지)
2. 각 향료의 양은 g 단위로 표시하고, 소수점 둘째 자리까지 정확하게 계산하세요.
3. 향료 알갱이를 사용한 간단한 테스트 방법도 안내해주세요 (예: "MS-1234567와 MS-7654321를 1:2 비율로 섞어보세요").
4. 향의 강도나 지속력에 대한 고려는 제외하고 향 자체에 집중하세요.
5. 기존 향 유지 비율(${retentionPercentage}%)을 고려하여 기존 향의 특성을 해당 비율만큼 유지하세요.

응답은 다음 JSON 형식으로 정확히 반환하세요:
{
  "recipe": {
    "10ml": [
      { "name": "향료 이름", "amount": "0.xx g", "percentage": xx }
    ],
    "50ml": [
      { "name": "향료 이름", "amount": "0.xx g", "percentage": xx }
    ]
  },
  "testGuide": {
    "instructions": "테스트 방법에 대한 설명",
    "scentMixtures": [
      { "name": "향료1", "ratio": 60 },
      { "name": "향료2", "ratio": 40 }
    ]
  },
  "explanation": {
    "rationale": "배합 이유에 대한 설명",
    "expectedResult": "예상되는 향의 특징",
    "recommendation": "이 향수가 어울리는 상황이나 계절 등 추천 사항"
  }
}
`;
}

/**
 * JSON 형식의 응답을 파싱하여 객체로 변환
 * 
 * @param responseText AI 응답 텍스트
 * @returns 처리된 객체와 레시피
 */
export function parseCustomPerfumeRecipe(responseText: string): { recipe: CustomPerfumeRecipe } {
  try {
    // JSON 부분만 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('응답에서 JSON 형식을 찾을 수 없습니다.');
    }
    
    const jsonStr = jsonMatch[0];
    const parsedResult = JSON.parse(jsonStr);
    
    // 필수 필드 검증
    if (!parsedResult.recipe || !parsedResult.testGuide || !parsedResult.explanation) {
      throw new Error('필수 정보가 누락되었습니다.');
    }
    
    // 완성된 커스텀 레시피 반환
    return {
      recipe: {
        ...parsedResult,
        basedOn: 'Custom Perfume Recipe'
      } as CustomPerfumeRecipe
    };
  } catch (error) {
    console.error('레시피 파싱 오류:', error);
    
    // 기본 응답 생성
    return {
      recipe: {
        basedOn: 'Default Recipe',
        recipe: {
          '10ml': [
            { name: 'Default Scent', amount: '1.00g', percentage: 100 }
          ],
          '50ml': [
            { name: 'Default Scent', amount: '5.00g', percentage: 100 }
          ]
        },
        testGuide: {
          instructions: '테스트 데이터를 생성하는 중 오류가 발생했습니다.',
          scentMixtures: [
            { name: 'Default Scent', ratio: 100 }
          ]
        },
        explanation: {
          rationale: '파싱 오류로 인해 기본 레시피가 생성되었습니다.',
          expectedResult: '기본 향을 유지합니다.',
          recommendation: '원본 향수를 그대로 사용하는 것을 권장합니다.'
        }
      } as CustomPerfumeRecipe
    };
  }
}

/**
 * 장시간 향이 지속되는 10가지 주요 향료
 */
export const LONG_LASTING_SCENTS = [
  '패출리',
  '바닐라',
  '샌달우드',
  '베티버',
  '앰버',
  '머스크',
  '시더우드',
  '통카빈',
  '라벤더',
  '베르가못'
]; 