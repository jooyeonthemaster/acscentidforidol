import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    // 환경변수 확인
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const publicGeminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    console.log('🔍 환경변수 상태 확인:');
    console.log('GEMINI_API_KEY 존재:', !!geminiApiKey);
    console.log('GEMINI_API_KEY 길이:', geminiApiKey?.length || 0);
    console.log('GEMINI_API_KEY 시작 부분:', geminiApiKey?.substring(0, 10) + '...');
    console.log('NEXT_PUBLIC_GEMINI_API_KEY 존재:', !!publicGeminiApiKey);

    // API 키가 없는 경우
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
        details: {
          geminiApiKey: !!geminiApiKey,
          publicGeminiApiKey: !!publicGeminiApiKey,
          allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI'))
        }
      }, { status: 500 });
    }

    // API 키 유효성 테스트
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      console.log('🧪 API 키 테스트 시작...');
      const result = await model.generateContent('Hello! This is a test. Please respond with "API key is working!"');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ API 키 테스트 성공:', text);

      return NextResponse.json({
        success: true,
        message: 'Gemini API 키가 정상적으로 작동합니다!',
        testResponse: text,
        details: {
          geminiApiKey: `${geminiApiKey.substring(0, 10)}...`,
          keyLength: geminiApiKey.length,
          model: 'gemini-2.0-flash'
        }
      });
    } catch (apiError: any) {
      console.error('❌ API 키 테스트 실패:', apiError);
      
      return NextResponse.json({
        success: false,
        error: 'API 키는 존재하지만 Gemini API 호출에 실패했습니다.',
        apiError: apiError.message,
        details: {
          geminiApiKey: `${geminiApiKey.substring(0, 10)}...`,
          keyLength: geminiApiKey.length,
          errorType: apiError.constructor.name
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('🚨 디버깅 API 전체 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '디버깅 중 예상치 못한 오류가 발생했습니다.',
      details: {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    }, { status: 500 });
  }
} 