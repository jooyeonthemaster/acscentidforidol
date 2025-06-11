/**
 * 실시간 DOM 번역 유틸리티
 * 페이지의 모든 텍스트 노드를 찾아서 번역합니다.
 */

// 번역할 텍스트 노드를 찾는 함수
function getTextNodes(element: Element): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        // script, style, noscript 태그 내부의 텍스트는 제외
        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // 공백만 있는 텍스트는 제외
        if (!node.textContent || node.textContent.trim() === '') {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  return textNodes;
}

// 텍스트를 청크로 나누는 함수 (API 제한 고려)
function chunkTexts(texts: string[], maxChunkSize: number = 1000): string[][] {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const text of texts) {
    if (currentSize + text.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(text);
    currentSize += text.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// 번역 API 호출
async function translateTexts(texts: string[], targetLanguage: string): Promise<string[]> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texts, 
        targetLanguage, 
        action: 'translate' 
      })
    });

    if (!response.ok) {
      throw new Error(`번역 API 오류: ${response.status}`);
    }

    const result = await response.json();
    return result.translatedTexts || texts;
  } catch (error) {
    console.error('번역 오류:', error);
    return texts;
  }
}

// 페이지 전체 번역 함수
export async function translatePage(targetLanguage: string, onProgress?: (progress: number) => void) {
  if (targetLanguage === 'ko') {
    // 한국어로 되돌리기 - 원본 텍스트 복원
    const elements = document.querySelectorAll('[data-original-text]');
    elements.forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText && element.textContent !== originalText) {
        element.textContent = originalText;
      }
    });
    return;
  }

  // 번역 시작
  console.log(`페이지를 ${targetLanguage}로 번역 시작...`);
  
  try {
    // body 내의 모든 텍스트 노드 찾기
    const textNodes = getTextNodes(document.body);
    console.log(`찾은 텍스트 노드 수: ${textNodes.length}`);
    
    // 원본 텍스트 추출 및 저장
    const originalTexts: string[] = [];
    const nodeMap = new Map<number, Text>();
    
    textNodes.forEach((node, index) => {
      const text = node.textContent?.trim() || '';
      if (text) {
        originalTexts.push(text);
        nodeMap.set(originalTexts.length - 1, node);
        
        // 원본 텍스트를 데이터 속성으로 저장
        const parent = node.parentElement;
        if (parent && !parent.hasAttribute('data-original-text')) {
          parent.setAttribute('data-original-text', text);
        }
      }
    });

    console.log(`번역할 텍스트 수: ${originalTexts.length}`);
    
    if (originalTexts.length === 0) {
      console.log('번역할 텍스트가 없습니다.');
      return;
    }

    // 텍스트를 청크로 나누기
    const chunks = chunkTexts(originalTexts);
    console.log(`청크 수: ${chunks.length}`);
    
    let translatedCount = 0;
    const allTranslations: string[] = [];

    // 각 청크 번역
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`청크 ${i + 1}/${chunks.length} 번역 중...`);
      
      const translations = await translateTexts(chunk, targetLanguage);
      allTranslations.push(...translations);
      
      translatedCount += chunk.length;
      if (onProgress) {
        onProgress((translatedCount / originalTexts.length) * 100);
      }
      
      // API 부하 방지를 위한 딜레이
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 번역된 텍스트를 DOM에 적용
    console.log('번역 결과를 페이지에 적용 중...');
    allTranslations.forEach((translatedText, index) => {
      const node = nodeMap.get(index);
      if (node && translatedText && translatedText !== originalTexts[index]) {
        node.textContent = translatedText;
      }
    });

    console.log('페이지 번역 완료!');
  } catch (error) {
    console.error('페이지 번역 중 오류:', error);
    throw error;
  }
}

// 특정 요소만 번역하는 함수
export async function translateElement(element: Element, targetLanguage: string) {
  if (targetLanguage === 'ko') {
    // 원본 텍스트 복원
    const originalText = element.getAttribute('data-original-text');
    if (originalText) {
      element.textContent = originalText;
    }
    return;
  }

  const textNodes = getTextNodes(element);
  const texts = textNodes.map(node => node.textContent?.trim() || '').filter(text => text);
  
  if (texts.length === 0) return;

  // 원본 텍스트 저장
  if (!element.hasAttribute('data-original-text') && element.textContent) {
    element.setAttribute('data-original-text', element.textContent.trim());
  }

  const translatedTexts = await translateTexts(texts, targetLanguage);
  
  textNodes.forEach((node, index) => {
    if (translatedTexts[index]) {
      node.textContent = translatedTexts[index];
    }
  });
}

// MutationObserver로 동적으로 추가되는 콘텐츠 번역
export function observeAndTranslate(targetLanguage: string) {
  if (targetLanguage === 'ko') return;

  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            await translateElement(node as Element, targetLanguage);
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}// 전역 언어 변경 헬퍼 함수
export function changeGlobalLanguage(language: string) {
  // 이벤트를 발생시켜 모든 컴포넌트에 언어 변경 알림
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
}