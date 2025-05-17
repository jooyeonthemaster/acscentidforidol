import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdolImage } from '../../utils/gemini';
import { findMatchingPerfumes } from '../../utils/perfumeUtils';
import { ImageAnalysisResult } from '../../types/perfume';

/**
 * 이미지 분석 API 엔드포인트
 * 
 * 1. 이미지와 아이돌 정보를 받아 Gemini API로 분석
 * 2. 이미지 분석 결과를 바탕으로 적합한 향수 매칭
 * 3. 결과를 JSON 형태로 반환
 */

// CORS를 위한 OPTIONS 핸들러
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // 로그: API 호출 시작
    console.log('분석 API 요청 시작');
    
    // 요청 본문 파싱
    const formData = await request.formData();
    
    // 이미지 추출
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
      return NextResponse.json({ error: '이미지가 필요합니다.' }, { status: 400 });
    }
    
    // 아이돌 정보 추출
    const idolName = formData.get('idolName') as string || '정보 없음';
    const idolGroup = formData.get('idolGroup') as string || '';
    const idolStyle = formData.get('idolStyle') as string || '';
    const idolPersonality = formData.get('idolPersonality') as string || '';
    const idolCharms = formData.get('idolCharms') as string || '';
    
    // 이미지 데이터 추출 및 Base64 변환
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    console.log(`이미지 변환 시작: ${imageFile.name} ${imageFile.type} ${imageFile.size}`);
    
    // Gemini API를 이용한 이미지 분석
    const analysisResult = await analyzeIdolImage(imageBase64, {
      name: idolName,
      group: idolGroup,
      style: idolStyle.split(',').map(s => s.trim()),
      personality: idolPersonality.split(',').map(s => s.trim()),
      charms: idolCharms
    });
    
    console.log('이미지 분석 완료, 향수 매칭 시작');
    
    // 분석 결과 검증
    if (!analysisResult.traits) {
      return NextResponse.json({ 
        success: false,
        error: '분석 결과에 특성(traits) 정보가 없습니다. 다시 시도해주세요.'
      }, { status: 400 });
    }
    
    if (!analysisResult.scentCategories) {
      return NextResponse.json({ 
        success: false,
        error: '분석 결과에 향 카테고리(scentCategories) 정보가 없습니다. 다시 시도해주세요.'
      }, { status: 400 });
    }
    
    if (!analysisResult.analysis) {
      return NextResponse.json({ 
        success: false,
        error: '분석 결과에 분석(analysis) 정보가 없습니다. 다시 시도해주세요.'
      }, { status: 400 });
    }
    
    if (!analysisResult.matchingKeywords || analysisResult.matchingKeywords.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: '분석 결과에 매칭 키워드(matchingKeywords) 정보가 없습니다. 다시 시도해주세요.'
      }, { status: 400 });
    }
    
    // 분석 결과를 바탕으로 향수 매칭 (상위 1개만)
    const matchingPerfumes = findMatchingPerfumes(analysisResult, 1, {
      // 중요 특성에 더 높은 가중치 부여
      weights: { 
        cute: 2.0,    // 귀여움 가중치 2배 증가 (가장 중요)
        sexy: 1.5,    // 섹시함 가중치 50% 증가
        charisma: 1.3 // 카리스마 가중치 30% 증가
      },
      // 임계값 초과 시 패널티 부여할 특성
      thresholds: { 
        cute: 2.5,    // 귀여움 차이 2.5점 이상이면 패널티 (더 엄격한 기준)
        sexy: 3.0,    // 섹시함 차이 3점 이상이면 패널티
        charisma: 3.0, // 카리스마 차이 3점 이상이면 패널티
        purity: 3.0   // 순수함 차이 3점 이상이면 패널티
      },
      // 하이브리드 접근법 사용 (코사인 유사도 + 유클리드 거리)
      useHybrid: true
    });
    
    // matchingPerfumes 유효성 확인
    if (!matchingPerfumes || matchingPerfumes.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: '매칭된 향수가 없습니다. 다시 시도해주세요.'
      }, { status: 400 });
    }
    
    // 매칭 결과를 분석 결과에 병합
    analysisResult.matchingPerfumes = matchingPerfumes;
    
    // persona 객체가 있는지 확인
    for (let i = 0; i < matchingPerfumes.length; i++) {
      if (!matchingPerfumes[i].persona) {
        return NextResponse.json({ 
          success: false,
          error: `매칭된 향수 #${i + 1}에 persona 객체가 없습니다. 다시 시도해주세요.`
        }, { status: 400 });
      }
    }
    
    // 응답 데이터 로깅
    console.log('응답 데이터 구조 확인:');
    console.log('- traits 존재:', !!analysisResult.traits);
    console.log('- scentCategories 존재:', !!analysisResult.scentCategories);
    console.log('- analysis 존재:', !!analysisResult.analysis);
    console.log('- matchingKeywords 존재:', !!analysisResult.matchingKeywords);
    console.log('- matchingPerfumes 존재:', !!analysisResult.matchingPerfumes);
    console.log('- matchingPerfumes 개수:', analysisResult.matchingPerfumes?.length || 0);
    
    // 응답 반환 - 이전 코드: 중첩 구조로 반환
    // return NextResponse.json(
    //   { 
    //     success: true,
    //     result: analysisResult
    //   }, 
    //   { 
    //     status: 200,
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //       'Cache-Control': 'no-cache, no-store, must-revalidate'
    //     }
    //   }
    // );
    
    // 수정된 코드: 직접 분석 결과만 반환
    return NextResponse.json(
      analysisResult, 
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('분석 API 오류:', error);
    
    // 사용자 친화적인 오류 메시지
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
    const friendlyMessage = errorMessage.includes('timeout') 
      ? "이미지 분석 시간이 초과되었습니다. 더 작은 이미지로 다시 시도해주세요."
      : (errorMessage || "이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    
    return NextResponse.json(
      { 
        success: false,
        error: friendlyMessage,
        details: errorMessage
      }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 