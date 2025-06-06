"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 메시지 타입 정의
type MessageType = {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
};

// 모달 타입 정의
type ModalType = 'welcome' | null;

// 타이핑 효과 훅
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return { displayText, isComplete };
};

// 모달 컴포넌트
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant: ModalType;
}> = ({ isOpen, onClose, children, variant }) => {
  const bgColors = {
    welcome: 'bg-gradient-to-br from-yellow-100 to-pink-100',
  };
  
  if (!isOpen || !variant) {
    return <div style={{ display: 'none' }}></div>; // 조건이 맞지 않을 때도 컴포넌트는 유지
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`${bgColors[variant]} w-[90%] max-w-md rounded-3xl p-6 shadow-xl border-4 border-dashed border-white`}
      >
        {children}
        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium shadow-md border-2 border-pink-200 hover:bg-pink-50 transition-all"
          >
            확인했어요!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ChatUI() {
  // 상태 관리
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('welcome');
  const [showModal, setShowModal] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 환영 메시지 및 안내 메시지
  const welcomeMessage = "안녕하세요! AC'SCENT ID에 오신 것을 환영해요! 😊 저와 함께 대화하면서 어울리는 향수를 찾아볼까요?";
  const { displayText: typedWelcome, isComplete } = useTypewriter(welcomeMessage, 40);

  // 채팅창이 항상 최신 메시지를 보여주도록 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트 로딩 시 설정
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
    
    // 환영 모달 닫힌 후 첫 메시지 표시
    setTimeout(() => {
      // 환영 인사만 표시
      addMessage(welcomeMessage, 'bot');
    }, 600);
  };

  // 새 메시지 추가 함수
  const addMessage = (text: string, sender: 'bot' | 'user') => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // 메시지 전송 처리
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage(input, 'user');
      setInput('');
      
      // 실제로는 여기서 Gemini API를 호출하여 응답을 받아야 하지만
      // 현재는 지시대로 API 호출은 하지 않고 추후 구현 예정
      setTimeout(() => {
        addMessage("좋은 답변이에요! 계속해서 이야기해볼까요?", 'bot');
      }, 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50 p-0 overflow-x-hidden">
      {/* 채팅 컨테이너 - 380픽셀로 고정 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.6 }}
        className="relative w-[380px] h-[80vh] bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 pt-12 pb-14 shadow-lg flex flex-col"
      >
        {/* 왼쪽 위 점 장식들 */}
        <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        <div className="absolute -left-2 top-36 w-4 h-4 bg-pink-200 border-2 border-pink-400 rounded-full"></div>
        <div className="absolute left-6 -top-2 w-5 h-5 bg-yellow-300 border-2 border-yellow-400 rounded-full"></div>
        
        {/* 상단 귀여운 헤더 영역 */}
        <div className="flex flex-col items-center mb-6 bg-gradient-to-r from-pink-100 to-yellow-100 -mx-6 -mt-12 pt-10 pb-4 px-6 rounded-t-3xl shadow-sm">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-16 h-16 mb-2 relative"
          >
            <img 
              src="/cute2.png" 
              alt="AC'SCENT Logo" 
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </motion.div>
          
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center relative"
          >
            <div className="absolute -right-10 -top-6">
              <div className="bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-sm rotate-12">
                AI 조향사
              </div>
            </div>
            <h2 className="text-xs font-bold text-gray-700 tracking-wider">AC'SCENT IDENTITY</h2>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              <span className="bg-yellow-300 px-1.5 py-0.5 inline-block rounded-md">
                <span className="text-pink-500">♥</span> CHAT <span className="text-pink-500">♥</span>
              </span>
            </h1>
          </motion.div>
          
          {/* 작은 귀여운 장식들 */}
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          </div>
        </div>
        
        {/* 채팅 메시지 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* 일반 메시지 */}
                <>
                  {message.sender === 'bot' && (
                    <div className="w-12 h-12 mr-2 flex-shrink-0">
                      <img
                        src="/cute2.png"
                        alt="Bot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[70%] p-3 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-300 text-gray-900 rounded-[20px] rounded-tr-none shadow-md' 
                        : 'bg-gradient-to-br from-pink-100 to-purple-100 text-gray-800 rounded-[20px] rounded-tl-none border-2 border-pink-200 shadow-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'user' && (
                      <div className="w-2 h-2 absolute -right-1 top-1 bg-yellow-300 rounded-full"></div>
                    )}
                    {message.sender === 'bot' && (
                      <div className="w-2 h-2 absolute -left-1 top-1 bg-pink-100 rounded-full border-2 border-pink-200"></div>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 ml-2 flex-shrink-0 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                      <span className="text-xl">🧑</span>
                    </div>
                  )}
                </>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>
        
        {/* 입력 폼 */}
        <form onSubmit={handleSendMessage} className="flex items-center mt-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 py-2.5 px-4 border-2 border-gray-300 rounded-l-full focus:outline-none focus:border-yellow-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 font-semibold py-2.5 px-5 rounded-r-full border-2 border-yellow-400"
          >
            전송
          </motion.button>
        </form>
        
        {/* 왼쪽 하단 장식 */}
        <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        <div className="absolute right-10 bottom-2 w-3 h-3 bg-pink-200 rounded-full"></div>
      </motion.div>
      
      {/* 모달 컴포넌트 */}
      <AnimatePresence>
        <Modal 
          isOpen={showModal} 
          onClose={handleCloseModal} 
          variant={modalType || 'welcome'} // null 대신 기본값 제공
        >
          {modalType === 'welcome' && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                transition={{ duration: 1, times: [0, 0.6, 1] }}
                className="w-48 h-48 mb-4"
              >
                <img 
                  src="/cute2.png" 
                  alt="Cute Character" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">환영해요!</h2>
              <div className="text-gray-700 text-center leading-relaxed">
                <p>{typedWelcome}</p>
                {isComplete && (
                  <p className="mt-3 text-sm bg-white bg-opacity-50 p-2 rounded-lg">
                    집중해서 질문에 답해주시면 더 정확한 향수를 추천해드릴 수 있어요!
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}