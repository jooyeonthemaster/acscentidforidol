"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Message from './Message';
import ImageUpload from './ImageUpload';
import PerfumeRecommendation from './PerfumeRecommendation';
import { Perfume } from '@/utils/perfume';

// 메시지 타입 정의
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 프로필 정보 인터페이스
interface ProfileInfo {
  name: string;
  group: string;
  style: string[];
  personality: string[];
  charms: string;
}

export default function ChatInterface() {
  const router = useRouter();
  
  // 상태 관리
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: '안녕하세요! 저는 어울리는 향수를 추천해주는 AI 입니다. 대화를 통해 원하는 이미지, 스타일, 분위기에 대해 알려주시면 더 정확한 추천이 가능해요. 마지막에 이미지를 업로드해주시면 이미지를 분석하여 어울리는 향수를 추천해드릴게요! 💕' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recommendedPerfume, setRecommendedPerfume] = useState<Perfume | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 프로필 정보 불러오기
  useEffect(() => {
    // localStorage에서 프로필 정보 가져오기
    const storedProfileInfo = localStorage.getItem('idolInfo');
    
    if (storedProfileInfo) {
      const parsedInfo = JSON.parse(storedProfileInfo) as ProfileInfo;
      setProfileInfo(parsedInfo);
      
      // 프로필 정보 기반 환영 메시지 추가
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `${parsedInfo.name}님에 대해 알려주셔서 감사합니다! 더 이야기해볼까요? 이미지를 업로드하시면 ${parsedInfo.name}님에게 어울리는 향수를 추천해드릴게요.`
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
    } else {
      // 정보가 없으면 정보 입력 페이지로 리디렉션
      router.push('/info');
    }
  }, [router]);
  
  // 스크롤 자동 조정
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송 처리
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() && !imageFile) return;

    // 사용자 메시지 추가
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        role: 'user',
        content: inputValue,
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        // 프로필 정보 추가
        const profileContext = profileInfo ? {
          idolName: profileInfo.name,
          idolGroup: profileInfo.group,
          idolStyle: profileInfo.style.join(', '),
          idolPersonality: profileInfo.personality.join(', '),
          idolCharms: profileInfo.charms
        } : {};
        
        // API 요청
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputValue,
            history: messages.map(msg => ({ role: msg.role, parts: msg.content })),
            idolInfo: profileContext
          }),
        });

        if (!response.ok) {
          throw new Error('API 요청 실패');
        }

        const data = await response.json();
        
        // AI 응답 추가
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } catch (error) {
        console.error('오류:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' }]);
      } finally {
        setIsLoading(false);
      }
    }

    // 이미지가 있는 경우 향수 추천 요청
    if (imageFile && imagePreview) {
      setIsLoading(true);
      
      try {
        // 이미지를 base64로 인코딩
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async () => {
          const base64Image = (reader.result as string).split(',')[1]; // base64 부분만 추출
          
          // 프로필 정보 추가
          const profileContext = profileInfo ? {
            idolName: profileInfo.name,
            idolGroup: profileInfo.group,
            idolStyle: profileInfo.style.join(', '),
            idolPersonality: profileInfo.personality.join(', '),
            idolCharms: profileInfo.charms
          } : {};
          
          // 이미지 업로드 메시지 추가
          setMessages(prev => [...prev, { 
            role: 'user', 
            content: profileInfo 
              ? `이미지를 업로드했습니다. 이 이미지를 기반으로 향수를 추천해주세요.` 
              : '이미지를 업로드했습니다. 이 이미지를 기반으로 향수를 추천해주세요.' 
          }]);

          // API 요청
          const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image,
              history: messages.map(msg => ({ role: msg.role, parts: msg.content })),
              idolInfo: profileContext
            }),
          });

          if (!response.ok) {
            throw new Error('API 요청 실패');
          }

          const data = await response.json();
          
          // 추천 결과 설정
          setRecommendation(data.response);
          
          // 추천 결과 메시지 추가
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: profileInfo
              ? `이미지 분석이 완료되었어요! 이미지에 어울리는 향수를 추천해드릴게요.`
              : '이미지 분석이 완료되었어요! 이미지에 어울리는 향수를 추천해드릴게요.' 
          }]);
          
          // 이미지 상태 초기화
          setImageFile(null);
        };
      } catch (error) {
        console.error('오류:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '죄송합니다. 이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.' 
        }]);
        setImageFile(null);
        setImagePreview(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (file: File) => {
    setImageFile(file);
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 미리보기 제거
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // 정보 입력 페이지로 돌아가기
  const handleBackToInfo = () => {
    router.push('/info');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50 max-w-[390px] mx-auto">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4 text-white shadow-md flex items-center">
        <button 
          onClick={handleBackToInfo}
          className="text-white p-1 rounded-full hover:bg-pink-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-center flex-1">
          {profileInfo ? `어울리는 향수 찾기 💕` : '어울리는 향수 찾기 💕'}
        </h1>
      </div>
      
      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        
        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-bounce bg-pink-400 rounded-full h-3 w-3 mr-1"></div>
            <div className="animate-bounce bg-pink-300 rounded-full h-3 w-3 mr-1" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-bounce bg-pink-200 rounded-full h-3 w-3" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        
        {/* 향수 추천 결과 */}
        {recommendation && <PerfumeRecommendation recommendation={recommendation} />}
        
        <div ref={chatEndRef} />
      </div>
      
      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <Image 
              src={imagePreview} 
              alt="업로드 이미지" 
              width={100} 
              height={100} 
              className="rounded-md object-cover"
            />
            <button 
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <ImageUpload onImageUpload={handleImageUpload} disabled={isLoading || !!imageFile} />
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && !imageFile)}
            className="bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full p-2 hover:opacity-90 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}