import { NextRequest, NextResponse } from 'next/server';
import { translateText, detectLanguage, getSupportedLanguages } from '@/lib/translate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, targetLanguage = 'en', action = 'translate', messages } = body;

    switch (action) {
      case 'translate':
        if (text) {
          // 단일 텍스트 번역
          const translatedText = await translateText(text, targetLanguage);
          return NextResponse.json({ 
            success: true, 
            translatedText,
            originalText: text,
            targetLanguage
          });
        } else if (texts && Array.isArray(texts)) {
          // 다중 텍스트 번역 - 개별 처리
          const translatedTexts = await Promise.all(
            texts.map(async (singleText) => {
              try {
                return await translateText(singleText, targetLanguage);
              } catch (error) {
                console.error(`개별 텍스트 번역 실패: ${singleText}`, error);
                return singleText; // 실패 시 원본 반환
              }
            })
          );
          
          return NextResponse.json({ 
            success: true, 
            translatedTexts,
            originalTexts: texts,
            targetLanguage
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            error: '번역할 텍스트가 제공되지 않았습니다.' 
          }, { status: 400 });
        }

      case 'detect':
        if (!text) {
          return NextResponse.json({ 
            success: false, 
            error: '언어 감지할 텍스트가 제공되지 않았습니다.' 
          }, { status: 400 });
        }
        const detectedLanguage = await detectLanguage(text);
        return NextResponse.json({ 
          success: true, 
          detectedLanguage,
          text 
        });

      case 'languages':
        const supportedLanguages = await getSupportedLanguages();
        return NextResponse.json({ 
          success: true, 
          languages: supportedLanguages 
        });

      case 'translateMessages':
        try {
          if (!messages || typeof messages !== 'object') {
            return NextResponse.json({ 
              error: 'Messages object is required',
              translatedMessages: messages || {}
            });
          }

          const translatedMessages: Record<string, string[]> = {};
          
          for (const [trait, messageArray] of Object.entries(messages)) {
            if (Array.isArray(messageArray)) {
              const translatedArray = await Promise.all(
                messageArray.map(async (message: string) => {
                  try {
                    const translation = await translateText(message, targetLanguage);
                    return translation;
                  } catch (error) {
                    console.error(`번역 실패 (${trait}):`, error);
                    return message; // 실패 시 원본 반환
                  }
                })
              );
              translatedMessages[trait] = translatedArray;
            } else {
              translatedMessages[trait] = messages[trait]; // 배열이 아니면 원본 유지
            }
          }

          return NextResponse.json({ 
            translatedMessages,
            targetLanguage 
          });
        } catch (error) {
          console.error('메시지 번역 오류:', error);
          return NextResponse.json({ 
            error: 'Translation failed',
            translatedMessages: messages || {}
          });
        }

      default:
        return NextResponse.json({ 
          success: false, 
          error: '지원하지 않는 액션입니다.' 
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('번역 API 오류:', error);
    
    // 에러 타입에 따른 적절한 응답
    if (error.message?.includes('quota')) {
      return NextResponse.json({ 
        success: false, 
        error: '번역 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.',
        errorType: 'quota_exceeded'
      }, { status: 429 });
    } else if (error.message?.includes('authentication')) {
      return NextResponse.json({ 
        success: false, 
        error: '인증 오류가 발생했습니다.',
        errorType: 'auth_error'
      }, { status: 401 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '번역 처리 중 오류가 발생했습니다.',
        errorType: 'translation_error',
        details: error.message
      }, { status: 500 });
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Translation API endpoint',
    endpoints: {
      'POST /api/translate': {
        description: '텍스트 번역, 언어 감지, 지원 언어 조회',
        actions: ['translate', 'detect', 'languages']
      }
    }
  });
}