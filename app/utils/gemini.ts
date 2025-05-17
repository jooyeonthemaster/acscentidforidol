import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ImageAnalysisResult } from '../types/perfume';
import perfumePersonas from '../data/perfumePersonas';
import { perfumes } from '../data/perfumeData';

// 아이돌 정보 인터페이스
interface IdolInfo {
  name: string;
  group?: string;
  style?: string[];
  personality?: string[];
  charms?: string;
}

// 초기 설정 - API 키 확인
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.');
}

// GoogleGenerativeAI 인스턴스 생성
let genAI: any = null;
let model: any = null;

// 모델 설정 - gemini-2.0-flash 모델 사용 (최신 버전으로 고정)
const modelName = 'gemini-2.0-flash';

/**
 * Gemini API 초기화 함수
 */
export function initializeGeminiAPI() {
  console.log('Gemini API 초기화 시작');
  
  try {
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다');
    }
    
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API 초기화 완료');
    
    initializeModel();
  } catch (error) {
    console.error('Gemini API 초기화 실패:', error);
    throw new Error('Gemini API 초기화에 실패했습니다');
  }
}

/**
 * 모델 초기화 함수
 */
export function initializeModel() {
  console.log('모델 초기화 시작:', modelName);
  
  try {
    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }
    
    model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.2,  // 낮은 온도로 일관된 결과 유도
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
    
    console.log('모델 초기화 완료');
  } catch (error) {
    console.error('모델 초기화 실패:', error);
    throw new Error(`모델 초기화에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 아이돌 이미지를 분석하여 향수 추천을 위한 특성과 분위기를 추출합니다.
 * @param imageBase64 - Base64 인코딩된 이미지 데이터
 * @param idolInfo - 아이돌 정보
 * @returns 이미지 분석 결과
 */
export async function analyzeIdolImage(
  imageBase64: string,
  idolInfo: IdolInfo
): Promise<ImageAnalysisResult> {
  try {
    // API 및 모델 초기화 확인
    if (!genAI || !model) {
      console.log('API 및 모델 초기화 필요');
      initializeGeminiAPI();
    }
    
    console.log('이미지 분석 시작:', { 
      modelName, 
      idolName: idolInfo.name,
      idolGroup: idolInfo.group || '미지정',
      imageSize: Math.round(imageBase64.length / 1024) + 'KB' 
    });

    // 이미지 데이터를 Part 객체로 변환
    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    // 최적화된 프롬프트 - gemini-2.0-flash 모델용
    const prompt = `당신은 아이돌 이미지를 분석하고 이미지 분위기에 맞는 향수를 추천하는 전문가입니다. 섹시하고 자극적인 표현과 유쾌한 문장으로 분석 결과를 작성해야 합니다.

## 분석 대상
- 아이돌 이름: ${idolInfo.name}
- 그룹: ${idolInfo.group || '없음'}
- 스타일 키워드: ${idolInfo.style?.join(', ') || '미제공'}
- 성격 키워드: ${idolInfo.personality?.join(', ') || '미제공'}
- 추가 매력 포인트: ${idolInfo.charms || '미제공'}

## 향수 관련 특성 설명
1. 섹시함(sexy): 관능적이고 매혹적인 이미지 점수 (3-10)
2. 귀여움(cute): 애교 있고 사랑스러운 이미지 점수 (3-10)
3. 카리스마(charisma): 강한 존재감과 영향력 점수 (3-10)
4. 다크함(darkness): 신비롭고 어두운 매력 점수 (3-10)
5. 청량함(freshness): 상쾌하고 활기찬 이미지 점수 (3-10)
6. 우아함(elegance): 고급스럽고 세련된 이미지 점수 (3-10)
7. 자유로움(freedom): 구속받지 않는 자유로운 이미지 점수 (3-10)
8. 럭셔리함(luxury): 고급스럽고 풍요로운 이미지 점수 (3-10)
9. 순수함(purity): 깨끗하고 순수한 이미지 점수 (3-10)
10. 독특함(uniqueness): 개성 있고 독특한 이미지 점수 (3-10)

## 중요 안내
- 향 카테고리(citrus, floral 등)는 이미 향수 데이터에 정의되어 있으므로 AI가 생성하지 않습니다.
- 특성(traits) 점수만 생성하여 향수 매칭에 사용합니다.
- 각 특성 점수는 3-10 사이의 정수로, 모든 값이 서로 다르게 분포되어야 합니다. 
- 반드시 모든 10가지 특성 점수를 포함해야 합니다. 누락된 점수가 있으면 안됩니다.
- 이미지 분석은 매우 상세하고 자극적이며 유쾌한 표현으로 제공해야 합니다.
- 특히 mood, style, aura, toneAndManner 설명은 매우 자극적이고 유쾌한 톤으로 작성해야 합니다.

## 작성 스타일 가이드
- "~~한 것 같아요"와 같은 소극적인 표현 대신 "~~다" 형식의 선언적 문장 사용
- 직접적인 화법, 마치 인스타그램이나 트위터 인플루언서처럼 자신감 있는 표현 사용
- 따옴표를 활용한 말투 인용 (예: "이게 분위기야? 이건 내 아우라지!")
- 과장된 표현과 감탄문 사용 (예: "눈빛만으로 세상을 정복할 준비 완료!")
- 형용사와 부사를 과감하게 사용하여 강렬한 이미지 묘사
- 짧고 임팩트 있는 문장 사용 (예: "매력 폭격기. 걸을 때마다 공기가 바뀐다.")
- 트렌디한 인터넷 용어와 이모티콘 활용
- 아래 참고 예시처럼 유쾌하고 과장된 문장으로 작성

## 분석 스타일 참고 예시
- mood 예시: "눈 마주치는 순간 영혼까지 사로잡는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감의 소유자."
- style 예시: "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재."
- aura 예시: "순백의 화려함으로 모든 시선을 강탈하는 인간 다이아몬드. 파티의 중심에 서는 것이 운명인 존재. \"화려함은 내 본질이에요.\" 향기에 취한 남자들이 정신을 잃는 마법사."
- toneAndManner 예시: "\"난 일 안 해도 돈이 들어와\"라고 말해도 의심하지 않을 완벽한 여유로움. 칵테일 한 잔에 인생의 모든 걱정을 지운 휴양지의 정령. 발걸음마다 자유와 쿨함이 흘러넘치는 존재."

## 분석 요청
제공된 이미지와 아이돌 정보를 분석하여 다음 정보를 JSON 형식으로 제공해주세요:

1. 각 향수 특성(traits)에 대한 점수(3-10점 사이, 모든 값이 다르게 분포) - 이 부분이 가장 중요합니다! 반드시 모든 10가지 특성을 포함해야 합니다.
2. 이미지에서 감지되는 주요 색상(HEX 코드)
3. 퍼스널 컬러 분석(계절감, 톤, 추천 색상 팔레트)
4. 이미지의 스타일, 분위기, 아우라, 톤앤매너 등을 상세히 설명 - 매우 자극적이고 유쾌한 톤으로 작성!
5. 이미지와 잘 어울리는 키워드
6. 사용자 입력 정보를 반영한 맞춤형 분석 내용

반드시 다음 JSON 형식으로만 응답하세요. 설명 없이 JSON만 반환해주세요.

\`\`\`json
{
  "traits": {
    "sexy": 7,      // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "cute": 5,      // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "charisma": 8,  // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "darkness": 3,  // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "freshness": 6, // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "elegance": 9,  // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "freedom": 4,   // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "luxury": 10,   // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "purity": 3,    // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
    "uniqueness": 7 // 3-10 사이 정수, 필수 포함, 모든 값이 다르게
  },
  "dominantColors": ["#FFD700", "#FF4500", "#1E90FF", "#9932CC"],
  "personalColor": {
    "season": "spring",  // spring, summer, autumn, winter 중 하나
    "tone": "bright",    // bright, mute, deep, light 등 톤 설명
    "palette": ["#FFD700", "#FFA500", "#FF4500", "#FF6347"],
    "description": "밝고 따뜻한 느낌의 봄 타입 컬러로, 화사하고 생동감 있는 이미지를 표현합니다."
  },
  "analysis": {
    "mood": "눈 마주치는 순간 영혼까지 사로잡는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감의 소유자.",
    "style": "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재.",
    "expression": "자신감 있고 당당한 표현 방식으로, 눈빛만으로 원하는 것을 얻어내는 통찰력의 소유자. \"내가 원하는 건 항상 내 앞에 있어야 해\"라는 아우라가 넘쳐흐르는 표정 관리의 달인.",
    "concept": "비비드한 에너지와 럭셔리한 감성이 공존하는 모순적 매력의 정점. 도전적이면서도 안정적인, 파격적이면서도 클래식한 양면성의 완벽한 균형점.",
    "aura": "순백의 화려함으로 모든 시선을 강탈하는 인간 다이아몬드. 파티의 중심에 서는 것이 운명인 존재. \"화려함은 내 본질이에요.\" 향기에 취한 남자들이 정신을 잃는 마법사.",
    "toneAndManner": "\"난 일 안 해도 돈이 들어와\"라고 말해도 의심하지 않을 완벽한 여유로움. 칵테일 한 잔에 인생의 모든 걱정을 지운 휴양지의 정령. 발걸음마다 자유와 쿨함이 흘러넘치는 존재.",
    "detailedDescription": "화려한 색감과 당당한 포즈가 강한 자신감을 드러내며, 표정에서는 부드러운 미소와 함께 카리스마가 느껴집니다."
  },
  "matchingKeywords": [
    "생동감", "트렌디", "개성적", "화려함", "자신감",
    "에너지", "독특함", "매력적", "밝음", "당당함"
  ],
  "customAnalysis": "제공해주신 ${idolInfo.name}님의 이미지에서는 ${idolInfo.style?.join(', ') || ''}의 스타일과 ${idolInfo.personality?.join(', ') || ''}의 성격이 잘 드러나며, 특히 ${idolInfo.charms || '매력적인 특징'}이 돋보입니다. 이러한 특성을 가진 향수가 잘 어울릴 것입니다."
}
\`\`\`

반드시 JSON 형식으로만 응답하고, 분석 설명은 포함하지 마세요. 잘 구문 분석되는 JSON만 제공해주세요. traits 객체는 반드시 포함해야 하며, 10개의 특성 점수가 모두 포함되어야 합니다.`;

    console.log('분석 API 요청 시작');
    // API 요청 시간 측정 시작
    const startTime = Date.now();
    
    const result = await model.generateContent([prompt, imageData]);
    
    // API 응답 소요 시간 측정
    const responseTime = Date.now() - startTime;
    console.log(`분석 API 응답 수신 (${responseTime / 1000}초 소요)`);
    
    const response = result.response;
    const text = response.text();
    console.log('분석 API 응답 텍스트 길이:', text.length);
    
    // 디버깅용 로그 (프로덕션에서는 비활성화 가능)
    if (text.length > 100) {
      console.log('응답 텍스트 일부:', text.substring(0, 100) + '...');
    } else {
      console.log('응답 텍스트:', text);
    }

    // JSON 형식 추출
    let jsonText = text;
    
    // 코드 블록 처리 (```json ... ``` 형식)
    const jsonBlockMatch = text.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonText = jsonBlockMatch[1].trim();
      console.log('JSON 코드 블록 추출됨');
    }
    
    // 불필요한 설명 텍스트 제거
    jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    console.log('JSON 파싱 시도');
    let parsedResult: ImageAnalysisResult;
    
    try {
      parsedResult = JSON.parse(jsonText);
      console.log('JSON 파싱 성공');
      
      // 결과 유효성 검사 및 필수 필드 확인
      if (!parsedResult.traits) {
        console.error('필수 분석 결과 필드(traits)가 누락됨');
        throw new Error('분석 결과에 특성(traits) 정보가 없습니다. 다시 시도해주세요.');
      }
      
      // 모든 향수 특성(traits)가 있는지 확인
      const requiredTraits = ['sexy', 'cute', 'charisma', 'darkness', 'freshness', 'elegance', 'freedom', 'luxury', 'purity', 'uniqueness'];
      const missingTraits = requiredTraits.filter(trait => !(trait in parsedResult.traits));
      
      if (missingTraits.length > 0) {
        console.error(`누락된 특성 필드: ${missingTraits.join(', ')}`);
        
        // 누락된 특성에 기본값 할당
        const usedValues = Object.values(parsedResult.traits).map(val => Number(val));
        missingTraits.forEach(trait => {
          // 3-10 사이에서 아직 사용되지 않은 값 찾기
          for (let val = 5; val <= 10; val++) {
            if (!usedValues.includes(val)) {
              parsedResult.traits[trait] = val;
              usedValues.push(val);
              break;
            }
          }
          // 값을 찾지 못했다면 기본값 5 사용
          if (!(trait in parsedResult.traits)) {
            parsedResult.traits[trait] = 5;
          }
        });
        
        console.log(`누락된 특성 필드에 기본값 할당됨: ${missingTraits.join(', ')}`);
      }
      
      // 값이 3-10 범위인지, 숫자 타입인지 확인하고 수정
      for (const trait of requiredTraits) {
        const value = parsedResult.traits[trait];
        if (typeof value !== 'number' || isNaN(value)) {
          console.warn(`특성 ${trait}의 값이 숫자가 아님, 기본값 5로 설정`);
          parsedResult.traits[trait] = 5;
        } else if (value < 3 || value > 10) {
          console.warn(`특성 ${trait}의 값(${value})이 범위를 벗어남, 조정`);
          parsedResult.traits[trait] = Math.max(3, Math.min(10, value));
        }
      }
      
      // 중복된 값이 있는지 확인하고 수정
      const values = requiredTraits.map(trait => parsedResult.traits[trait]);
      const uniqueValues = new Set(values);
      
      if (uniqueValues.size < requiredTraits.length) {
        console.warn('중복된 특성 점수가 있음, 조정');
        
        // 이미 사용된 값 추적
        const usedValues = new Set<number>();
        
        // 각 특성에 대해
        for (const trait of requiredTraits) {
          const value = parsedResult.traits[trait];
          
          // 이 값이 이미 다른 특성에 사용되었는지 확인
          if (!usedValues.has(value)) {
            usedValues.add(value);
          } else {
            // 중복된 값이라면 사용되지 않은 값 찾기
            for (let newValue = 3; newValue <= 10; newValue++) {
              if (!usedValues.has(newValue)) {
                parsedResult.traits[trait] = newValue;
                usedValues.add(newValue);
                console.log(`특성 ${trait}의 중복 값 ${value}를 ${newValue}로 조정`);
                break;
              }
            }
          }
        }
      }
      
      // scentCategories 필드가 없으면 기본값 추가 (해당 데이터는 향수 매칭에서 필요)
      if (!parsedResult.scentCategories) {
        console.log('향 카테고리 필드 추가 (기본값)');
        parsedResult.scentCategories = {
          citrus: 6,
          floral: 6, 
          woody: 6,
          musky: 6,
          fruity: 6,
          spicy: 6
        };
      }
      
      // 기타 필수 필드 확인 및 기본값 설정
      if (!parsedResult.dominantColors || !Array.isArray(parsedResult.dominantColors) || parsedResult.dominantColors.length === 0) {
        console.log('dominantColors 필드 추가 (기본값)');
        parsedResult.dominantColors = ["#FFD700", "#FF4500", "#1E90FF", "#9932CC"];
      }
      
      if (!parsedResult.personalColor) {
        console.log('personalColor 필드 추가 (기본값)');
        parsedResult.personalColor = {
          season: "spring",
          tone: "bright",
          palette: ["#FFD700", "#FFA500", "#FF4500", "#FF6347"],
          description: "밝고 따뜻한 느낌의 봄 타입 컬러로, 화사하고 생동감 있는 이미지를 표현합니다."
        };
      }
      
      if (!parsedResult.analysis) {
        console.log('analysis 필드 추가 (기본값)');
        parsedResult.analysis = {
          mood: "눈 마주치는 순간 영혼까지 사로잡는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감의 소유자.",
          style: "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재.",
          expression: "자신감 있고 당당한 표현 방식으로, 눈빛만으로 원하는 것을 얻어내는 통찰력의 소유자. \"내가 원하는 건 항상 내 앞에 있어야 해\"라는 아우라가 넘쳐흐르는 표정 관리의 달인.",
          concept: "비비드한 에너지와 럭셔리한 감성이 공존하는 모순적 매력의 정점. 도전적이면서도 안정적인, 파격적이면서도 클래식한 양면성의 완벽한 균형점.",
          aura: "순백의 화려함으로 모든 시선을 강탈하는 인간 다이아몬드. 파티의 중심에 서는 것이 운명인 존재. \"화려함은 내 본질이에요.\" 향기에 취한 남자들이 정신을 잃는 마법사.",
          toneAndManner: "\"난 일 안 해도 돈이 들어와\"라고 말해도 의심하지 않을 완벽한 여유로움. 칵테일 한 잔에 인생의 모든 걱정을 지운 휴양지의 정령. 발걸음마다 자유와 쿨함이 흘러넘치는 존재.",
          detailedDescription: "화려한 색감과 당당한 포즈가 강한 자신감을 드러내며, 표정에서는 부드러운 미소와 함께 카리스마가 느껴집니다."
        };
      }
      
      if (!parsedResult.matchingKeywords || !Array.isArray(parsedResult.matchingKeywords) || parsedResult.matchingKeywords.length === 0) {
        console.log('matchingKeywords 필드 추가 (기본값)');
        parsedResult.matchingKeywords = [
          "생동감", "트렌디", "개성적", "화려함", "자신감",
          "에너지", "독특함", "매력적", "밝음", "당당함"
        ];
      }
      
      // matchingPerfumes 필드는 분석 후 매칭 로직에서 추가되므로 초기화
      parsedResult.matchingPerfumes = [];
      
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.log('원본 응답 텍스트:', text);
      
      // JSON 형식이 아닌 경우 기본값 사용
      parsedResult = {
        traits: {
          sexy: 7,
          cute: 5,
          charisma: 8,
          darkness: 3,
          freshness: 6,
          elegance: 9,
          freedom: 4,
          luxury: 10,
          purity: 3,
          uniqueness: 7
        },
        dominantColors: ["#FFD700", "#FF4500", "#1E90FF", "#9932CC"],
        personalColor: {
          season: "spring",
          tone: "bright",
          palette: ["#FFD700", "#FFA500", "#FF4500", "#FF6347"],
          description: "밝고 따뜻한 느낌의 봄 타입 컬러로, 화사하고 생동감 있는 이미지를 표현합니다."
        },
        analysis: {
          mood: "눈 마주치는 순간 영혼까지 사로잡는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감의 소유자.",
          style: "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재.",
          expression: "자신감 있고 당당한 표현 방식으로, 눈빛만으로 원하는 것을 얻어내는 통찰력의 소유자. \"내가 원하는 건 항상 내 앞에 있어야 해\"라는 아우라가 넘쳐흐르는 표정 관리의 달인.",
          concept: "비비드한 에너지와 럭셔리한 감성이 공존하는 모순적 매력의 정점. 도전적이면서도 안정적인, 파격적이면서도 클래식한 양면성의 완벽한 균형점.",
          aura: "순백의 화려함으로 모든 시선을 강탈하는 인간 다이아몬드. 파티의 중심에 서는 것이 운명인 존재. \"화려함은 내 본질이에요.\" 향기에 취한 남자들이 정신을 잃는 마법사.",
          toneAndManner: "\"난 일 안 해도 돈이 들어와\"라고 말해도 의심하지 않을 완벽한 여유로움. 칵테일 한 잔에 인생의 모든 걱정을 지운 휴양지의 정령. 발걸음마다 자유와 쿨함이 흘러넘치는 존재.",
          detailedDescription: "화려한 색감과 당당한 포즈가 강한 자신감을 드러내며, 표정에서는 부드러운 미소와 함께 카리스마가 느껴집니다."
        },
        matchingKeywords: [
          "생동감", "트렌디", "개성적", "화려함", "자신감",
          "에너지", "독특함", "매력적", "밝음", "당당함"
        ],
        scentCategories: {
          citrus: 6,
          floral: 6, 
          woody: 6,
          musky: 6,
          fruity: 6,
          spicy: 6
        },
        matchingPerfumes: []
      };
      console.log('JSON 파싱 오류로 기본 분석 결과 사용');
    }
    
    // 향수 매칭 수행
    const matchedPerfumes = findMatchingPerfumes(parsedResult);
    parsedResult.matchingPerfumes = matchedPerfumes;
    
    return parsedResult;
    
  } catch (error) {
    console.error('이미지 분석 중 오류 발생:', error);
    
    // 오류 정보를 포함한 응답 반환
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * 이미지 분석 결과를 바탕으로 가장 유사한 향수 페르소나를 찾는 함수
 * @param analysisResult 이미지 분석 결과
 * @param topN 반환할 결과 수
 * @returns 매칭된 향수 정보 배열
 */
export function findMatchingPerfumes(analysisResult: ImageAnalysisResult, topN: number = 3) {
  if (!analysisResult || !analysisResult.traits) {
    console.error('분석 결과가 없거나 특성 점수가 없습니다.');
    return [];
  }

  try {
    console.log('향수 매칭 시작:', { 
      availablePersonas: perfumePersonas.personas.length,
      traits: JSON.stringify(analysisResult.traits)
    });

    const matchResults = perfumePersonas.personas.map(persona => {
      // 특성(traits) 간 코사인 유사도 계산 - 핵심 매칭 기준
      const traitSimilarity = calculateCosineSimilarity(
        analysisResult.traits as unknown as Record<string, number>,
        persona.traits as unknown as Record<string, number>,
        analysisResult.scentCategories as unknown as Record<string, number>,
        persona.categories as unknown as Record<string, number>,
        1.0,  // 특성 가중치 100% (특성만 사용)
        0.0   // 향 카테고리 가중치 0% (향 카테고리 사용 안 함)
      );

      return {
        perfumeId: persona.id,
        persona: persona,
        score: traitSimilarity,
        matchReason: generateMatchReason(analysisResult, persona)
      };
    });

    // 유사도 점수가 높은 순으로 정렬
    const sortedResults = matchResults
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topN);

    console.log(`향수 매칭 완료: ${sortedResults.length}개 결과 반환, 최고 점수: ${sortedResults[0]?.score.toFixed(2)}`);
    
    return sortedResults;
  } catch (error) {
    console.error('향수 매칭 오류:', error);
    return [];
  }
}

/**
 * 코사인 유사도를 계산하는 함수
 * 특성 점수와 향 카테고리 점수를 결합하여 유사도 계산
 * 
 * @param traitScores1 첫 번째 특성 점수
 * @param traitScores2 두 번째 특성 점수
 * @param scentScores1 첫 번째 향 카테고리 점수
 * @param scentScores2 두 번째 향 카테고리 점수
 * @param traitWeight 특성 가중치 (기본 70%)
 * @param scentWeight 향 카테고리 가중치 (기본 30%)
 * @returns 코사인 유사도 (0~1)
 */
function calculateCosineSimilarity(
  traitScores1: Record<string, number>,
  traitScores2: Record<string, number>,
  scentScores1: Record<string, number>,
  scentScores2: Record<string, number>,
  traitWeight: number = 0.7,  // 특성 가중치 (기본 70%)
  scentWeight: number = 0.3   // 향 카테고리 가중치 (기본 30%)
): number {
  // 특성 점수 유사도 계산
  const traitSimilarity = calculateVectorSimilarity(traitScores1, traitScores2);
  
  // 향 카테고리 점수 유사도 계산
  const scentSimilarity = calculateVectorSimilarity(scentScores1, scentScores2);
  
  // 가중 평균 계산
  return (traitSimilarity * traitWeight) + (scentSimilarity * scentWeight);
}

/**
 * 두 벡터(객체) 간의 코사인 유사도 계산
 * @param vector1 첫 번째 벡터 (키-값 쌍)
 * @param vector2 두 번째 벡터 (키-값 쌍)
 * @returns 코사인 유사도 (0~1)
 */
function calculateVectorSimilarity(vector1: Record<string, number>, vector2: Record<string, number>): number {
  // 두 벡터에 모두 존재하는 키 찾기
  const keys = Object.keys(vector1).filter(key => key in vector2);
  
  if (keys.length === 0) {
    console.warn('두 벡터 간에 공통 키가 없습니다.');
    return 0;
  }
  
  // 내적 계산
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const key of keys) {
    const val1 = vector1[key] || 0;
    const val2 = vector2[key] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  // 0으로 나누기 방지
  if (magnitude1 === 0 || magnitude2 === 0) {
    console.warn('벡터의 크기가 0입니다.');
    return 0;
  }
  
  // 코사인 유사도 계산
  const similarity = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  
  // NaN 방지 및 0~1 범위로 제한
  return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
}

/**
 * 매칭 이유를 생성하는 함수
 * 이미지 분석 결과와 향수 페르소나를 비교하여 매칭 이유 설명 생성
 * 
 * @param analysisResult 이미지 분석 결과
 * @param persona 향수 페르소나
 * @returns 매칭 이유 설명 문자열
 */
function generateMatchReason(analysisResult: ImageAnalysisResult, persona: any): string {
  try {
    // 이미지와 향수 간의 가장 유사한 특성 찾기
    const topSimilarTraits = findTopSimilarFields(
      analysisResult.traits as unknown as Record<string, number>, 
      persona.traits as unknown as Record<string, number>, 
      3
    );
    
    // 한글 특성 이름 매핑
    const traitNames: Record<string, string> = {
      sexy: '섹시함',
      cute: '귀여움',
      charisma: '카리스마',
      darkness: '다크함',
      freshness: '청량함',
      elegance: '우아함',
      freedom: '자유로움',
      luxury: '럭셔리함',
      purity: '순수함',
      uniqueness: '독특함'
    };
    
    // 가장 높은 향 카테고리 찾기
    const topCategory = Object.entries(persona.categories)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
    
    // 향 카테고리 한글 이름 매핑
    const categoryNames: Record<string, string> = {
      citrus: '시트러스',
      floral: '플로럴',
      woody: '우디',
      musky: '머스크',
      fruity: '프루티',
      spicy: '스파이시'
    };
    
    // 유사한 특성을 바탕으로 매칭 이유 생성
    const similarTraitsText = topSimilarTraits
      .map(trait => `${traitNames[trait.key] || trait.key}(${trait.value})`)
      .join(', ');
    
    // 매칭 이유 생성
    let reason = `'${persona.name}'은(는) `;
    
    // 페르소나 키워드가 있으면 포함
    if (persona.keywords && persona.keywords.length > 0) {
      const keywords = persona.keywords.slice(0, 3).join(', ');
      reason += `${keywords}의 특성과 `;
    }
    
    // 유사한 특성 설명
    reason += `${similarTraitsText}의 특성이 당신의 이미지와 높은 유사도를 보입니다. `;
    
    // 주요 향 카테고리 설명
    reason += `${categoryNames[topCategory] || topCategory} 계열의 향이 주를 이루며, `;
    
    // 페르소나 설명 요약 (앞부분만)
    if (persona.description) {
      const shortDesc = persona.description.split('.')[0] + '.';
      reason += `${shortDesc} `;
    }
    
    // 마무리 문구
    reason += '당신의 이미지와 완벽하게 어울립니다.';
    
    return reason;
  } catch (error) {
    console.error('매칭 이유 생성 오류:', error);
    return `${persona.name}은(는) 당신의 이미지에 잘 어울리는 향수입니다.`;
  }
}

/**
 * 두 객체 간에 값이 가장 유사한 필드를 찾는 함수
 * @param obj1 첫 번째 객체
 * @param obj2 두 번째 객체
 * @param count 반환할 유사 필드 수
 * @returns 유사도가 높은 필드 배열
 */
function findTopSimilarFields(
  obj1: Record<string, number>, 
  obj2: Record<string, number>, 
  count: number
): Array<{key: string, value: number, similarity: number}> {
  // 두 객체에 모두 존재하는 키만 사용
  const commonKeys = Object.keys(obj1).filter(key => key in obj2);
  
  // 각 키별 유사도 계산 (절대값 차이의 역수)
  const similarities = commonKeys.map(key => {
    const val1 = obj1[key] || 0;
    const val2 = obj2[key] || 0;
    const diff = Math.abs(val1 - val2);
    // 차이가 작을수록 유사도가 높음
    const similarity = 1 / (1 + diff);
    
    return {
      key,
      value: val2, // obj2의 값 사용
      similarity
    };
  });
  
  // 유사도가 높은 순으로 정렬 후 상위 N개 반환
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);
}

// 모듈 초기화
initializeGeminiAPI(); 

/**
 * 텍스트로 Gemini API에 질문하기
 */
export async function askGemini(prompt: string, history: Array<{ role: string, parts: string }> = []) {
  try {
    // API 및 모델 초기화 확인
    if (!genAI || !model) {
      console.log('API 및 모델 초기화 필요');
      initializeGeminiAPI();
    }

    // 채팅 세션 생성
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
    });

    // 타임아웃 설정 (60초)
    const timeout = 60000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('요청 시간이 초과되었습니다.'));
      }, timeout);
    });

    // 응답 생성 (타임아웃 적용)
    const resultPromise = chat.sendMessage(prompt);
    const result = await Promise.race([resultPromise, timeoutPromise as Promise<any>]);
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 이미지를 분석하여 Gemini API에 질문하기
 */
export async function analyzeImage(imageBase64: string, prompt: string) {
  try {
    // API 및 모델 초기화 확인
    if (!genAI || !model) {
      console.log('API 및 모델 초기화 필요');
      initializeGeminiAPI();
    }

    // 이미지 프롬프트 구성
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 추가 텍스트 프롬프트 설정
    const textPart = {
      text: prompt,
    };

    // 타임아웃 설정 (60초)
    const timeout = 60000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('요청 시간이 초과되었습니다.'));
      }, timeout);
    });

    // 응답 생성 (타임아웃 적용)
    const resultPromise = model.generateContent([imagePart, textPart]);
    const result = await Promise.race([resultPromise, timeoutPromise as Promise<any>]);
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini 이미지 분석 오류:', error);
    throw new Error('죄송합니다. 이미지를 분석할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 이미지와 채팅 히스토리를 기반으로 향수 추천하기
 */
export async function recommendPerfume(imageBase64: string, chatHistory: Array<{ role: string, parts: string }>) {
  try {
    // API 및 모델 초기화 확인
    if (!genAI || !model) {
      console.log('API 및 모델 초기화 필요');
      initializeGeminiAPI();
    }

    // 이미지 파트 설정
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 챗 히스토리 텍스트로 정리
    const historyText = chatHistory
      .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.parts}`)
      .join('\n');

    // 향수 추천을 위한 프롬프트 구성
    const textPart = {
      text: `
다음은 사용자와의 대화 내용입니다:
${historyText}

위 대화 내용과 첨부된 이미지를 분석하여, 이 이미지에 가장 어울리는 향수를 추천해주세요.
이미지를 자세하게 분석해주세요:
1. 이미지의 전반적인 분위기와 느낌
2. 주요 색감과 색상의 의미
3. 인물이 있다면 표정, 포즈, 패션 스타일
4. 배경과 환경적 요소
5. 이미지에서 느껴지는 감정과 에너지

그 다음, 이 이미지에 어울리는 향수를 선택하고 자세한 이유를 설명해주세요.
향수와 이미지 간의 연관성, 어떤 향수 노트가 이미지의 어떤 부분과 어울리는지 구체적으로 설명해주세요.

다음 향수 목록 중에서만 선택해주세요:
1. BK-2201281 (블랙베리)
2. MD-8602341 (만다린 오렌지)
3. ST-3503281 (스트로베리)
4. BG-8704231 (베르가못)
5. BO-6305221 (비터 오렌지)
6. CR-3706221 (캐럿)
7. RS-2807221 (로즈)
8. TB-2808221 (튜베로즈)
9. OB-6809221 (오렌지 블라썸)
10. TL-2810221 (튤립)
11. LM-7211441 (라임)
12. LV-2812221 (은방울꽃)
13. YJ-8213431 (유자)
14. MT-8614231 (민트)
15. PT-8415331 (페티그레인)
16. SD-2216141 (샌달우드)
17. LP-6317181 (레몬페퍼)
18. PP-3218181 (핑크페퍼)
19. SS-8219241 (바다소금)
20. TM-2320461 (타임)
21. MS-2621712 (머스크)
22. WR-2622131 (화이트로즈)
23. SW-2623121 (스웨이드)
24. IM-4324311 (이탈리안만다린)
25. LV-2225161 (라벤더)
26. IC-3126171 (이탈리안사이프러스)
27. SW-1227171 (스모키 블렌드 우드)
28. LD-2128524 (레더)
29. VL-2129241 (바이올렛)
30. FG-3430721 (무화과)

응답 형식은 다음과 같이 해주세요:

===이미지 분석===
분위기: [이미지의 전반적인 분위기와 느낌]
색감: [주요 색감과 색상의 의미]
스타일: [패션 스타일 또는 이미지 스타일]
감정: [이미지에서 느껴지는 감정과 에너지]
특징: [이미지의 특별한 요소나 주목할 만한 점]

===향수 추천===
추천 향수: [향수 ID] [향수명]
노트 분석: [향수의 주요 노트와 특징]
추천 이유: [이미지와 향수의 연관성에 대한 자세한 설명]
매칭 포인트: [이미지의 어떤 요소가 향수의 어떤 특징과 매칭되는지]
      `,
    };

    // 타임아웃 설정 (60초)
    const timeout = 60000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('요청 시간이 초과되었습니다.'));
      }, timeout);
    });

    // 응답 생성 (타임아웃 적용)
    const resultPromise = model.generateContent([imagePart, textPart]);
    const result = await Promise.race([resultPromise, timeoutPromise as Promise<any>]);
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini 향수 추천 오류:', error);
    throw new Error('죄송합니다. 향수 추천을 생성할 수 없습니다. 다시 시도해주세요.');
  }
} 