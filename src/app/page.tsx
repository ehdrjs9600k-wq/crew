'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';
import RecordModal from '@/components/RecordModal';
import LoginModal from '@/components/LoginModal';
import { TeamRecord } from '@/types/record';
import { RefreshCw, Users } from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  // SSR Pre-render 시 동적 Date 호출 방지를 위해 초기값을 고정 또는 useEffect에서 세팅
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-11-01'));
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-01');

  const [records, setRecords] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 클라이언트 마운트 시 현재 날짜 및 로컬 스토리지 불러오기
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);

    const savedUser = localStorage.getItem('crew_user_name');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // 토스트 메시지 헬퍼
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 기록 데이터 조회 (GET)
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/records', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
      showToast('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 로그인 핸들러
  const handleLogin = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem('crew_user_name', name);
    setIsLoginModalOpen(false);
    showToast(`${name}님 환영합니다.`);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('crew_user_name');
    showToast('로그아웃 되었습니다.');
  };

  // 월 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // 날짜 선택 및 모달 열기
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  // 기록 추가 핸들러
  const handleAddRecord = async (newRecordData: Omit<TeamRecord, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          payload: newRecordData,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast('성공적으로 저장되었습니다.');
        // 즉각 재조회 (Re-fetch)
        await fetchRecords();
      } else {
        showToast('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('네트워크 오류가 발생했습니다.');
    }
  };

  // 기록 삭제 핸들러
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          payload: { id },
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast('삭제되었습니다.');
        // 즉각 재조회 (Re-fetch)
        await fetchRecords();
      } else {
        showToast('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 헤더 */}
      <Header
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* 메인 뷰 컨테이너 (스마트폰 최적화 폭) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* 미로그인 시 알림 배너 */}
        {!currentUser && (
          <div
            onClick={() => setIsLoginModalOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-3 flex items-center justify-between text-blue-900 shadow-xs"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold">이름을 등록하고 함께 일정을 공유하세요!</span>
            </div>
            <span className="text-[11px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
              등록
            </span>
          </div>
        )}

        {/* 새로고침 및 상태 정보 */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500">
            총 {records.length}건의 팀 기록
          </span>
          <button
            onClick={() => fetchRecords()}
            disabled={loading}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>동기화</span>
          </button>
        </div>

        {/* 월간 캘린더 */}
        <Calendar
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          records={records}
        />

        {/* 하단 빠른 정보 팁 카드 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
            <span>사용 안내</span>
          </div>
          <ul className="list-disc list-inside space-x-0.5 space-y-1 text-[11px] text-slate-500">
            <li>달력에서 특정 날짜를 터치하면 상세 기록과 추가 창이 열립니다.</li>
            <li>본인이 작성한 글만 삭제할 수 있습니다.</li>
            <li>스프레드시트 배포 URL이 연결되면 전 팀원에게 실시간 반영됩니다.</li>
          </ul>
        </div>
      </main>

      {/* 세부 바텀시트 / 모달 */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        records={records}
        currentUser={currentUser}
        onAddRecord={handleAddRecord}
        onDeleteRecord={handleDeleteRecord}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* 간이 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLogin={handleLogin}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* 토스트 팝업 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs transition animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
