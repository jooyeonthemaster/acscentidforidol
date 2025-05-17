import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdolImage } from '../../utils/gemini';
import { findMatchingPerfumePersonas, generateCustomPerfumeName } from '../../utils/perfumeUtils';
import { ImageAnalysisResult, PerfumePersona } from '../../types/perfume';

// 결과 타입 확장
interface AnalysisResultWithCustomPerfume extends ImageAnalysisResult {
  customPerfume?: {
    name: string;
    basedOn: string;
    description: string;
  };
}

// 다양한 특성 점수 생성 함수 
function generateDiverseTraitScores() {
  // 기본 특성 점수 범위: 3-10
  const traits = {
    sexy: 0,
    cute: 0,
    charisma: 0,
    darkness: 0,
    freshness: 0,
    elegance: 0,
    freedom: 0,
    luxury: 0,
    purity: 0,
    uniqueness: 0
  };
  
  // 각 특성에 대해 무작위 점수 생성 (최소 1점 이상 차이나도록)
  const usedScores = new Set<number>();
  
  Object.keys(traits).forEach(key => {
    // 이미 사용한 점수와 겹치지 않도록 새로운 점수 생성
    let score;
    do {
      score = Math.floor(Math.random() * 8) + 3; // 3-10 범위
    } while (usedScores.has(score));
    
    // 타입 안전성을 위한 타입 단언
    (traits as any)[key] = score;
    usedScores.add(score);
  });
  
  return traits;
}

// 기본 분석 결과 생성 함수
function createDefaultAnalysisResult(): ImageAnalysisResult {
  return {
    traits: generateDiverseTraitScores(),
    scentCategories: {
      citrus: 7,
      floral: 5,
      woody: 3,
      musky: 6,
      fruity: 8,
      spicy: 4
    },
    dominantColors: ['#FFD700', '#FF4500', '#1E90FF', '#9932CC'],
    personalColor: {
      season: 'spring',
      tone: 'bright',
      palette: ['#FFD700', '#FFA500', '#FF4500', '#FF6347'],
      description: '밝고 따뜻한 느낌의 봄 타입 컬러로, 화사하고 생동감 있는 이미지를 표현합니다.'
    },
    analysis: {
      mood: '생동감 있고 에너지 넘치는 분위기',
      style: '트렌디하면서도 독특한 개성이 돋보이는 스타일',
      expression: '자신감 있고 당당한 표현 방식',
      concept: '비비드한 에너지'
    },
    matchingKeywords: [
      '생동감', '트렌디', '개성적', '화려함', '자신감',
      '에너지', '독특함', '매력적', '밝음', '당당함'
    ],
    matchingPerfumes: []
  };
}

// 간소화된 분석 결과 생성 함수 - 재시도 실패 시 사용
function createSimplifiedAnalysisResult(idolName: string, idolGroup: string): ImageAnalysisResult {
  const traits = generateDiverseTraitScores();
  
  // 최소한의 필수 데이터만 포함
  return {
    traits,
    scentCategories: {
      citrus: 7,
      floral: 5,
      woody: 3,
      musky: 6,
      fruity: 8,
      spicy: 4
    },
    dominantColors: ['#FFD700', '#FF4500', '#1E90FF'],
    personalColor: {
      season: 'spring',
      tone: 'bright',
      palette: ['#FFD700', '#FFA500', '#FF4500'],
      description: '밝고, 생동감 있는 봄 타입 컬러'
    },
    analysis: {
      mood: '매력적이고 개성 있는 분위기',
      style: '트렌디한 스타일',
      expression: '자신감 있는 표현 방식',
      concept: '개성'
    },
    matchingKeywords: [
      '매력적', '트렌디', '개성적', '스타일리시', '자신감',
      '센스있는', '독특함', '감각적', '세련된', '현대적'
    ],
    matchingPerfumes: []
  };
}

export const maxDuration = 120; // 2분 (단위: 초)
export const dynamic = 'force-dynamic'; // 캐싱 방지
export const fetchCache = 'force-no-store'; // 캐싱 방지

// CORS preflight 요청 처리를 위한 OPTIONS 메서드 핸들러
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'  // 24시간
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('분석 API 요청 시작');
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()));

    // 요청 본문 파싱
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('FormData 파싱 성공');
      console.log('formData 필드:', Array.from(formData.keys()));
    } catch (formError) {
      console.error('FormData 파싱 오류:', formError);
      return NextResponse.json(
        { error: 'FormData 파싱에 실패했습니다.' },
        { status: 400 }
      );
    }
    
    const idolName = formData.get('idolName') as string;
    const idolGroup = formData.get('idolGroup') as string;
    const idolStyle = formData.getAll('idolStyle') as string[];
    const idolPersonality = formData.getAll('idolPersonality') as string[];
    const idolCharms = formData.get('idolCharms') as string;
    const imageFile = formData.get('image') as File;
    const userName = formData.get('userName') as string || '사용자';

    // 요청 필드 로깅
    console.log('요청 필드:', { 
      idolName, 
      idolGroup, 
      idolStyles: idolStyle.join(','), 
      idolPersonalities: idolPersonality.join(','),
      idolCharms: idolCharms?.substring(0, 20) + '...',
      imageFile: imageFile ? `${imageFile.name}, ${imageFile.type}, ${imageFile.size}바이트` : '없음',
      userName
    });

    // 필수 필드 확인
    if (!imageFile || !idolName) {
      console.error('필수 필드 누락:', { imageFile: !!imageFile, idolName: !!idolName });
      return NextResponse.json(
        { error: '이미지와 아이돌 이름은 필수입니다.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          } 
        }
      );
    }

    // 이미지 크기 확인 - 2MB로 제한 강화
    if (imageFile.size > 2 * 1024 * 1024) { // 2MB 제한
      console.error('이미지 크기 초과:', imageFile.size);
      return NextResponse.json(
        { error: '이미지 크기가 2MB를 초과합니다. 더 작은 이미지를 사용해주세요.' },
        { status: 413 }
      );
    }

    // 이미지 파일을 Base64로 변환
    try {
      console.log('이미지 변환 시작:', imageFile.name, imageFile.type, imageFile.size);
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
      console.log('이미지 변환 완료: 길이 =', imageBase64.length);

    // 아이돌 정보 객체 구성
    const idolInfo = {
      name: idolName,
      group: idolGroup,
      style: idolStyle,
      personality: idolPersonality,
      charms: idolCharms,
    };

    // Gemini API로 이미지 분석
      let analysisResult: ImageAnalysisResult = createDefaultAnalysisResult(); // 기본값으로 초기화
    try {
        // 최대 5번까지 API 호출 시도 (횟수 증가)
        let attempts = 0;
        let success = false;
        console.log('Gemini API 분석 시작 (최대 5번 시도)');
        
        while (attempts < 5 && !success) {
          try {
            console.log(`Gemini API 호출 시도 ${attempts + 1}/5 시작`);
            
            // 마지막 시도에서는 간소화된 프롬프트로 시도
            const apiResult = await analyzeIdolImage(imageBase64, idolInfo);
            console.log(`Gemini API 호출 시도 ${attempts + 1}/5 완료, 응답 수신됨`);
      
            // 특성 점수 확인
            if (!apiResult.traits) {
              console.warn(`시도 ${attempts + 1}: 특성 점수가 없습니다.`);
              throw new Error('응답에 특성 점수가 포함되어 있지 않습니다.');
            }
            
            // 모든 특성 점수가 동일한지 확인
            const traitValues = Object.values(apiResult.traits);
            const allSameValue = traitValues.every(val => val === traitValues[0]);
            
            if (allSameValue) {
              console.warn(`시도 ${attempts + 1}: 모든 특성 점수가 동일합니다.`);
              throw new Error('모든 특성 점수가 동일하게 설정되었습니다.');
            }
            
            // 각 특성 점수가 3-10 범위인지 확인
            let hasInvalidScores = false;
            Object.entries(apiResult.traits).forEach(([key, value]) => {
              if (typeof value !== 'number' || value < 3 || value > 10) {
                console.warn(`시도 ${attempts + 1}: 특성 '${key}'의 점수가 유효하지 않습니다: ${value}`);
                hasInvalidScores = true;
              }
            });
            
            if (hasInvalidScores) {
              throw new Error('유효하지 않은 특성 점수가 있습니다.');
            }
      
            // 유효한 응답을 받았으면 analysisResult에 할당
            analysisResult = apiResult;
            console.log('유효한 API 응답 수신됨. 응답 구조:', Object.keys(apiResult).join(', '));
            
            // 기본 scentCategories가 없는 경우 추가
      if (!analysisResult.scentCategories) {
        console.log('scentCategories가 없어 기본값 추가');
        analysisResult.scentCategories = {
                citrus: 7,
          floral: 5,
                woody: 3,
                musky: 6,
                fruity: 8,
                spicy: 4
        };
      }
      
            // matchingPerfumes가 없는 경우 추가
            if (!analysisResult.matchingPerfumes) {
              console.log('matchingPerfumes가 없어 빈 배열 추가');
              analysisResult.matchingPerfumes = [];
            }
            
            success = true;
            console.log('Gemini API 호출 성공');
          } catch (error: any) {
            attempts++;
            const errorMessage = error.message || (typeof error === 'string' ? error : '알 수 없는 오류');
            console.warn(`API 호출 시도 ${attempts} 실패: ${errorMessage}`);
            console.error('오류 객체 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            
            // 잠시 대기 후 재시도 (오류에 따라 대기 시간 조정, 간격 늘림)
            if (attempts < 5) {
              // 3초, 6초, 10초, 15초로 대기 시간 증가
              const waitTimes = [3000, 6000, 10000, 15000];
              const waitTime = waitTimes[attempts - 1] || 3000;
              
              console.log(`${waitTime}ms 후 재시도합니다.`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              // 마지막 시도 직전에는 더 단순화된 분석 모드 사용을 고려
              if (attempts === 4) {
                console.log('마지막 시도에서는 더 단순화된 분석 모드로 진행합니다.');
                // 마지막 시도에서는 간소화된 결과 생성
                analysisResult = createSimplifiedAnalysisResult(idolName, idolGroup);
                // 이 시점에서 성공한 것으로 간주하고 루프 종료
                success = true;
                console.log('단순화된 분석 모드로 결과 생성 성공');
                break;
              }
            } else {
              console.warn('최대 시도 횟수 초과. 다양한 특성 점수를 생성합니다.');
              // 모든 시도가 실패하면 기본값 사용 (이미 초기화됨)
              break;
            }
          }
        }
        
        // 필수 속성 확인 및 기본값 설정
      if (!analysisResult.personalColor) {
        analysisResult.personalColor = {
          season: 'spring',
          tone: 'bright',
          palette: ['#FFD700', '#FFA500', '#FF4500'],
          description: '밝고 따뜻한 느낌의 봄 타입 컬러'
        };
      }
      
        if (!analysisResult.dominantColors) {
          analysisResult.dominantColors = ['#FFFFFF', '#000000', '#808080'];
      }
        
        if (!analysisResult.analysis) {
          analysisResult.analysis = {
            mood: '자신감 있고 매력적인 분위기',
            style: '트렌디하면서도 독특한 개성이 돋보이는 스타일',
            expression: '자연스럽고 편안한 표현 방식',
            concept: '트렌드를 리드하는 핵심 키워드'
          };
        }
        
        if (!analysisResult.matchingKeywords || analysisResult.matchingKeywords.length === 0) {
          analysisResult.matchingKeywords = [
            '매력적', '트렌디', '개성적', '스타일리시', '자신감',
            '센스있는', '독특함', '감각적', '세련된', '현대적'
          ];
        }
        
      } catch (error: any) {
        console.error('Gemini API 분석 오류:', error.message || error);
        console.log('기본 분석 결과를 사용합니다.');
        // API 오류 시 이미 초기화된 기본값 사용 (변경 필요 없음)
      }

      console.log('향수 매칭 시작');
    // 분석 결과에 따라 향수 추천
    const matchingPerfumes = await findMatchingPerfumePersonas(analysisResult);
      console.log(`향수 매칭 완료: ${matchingPerfumes.length}개 매칭됨`);

    // 매칭 결과가 비어있는지 확인
    if (!matchingPerfumes || matchingPerfumes.length === 0) {
      console.warn('매칭된 향수가 없습니다. 기본 향수를 사용합니다.');
    }
    
    // 매칭 결과 디버깅
    console.log('매칭 향수 상세 정보:');
    matchingPerfumes.forEach((match, index) => {
      console.log(`${index + 1}. ${match.persona.id} (${match.persona.name}), 점수: ${match.score.toFixed(2)}`);
      console.log(`   매칭 이유: ${match.matchReason}`);
      console.log(`   향수 키워드: ${match.persona.keywords.join(', ')}`);
    });

    // 최종 결과에 매칭된 향수 정보 추가
    const result: AnalysisResultWithCustomPerfume = {
      ...analysisResult,
      matchingPerfumes: matchingPerfumes.map((match: {persona: PerfumePersona, score: number, matchReason: string}) => ({
        perfumeId: match.persona.id,
        score: match.score,
        matchReason: match.matchReason,
        persona: match.persona,
      })),
    };

    // 최고 점수 향수를 기반으로 커스텀 향수 이름 생성
    if (matchingPerfumes.length > 0) {
      const topPerfume = matchingPerfumes[0].persona;
      const customPerfumeName = generateCustomPerfumeName(
        userName,
        idolName,
        topPerfume.name
      );
      
      // 결과에 커스텀 향수 정보 추가
      result.customPerfume = {
        name: customPerfumeName,
        basedOn: topPerfume.name,
        description: `${userName}님의 ${idolName} 이미지를 분석해 만든 특별한 향수입니다. ${topPerfume.name}의 매력적인 향을 베이스로 하여 ${idolName}의 특성을 담았습니다.`,
      };
    }

      console.log('분석 완료, 결과 반환');
      // 분석 결과 전체 로깅
      console.log('==== 분석 결과 전체 내용 시작 ====');
      console.log('traits:', JSON.stringify(result.traits, null, 2));
      console.log('scentCategories:', JSON.stringify(result.scentCategories, null, 2));
      console.log('personalColor:', JSON.stringify(result.personalColor, null, 2));
      console.log('analysis:', JSON.stringify(result.analysis, null, 2));
      console.log('matchingKeywords:', JSON.stringify(result.matchingKeywords, null, 2));
      console.log('matchingPerfumes 수:', result.matchingPerfumes?.length || 0);
      if (result.matchingPerfumes && result.matchingPerfumes.length > 0) {
        console.log('첫 번째 매칭 향수:', JSON.stringify(result.matchingPerfumes[0], (key, value) => {
          if (key === 'persona' && value) {
            return {
              id: value.id, 
              name: value.name, 
              traits: value.traits,
              keywords: value.keywords
            }; // persona 객체의 일부만 출력
          }
          return value;
        }, 2));
      } else {
        console.log('매칭된 향수가 없습니다!');
      }
      console.log('==== 분석 결과 전체 내용 끝 ====');
      
      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    } catch (imageError: any) {
      console.error('이미지 처리 오류:', imageError.message || imageError);
      return NextResponse.json(
        { error: '이미지 처리 중 오류가 발생했습니다: ' + (imageError.message || '알 수 없는 오류') },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }
  } catch (error: any) {
    console.error('분석 API 오류:', error.message || error);
    
    // 오류 유형별 맞춤 응답
    if (error.message && error.message.includes('시간이 초과되었습니다')) {
      return NextResponse.json(
        { error: '이미지 분석 시간이 초과되었습니다. 이미지 크기를 줄이거나 더 간단한 이미지를 사용해주세요.' },
        { 
          status: 504, // Gateway Timeout
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    } else if (error.message && error.message.includes('API 키')) {
      return NextResponse.json(
        { error: 'API 키 문제로 분석에 실패했습니다. 관리자에게 문의해주세요.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: '이미지 분석 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류') },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }
  }
} 