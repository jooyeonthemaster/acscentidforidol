import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdolImage } from '../../utils/gemini';
import { findMatchingPerfumes } from '../../utils/perfumeUtils';
import { saveImageAnalysisWithLink } from '../../../lib/firestoreApi';
import { ImageAnalysisResult } from '../../types/perfume';

/**
 * Firestore 버전 이미지 분석 API
 * 기존 analyze API와 동일한 기능이지만 Firestore에 저장
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 파라미터 추출
    const image = formData.get('image') as File;
    const userId = formData.get('userId') as string;
    const sessionId = formData.get('sessionId') as string;
    const idolName = formData.get('idolName') as string;
    const idolGender = formData.get('idolGender') as string;
    
    // 스타일 배열 처리
    const idolStyle = formData.getAll('idolStyle').join(', ');
    const idolPersonality = formData.getAll('idolPersonality').join(', ');
    const idolCharms = formData.get('idolCharms') as string;

    console.log('🔥 Firestore 이미지 분석 시작:', { 
      userId, 
      sessionId, 
      idolName, 
      hasImage: !!image 
    });

    if (!image) {
      return NextResponse.json({ 
        success: false,
        error: '이미지가 제공되지 않았습니다.' 
      }, { status: 400 });
    }

    // 이미지를 Base64로 변환
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const imageUrl = `data:${image.type};base64,${base64Image}`;

    console.log('📷 이미지 처리 완료, Gemini 분석 시작...');

    // Gemini로 이미지 분석
    const analysisResult = await analyzeIdolImage(
      base64Image,
      idolName,
      idolGender,
      idolStyle,
      idolPersonality,
      idolCharms
    );

    console.log('🧠 Gemini 분석 완료, 향수 매칭 시작...');

    // 향수 매칭
    const matchingPerfumes = await findMatchingPerfumes({
      scentCategories: analysisResult.scentCategories,
      traits: analysisResult.traits,
      keywords: analysisResult.matchingKeywords,
      personalColor: analysisResult.personalColor,
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
    
    // Firestore에 이미지 분석 결과 및 이미지 링크 저장
    if (userId && sessionId) {
      try {
        // 세션에 추가 정보 포함
        const sessionData = {
          ...analysisResult,
          name: idolName,
          gender: idolGender,
          style: idolStyle.split(',').map(s => s.trim()),
          personality: idolPersonality.split(',').map(s => s.trim()),
          charms: idolCharms
        };
        
        console.log('💾 Firestore 저장 시작...');
        await saveImageAnalysisWithLink(userId, sessionId, sessionData, imageUrl);
        console.log('✅ Firestore에 이미지 분석 결과 저장 완료');
        
        // 🔄 새로운 분석 데이터 저장 후 관리자 캐시 무효화
        try {
          const { invalidateAdminCache } = await import('../../../lib/cacheManager');
          const invalidatedCount = invalidateAdminCache();
          console.log(`🗑️ 관리자 캐시 무효화 완료: ${invalidatedCount}개 항목`);
        } catch (cacheError) {
          console.warn('⚠️ 캐시 무효화 중 오류 (데이터 저장은 성공):', cacheError);
        }
      } catch (firestoreError) {
        console.error('❌ Firestore 저장 오류:', firestoreError);
        // Firestore 저장 실패해도 분석 결과는 반환
      }
    }
    
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
    console.log('📊 Firestore 분석 응답 데이터 구조 확인:');
    console.log('- traits 존재:', !!analysisResult.traits);
    console.log('- scentCategories 존재:', !!analysisResult.scentCategories);
    console.log('- analysis 존재:', !!analysisResult.analysis);
    console.log('🔍 analysis.style:', analysisResult.analysis?.style);
    console.log('🔍 analysis.expression:', analysisResult.analysis?.expression);
    console.log('🔍 analysis.concept:', analysisResult.analysis?.concept);
    console.log('- matchingKeywords 존재:', !!analysisResult.matchingKeywords);
    console.log('- matchingPerfumes 존재:', !!analysisResult.matchingPerfumes);
    console.log('- matchingPerfumes 개수:', analysisResult.matchingPerfumes?.length);

    console.log('✅ Firestore 이미지 분석 API 완료');

    // 기존 analyze API와 동일한 응답 구조로 반환
    return NextResponse.json(
      analysisResult, 
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Source': 'firestore',
          'X-Session-Id': sessionId || 'unknown',
          'X-Timestamp': new Date().toISOString()
        }
      }
    );

  } catch (error) {
    console.error('❌ Firestore 이미지 분석 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 이미지 분석 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}