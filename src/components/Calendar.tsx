'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { TeamRecord, CategoryType } from '@/types/record';

interface CalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  records: TeamRecord[];
}

export default function Calendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  selectedDate,
  onSelectDate,
  records,
}: CalendarProps) {
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setTodayStr(`${y}-${m}-${d}`);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11

  // 해당 월 1일의 요일 (0: 일, 1: 월, ...)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // 해당 월 마지막 날짜
  const lastDay = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜별 레코드 카테고리 맵핑 { '2026-10-15': Set(['schedule', 'flight']) }
  const recordCategoryMap = React.useMemo(() => {
    const map: Record<string, Set<CategoryType>> = {};
    records.forEach((rec) => {
      if (!map[rec.date]) {
        map[rec.date] = new Set<CategoryType>();
      }
      map[rec.date].add(rec.category);
    });
    return map;
  }, [records]);

  const calendarDays = [];
  // 이전 달 여백 채우기
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // 이번 달 일수 채우기
  for (let day = 1; day <= lastDay; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
      {/* 월 네비게이션 헤더 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-1">
          <h2 className="text-lg font-bold text-slate-800">
            {year}년 {month + 1}월
          </h2>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onToday}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>오늘</span>
          </button>
          <div className="flex bg-slate-100 rounded-full p-0.5">
            <button
              onClick={onPrevMonth}
              className="p-1 rounded-full text-slate-600 hover:bg-white hover:shadow-xs transition"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1 rounded-full text-slate-600 hover:bg-white hover:shadow-xs transition"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-semibold py-1 ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-12" />;
          }

          const currentCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(
            day
          ).padStart(2, '0')}`;
          const isSelected = selectedDate === currentCellDate;
          const isToday = todayStr === currentCellDate;
          const categories = recordCategoryMap[currentCellDate];
          const colIndex = index % 7;

          return (
            <button
              key={`day-${day}`}
              onClick={() => onSelectDate(currentCellDate)}
              className={`h-12 flex flex-col items-center justify-between py-1.5 rounded-2xl transition relative group ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isSelected
                    ? 'text-white font-bold'
                    : isToday
                    ? 'text-blue-600 font-bold'
                    : colIndex === 0
                    ? 'text-red-500'
                    : colIndex === 6
                    ? 'text-blue-500'
                    : 'text-slate-700'
                }`}
              >
                {day}
              </span>

              {/* 카테고리별 작은 점 (Dot Indicator) */}
              <div className="flex items-center space-x-1 h-2">
                {categories?.has('schedule') && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-blue-500'
                    }`}
                  />
                )}
                {categories?.has('flight') && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-purple-200' : 'bg-purple-500'
                    }`}
                  />
                )}
                {categories?.has('maintenance') && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-orange-200' : 'bg-orange-500'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 범례 표시 */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500 font-medium">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span>스케줄</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
          <span>비행기록</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          <span>정비작업</span>
        </div>
      </div>
    </div>
  );
}
