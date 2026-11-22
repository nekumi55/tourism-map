'use client';

import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

const ADMIN_STORAGE_KEY = 'tourism_map_admin_auth_v1';
const DEFAULT_PIN = '888888';
const DEFAULT_PASS = 'admin123';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  });
  const [inputCode, setInputCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === DEFAULT_PIN || inputCode === DEFAULT_PASS) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Mã PIN hoặc mật khẩu quản trị viên không chính xác!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAuthenticated(false);
    setInputCode('');
  };

  // Not authenticated: Show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bảng Quản Trị Hệ Thống
            </h1>
            <p className="text-xs text-slate-500">
              Khu vực bảo mật dành riêng cho Quản trị viên (Admin)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã PIN hoặc Mật khẩu Quản trị
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Nhập mã PIN hoặc mật khẩu..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-hidden focus:border-teal-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
              {errorMsg && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>Đăng Nhập Quản Trị</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credential Hint for the user */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Thông tin đăng nhập mặc định:</span>
            </div>
            <div>
              Mã PIN nhanh: <code className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">888888</code> hoặc mật khẩu: <code className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">admin123</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Render children with a top Admin bar
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Status Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wide">CHẾ ĐỘ QUẢN TRỊ VIÊN TOÀN QUYỀN (ADMIN CMS)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">Phiên làm việc: Quyền cao nhất</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-200 hover:text-white font-semibold transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
