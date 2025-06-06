import { PerfumeFeedback, PerfumeCategory, CategoryPreference, FragranceCharacteristic, CharacteristicValue, GeminiPerfumeSuggestion, PerfumePersona, ScentCategoryScores, CustomPerfumeRecipe, CategoryDataPoint, CategoryChangeInfo, TestingRecipeData, ContradictionInfo, SpecificScent, TestingGranule } from '@/app/types/perfume';

/**
 * 커스텀 향수 레시피 생성을 위한 프롬프트 템플릿
 * UI 요구사항을 반영하여 Gemini API가 상세한 JSON을 생성하도록 유도
 * @param feedback 사용자의 피드백과 초기 제안을 포함하는 데이터
 * @returns 프롬프트 문자열
 */
export function generateCustomPerfumePrompt(feedback: GeminiPerfumeSuggestion & { categoryPreferences?: PerfumeFeedback['categoryPreferences'], userCharacteristics?: PerfumeFeedback['userCharacteristics'], specificScents?: SpecificScent[], notes?: string, impression?: string }): string {
  const categoryPreferences = feedback.categoryPreferences
    ? Object.entries(feedback.categoryPreferences)
      .map(([category, preference]) => `- ${category}: ${preference}`)
      .join('\n')
    : '제공되지 않음';

  const specificScents = feedback.specificScents?.length
    ? feedback.specificScents
      .map(scent => {
        return `- ${scent.action === 'add' ? '추가 요청' : '제거 요청'}: ${scent.name}${scent.description ? ` (${scent.description})` : ''}`;
      })
      .join('\n')
    : '제공되지 않음';

  const characteristicPreferences = feedback.userCharacteristics
    ? Object.entries(feedback.userCharacteristics)
      .map(([characteristic, value]) => `- ${characteristic}: ${value}`)
      .join('\n')
    : '제공되지 않음';

  const retentionPercentage = feedback.retentionPercentage || 50;
  const perfumeName = feedback.originalPerfumeName || '미지정 향수';
  const perfumeId = feedback.perfumeId;

  const personaDataSourceMention = "'@/app/data/perfumePersonas.ts' 파일의 'personas' 배열";
  const granuleCategoryGuidance = `각 추천 향료의 주된 향 계열(mainCategory)은 ${personaDataSourceMention}에 정의된 해당 향료의 'categories' 객체를 참고하여 가장 대표적인 한글 카테고리명으로 명시해주세요.`;
  const aiName = "Personal Scent";

  return `
당신은 천재적인 조향사 AI '${aiName}'입니다. 사용자의 상세한 피드백을 면밀히 분석하여, 사용자가 직접 시향해볼 수 있는 테스팅 향료 조합 레시피를 제안해야 합니다. 응답은 반드시 아래 명시된 JSON 구조를 따라야 하며, 모든 필드를 포함해야 합니다. UI 화면에는 당신이 제공한 JSON 데이터가 직접 사용됩니다.

!! 절대적으로 중요한 규칙 !!
당신이 추천하는 모든 향료는 반드시 아래 목록에 있는 ID와 이름만을 사용해야 합니다.
목록에 없는 ID나 이름을 사용하면 응답이 완전히 거부되고 오류가 발생합니다.
이 규칙을 위반하면 전체 응답이 무효화됩니다.

사용 가능한 향료 목록 (절대로 이 목록 외의 ID나 이름을 사용하지 마세요):
- ID: "BK-2201281", 이름: "블랙베리"
- ID: "MD-8602341", 이름: "만다린 오렌지"
- ID: "ST-3503281", 이름: "스트로베리"
- ID: "BG-8704231", 이름: "베르가못"
- ID: "BO-6305221", 이름: "비터 오렌지"
- ID: "CR-3706221", 이름: "캐럿"
- ID: "RS-2807221", 이름: "로즈"
- ID: "TB-2808221", 이름: "튜베로즈"
- ID: "OB-6809221", 이름: "오렌지 블라썸"
- ID: "TL-2810221", 이름: "튤립"
- ID: "LM-7211441", 이름: "라임"
- ID: "LV-2812221", 이름: "은방울꽃"
- ID: "YJ-8213431", 이름: "유자"
- ID: "MT-8614231", 이름: "민트"
- ID: "PT-8415331", 이름: "페티그레인"
- ID: "SD-2216141", 이름: "샌달우드"
- ID: "LP-6317181", 이름: "레몬페퍼"
- ID: "PP-3218181", 이름: "핑크페퍼"
- ID: "SS-8219241", 이름: "바다소금"
- ID: "TM-2320461", 이름: "타임"
- ID: "MS-2621712", 이름: "머스크"
- ID: "WR-2622131", 이름: "화이트로즈"
- ID: "SW-2623121", 이름: "스웨이드"
- ID: "IM-4324311", 이름: "이탈리안만다린"
- ID: "LV-2225161", 이름: "라벤더"
- ID: "IC-3126171", 이름: "이탈리안사이프러스"
- ID: "SW-1227171", 이름: "스모키 블렌드 우드"
- ID: "LD-2128524", 이름: "레더"
- ID: "VL-2129241", 이름: "바이올렛"
- ID: "FG-3430721", 이름: "무화과"

위 목록에 있는 ID와 이름만 사용하세요. 다른 ID나 이름을 만들거나 수정하지 마세요. 위 목록은 ${personaDataSourceMention}에서 가져온 실제 데이터입니다.

매우 중요한 규칙: 당신이 추천하는 모든 향료(granules)의 id와 name은 반드시 ${personaDataSourceMention}에 실제로 정의된 값과 정확히 일치해야 합니다. 어떠한 경우에도 임의의 ID, 수정된 ID, 존재하지 않는 ID를 생성하거나 사용해서는 안 됩니다. 이 규칙을 위반한 응답은 유효하지 않은 것으로 처리됩니다.

분석 대상: 기존 추천 향수 정보 (Data Source: ${personaDataSourceMention})
- 향수 ID: ${perfumeId}
- 향수 이름: ${perfumeName}
- 향수 설명 (초기): ${feedback.overallExplanation || '제공된 초기 설명 없음'}
- 기존 향수 카테고리별 점수 (1-10점 스케일):
${feedback.initialCategoryGraphData?.map((data: CategoryDataPoint) => `  - ${data.axis}: ${data.value}`).join('\n') || '  초기 그래프 데이터 없음'}

사용자 피드백 상세
- 기존 향 유지 비율 (매우 중요): ${retentionPercentage}% (이 비율만큼 원본 향수(${perfumeName}, ID: ${perfumeId})의 특징이 유지되어야 합니다)
- 첫인상 (선택 사항): ${feedback.impression || '제공되지 않음'}
- 향 카테고리 선호도 (증가/감소/유지):
${categoryPreferences}
- 주요 향 특성 선호도 (무게감, 달콤함, 청량감, 독특함 - veryLow/low/medium/high/veryHigh):
${characteristicPreferences}
- 구체적인 향료 추가/제거 요청 (선택 사항):
${specificScents}
    *   만약 사용자가 추가를 요청한 특정 향료의 이름이 ${personaDataSourceMention}에 없다면, 해당 요청을 반영하기 어렵다는 점을 contradictionWarning이나 reason에 명확히 명시하고, 해당 향료를 추천 목록에 포함하지 마십시오.
- 자유 코멘트 (선택 사항): ${feedback.notes || '추가 코멘트 없음'}

당신의 임무 및 핵심 요구사항

1.  피드백 분석 및 테스팅 레시피 생성:
    *   사용자의 모든 피드백(향 유지 비율, 카테고리/특성 선호도, 특정 향료 요청 등)을 종합적으로 고려합니다.
    *   유지 비율 절대 준수: '${retentionPercentage}%'의 기존 향 유지 비율을 반드시 반영하여, 원본 향(${perfumeName})의 느낌과 주요 특징이 해당 비율만큼 새로운 조합에서도 느껴지도록 해야 합니다. 이것은 테스팅 레시피 구성에서 가장 중요한 규칙 중 하나입니다.
    *   향료 추천 (매우 중요 규칙 필독): 2~3개의 테스팅용 향료(granules)를 추천합니다. 다시 한번 강조합니다: 추천되는 각 향료는 반드시 위에 나열된 목록에서 선택해야 하며, ${personaDataSourceMention}에 정의된 기존 향수 페르소나 중 하나여야 합니다.
        *   규칙 1 (원본 향수 포함 및 비율 고정): 추천되는 향료 중 첫 번째는 반드시 원본 추천 향수 (ID: '${perfumeId}', 이름: '${perfumeName}')여야 합니다. 이 첫 번째 향료의 ratio (비율) 값은 사용자가 설정한 기존 향 유지 비율인 정확히 ${retentionPercentage}% 여야 합니다. drops는 이 비율과 다른 향료들과의 관계를 고려하여 AI가 자율적으로 1-10 사이로 설정하되, 전체 방울 합이 5-15개가 되도록 합니다.
        *   규칙 2 (ID 및 이름 정확성): 나머지 추천 향료 및 원본 향료를 포함한 모든 향료의 id와 name은 반드시 위에 나열된 목록과 ${personaDataSourceMention}에 정의된 기존 향수 페르소나의 것과 정확히 일치해야 합니다. 절대로 임의의 ID나 이름을 생성/수정하지 마십시오.
        *   규칙 3 (나머지 향료 비율): 원본 향수를 제외한 나머지 모든 추천 향료들의 ratio 값의 총합은 (100 - ${retentionPercentage})%가 되어야 합니다. (AI가 이 계산을 정확히 수행해야 합니다). 각 추가 향료의 ratio는 AI가 결정하되, 이 총합을 준수해야 합니다.
        *   각 향료는 다음 정보를 포함해야 합니다:
            *   id: (규칙 1, 2 준수)
            *   name: (규칙 1, 2 준수)
            *   mainCategory: ${granuleCategoryGuidance}
            *   drops: (규칙 1 준수 하에 AI가 자율 결정, 각 향료 1-10 방울, 총합 5-15 방울)
            *   ratio: (규칙 1, 3 준수, 정수값)
            *   reason: 해당 향료를 해당 방울 수와 비율로 추천한 구체적인 이유. 원본 향수의 경우, "기존 '${perfumeName}' 향수의 특징을 사용자의 요청에 따라 ${retentionPercentage}% 유지하기 위해 핵심 베이스로 포함되었습니다." 와 같이 명확한 이유가 포함되어야 합니다. 다른 향료들은 사용자의 어떤 피드백을 반영하는지, 원본 향과 어떻게 조화를 이루는지 등을 설명합니다.
    *   모순점 및 존재하지 않는 향료 요청 처리: 사용자의 피드백 간에 명백한 모순이 발견될 경우, 또는 사용자가 추가를 요청한 특정 향료가 ${personaDataSourceMention}에 없어 추천 목록에 포함할 수 없는 경우, 이를 'contradictionWarning' 객체에 해당 내용을 명확히 포함시켜야 합니다. 추천 불가능한 향료는 'granules' 배열에 절대 포함시키지 마십시오.

2.  그래프 데이터 생성:
    *   'initialCategoryGraphData': 원본 향수의 카테고리별 점수를 그대로 사용합니다.
    *   'adjustedCategoryGraphData': 당신이 제안하는 테스팅 레시피의 최종적인 향기 프로필을 나타내는 카테고리별 예상 점수를 0-10 사이의 값으로 생성합니다.

3.  카테고리 변경 요약 ('categoryChanges'):
    *   각 주요 향 카테고리가 원본 대비 테스팅 레시피에서 어떻게 변화했는지와 그 이유를 간략히 설명합니다.

4.  테스팅 안내 문구 생성:
    *   'testingRecipe.purpose'
    *   'testingRecipe.instructions' (step1, step2, step3, caution 포함)

5.  전체적인 설명 ('overallExplanation'):

6.  최종 레시피 여부 ('isFinalRecipe'): 항상 false입니다.

응답 JSON 구조 (반드시 이 형식 준수, 모든 키와 값 타입을 정확히 지켜주세요)
\`\`\`json
{
  "perfumeId": "${perfumeId}",
  "originalPerfumeName": "${perfumeName}",
  "retentionPercentage": ${retentionPercentage},
  "overallExplanation": "(AI가 생성한 테스팅 레시피 및 피드백 반영 결과에 대한 종합 설명)",
  "initialCategoryGraphData": [
    ${feedback.initialCategoryGraphData?.map((data: CategoryDataPoint) => `{ "axis": "${data.axis}", "value": ${data.value} }`).join(',\\n    ')}
  ],
  "adjustedCategoryGraphData": [
    // AI가 계산한, 테스팅 레시피의 예상 카테고리별 점수
  ],
  "categoryChanges": [
    // 각 주요 카테고리별 변화 상태와 이유 명시
  ],
  "testingRecipe": {
    "purpose": "(AI가 작성한 테스팅 레시피의 목적)",
    "granules": [
      // 중요: 아래 예시는 perfumePersonas.ts에 실제 존재하는 데이터를 기반으로, retentionPercentage가 20%라고 가정한 예시입니다.
      // 당신의 응답도 반드시 이와 같이 실제 데이터만을 사용하고, 첫 번째 granule은 원본 향수여야 하며, 그 ratio는 retentionPercentage 값과 정확히 일치해야 합니다.
      // 예시 (retentionPercentage가 20%라고 가정 시):
      // {
      //   "id": "${perfumeId}",      // 실제 원본 향수 ID (예: TL-2810221)
      //   "name": "${perfumeName}",    // 실제 원본 향수 이름 (예: 튤립)
      //   "mainCategory": "플로럴",   // 원본 향수의 대표 카테고리
      //   "drops": 2,                // 예시 방울 수 (AI가 결정)
      //   "ratio": 20,               // retentionPercentage 값과 동일해야 함
      //   "reason": "기존 '${perfumeName}' 향수의 특징을 사용자의 요청에 따라 20% 유지하기 위해 핵심 베이스로 포함되었습니다."
      // },
      // {
      //   "id": "YJ-8213431",      // perfumePersonas.ts에 있는 실제 ID
      //   "name": "유자",          // perfumePersonas.ts에 있는 실제 이름
      //   "mainCategory": "시트러스",
      //   "drops": 4,
      //   "ratio": 40,               // (100 - 20)의 일부
      //   "reason": "사용자님의 시트러스 선호도 증가 요청을 반영하고, '${perfumeName}'의 플로럴 노트와 조화를 이루며 상큼함을 더하기 위해 유자를 40% 비율로 추가했습니다."
      // },
      // {
      //   "id": "BK-2201281",      // perfumePersonas.ts에 있는 실제 ID
      //   "name": "블랙베리",      // perfumePersonas.ts에 있는 실제 이름
      //   "mainCategory": "프루티",
      //   "drops": 4,
      //   "ratio": 40,               // (100 - 20)의 나머지 부분
      //   "reason": "전체적인 향에 달콤함과 풍부한 과일의 느낌을 더하고, 사용자의 프루티 계열 선호도를 반영하기 위해 블랙베리를 40% 비율로 포함했습니다."
      // }
      // AI는 위 규칙과 예시에 따라, granules 배열의 첫 번째 요소로 원본 향수(${perfumeId}, ${perfumeName})를 포함하고, 
      // 해당 향료의 ratio는 반드시 ${retentionPercentage} (사용자가 입력한 실제 값)으로 설정해야 합니다.
      // 나머지 향료들의 ratio 합은 (100 - ${retentionPercentage})가 되어야 합니다.
      // 모든 향료의 ID와 이름은 ${personaDataSourceMention}의 것을 그대로 사용해야 합니다.
    ],
    "instructions": {
      "step1": {
        "title": "Step 1: 향료 방울 준비",
        "description": "아래 목록의 향료 방울을 준비하세요.",
        "details": "각 향료 코드와 개수를 정확히 확인하세요."
      },
      "step2": {
        "title": "Step 2: 향료 혼합하기",
        "description": "준비한 모든 방울을 작은 용기에 함께 넣고 부드럽게 섞어주세요.",
        "details": "모든 방울을 용기에 넣고 10초 이상 부드럽게 흔들어주세요."
      },
      "step3": {
        "title": "Step 3: 시향 테스트",
        "description": "혼합된 방울에서 나는 향을 맡고 전체적인 느낌을 평가하세요.",
        "details": "이 테스트는 실제 향수 제작 전 향 조합을 확인하는 목적입니다."
      },
      "caution": "이 테스팅 레시피는 향수 제작 전 시향(향 테스트)을 위한 것입니다... (기존 내용과 유사하게)"
    }
  },
  "isFinalRecipe": false,
  "contradictionWarning": null // 또는 모순/문제 발생 시 메시지 포함
}
\`\`\`

참고: 응답은 위에 명시된 JSON 구조만을 포함해야 하며, 다른 설명이나 마크다운 포맷팅 없이 순수 JSON 텍스트로 제공되어야 합니다. 모든 키와 값 타입을 정확히 지켜주세요. 특히, 향료의 id와 name은 반드시 위에 나열된 목록과 '@/app/data/perfumePersonas.ts' 파일의 'personas' 배열에 명시된 실제 값이어야 하며, 첫 번째 향료의 ratio는 사용자가 설정한 retentionPercentage와 정확히 일치해야 합니다. 이를 어길 시 응답은 사용될 수 없습니다.
`;
}

/**
 * JSON 형식의 응답을 파싱하여 GeminiPerfumeSuggestion 객체로 변환
 * 
 * @param responseText AI 응답 텍스트
 * @returns 파싱된 GeminiPerfumeSuggestion 객체 또는 에러 시 기본 객체
 */
export function parseCustomPerfumeRecipe(responseText: string): GeminiPerfumeSuggestion {
  try {
    const jsonMatch = responseText.match(/\\`\\`\\`json([\\s\\S]*?)\\`\\`\\`/);
    let jsonStr;
    if (!jsonMatch || !jsonMatch[1]) {
      console.warn('응답에서 ```json ... ``` 코드 블록을 찾을 수 없습니다. 일반 JSON 파싱을 시도합니다.', responseText);
      const plainJsonMatch = responseText.match(/\{([\s\S]*)\}/);
      if (!plainJsonMatch || !plainJsonMatch[0]) {
        console.error('일반 JSON 형식도 찾을 수 없습니다.', responseText);
        throw new Error('응답에서 JSON 형식을 찾을 수 없습니다.');
      }
      jsonStr = plainJsonMatch[0];
    } else {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsedResult = JSON.parse(jsonStr) as GeminiPerfumeSuggestion;
    
    if (
      !parsedResult.perfumeId ||
      !parsedResult.originalPerfumeName ||
      !parsedResult.initialCategoryGraphData ||
      !parsedResult.adjustedCategoryGraphData ||
      !parsedResult.categoryChanges ||
      !parsedResult.testingRecipe ||
      !parsedResult.testingRecipe.granules || 
      !parsedResult.testingRecipe.granules.every(g => typeof g.id !== 'undefined' && typeof g.name !== 'undefined' && typeof g.mainCategory !== 'undefined' && typeof g.drops !== 'undefined' && typeof g.ratio !== 'undefined' && typeof g.reason !== 'undefined') || 
      !parsedResult.testingRecipe.instructions ||
      typeof parsedResult.retentionPercentage === 'undefined' ||
      typeof parsedResult.isFinalRecipe === 'undefined'
    ) {
      console.error('파싱된 결과에 필수 정보가 누락되었습니다. (parseCustomPerfumeRecipe)', parsedResult, jsonStr); 
      const missingFields = [];
      if (!parsedResult.perfumeId) missingFields.push('perfumeId');
      if (!parsedResult.originalPerfumeName) missingFields.push('originalPerfumeName');
      if (!parsedResult.initialCategoryGraphData) missingFields.push('initialCategoryGraphData');
      if (!parsedResult.adjustedCategoryGraphData) missingFields.push('adjustedCategoryGraphData');
      if (!parsedResult.categoryChanges) missingFields.push('categoryChanges');
      if (!parsedResult.testingRecipe) missingFields.push('testingRecipe');
      if (parsedResult.testingRecipe && !parsedResult.testingRecipe.granules) missingFields.push('testingRecipe.granules');
      if (parsedResult.testingRecipe && parsedResult.testingRecipe.granules && !parsedResult.testingRecipe.granules.every(g => !!(g.id && g.name && g.mainCategory && typeof g.drops !== 'undefined' && typeof g.ratio !== 'undefined' && g.reason))) missingFields.push('testingRecipe.granules[].<all_fields>');
      if (parsedResult.testingRecipe && !parsedResult.testingRecipe.instructions) missingFields.push('testingRecipe.instructions');
      if (typeof parsedResult.retentionPercentage === 'undefined') missingFields.push('retentionPercentage');
      if (typeof parsedResult.isFinalRecipe === 'undefined') missingFields.push('isFinalRecipe');
      throw new Error(`필수 정보가 누락되었습니다. 누락된 필드: ${missingFields.join(', ')}`);
    }
    return parsedResult;

  } catch (error) {
    console.error('레시피 파싱 오류 (parseCustomPerfumeRecipe):', error, responseText);
    
    return {
        perfumeId: 'ERROR_UNKNOWN_ID',
        originalPerfumeName: '파싱 오류 발생',
        retentionPercentage: 0,
        overallExplanation: 'Gemini API 응답을 파싱하는 중 오류가 발생하여 기본값을 반환합니다. 자세한 내용은 콘솔을 확인해주세요.',
        initialCategoryGraphData: [],
        adjustedCategoryGraphData: [],
        categoryChanges: [{ category: 'citrus', change: '조정', reason: '데이터 파싱 중 문제가 발생했습니다.' }],
        testingRecipe: {
            purpose: '데이터 파싱 오류로 기본 안내를 표시합니다.',
            granules: [{id: 'ERR-001', name: '오류 안내', mainCategory: 'citrus' as PerfumeCategory, drops: 1, ratio: 100, reason: 'API 응답 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}],
            instructions: {
              step1: { title: '오류', description: '데이터 로딩 실패', details: ''},
              step2: { title: '오류', description: '데이터 로딩 실패', details: ''},
              step3: { title: '오류', description: '데이터 로딩 실패', details: ''},
              caution: '현재 서비스 응답을 처리할 수 없습니다. 관리자에게 문의하거나 잠시 후 다시 시도해주세요.'
            },
        },
        isFinalRecipe: false,
        contradictionWarning: {
            message: error instanceof Error ? `파싱 오류: ${error.message}` : '알 수 없는 파싱 오류'
        },
    } as GeminiPerfumeSuggestion;
  }
}

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

export function parseGeminiPerfumeSuggestion(responseText: string): GeminiPerfumeSuggestion | null {
  try {
    // parseCustomPerfumeRecipe가 이제 GeminiPerfumeSuggestion을 반환하므로, 해당 함수를 직접 사용하거나,
    // 이 함수는 parseCustomPerfumeRecipe의 래퍼(wrapper) 형태로 유지할 수 있습니다.
    // 에러 처리 방식이나 반환 값(null 또는 기본 객체)을 다르게 하고 싶을 때 유용합니다.
    return parseCustomPerfumeRecipe(responseText);
  } catch (error) {
    // parseCustomPerfumeRecipe 내부에서 이미 console.error를 호출합니다.
    // 여기서는 추가적인 로깅이나 다른 처리가 필요하면 수행합니다.
    console.error('Gemini 향수 제안 파싱 오류 (parseGeminiPerfumeSuggestion 래퍼):', error, responseText);
    return null; // 또는 parseCustomPerfumeRecipe처럼 기본 객체를 반환할 수도 있습니다.
  }
} 