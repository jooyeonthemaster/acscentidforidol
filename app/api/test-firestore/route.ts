import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '../../../lib/firestoreModels';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Firestore 연결 테스트 시작');
    
    // 테스트 사용자 생성
    const testUserId = `test_${Date.now()}`;
    const user = await UserModel.create(testUserId, '테스트 사용자');
    
    console.log('✅ Firestore 사용자 생성 성공:', user);
    
    // 생성된 사용자 찾기
    const foundUser = await UserModel.findByPhone(testUserId);
    console.log('✅ Firestore 사용자 조회 성공:', foundUser);
    
    return NextResponse.json({
      success: true,
      message: 'Firestore 연결이 정상적으로 작동합니다!',
      createdUser: user,
      foundUser: foundUser,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Firestore 테스트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}