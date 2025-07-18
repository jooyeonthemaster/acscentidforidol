"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SessionData {
  userId: string;
  sessionId: string;
  phoneNumber: string;
  createdAt: any;
  updatedAt: any;
  status: string;
  customerName: string;
  idolName: string;
  hasImageAnalysis: boolean;
  hasFeedback: boolean;
  hasRecipe: boolean;
  hasConfirmation: boolean;
  completionStatus: string;
}

interface PaginationData {
  sessions: SessionData[];
  totalSessions: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function AdminPage() {
  const [paginationData, setPaginationData] = useState<PaginationData>({
    sessions: [],
    totalSessions: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [optimizedMode, setOptimizedMode] = useState(true); // 최적화 모드 기본 활성화

  // 데이터 로드
  useEffect(() => {
    loadSessions(1); // 첫 페이지 로드
  }, [optimizedMode]); // 최적화 모드 변경 시에도 다시 로드

  const loadSessions = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const optimizedParam = optimizedMode ? '&optimized=true' : '';
      const response = await fetch(`/api/admin?page=${page}&pageSize=${pageSize}${optimizedParam}`);
      const data = await response.json();
      
      if (data.success) {
        setPaginationData({
          sessions: data.sessions,
          totalSessions: data.totalSessions,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.pageSize
        });
      } else {
        setError(data.error || '데이터 로드 실패');
      }
    } catch (err) {
      setError('서버 연결 오류');
      console.error('Admin 데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return;
    loadSessions(newPage, paginationData.pageSize);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    loadSessions(1, newPageSize); // 페이지 크기 변경 시 첫 페이지로
  };

  // 시간 포맷팅
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '알 수 없음';
    
    let date;
    if (typeof timestamp === 'object' && timestamp.seconds) {
      // Firebase Timestamp 객체
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return '알 수 없음';
    }
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800';
      case '레시피 생성': return 'bg-blue-100 text-blue-800';
      case '피드백 완료': return 'bg-yellow-100 text-yellow-800';
      case '분석 완료': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링
  const filteredSessions = paginationData.sessions.filter(session => {
    const matchesSearch = 
      session.phoneNumber.includes(searchTerm) ||
      session.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.idolName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.completionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AC'SCENT 관리자</h1>
                <p className="text-gray-600">향수 분석 내역 관리</p>
              </div>
              <div className="text-sm text-gray-500">
                로딩 중...
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 스켈레톤 UI */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고객 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최애
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      진행 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      분석 일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array(10).fill(0).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ 오류 발생</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadSessions(paginationData.currentPage, paginationData.pageSize)}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AC'SCENT 관리자</h1>
              <p className="text-gray-600">향수 분석 내역 관리</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">최적화 모드:</span>
                <button
                  onClick={() => setOptimizedMode(!optimizedMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    optimizedMode ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      optimizedMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {optimizedMode && <span className="text-xs text-green-600">⚡ 빠름</span>}
              </div>
              <div className="text-sm text-gray-500">
                총 {paginationData.totalSessions}개 세션
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색 (비밀번호, 고객명, 최애명)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진행 상태
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="완료">완료</option>
                <option value="레시피 생성">레시피 생성</option>
                <option value="피드백 완료">피드백 완료</option>
                <option value="분석 완료">분석 완료</option>
                <option value="진행 중">진행 중</option>
              </select>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최애
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    진행 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분석 일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session, index) => (
                  <motion.tr
                    key={session.sessionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.idolName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.completionStatus)}`}>
                        {session.completionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/report/${session.userId}_${session.sessionId}`}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        보고서 보기
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">검색 결과가 없습니다.</div>
              </div>
            )}
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(paginationData.currentPage - 1)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(paginationData.currentPage + 1)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">
                페이지 크기:
              </span>
              <select
                value={paginationData.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(paginationData.currentPage - 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                                 {/* 페이지 번호 계산 (10개씩만 표시) */}
                 {(() => {
                   const currentPage = paginationData.currentPage;
                   const totalPages = paginationData.totalPages;
                   const pageGroupSize = 10;
                   const currentGroup = Math.ceil(currentPage / pageGroupSize);
                   const startPage = (currentGroup - 1) * pageGroupSize + 1;
                   const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);
                   
                   const pages = [];
                   
                   // 이전 그룹으로 이동 버튼
                   if (startPage > 1) {
                     pages.push(
                       <button
                         key="prevGroup"
                         onClick={() => handlePageChange(startPage - 1)}
                         className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                       >
                         ...
                       </button>
                     );
                   }
                   
                   // 현재 그룹의 페이지 번호들
                   for (let i = startPage; i <= endPage; i++) {
                     pages.push(
                       <button
                         key={i}
                         onClick={() => handlePageChange(i)}
                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                           currentPage === i
                             ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                             : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                         }`}
                       >
                         {i}
                       </button>
                     );
                   }
                   
                   // 다음 그룹으로 이동 버튼
                   if (endPage < totalPages) {
                     pages.push(
                       <button
                         key="nextGroup"
                         onClick={() => handlePageChange(endPage + 1)}
                         className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                       >
                         ...
                       </button>
                     );
                   }
                   
                   return pages;
                 })()}
                <button
                  onClick={() => handlePageChange(paginationData.currentPage + 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 