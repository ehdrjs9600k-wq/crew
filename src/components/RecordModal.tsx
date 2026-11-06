'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Plane,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { TeamRecord, CategoryType, ScheduleRecord, FlightRecord, MaintenanceRecord } from '@/types/record';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  records: TeamRecord[];
  currentUser: string | null;
  onAddRecord: (record: Omit<TeamRecord, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  onOpenLoginModal: () => void;
}

export default function RecordModal({
  isOpen,
  onClose,
  selectedDate,
  records,
  currentUser,
  onAddRecord,
  onDeleteRecord,
  onOpenLoginModal,
}: RecordModalProps) {
  const [activeTab, setActiveTab] = useState<CategoryType>('schedule');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 스케줄 폼 상태
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleMemo, setScheduleMemo] = useState('');

  // 비행기록 폼 상태
  const [aircraftNumber, setAircraftNumber] = useState('');
  const [flightDuration, setFlightDuration] = useState('01:00');
  const [purposeAndRoute, setPurposeAndRoute] = useState('');

  // 정비작업 폼 상태
  const [partOrItem, setPartOrItem] = useState('');
  const [maintenanceDetails, setMaintenanceDetails] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState<'진행중' | '완료'>('완료');

  if (!isOpen) return null;

  // 선택한 날짜 포맷팅 (예: 2026. 10. 15 (목))
  const formatHeaderDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `${parts[0]}. ${parts[1]}. ${parts[2]} (${days[d.getDay()]})`;
    } catch {
      return dateStr;
    }
  };

  // 선택된 탭에 해당하는 레코드 필터
  const currentTabRecords = records.filter(
    (rec) => rec.date === selectedDate && rec.category === activeTab
  );

  const resetForms = () => {
    setScheduleTitle('');
    setScheduleMemo('');
    setScheduleTime('09:00');

    setAircraftNumber('');
    setFlightDuration('01:00');
    setPurposeAndRoute('');

    setPartOrItem('');
    setMaintenanceDetails('');
    setMaintenanceStatus('완료');

    setIsFormOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLoginModal();
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'schedule') {
        if (!scheduleTitle.trim()) return;
        const record: Omit<ScheduleRecord, 'id' | 'createdAt'> = {
          category: 'schedule',
          date: selectedDate,
          author: currentUser,
          time: scheduleTime,
          title: scheduleTitle.trim(),
          memo: scheduleMemo.trim(),
        };
        await onAddRecord(record);
      } else if (activeTab === 'flight') {
        if (!aircraftNumber.trim() || !purposeAndRoute.trim()) return;
        const record: Omit<FlightRecord, 'id' | 'createdAt'> = {
          category: 'flight',
          date: selectedDate,
          author: currentUser,
          aircraftNumber: aircraftNumber.trim(),
          flightDuration: flightDuration.trim(),
          purposeAndRoute: purposeAndRoute.trim(),
        };
        await onAddRecord(record);
      } else if (activeTab === 'maintenance') {
        if (!partOrItem.trim() || !maintenanceDetails.trim()) return;
        const record: Omit<MaintenanceRecord, 'id' | 'createdAt'> = {
          category: 'maintenance',
          date: selectedDate,
          author: currentUser,
          partOrItem: partOrItem.trim(),
          details: maintenanceDetails.trim(),
          status: maintenanceStatus,
        };
        await onAddRecord(record);
      }
      resetForms();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* 바텀시트 / 모달 컨테이너 */}
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일 드래그 핸들 바 */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {formatHeaderDate(selectedDate)}
              </h3>
              <p className="text-[11px] text-slate-400">일정 및 작업 내역</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3개 탭 네비게이션 */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => {
              setActiveTab('schedule');
              setIsFormOpen(false);
            }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'schedule'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>스케줄</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('flight');
              setIsFormOpen(false);
            }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'flight'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>비행기록</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('maintenance');
              setIsFormOpen(false);
            }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'maintenance'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>정비작업</span>
          </button>
        </div>

        {/* 컨텐츠 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 목록 표시 영역 */}
          {currentTabRecords.length === 0 && !isFormOpen && (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-xs">등록된 기록이 없습니다.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">아래 '기록 추가'를 눌러 작성해보세요.</p>
            </div>
          )}

          {currentTabRecords.map((item) => {
            const canDelete = currentUser && item.author === currentUser;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs relative hover:border-slate-200 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 카테고리별 세부 항목 카드 뷰 */}
                    {item.category === 'schedule' && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {item.time}
                          </span>
                          <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                        </div>
                        {item.memo && (
                          <p className="text-xs text-slate-600 mt-1 pl-1 whitespace-pre-wrap">
                            {item.memo}
                          </p>
                        )}
                      </div>
                    )}

                    {item.category === 'flight' && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            기체 {item.aircraftNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            비행 {item.flightDuration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium pl-0.5">
                          {item.purposeAndRoute}
                        </p>
                      </div>
                    )}

                    {item.category === 'maintenance' && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                              item.status === '완료'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {item.status === '완료' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            <span>{item.status}</span>
                          </span>
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {item.partOrItem}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 pl-0.5 whitespace-pre-wrap">
                          {item.details}
                        </p>
                      </div>
                    )}

                    {/* 작성자 정보 */}
                    <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>작성자: <span className="font-medium text-slate-600">{item.author}</span></span>
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  {canDelete && (
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      className="ml-2 p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* 등록 폼 */}
          {isFormOpen && (
            <form
              onSubmit={handleFormSubmit}
              className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-bold text-slate-700">
                  새 {activeTab === 'schedule' ? '스케줄' : activeTab === 'flight' ? '비행기록' : '정비작업'} 추가
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">
                  작성자: {currentUser || '미로그인'}
                </span>
              </div>

              {/* 스케줄 폼 */}
              {activeTab === 'schedule' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      시간
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      일정 제목
                    </label>
                    <input
                      type="text"
                      placeholder="예: 비행 전 점검 회의"
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      상세 메모
                    </label>
                    <textarea
                      placeholder="메모를 입력하세요..."
                      value={scheduleMemo}
                      onChange={(e) => setScheduleMemo(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* 비행기록 폼 */}
              {activeTab === 'flight' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        기체 번호
                      </label>
                      <input
                        type="text"
                        placeholder="예: HL-1234"
                        value={aircraftNumber}
                        onChange={(e) => setAircraftNumber(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        비행 시간
                      </label>
                      <input
                        type="text"
                        placeholder="예: 01:30"
                        value={flightDuration}
                        onChange={(e) => setFlightDuration(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      비행 목적 및 경로
                    </label>
                    <textarea
                      placeholder="예: RKSI -> RKSS 훈련 비행"
                      value={purposeAndRoute}
                      onChange={(e) => setPurposeAndRoute(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* 정비작업 폼 */}
              {activeTab === 'maintenance' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        정비 부위/항목
                      </label>
                      <input
                        type="text"
                        placeholder="예: 랜딩기어"
                        value={partOrItem}
                        onChange={(e) => setPartOrItem(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        상태
                      </label>
                      <select
                        value={maintenanceStatus}
                        onChange={(e) => setMaintenanceStatus(e.target.value as '진행중' | '완료')}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="완료">완료</option>
                        <option value="진행중">진행중</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      정비 세부내용
                    </label>
                    <textarea
                      placeholder="점검 내용 및 조치 사항 입력..."
                      value={maintenanceDetails}
                      onChange={(e) => setMaintenanceDetails(e.target.value)}
                      required
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? '저장 중...' : '저장하기'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 하단 고정 추가 버튼 */}
        {!isFormOpen && (
          <div className="p-3 bg-white border-t border-slate-100">
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenLoginModal();
                } else {
                  setIsFormOpen(true);
                }
              }}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-2xl flex items-center justify-center space-x-1.5 shadow-md active:scale-[0.99] transition"
            >
              <Plus className="w-4 h-4" />
              <span>
                {currentUser
                  ? `${activeTab === 'schedule' ? '스케줄' : activeTab === 'flight' ? '비행기록' : '정비작업'} 추가하기`
                  : '이름 설정 후 기록 추가하기'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
