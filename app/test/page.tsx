"use client";

import React, { useState } from 'react';

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError("이미지를 업로드해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      // FormData 생성
      const formData = new FormData();
      formData.append('image', image);
      formData.append('idolName', 'Test Idol');
      formData.append('idolGroup', 'Test Group');
      formData.append('idolStyle', 'cute');
      formData.append('idolPersonality', 'bright');
      formData.append('idolCharms', '테스트용 최애 매력 포인트');

      // API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }

      // 응답 데이터 파싱
      const data = await response.json();
      console.log('API 응답:', data);
      setResult(data);
    } catch (err: any) {
      console.error('테스트 오류:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API 테스트 페이지</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">이미지 업로드:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 w-full"
          />
        </div>
        
        {imagePreview && (
          <div className="mb-4">
            <img 
              src={imagePreview} 
              alt="미리보기" 
              className="max-w-xs max-h-64 object-contain border"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? '처리 중...' : 'API 테스트'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          <p className="font-bold">오류 발생:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">API 응답 결과:</h2>
          
          <div className="bg-gray-100 p-4 rounded overflow-auto" style={{ maxHeight: '500px' }}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">주요 확인 포인트:</h3>
            <ul className="list-disc pl-5">
              <li>
                traits: {result.traits ? '있음 ✅' : '없음 ❌'}
              </li>
              <li>
                scentCategories: {result.scentCategories ? '있음 ✅' : '없음 ❌'}
              </li>
              <li>
                matchingPerfumes: {result.matchingPerfumes ? 
                  `있음 ✅ (${result.matchingPerfumes.length}개)` : 
                  '없음 ❌'}
              </li>
              {result.matchingPerfumes && result.matchingPerfumes.length > 0 && (
                <li>
                  persona 객체: {result.matchingPerfumes[0].persona ? '있음 ✅' : '없음 ❌'}
                </li>
              )}
              <li>
                customPerfume: {result.customPerfume ? '있음 ✅' : '없음 ❌'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 