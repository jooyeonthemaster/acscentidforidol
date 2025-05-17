"use client";

import React from 'react';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[80%] rounded-2xl px-4 py-2 
          ${isUser 
            ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}