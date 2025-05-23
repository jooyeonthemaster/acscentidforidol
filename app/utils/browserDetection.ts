/**
 * 브라우저/OS 감지를 위한 유틸리티 함수들
 */

/**
 * Safari 브라우저인지 감지합니다.
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * macOS 운영체제인지 감지합니다.
 */
export const isMacOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

/**
 * iOS 기기인지 감지합니다.
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * 레티나 디스플레이인지 감지합니다.
 */
export const isRetinaDisplay = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia && 
    (window.matchMedia('(min-resolution: 2dppx)').matches || 
     window.matchMedia('(-webkit-min-device-pixel-ratio: 2)').matches);
}; 