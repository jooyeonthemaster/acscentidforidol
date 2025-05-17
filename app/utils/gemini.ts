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
 * 향상된 이미지 분석 프롬프트 - 특성 평가 가이드라인 명확화
 */
const improvedImageAnalysisPrompt = `
이미지에 나타난 아이돌/사람의 특성을 10가지 카테고리로 면밀히 분석해주세요. 
각 특성은 독립적으로 평가하며, 한 특성의 점수가 다른 특성에 영향을 주지 않아야 합니다.
각 특성별로 1-10 점수를 매겨주세요(1: 매우 낮음, 10: 매우 높음).

특성 정의 및 평가 기준:
- sexy: 성적 매력, 관능미, 성숙한 섹시함 (1: 전혀 섹시하지 않음, 10: 극도로 섹시함)
- cute: 귀여움, 애교, 소녀/소년다움 (1: 전혀 귀엽지 않음, 10: 극도로 귀여움)
- charisma: 카리스마, 존재감, 리더십 (1: 존재감 없음, 10: 압도적 카리스마)
- darkness: 어둡고 신비로운 분위기 (1: 매우 밝고 가벼움, 10: 매우 어둡고 신비로움)
- freshness: 청량함, 상쾌함, 활기참 (1: 전혀 청량하지 않음, 10: 매우 청량하고 상쾌함)
- elegance: 우아함, 고급스러움, 세련됨 (1: 전혀 우아하지 않음, 10: 극도로 우아하고 세련됨)
- freedom: 자유로움, 개방적임, 구속받지 않는 느낌 (1: 매우 정형적임, 10: 매우 자유분방함)
- luxury: 럭셔리한 느낌, 부와 풍요로움의 인상 (1: 소박하고 검소함, 10: 매우 럭셔리하고 화려함)
- purity: 순수함, 깨끗함, 순결한 이미지 (1: 전혀 순수하지 않음, 10: 매우 순수하고 깨끗함)
- uniqueness: 독특함, 개성, 남들과 다른 특별함 (1: 매우 평범함, 10: 매우 독특하고 특별함)

중요: 각 특성은 상호 독립적입니다. 예를 들어, sexy가 높다고 해서 cute가 낮을 필요는 없습니다.
모든 특성에 대해 이미지를 면밀히 분석하고, 객관적인 기준으로 각각 독립적으로 점수를 매겨주세요.
점수 분포를 1-10 전체 범위에서 골고루 사용하여, 특성 간 명확한 차이가 드러나도록 해주세요.
두 개 이상의 특성에 동일한 점수를 부여하는 것은 가급적 피하고, 차별화된 점수를 매겨주세요.

향 카테고리도 분석해주세요 (각 향 특성별로 1-10 점수):
- citrus: 상큼하고 톡 쏘는 감귤류 향 (레몬, 오렌지 등)
- floral: 꽃향기 (장미, 자스민, 라일락 등)
- woody: 나무, 숲의 향 (샌달우드, 시더우드 등)
- musky: 묵직하고 관능적인 향 (머스크, 앰버 등)
- fruity: 달콤한 과일향 (복숭아, 베리류 등)
- spicy: 따뜻하고 자극적인 향신료 향 (시나몬, 정향 등)

다음 형식의 JSON으로 응답해주세요:
{
  "traits": {
    "sexy": [1-10 점수],
    "cute": [1-10 점수],
    "charisma": [1-10 점수],
    "darkness": [1-10 점수],
    "freshness": [1-10 점수],
    "elegance": [1-10 점수],
    "freedom": [1-10 점수],
    "luxury": [1-10 점수],
    "purity": [1-10 점수],
    "uniqueness": [1-10 점수]
  },
  "scentCategories": {
    "citrus": [1-10 점수],
    "floral": [1-10 점수],
    "woody": [1-10 점수],
    "musky": [1-10 점수],
    "fruity": [1-10 점수],
    "spicy": [1-10 점수]
  }
}
`;

/**
 * 안전한 JSON 파싱을 위한 클래스
 * 여러 파싱 전략을 순차적으로 시도하여 JSON 파싱 오류를 방지
 */
class SafeJSONParser {
  private jsonStr: string;
  
  constructor(jsonString: string) {
    this.jsonStr = this.preprocess(jsonString);
  }
  
  /**
   * JSON 문자열 전처리
   */
  private preprocess(jsonStr: string): string {
    // 코드 블록 제거
    const jsonBlockMatch = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonStr = jsonBlockMatch[1].trim();
    }
    
    // 불필요한 설명 텍스트 제거
    jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    // 따옴표 처리
    jsonStr = this.fixQuotes(jsonStr);
    
    console.log('따옴표 처리 후 JSON:', jsonStr.substring(0, 70) + '...');
    
    return jsonStr;
  }
  
  /**
   * 이스케이프되지 않은 따옴표 처리
   */
  private fixQuotes(jsonStr: string): string {
    // 1. 텍스트 내의 따옴표 문제 처리 (텍스트 내에서 쌍따옴표가 이스케이프되지 않은 경우)
    // 예: "text": "He said "hello" to me" -> "text": "He said \"hello\" to me"
    
    // 프로퍼티 값 내부의 이스케이프되지 않은 따옴표 처리 정규식
    // 해당 정규식은 프로퍼티 값 내에서 이스케이프되지 않은 따옴표를 찾아 이스케이프합니다
    return jsonStr.replace(/: *"([^"\\]*(\\.[^"\\]*)*)"([^"\\]*)"([^"]*)"(?=[,}])/g, 
                            (match, p1, p2, p3, p4) => `: "${p1}${p3.replace(/"/g, '\\"')}${p4}"`);
  }
  
  /**
   * 여러 전략을 시도하여 JSON 파싱
   */
  public parse(): ImageAnalysisResult {
    try {
      // 표준 JSON.parse 시도
      const result = JSON.parse(this.jsonStr) as ImageAnalysisResult;
      
      // 필수 필드 확인
      this.ensureRequiredFields(result);
      
      // scentCategories가 여전히 없으면 강제로 추가
      if (!result.scentCategories || Object.keys(result.scentCategories).length === 0) {
        console.log('최종 검사: scentCategories 필드 추가 (기본값)');
        result.scentCategories = {
          citrus: 6,
          floral: 6, 
          woody: 6,
          musky: 6,
          fruity: 6,
          spicy: 6
        };
      }
      
      return result;
    } catch (e) {
      console.warn('표준 JSON.parse 실패, 대체 파싱 전략 시도:', e);
      
      // 필드별 추출 시도
      try {
        const result = this.extractFieldsManually();
        
        // scentCategories가 여전히 없으면 강제로 추가
        if (!result.scentCategories || Object.keys(result.scentCategories).length === 0) {
          console.log('최종 검사: scentCategories 필드 추가 (기본값)');
          result.scentCategories = {
            citrus: 6,
            floral: 6, 
            woody: 6,
            musky: 6,
            fruity: 6,
            spicy: 6
          };
        }
        
        return result;
      } catch (extractError) {
        console.error('필드별 추출 실패:', extractError);
        
        // 기본값 반환
        return this.getDefaultResult();
      }
    }
  }
  
  /**
   * 정규식을 사용하여 각 필드를 개별적으로 추출
   */
  private extractFieldsManually(): ImageAnalysisResult {
    const result: ImageAnalysisResult = {
      traits: {},
      dominantColors: [],
      personalColor: {
        season: "spring",
        tone: "bright",
        palette: [],
        description: ""
      },
      analysis: {},
      matchingKeywords: [],
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
    
    try {
      // traits 필드 추출
      const traitsMatch = this.jsonStr.match(/"traits"\s*:\s*{([^}]*)}/);
      if (traitsMatch && traitsMatch[1]) {
        const traitsStr = traitsMatch[1];
        
        // 각 특성 추출
        const traitMatches = traitsStr.matchAll(/"(\w+)"\s*:\s*(\d+)/g);
        for (const match of traitMatches) {
          const key = match[1];
          const value = parseInt(match[2], 10);
          if (!isNaN(value)) {
            result.traits[key] = value;
          }
        }
        
        console.log('특성 추출 성공:', Object.keys(result.traits).length, '개 항목');
      }
      
      // dominantColors 추출
      const colorsMatch = this.jsonStr.match(/"dominantColors"\s*:\s*\[(.*?)\]/);
      if (colorsMatch && colorsMatch[1]) {
        const colorsStr = colorsMatch[1];
        
        // 각 색상 코드 추출
        const colorMatches = colorsStr.matchAll(/"(#[A-Fa-f0-9]+)"/g);
        for (const match of colorMatches) {
          result.dominantColors.push(match[1]);
        }
      }
      
      // personalColor 추출
      const personalColorMatch = this.jsonStr.match(/"personalColor"\s*:\s*{([^}]*)}/);
      if (personalColorMatch && personalColorMatch[1]) {
        const pcStr = personalColorMatch[1];
        
        // 시즌 추출
        const seasonMatch = pcStr.match(/"season"\s*:\s*"([^"]*)"/);
        if (seasonMatch && seasonMatch[1]) {
          result.personalColor.season = seasonMatch[1] as any;
        }
        
        // 톤 추출
        const toneMatch = pcStr.match(/"tone"\s*:\s*"([^"]*)"/);
        if (toneMatch && toneMatch[1]) {
          result.personalColor.tone = toneMatch[1] as any;
        }
        
        // 설명 추출
        const descMatch = pcStr.match(/"description"\s*:\s*"([^"]*)"/);
        if (descMatch && descMatch[1]) {
          result.personalColor.description = descMatch[1];
        }
        
        // 팔레트 추출
        const paletteMatch = pcStr.match(/"palette"\s*:\s*\[(.*?)\]/);
        if (paletteMatch && paletteMatch[1]) {
          const paletteStr = paletteMatch[1];
          const colorMatches = paletteStr.matchAll(/"(#[A-Fa-f0-9]+)"/g);
          for (const match of colorMatches) {
            result.personalColor.palette.push(match[1]);
          }
        }
      }
      
      // analysis 추출
      const analysisMatch = this.jsonStr.match(/"analysis"\s*:\s*{([^}]*)}/s);
      if (analysisMatch && analysisMatch[1]) {
        const analysisStr = analysisMatch[1];
        
        // mood 추출
        const moodMatch = analysisStr.match(/"mood"\s*:\s*"(.*?)(?:"|,$)/s);
        if (moodMatch && moodMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.mood = moodMatch[1].replace(/\\"/g, '"');
        }
        
        // style 추출
        const styleMatch = analysisStr.match(/"style"\s*:\s*"(.*?)(?:"|,$)/s);
        if (styleMatch && styleMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.style = styleMatch[1].replace(/\\"/g, '"');
        }
        
        // expression 추출
        const exprMatch = analysisStr.match(/"expression"\s*:\s*"(.*?)(?:"|,$)/s);
        if (exprMatch && exprMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.expression = exprMatch[1].replace(/\\"/g, '"');
        }
        
        // concept 추출
        const conceptMatch = analysisStr.match(/"concept"\s*:\s*"(.*?)(?:"|,$)/s);
        if (conceptMatch && conceptMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.concept = conceptMatch[1].replace(/\\"/g, '"');
        }
        
        // aura 추출
        const auraMatch = analysisStr.match(/"aura"\s*:\s*"(.*?)(?:"|,$)/s);
        if (auraMatch && auraMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.aura = auraMatch[1].replace(/\\"/g, '"');
        }
        
        // toneAndManner 추출
        const toneMatch = analysisStr.match(/"toneAndManner"\s*:\s*"(.*?)(?:"|,$)/s);
        if (toneMatch && toneMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.toneAndManner = toneMatch[1].replace(/\\"/g, '"');
        }
        
        // detailedDescription 추출
        const detailMatch = analysisStr.match(/"detailedDescription"\s*:\s*"(.*?)(?:"|,$)/s);
        if (detailMatch && detailMatch[1]) {
          if (!result.analysis) result.analysis = {} as any;
          result.analysis.detailedDescription = detailMatch[1].replace(/\\"/g, '"');
        }
      }
      
      // scentCategories 추출 - 추가된 부분
      const scentCategoriesMatch = this.jsonStr.match(/"scentCategories"\s*:\s*{([^}]*)}/);
      if (scentCategoriesMatch && scentCategoriesMatch[1]) {
        const scStr = scentCategoriesMatch[1];
        
        // 각 카테고리 추출
        const categoryMatches = scStr.matchAll(/"(\w+)"\s*:\s*(\d+)/g);
        for (const match of categoryMatches) {
          const key = match[1];
          const value = parseInt(match[2], 10);
          if (!isNaN(value)) {
            if (!result.scentCategories) result.scentCategories = {} as any;
            result.scentCategories[key] = value;
          }
        }
        
        console.log('향 카테고리 추출 성공:', Object.keys(result.scentCategories).length, '개 항목');
      } else {
        console.log('향 카테고리 필드를 찾을 수 없음, 기본값 사용');
      }
      
      // matchingKeywords 추출
      const keywordsMatch = this.jsonStr.match(/"matchingKeywords"\s*:\s*\[(.*?)\]/s);
      if (keywordsMatch && keywordsMatch[1]) {
        const keywordsStr = keywordsMatch[1];
        const keywordMatches = keywordsStr.matchAll(/"([^"]*)"/g);
        for (const match of keywordMatches) {
          if (!result.matchingKeywords) result.matchingKeywords = [];
          result.matchingKeywords.push(match[1]);
        }
      }
      
      // customAnalysis 추출
      const customMatch = this.jsonStr.match(/"customAnalysis"\s*:\s*"(.*?)(?:"|,$)/s);
      if (customMatch && customMatch[1]) {
        result.customAnalysis = customMatch[1].replace(/\\"/g, '"');
      }
      
      console.log('향상된 JSON 파싱 성공');
      
      // 필수 필드 확인 및 중복 값 처리
      this.ensureRequiredFields(result);
      
      return result;
    } catch (error) {
      console.error('정규식 기반 파싱 오류:', error);
      throw error;
    }
  }
  
  /**
   * 필수 필드 확인 및 중복 값 처리
   */
  private ensureRequiredFields(result: ImageAnalysisResult): void {
    // 필수 특성 필드 확인
    const requiredTraits = ['sexy', 'cute', 'charisma', 'darkness', 'freshness', 'elegance', 'freedom', 'luxury', 'purity', 'uniqueness'];
    const missingTraits = requiredTraits.filter(trait => !(trait in result.traits));
    
    if (missingTraits.length > 0) {
      console.log('중복된 특성 점수가 있음, 조정');
      
      // 누락된 특성에 기본값 할당
      for (const trait of missingTraits) {
        result.traits[trait] = 5; // 기본값
      }
    }
    
    // 중복된 값이 있는지 확인하고 수정
    const usedValues = new Set<number>();
    
    // 각 특성에 대해
    for (const trait of requiredTraits) {
      let value = result.traits[trait];
      
      // 값이 없거나 범위를 벗어나는 경우 조정
      if (value === undefined || value < 3 || value > 10) {
        value = Math.max(3, Math.min(10, value || 5));
        result.traits[trait] = value;
      }
      
      // 이미 사용된 값인지 확인
      if (usedValues.has(value)) {
        // 중복된 값이라면 사용되지 않은 값 찾기
        for (let newValue = 3; newValue <= 10; newValue++) {
          if (!usedValues.has(newValue)) {
            result.traits[trait] = newValue;
            usedValues.add(newValue);
            break;
          }
        }
      } else {
        usedValues.add(value);
      }
    }
    
    // 향 카테고리 필드가 없으면 기본값 추가
    if (!result.scentCategories || Object.keys(result.scentCategories).length === 0) {
      console.log('향 카테고리 필드 추가 (기본값)');
      result.scentCategories = {
        citrus: 6,
        floral: 6, 
        woody: 6,
        musky: 6,
        fruity: 6,
        spicy: 6
      };
    }
    
    // 필수 향 카테고리 필드 확인
    const requiredCategories = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'];
    const missingCategories = requiredCategories.filter(cat => !(cat in result.scentCategories));
    
    if (missingCategories.length > 0) {
      console.log('누락된 향 카테고리가 있음, 추가:', missingCategories.join(', '));
      
      // 누락된 카테고리에 기본값 할당
      for (const cat of missingCategories) {
        result.scentCategories[cat] = 6; // 기본값
      }
    }
    
    // dominantColors가 없으면 기본값 추가
    if (!result.dominantColors || result.dominantColors.length === 0) {
      result.dominantColors = ["#FFD700", "#FF4500", "#1E90FF", "#9932CC"];
      console.log('dominantColors 필드 추가 (기본값)');
    }
    
    // matchingKeywords가 없으면 기본값 추가
    if (!result.matchingKeywords || result.matchingKeywords.length === 0) {
      result.matchingKeywords = [
        "생동감", "트렌디", "개성적", "화려함", "자신감",
        "에너지", "독특함", "매력적", "밝음", "당당함"
      ];
      console.log('matchingKeywords 필드 추가 (기본값)');
    }
    
    // analysis 객체가 없거나 필수 필드가 없으면 기본값 추가
    if (!result.analysis || !result.analysis.mood || !result.analysis.style || !result.analysis.expression || !result.analysis.concept) {
      if (!result.analysis) result.analysis = {} as any;
      
      if (!result.analysis.mood) {
        result.analysis.mood = "눈 마주치는 순간 영혼까지 사로잡는 카리스마 폭격기. \"회의실에 들어가면 공기가 바뀐다\"는 소리 듣는 인간 포스. 말 한마디가 칼보다 강력한 존재감의 소유자.";
        console.log('mood 필드 추가 (기본값)');
      }
      
      if (!result.analysis.style) {
        result.analysis.style = "올드머니 여왕의 위엄과 품격. \"와인 리스트 좀 볼게요. 이건 2015년산이네요, 2014년은 없나요?\" 말투에서부터 느껴지는 3대째 물려받은 우아함. 고급 취향이 유전자에 각인된 존재.";
        console.log('style 필드 추가 (기본값)');
      }
      
      if (!result.analysis.expression) {
        result.analysis.expression = "자신감 있고 당당한 표현 방식으로, 눈빛만으로 원하는 것을 얻어내는 통찰력의 소유자. \"내가 원하는 건 항상 내 앞에 있어야 해\"라는 아우라가 넘쳐흐르는 표정 관리의 달인.";
        console.log('expression 필드 추가 (기본값)');
      }
      
      if (!result.analysis.concept) {
        result.analysis.concept = "비비드한 에너지와 럭셔리한 감성이 공존하는 모순적 매력의 정점. 도전적이면서도 안정적인, 파격적이면서도 클래식한 양면성의 완벽한 균형점.";
        console.log('concept 필드 추가 (기본값)');
      }
    }
  }
  
  /**
   * 기본 분석 결과 반환
   */
  private getDefaultResult(): ImageAnalysisResult {
    return {
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
  }
}

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
 * 이미지 분석 함수
 * Gemini API를 사용하여 이미지와 텍스트 정보를 함께 분석
 * 
 * @param imageBase64 Base64로 인코딩된 이미지 데이터
 * @param idolInfo 아이돌 정보 (이름, 그룹 등)
 * @returns 분석 결과 객체
 */
export async function analyzeIdolImage(
  imageBase64: string,
  idolInfo: IdolInfo
): Promise<ImageAnalysisResult> {
  try {
    // 초기화 확인 및 필요시 초기화
    if (!genAI) {
      console.log('Gemini API 초기화 중...');
      initializeGeminiAPI();
      initializeModel();
    }
    
    if (!model) {
      console.log('모델 초기화 오류. 재시도 중...');
      initializeModel();
      
      if (!model) {
        throw new Error('Gemini 모델을 초기화할 수 없습니다.');
      }
    }

    // 이미지 Base64 데이터 검증
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error('유효하지 않은 이미지 데이터입니다.');
    }
    
    // 이미지 MIME 타입 추론 (기본값: jpeg)
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (imageBase64.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (imageBase64.startsWith('R0lGOD')) {
      mimeType = 'image/gif';
    } else if (imageBase64.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
    
    // Base64 데이터에 접두사가 있는지 확인하고 제거
    if (imageBase64.includes('base64,')) {
      imageBase64 = imageBase64.split('base64,')[1];
    }

    // 프롬프트 및 이미지 준비
    // 최적화된 프롬프트 - gemini-2.0-flash 모델용
    const prompt = improvedImageAnalysisPrompt;

    console.log('분석 API 요청 시작');
    
    // 이미지 데이터로 Part 객체 생성
    const imagePart: Part = {
      inlineData: {
        data: imageBase64,
        mimeType
      }
    };
    
    // 프롬프트 텍스트로 Part 객체 생성
    const promptPart: Part = {
      text: prompt
    };
    
    // 아이돌 정보를 포함한 부가 정보 Part
    const idolInfoPart: Part = {
      text: `
추가 참고 정보:
- 아이돌/인물 이름: ${idolInfo.name}
- 그룹/소속: ${idolInfo.group || '정보 없음'}
- 스타일 키워드: ${idolInfo.style?.join(', ') || '정보 없음'}
- 성격 키워드: ${idolInfo.personality?.join(', ') || '정보 없음'}
- 매력 포인트: ${idolInfo.charms || '정보 없음'}

위 정보는 참고만 하고, 이미지에 나타난 실제 특성을 기준으로 점수를 매겨주세요.
`
    };
    
    // Gemini API 호출 설정
    const geminiConfig = {
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    };

    // Gemini API 호출
    const result = await model.generateContent([promptPart, imagePart, idolInfoPart], geminiConfig);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('분석 API 응답 수신 완료');
    
    // 응답 처리
    const safeParser = new SafeJSONParser(responseText);
    const parsedResult = safeParser.parse();
    
    // 분석 결과 검증
    // ... existing code ...

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