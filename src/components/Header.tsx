'use client';

import React, { useState } from 'react';
import { User, LogOut, Check } from 'lucide-react';

interface HeaderProps {
  currentUser: string | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogin, onLogout }: HeaderProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [inputName, setInputName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    onLogin(inputName.trim());
    setInputName('');
    setIsChanging(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            ✈
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Team 046 스케줄</h1>
            <p className="text-[11px] text-slate-400 font-medium">스프레드시트 실시간 동기화</p>
          </div>
        </div>

        <div>
          {currentUser && !isChanging ? (
            <div className="flex items-center space-x-1.5 bg-slate-100/80 border border-slate-200/60 rounded-full py-1 px-2.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                {currentUser}
              </span>
              <button
                onClick={() => {
                  setInputName(currentUser);
                  setIsChanging(true);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 ml-1 pl-1 border-l border-slate-300 transition-colors"
                title="이름 변경"
              >
                변경
              </button>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center space-x-1">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="이름 입력"
                className="w-24 text-xs px-2.5 py-1 rounded-full border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-800"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                title="확인"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              {isChanging && (
                <button
                  type="button"
                  onClick={() => setIsChanging(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  취소
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
