import React, { useState } from 'react';
import { User, Role } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  KeyRound,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface ChangePasswordModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  onClose,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có độ dài từ 8 ký tự trở lên.');
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMessage('Mật khẩu mới phải bao gồm cả chữ cái và số.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    const res = archiveStore.changePassword(currentUser.id, currentPassword, newPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Đổi mật khẩu thất bại.');
      return;
    }

    alert('Đổi mật khẩu thành công!');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Đổi Mật Khẩu Cá Nhân</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Mật khẩu hiện tại *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Mật khẩu mới (Tối thiểu 8 ký tự, gồm chữ và số) *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Xác nhận mật khẩu mới *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 flex items-center space-x-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
            </button>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Cập Nhật Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AdminResetPasswordModalProps {
  targetUser: User;
  adminUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  targetUser,
  adminUser,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateRandom = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }

    const res = archiveStore.adminResetPassword(targetUser.id, newPassword, adminUser);
    if (!res.success) {
      setErrorMessage(res.error || 'Lỗi khi reset mật khẩu.');
      return;
    }

    alert(`Đã đặt lại mật khẩu thành công cho tài khoản "${targetUser.username}"! Mật khẩu mới: ${newPassword}`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Admin Đặt Lại Mật Khẩu (Reset)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReset} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <span className="font-bold block">Tài khoản được đặt lại: {targetUser.fullName} (@{targetUser.username})</span>
            <span className="text-[11px] block mt-0.5">
              Đặc quyền Admin: Không cần nhập mật khẩu cũ của người dùng. Hệ thống sẽ ghi nhận Audit Log.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 uppercase">
                Mật khẩu mới *
              </label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Tạo mật khẩu ngẫu nhiên</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Nhập mật khẩu mới hoặc bấm tạo ngẫu nhiên..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-sm font-bold focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
            >
              Xác Nhận Đặt Lại Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
