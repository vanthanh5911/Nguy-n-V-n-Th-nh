import React, { useState } from 'react';
import { User, Role } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  Box,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  Wifi,
  AlertCircle,
  ArrowRight,
  Database,
  Building,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = archiveStore.login(trimmedUsername, password);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập không thành công.');
        return;
      }

      if (res.user) {
        if (rememberMe) {
          localStorage.setItem('quanlyluutru_session_user_id', res.user.id);
        } else {
          sessionStorage.setItem('quanlyluutru_session_user_id', res.user.id);
        }
        onLoginSuccess(res.user);
      }
    }, 400);
  };

  // Quick Demo Account Clicker
  const handleQuickLogin = (uname: string, pwd: string) => {
    setUsername(uname);
    setPassword(pwd);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Left Branding & System Overview Panel (Split Screen) */}
      <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between relative bg-radial-[at_top_left] from-slate-900 via-slate-950 to-black border-r border-slate-800 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/25">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white uppercase flex items-center space-x-2">
                <span>QUẢN LÝ LƯU TRỮ</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Hệ Thống Quản Lý Kho Hồ Sơ &amp; Chứng Từ Doanh Nghiệp
              </p>
            </div>
          </div>

          {/* LAN Connection Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server LAN: Connected (192.168.1.100:3000)</span>
          </div>
        </div>

        {/* Middle Core Feature Highlights */}
        <div className="my-10 space-y-4 relative z-10 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            Nền tảng lưu trữ an toàn, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              kiểm kê ngoại tuyến &amp; chống xung đột.
            </span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Hệ thống chuyên dụng cho kho lưu trữ tài liệu kế toán, pháp lý và nhân sự trong mạng nội bộ LAN kết hợp máy quét mã vạch Mobile Companion với cơ chế khóa lạc quan (Optimistic Locking).
          </p>

          <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Mã Thùng Bất Biến</span>
              </div>
              <p className="text-[11px] text-slate-400">Chuẩn hóa ISO: Đơn Vị - Loại - Năm - Kho - STT</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                <Database className="w-4 h-4" />
                <span>Mobile Offline Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">Tự động phát hiện sai lệch phiên bản Version</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-4 relative z-10">
          <span>&copy; 2026 Archive Management System. All rights reserved.</span>
          <span className="font-mono">Security Level: Enterprise High</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-14 flex items-center justify-center bg-slate-900">
        <div className="max-w-md w-full space-y-7">
          <div>
            <div className="inline-block p-2 bg-slate-800 rounded-xl mb-3 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Hệ Thống</h2>
            <p className="text-xs text-slate-400 mt-1">
              Nhập tài khoản định danh mạng LAN để truy cập không gian quản lý kho hồ sơ.
            </p>
          </div>

          {/* Error Message Toast */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-600/60 text-rose-200 rounded-xl text-xs font-semibold flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên đăng nhập (Username) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input with Visibility Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu (Password) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium transition-all font-mono"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <span>Ghi nhớ phiên làm việc trên máy này</span>
              </label>
              <span className="text-[11px] text-slate-500 italic">Mạng nội bộ LAN</span>
            </div>

            {/* Submit Button with Loading Spinner */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực bảo mật...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Chọn Nhanh Tài Khoản Thử Nghiệm (One-Click Test):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-emerald-400">admin</div>
                <div className="text-[10px] text-slate-400">Quản trị viên (ADMIN)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager_hy', 'manager123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-blue-400">manager_hy</div>
                <div className="text-[10px] text-slate-400">Trưởng kho HY (MANAGER)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff_hung', 'staff123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-amber-400">staff_hung</div>
                <div className="text-[10px] text-slate-400">Thủ kho (STAFF)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('approver_kien', 'approver123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-purple-400">approver_kien</div>
                <div className="text-[10px] text-slate-400">Ban Giám Đốc (APPROVER)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer_lan', 'viewer123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-slate-300">viewer_lan</div>
                <div className="text-[10px] text-slate-400">Thanh tra (VIEWER)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
