import { NextRequest, NextResponse } from 'next/server';
import { UserModel, AnalysisModel } from '../../../lib/firestoreModels';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;
    
    console.log('🔍 디버깅 시작:', { userId, sessionId });
    
    // 1. 사용자 생성 테스트
    console.log('1️⃣ 사용자 생성 테스트...');
    const user = await UserModel.create(`debug_${Date.now()}`, '디버그 사용자');
    console.log('✅ 사용자 생성 성공:', user);
    
    // 2. 분석 생성 테스트 (최소 데이터)
    console.log('2️⃣ 분석 생성 테스트...');
    const analysisData = {
      traits: { test: 1 },
      scentCategories: { test: 1 },
      analysis: 'test analysis',
      matchingKeywords: ['test']
    };
    
    const testSessionId = `debug_session_${Date.now()}`;
    console.log('분석 생성 파라미터:', { sessionId: testSessionId, userId: user.id, analysisData });
    
    const analysis = await AnalysisModel.create(testSessionId, user.id, analysisData);
    console.log('✅ 분석 생성 성공:', analysis);
    
    // 3. 조회 테스트
    console.log('3️⃣ 분석 조회 테스트...');
    const foundAnalysis = await AnalysisModel.getBySession(testSessionId);
    console.log('✅ 분석 조회 성공:', foundAnalysis);
    
    return NextResponse.json({
      success: true,
      message: '모든 테스트 성공',
      results: { user, analysis, foundAnalysis }
    });
    
  } catch (error) {
    console.error('❌ 디버깅 테스트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}