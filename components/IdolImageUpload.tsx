"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface IdolImageUploadProps {
  onImageUpload: (file: File) => void;
  previewUrl?: string;
}

export default function IdolImageUpload({ onImageUpload, previewUrl }: IdolImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(previewUrl);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('파일 크기는 5MB 이하여야 합니다.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('이미지 파일만 업로드 가능합니다.');
      } else {
        setError('파일 업로드 중 오류가 발생했습니다.');
      }
      return;
    }
    
    // 파일 유형 검증
    const file = acceptedFiles[0];
    if (!file) return;
    
    // 미리보기 생성
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // 상위 컴포넌트에 파일 전달
    onImageUpload(file);
  }, [onImageUpload]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });
  
  // 컴포넌트 언마운트시 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (preview && preview !== previewUrl) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, previewUrl]);
  
  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`
          w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${isDragActive ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${preview ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full aspect-square max-h-[200px] mx-auto">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg"
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setPreview(undefined);
              }}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? 
                "여기에 파일을 놓으세요!" : 
                "최애의 이미지를 드래그하거나 클릭하여 업로드하세요"
              }
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF 파일 (최대 5MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
} 