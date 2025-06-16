"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import IdolImageUpload from '../IdolImageUpload';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

// 최애 정보 인터페이스
interface IdolInfo {
  userPhone: string;
  name: string;
  gender: string;
  style: string[];
  personality: string[];
  charms: string;
  image?: File;
}

export default function IdolInfoForm() {
  const router = useRouter();
  const { t } = useTranslationContext();
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>(t('analysis.stage.uploading'));
  const [idolInfo, setIdolInfo] = useState<IdolInfo>({
    userPhone: '',
    name: '',
    gender: '',
    style: [],
    personality: [],
    charms: '',
  });
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 스타일 옵션
  const styleOptions = [
    { id: 'cute', label: t('style.cute') },
    { id: 'sexy', label: t('style.sexy') },
    { id: 'chic', label: t('style.chic') },
    { id: 'elegant', label: t('style.elegant') },
    { id: 'energetic', label: t('style.energetic') },
    { id: 'fresh', label: t('style.fresh') },
    { id: 'retro', label: t('style.retro') },
    { id: 'casual', label: t('style.casual') },
  ];

  // 성격 옵션
  const personalityOptions = [
    { id: 'bright', label: t('personality.bright') },
    { id: 'calm', label: t('personality.calm') },
    { id: 'funny', label: t('personality.funny') },
    { id: 'shy', label: t('personality.shy') },
    { id: 'confident', label: t('personality.confident') },
    { id: 'thoughtful', label: t('personality.thoughtful') },
    { id: 'passionate', label: t('personality.passionate') },
    { id: 'caring', label: t('personality.caring') },
  ];

  // 이름 길이 검증 함수 (한글 5글자, 영어 10글자 제한)
  const validateNameLength = (name: string): boolean => {
    let totalWidth = 0;
    for (let char of name) {
      // 한글, 한자, 일본어 등 2바이트 문자는 2의 가중치
      if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(char)) {
        totalWidth += 2;
      } else {
        // 영어, 숫자 등 1바이트 문자는 1의 가중치
        totalWidth += 1;
      }
    }
    return totalWidth <= 10; // 한글 5글자(10 가중치) 제한
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 이름 필드의 경우 길이 검증
    if (name === 'name' && !validateNameLength(value)) {
      return; // 제한을 초과하면 입력 무시
    }
    
    setIdolInfo(prev => ({ ...prev, [name]: value }));
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (category: 'style' | 'personality', id: string) => {
    setIdolInfo(prev => {
      const current = prev[category];
      
      // 이미 선택된 항목인 경우 제거, 아니면 추가
      if (current.includes(id)) {
        return { ...prev, [category]: current.filter(item => item !== id) };
      } else {
        return { ...prev, [category]: [...current, id] };
      }
    });
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (file: File) => {
    setIdolInfo(prev => ({ ...prev, image: file }));
    
    // 이미지 크기 확인 및 경고
    if (file.size > 2 * 1024 * 1024) { // 2MB 초과
      alert('이미지 크기가 큽니다. 분석에 시간이 오래 걸릴 수 있습니다.');
    }
  };

  // 이미지 압축 함수
  const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // 최대 크기 제한 (가로/세로 1200px)
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round(height * (MAX_SIZE / width));
              width = MAX_SIZE;
            } else {
              width = Math.round(width * (MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 압축 품질 조정
          let quality = 0.9; // 90% 품질로 시작
          const maxSizeBytes = maxSizeMB * 1024 * 1024;
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('이미지 압축에 실패했습니다.'));
                return;
              }
              
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`압축 전: ${Math.round(file.size / 1024)}KB, 압축 후: ${Math.round(compressedFile.size / 1024)}KB`);
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => {
          reject(new Error('이미지 로드에 실패했습니다.'));
        };
      };
      reader.onerror = () => {
        reject(new Error('파일 읽기에 실패했습니다.'));
      };
    });
  };

  // 다음 단계로 진행
  const handleNext = () => {
    if (step === 1) {
      if (!idolInfo.userPhone) {
        alert(t('validation.password.required'));
        return;
      }
      if (!idolInfo.name) {
        alert(t('validation.name.required'));
        return;
      }
      if (!idolInfo.gender) {
        alert(t('validation.gender.required'));
        return;
      }
      // 비밀번호 형식 검증 (4자리 숫자만 허용)
      const passwordRegex = /^[0-9]{4}$/;
      if (!passwordRegex.test(idolInfo.userPhone)) {
        alert(t('validation.password.format'));
        return;
      }
    }
    
    if (step === 2 && idolInfo.style.length === 0) {
      alert(t('validation.style.required'));
      return;
    }
    
    if (step === 3 && idolInfo.personality.length === 0) {
      alert(t('validation.personality.required'));
      return;
    }
    
    if (step === 5) {
      // 이미지 유효성 검사
      if (!idolInfo.image) {
        alert(t('validation.image.required'));
        return;
      }
      
      // 분석 시작
      handleAnalyzeImage();
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep === 5) {
        setShowImageModal(false); // 이미지 단계에서 모달 초기화
      }
    }
  };

  // 분석 요청 함수
  const handleAnalyzeImage = async () => {
    try {
      // 폼 데이터 생성 및 전송
      const formData = new FormData();
      
      // 사용자 및 세션 정보 추가 (Firebase 저장을 위해)
      const userId = idolInfo.userPhone.replace(/-/g, ''); // 하이픈 제거해서 userId로 사용
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      formData.append('userId', userId);
      formData.append('sessionId', sessionId);
      
      formData.append('idolName', idolInfo.name);
      formData.append('idolGender', idolInfo.gender);
      
      // 배열 데이터는 여러 개의 동일한 이름으로 추가
      idolInfo.style.forEach(style => {
        formData.append('idolStyle', style);
      });
      
      idolInfo.personality.forEach(personality => {
        formData.append('idolPersonality', personality);
      });
      
      formData.append('idolCharms', idolInfo.charms);
      
      // 이미지 압축 후 추가
      if (idolInfo.image) {
        try {
          const compressedImage = await compressImage(idolInfo.image, 1); // 1MB로 압축
          formData.append('image', compressedImage);
          console.log(`이미지 압축 완료: ${Math.round(compressedImage.size / 1024)}KB`);
        } catch (compressionError) {
          console.error('이미지 압축 오류:', compressionError);
          // 압축 실패 시 원본 이미지 사용
        formData.append('image', idolInfo.image);
          console.log(`원본 이미지 사용: ${Math.round(idolInfo.image.size / 1024)}KB`);
        }
      }
      
      setIsSubmitting(true);
      
      // 타임아웃 설정 (90초)
      const timeoutDuration = 90000; // 90초
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      // 10초마다 분석 상태 메시지 업데이트
      const progressCheckInterval: NodeJS.Timeout = setInterval(() => {
        // 분석 단계별 메시지 업데이트
        if (analysisStage === '이미지 전송 중...') {
          setAnalysisStage('이미지 분석 중...');
        } else if (analysisStage === '이미지 분석 중...') {
          setAnalysisStage('특성 점수 계산 중...');
        } else if (analysisStage === '특성 점수 계산 중...') {
          setAnalysisStage('퍼스널 컬러 분석 중...');
        } else if (analysisStage === '퍼스널 컬러 분석 중...') {
          setAnalysisStage('향수 추천 계산 중...');
        } else {
          setAnalysisStage('결과 생성 중... 잠시만 기다려주세요');
        }
      }, 10000);
      
      // API 호출
      console.time('analyze-api-call');
      console.log('분석 API 호출 시작');
      
      // 추가 디버깅 로그
      console.log('API 요청 경로:', '/api/analyze');
      console.log('FormData 내용:', {
        userPhone: idolInfo.userPhone,
        userId: userId,
        sessionId: sessionId,
        idolName: idolInfo.name,
        idolStyle: idolInfo.style,
        idolPersonality: idolInfo.personality,
        idolCharms: idolInfo.charms,
        imageSize: idolInfo.image ? `${Math.round(idolInfo.image.size / 1024)}KB` : 'No image'
      });

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          credentials: 'same-origin', // 쿠키 포함
          // Content-Type 헤더를 명시적으로 설정하지 않음 (FormData가 자동으로 설정)
        });
        
        // 타임아웃과 인터벌 해제
        clearTimeout(timeoutId);
        clearInterval(progressCheckInterval);
        console.timeEnd('analyze-api-call');
        
        console.log('API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('이미지 크기가 너무 큽니다. 더 작은 이미지를 사용해주세요.');
          } else if (response.status === 429) {
            throw new Error('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else if (response.status >= 500) {
            throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else {
            const errorText = await response.text();
            console.error('API 응답 에러 내용:', errorText);
            throw new Error(`분석 요청에 실패했습니다. 상태 코드: ${response.status}`);
          }
        }
        
        // 응답 데이터 로드
        const data = await response.json();
        console.log('분석 결과 수신 완료');
        
        // 상세 로깅 추가
        console.log('==== 클라이언트 - API 응답 상세 내용 ====');
        console.log('응답 구조:', Object.keys(data).join(', '));
        
        // API 응답 구조 확인 (이전 버전 호환성 유지)
        const analysisData = data.result || data;
        
        // 필수 필드 확인
        const hasRequiredFields = 
          !!analysisData.traits && 
          !!analysisData.scentCategories && 
          !!analysisData.matchingPerfumes;
        
        console.log('필수 필드 존재 여부:', hasRequiredFields);
        console.log('traits:', !!analysisData.traits);
        console.log('scentCategories:', !!analysisData.scentCategories);
        console.log('matchingPerfumes:', !!analysisData.matchingPerfumes);
        
        if (!hasRequiredFields) {
          console.error('분석 결과에 필수 필드가 누락되었습니다:', analysisData);
          throw new Error('분석 결과가 완전하지 않습니다. 다시 시도해주세요.');
        }
        
        console.log('==== 클라이언트 - API 응답 상세 내용 끝 ====');
        
        // 분석 결과를 로컬 스토리지에 저장
        localStorage.setItem('analysisResult', JSON.stringify(analysisData));
        
        // 아이돌 정보 저장 (이미지는 별도 처리)
        localStorage.setItem('idolInfo', JSON.stringify({
          ...idolInfo,
          // File 객체는 직렬화되지 않으므로 image 속성은 제외
          image: undefined
        }));
        
        // 이미지가 있다면 별도로 처리
        if (idolInfo.image && imagePreview) {
          localStorage.setItem('idolImagePreview', imagePreview);
        }
        
        // 분석 결과 페이지로 이동
        router.push('/result');
      } catch (error: any) {
        // 타임아웃과 인터벌 해제
        clearTimeout(timeoutId);
        clearInterval(progressCheckInterval);
        
        if (error.name === 'AbortError') {
          console.error('요청 시간이 초과되었습니다.');
          alert('분석 요청 시간이 초과되었습니다. 이미지 크기를 줄이거나 더 간단한 이미지를 업로드한 후 다시 시도해주세요.');
        } else {
          console.error('분석 오류:', error);
          alert(`분석 중 오류가 발생했습니다: ${error.message}`);
        }
        
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('예상치 못한 오류:', error);
      alert(`예상치 못한 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50 p-0 overflow-x-hidden">
      {/* 큰 카드 컨테이너 - 380픽셀로 고정 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.6 }}
        className="relative w-[380px] h-auto bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 pt-10 pb-12 shadow-lg"
        style={{ maxHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* 왼쪽 위 점 장식 */}
        <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 오른쪽 상단 캐릭터 */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          className="absolute -right-10 top-6 w-20 h-20"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/cute2.png" 
              alt="Cute Character 2" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </div>
        </motion.div>
        
        {/* 왼쪽 아래 캐릭터 */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
          className="absolute -left-10 bottom-10 w-20 h-20"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/cute2.png" 
              alt="Cute Character" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </div>
        </motion.div>
        
        {/* 왼쪽 하단 장식 */}
        <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 상단 로고 및 제목 영역 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center mb-6"
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-xs font-bold text-gray-700 mb-1 tracking-wider">AC'SCENT IDENTITY</h2>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              <span className="bg-yellow-300 px-1 py-1 inline-block">
                {step === 1 && t('info.title')}
                {step === 2 && t('info.style.title')}
                {step === 3 && t('info.personality.title')}
                {step === 4 && t('info.charm.title')}
                {step === 5 && t('info.image.title')}
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-gray-700 text-base text-center mt-1"
          >
{t('info.subtitle', '최애에 대한 정보를 입력해주세요')} ({step}/5)
          </motion.p>
          
          {/* 진행 상태 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-yellow-400 h-2.5 rounded-full" 
              style={{ width: `${step * 20}%` }}
            ></div>
          </div>
        </motion.div>
        
        {/* 단계 1: 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3 mb-5"
        >
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('info.password.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="userPhone"
                  name="userPhone"
                  value={idolInfo.userPhone}
                  onChange={handleInputChange}
                  placeholder={t('info.password.placeholder')}
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-900 placeholder-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">결과 조회 시 사용되는 비밀번호입니다</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('info.name.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={idolInfo.name}
                  onChange={handleInputChange}
                  placeholder={t('info.name.placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-900 placeholder-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">한글 5글자, 영어 10글자 이내로 입력해주세요</p>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('info.gender.label')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={idolInfo.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-900"
                  required
                >
                  <option value="">{t('info.gender.placeholder', '성별을 선택해주세요')}</option>
                  <option value="남성">{t('info.gender.male')}</option>
                  <option value="여성">{t('info.gender.female')}</option>
                </select>
              </div>
              
            </div>
          )}
          
          {/* 단계 2: 스타일 */}
          {step === 2 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {t('info.style.subtitle')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {styleOptions.map((style) => (
                  <label 
                    key={style.id} 
                    className={`
                      flex items-center p-3 border rounded-md cursor-pointer transition-all
                      ${idolInfo.style.includes(style.id) 
                        ? 'border-yellow-500 bg-yellow-50' 
                        : 'border-gray-200 hover:border-yellow-300'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={idolInfo.style.includes(style.id)}
                      onChange={() => handleCheckboxChange('style', style.id)}
                      className="sr-only"
                    />
                    <span className={`${idolInfo.style.includes(style.id) ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {style.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* 단계 3: 성격 */}
          {step === 3 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {t('info.personality.subtitle')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {personalityOptions.map((personality) => (
                  <label 
                    key={personality.id} 
                    className={`
                      flex items-center p-3 border rounded-md cursor-pointer transition-all
                      ${idolInfo.personality.includes(personality.id) 
                        ? 'border-yellow-500 bg-yellow-50' 
                        : 'border-gray-200 hover:border-yellow-300'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={idolInfo.personality.includes(personality.id)}
                      onChange={() => handleCheckboxChange('personality', personality.id)}
                      className="sr-only"
                    />
                    <span className={`${idolInfo.personality.includes(personality.id) ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {personality.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* 단계 4: 매력 포인트 */}
          {step === 4 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {t('info.charm.subtitle', '최애의 매력 포인트를 자유롭게 작성해주세요.')}
              </p>
              <textarea
                id="charms"
                name="charms"
                value={idolInfo.charms}
                onChange={handleInputChange}
                placeholder={t('info.charm.placeholder')}
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
              />
            </div>
          )}
          
          {/* 단계 5: 이미지 업로드 */}
          {step === 5 && (
            <div>
              {!showImageModal ? (
                /* 이미지 업로드 안내 모달 */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    최애 이미지 업로드
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      📸 이미지 비율 안내
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      <strong>5:6 비율</strong>의 세로로 조금 긴 이미지를<br/>
                      업로드해주시면 가장 좋은 결과를 얻을 수 있어요!
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      (예: 500×600px, 400×480px 등)
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      ✨ <strong>팁:</strong> 최애가 잘 보이는 고화질 사진을<br/>
                      선택하시면 더 정확한 분석이 가능해요!
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 shadow-md"
                  >
                    이미지 업로드하기
                  </button>
                </div>
              ) : (
                /* 실제 이미지 업로드 컴포넌트 */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      {t('info.image.subtitle')}
                    </p>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      다시 안내보기
                    </button>
                  </div>
                  <IdolImageUpload 
                    onImageUpload={(file) => {
                      handleImageUpload(file);
                      const preview = URL.createObjectURL(file);
                      setImagePreview(preview);
                    }}
                    previewUrl={imagePreview}
                  />
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    * 5:6 비율의 세로 이미지를 권장해요!
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        {/* 버튼 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex justify-center space-x-3"
        >
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-gray-800 text-gray-800 font-bold py-2 px-6 rounded-full shadow-sm flex items-center"
            disabled={isSubmitting}
          >
{step === 1 ? t('common.home', '처음으로') : t('common.back')}
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white border-2 border-gray-800 text-gray-800 font-bold py-2 px-6 rounded-full shadow-sm flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {step === 5 ? (
              isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {analysisStage || t('analysis.stage.analyzing')}
                </span>
              ) : t('common.complete')
            ) : t('common.next')}
            {!isSubmitting && <span className="ml-1 text-lg">»</span>}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}