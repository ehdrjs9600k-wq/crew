'use client';

import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (name: string) => void;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onLogin, onClose }: LoginModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(name.trim());
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-center font-bold text-slate-800 text-base mb-1">
          사용자 이름 입력
        </h3>
        <p className="text-center text-xs text-slate-400 mb-5">
          팀원 식별 및 작성자 표기를 위해 이름을 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력 (예: 홍길동)"
            required
            autoFocus
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              시작하기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition"
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
