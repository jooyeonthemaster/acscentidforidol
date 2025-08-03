import { NextRequest, NextResponse } from 'next/server';
import { saveImprovedRecipe } from '../../../lib/firestoreApi';

/**
 * Firestore 버전 레시피 API
 * 기존 recipe API와 동일한 기능이지만 Firestore에 저장
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      recipeData,
      // 하위 호환성을 위한 개별 필드들
      originalPerfumeId,
      originalPerfumeName,
      customizations,
      notes,
      characteristics
    } = body;

    console.log('🔥 Firestore 레시피 저장 시작:', { 
      userId, 
      sessionId, 
      hasRecipeData: !!recipeData,
      originalPerfumeName 
    });

    if (!userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 sessionId가 필요합니다.'
      }, { status: 400 });
    }

    // 레시피 데이터 정규화
    const normalizedRecipeData = recipeData || {
      originalPerfumeId: originalPerfumeId || null,
      originalPerfumeName: originalPerfumeName || '',
      customizations: customizations || {},
      notes: notes || {},
      characteristics: characteristics || {},
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };

    console.log('🧪 레시피 데이터 구조:', {
      basePerfume: normalizedRecipeData.originalPerfumeName,
      customizationKeys: Object.keys(normalizedRecipeData.customizations || {}),
      notesKeys: Object.keys(normalizedRecipeData.notes || {}),
      characteristicsKeys: Object.keys(normalizedRecipeData.characteristics || {})
    });

    // Firestore에 레시피 저장
    const result = await saveImprovedRecipe(userId, sessionId, normalizedRecipeData);

    console.log('✅ Firestore 레시피 저장 완료:', result.recipeId);

    return NextResponse.json({
      success: true,
      message: 'Firestore에 레시피가 성공적으로 저장되었습니다.',
      recipeId: result.recipeId,
      sessionUpdated: result.sessionUpdated,
      source: 'firestore',
      timestamp: new Date().toISOString(),
      data: {
        id: result.recipeId,
        ...normalizedRecipeData
      }
    });

  } catch (error) {
    console.error('❌ Firestore 레시피 저장 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 레시피 저장 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}

// 레시피 조회 API (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const recipeId = searchParams.get('recipeId');

    console.log('🔍 Firestore 레시피 조회:', { userId, sessionId, recipeId });

    if (recipeId) {
      // 특정 레시피 조회
      const { getRecipeById } = await import('../../../lib/firestoreApi');
      const recipe = await getRecipeById(userId!, recipeId);
      
      return NextResponse.json({
        success: true,
        data: recipe,
        source: 'firestore',
        timestamp: new Date().toISOString()
      });
    } else if (sessionId) {
      // 세션의 모든 레시피 조회
      const { getSessionRecipes } = await import('../../../lib/firestoreApi');
      const recipes = await getSessionRecipes(userId!, sessionId);
      
      return NextResponse.json({
        success: true,
        data: recipes,
        count: recipes.length,
        source: 'firestore',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'sessionId 또는 recipeId가 필요합니다.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Firestore 레시피 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 레시피 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}

// 레시피 업데이트 API (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      recipeId, 
      action,
      updateData 
    } = body;

    console.log('🔥 Firestore 레시피 업데이트:', { userId, recipeId, action });

    if (!userId || !recipeId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 recipeId가 필요합니다.'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'bookmark':
        const { toggleRecipeBookmark } = await import('../../../lib/firestoreApi');
        result = await toggleRecipeBookmark(userId, recipeId, updateData.isBookmarked);
        break;
        
      case 'activate':
        const { setSessionActiveRecipe } = await import('../../../lib/firestoreApi');
        result = await setSessionActiveRecipe(userId, updateData.sessionId, { id: recipeId, ...updateData });
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: '지원되지 않는 액션입니다.'
        }, { status: 400 });
    }

    console.log('✅ Firestore 레시피 업데이트 완료:', action);

    return NextResponse.json({
      success: true,
      message: `레시피 ${action}이 성공적으로 처리되었습니다.`,
      result,
      source: 'firestore',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Firestore 레시피 업데이트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 레시피 업데이트 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}