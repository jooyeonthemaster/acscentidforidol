"use client";

import React, { useEffect, useState } from 'react';
import { isSafari, isIOS, isMacOS } from '../app/utils/browserDetection';

interface SafariCompatibleContainerProps {
  children: React.ReactNode;
  className?: string;
  fixedHeight?: boolean;
  minHeight?: string;
}

/**
 * Safari와 iOS 디바이스에서 발생하는 텍스트 레이아웃 문제를 해결하기 위한 컴포넌트
 * 
 * @param children - 컴포넌트 내부에 렌더링할 내용
 * @param className - 추가할 CSS 클래스명
 * @param fixedHeight - 고정 높이 적용 여부
 * @param minHeight - 최소 높이 값 (예: '26px')
 */
export const SafariCompatibleContainer: React.FC<SafariCompatibleContainerProps> = ({
  children,
  className = '',
  fixedHeight = false,
  minHeight = 'auto',
}) => {
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    setIsSafariBrowser(isSafari());
    setIsAppleDevice(isMacOS() || isIOS());
  }, []);

  const getContainerClasses = () => {
    let classes = className;
    
    if (isSafariBrowser) {
      classes += ' safari-fixed-height';
    }
    
    if (isAppleDevice && fixedHeight) {
      classes += ' ios-height-fix';
    }
    
    return classes.trim();
  };

  const getContainerStyles = () => {
    const styles: React.CSSProperties = {
      minHeight: minHeight !== 'auto' ? minHeight : undefined,
    };
    
    if ((isSafariBrowser || isAppleDevice) && fixedHeight) {
      styles.height = minHeight;
      styles.display = 'flex';
      styles.alignItems = 'center';
      // transform 속성은 텍스트 렌더링 개선에 도움이 됩니다
      styles.transform = 'translateZ(0)';
      styles.backfaceVisibility = 'hidden';
    }
    
    return styles;
  };

  return (
    <div className={getContainerClasses()} style={getContainerStyles()}>
      {children}
    </div>
  );
};

/**
 * Safari와 iOS 디바이스에서 텍스트 렌더링 문제를 해결하기 위한 텍스트 컴포넌트
 */
export const SafariCompatibleText: React.FC<SafariCompatibleContainerProps> = (props) => {
  return (
    <SafariCompatibleContainer {...props} fixedHeight={true}>
      {props.children}
    </SafariCompatibleContainer>
  );
};

export default SafariCompatibleContainer; 