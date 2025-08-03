import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Firestore 초기화 디버깅 시작');
    
    // 단계별로 import 테스트
    const { initializeApp, getApps } = await import('firebase/app');
    console.log('✅ Firebase App 모듈 import 성공');
    
    const { getFirestore } = await import('firebase/firestore');
    console.log('✅ Firestore 모듈 import 성공');
    
    // Firebase 설정 확인
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    console.log('🔧 Firebase 설정:', {
      hasApiKey: !!firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain
    });
    
    // Firebase 앱 초기화
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase 앱 초기화 성공');
    } else {
      app = getApps()[0];
      console.log('✅ 기존 Firebase 앱 사용');
    }
    
    // Firestore 초기화
    const db = getFirestore(app);
    console.log('✅ Firestore 인스턴스 생성 성공');
    
    return NextResponse.json({
      success: true,
      message: 'Firestore 초기화 성공',
      config: {
        projectId: firebaseConfig.projectId,
        hasApiKey: !!firebaseConfig.apiKey,
        appsCount: getApps().length
      }
    });
    
  } catch (error) {
    console.error('❌ Firestore 초기화 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}