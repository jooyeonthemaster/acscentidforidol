import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecipes, getRecipeById, setSessionActiveRecipe, toggleRecipeBookmark } from '../../../lib/firebaseApi';

// GET: 세션별 레시피 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId와 sessionId가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`레시피 히스토리 조회 요청: userId=${userId}, sessionId=${sessionId}`);

    const recipes = await getSessionRecipes(userId, sessionId);

    return NextResponse.json({
      success: true,
      recipes,
      count: recipes.length,
      message: `${recipes.length}개의 레시피를 찾았습니다.`
    });

  } catch (error) {
    console.error('레시피 히스토리 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json(
      { error: '레시피 히스토리를 조회하는 중 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 레시피 관련 작업 (활성화, 북마크 등)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, sessionId, recipeId, recipeData, isBookmarked } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'activate':
        if (!sessionId || !recipeData) {
          return NextResponse.json(
            { error: 'sessionId와 recipeData가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log(`레시피 활성화 요청: sessionId=${sessionId}, recipeId=${recipeData.id}`);
        const activateResult = await setSessionActiveRecipe(userId, sessionId, recipeData);

        return NextResponse.json({
          success: true,
          message: activateResult.message,
          activatedRecipe: recipeData
        });

      case 'bookmark':
        if (!recipeId || typeof isBookmarked !== 'boolean') {
          return NextResponse.json(
            { error: 'recipeId와 isBookmarked가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log(`레시피 북마크 ${isBookmarked ? '추가' : '제거'}: recipeId=${recipeId}`);
        const bookmarkResult = await toggleRecipeBookmark(userId, recipeId, isBookmarked);

        return NextResponse.json({
          success: true,
          isBookmarked: bookmarkResult.isBookmarked,
          message: `레시피가 ${isBookmarked ? '북마크에 추가' : '북마크에서 제거'}되었습니다.`
        });

      case 'detail':
        if (!recipeId) {
          return NextResponse.json(
            { error: 'recipeId가 필요합니다.' },
            { status: 400 }
          );
        }

        console.log(`레시피 상세 조회: recipeId=${recipeId}`);
        const recipe = await getRecipeById(userId, recipeId);

        return NextResponse.json({
          success: true,
          recipe,
          message: '레시피 상세 정보를 조회했습니다.'
        });

      default:
        return NextResponse.json(
          { error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('레시피 작업 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json(
      { error: '레시피 작업 중 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
} 