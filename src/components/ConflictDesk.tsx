import React, { useState } from 'react';
import { SyncConflictRecord, User, Role } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Server,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ConflictDeskProps {
  conflicts: SyncConflictRecord[];
  currentUser: User;
  onRefresh: () => void;
}

export const ConflictDesk: React.FC<ConflictDeskProps> = ({
  conflicts,
  currentUser,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'RESOLVED_OVERRIDE' | 'DISCARDED'>('PENDING_REVIEW');
  const [selectedConflict, setSelectedConflict] = useState<SyncConflictRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredConflicts = conflicts.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const handleResolve = (conflictId: string, action: 'RESOLVE_OVERRIDE' | 'DISCARD') => {
    setActionError(null);
    if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.WAREHOUSE_MANAGER) {
      setActionError('Chỉ Quản trị viên (ADMIN) hoặc Quản lý kho mới có thẩm quyền đối soát xử lý xung đột.');
      return;
    }

    const res = archiveStore.resolveConflict(conflictId, action, currentUser);
    if (!res.success) {
      setActionError(res.error || 'Lỗi khi xử lý xung đột');
      return;
    }

    onRefresh();
    if (selectedConflict?.id === conflictId) {
      setSelectedConflict(null);
    }
  };

  const pendingCount = conflicts.filter(c => c.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start space-x-4">
        <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-amber-900 text-base flex items-center space-x-2">
            <span>Bàn Đối Soát Xung Đột Dữ Liệu Ngoại Tuyến (Optimistic Locking)</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                {pendingCount} Cần Xử Lý
              </span>
            )}
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Quy tắc nghiệp vụ: Server luôn là Nguồn chân lý duy nhất (Single Source of Truth). Khi thiết bị Mobile đẩy lên dữ liệu có phiên bản cũ hơn Server (do mất mạng hoặc có nhân sự khác thao tác trước), hệ thống KHÔNG TỰ ĐỘNG GHI ĐÈ mà đưa vào bàn đối soát này để Quản trị viên kiểm tra và quyết định.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('PENDING_REVIEW')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'PENDING_REVIEW'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Chờ Đối Soát ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('RESOLVED_OVERRIDE')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'RESOLVED_OVERRIDE'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã Chấp Nhận Ghi Đè ({conflicts.filter(c => c.status === 'RESOLVED_OVERRIDE').length})
        </button>
        <button
          onClick={() => setFilter('DISCARDED')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'DISCARDED'
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã Hủy Bỏ ({conflicts.filter(c => c.status === 'DISCARDED').length})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({conflicts.length})
        </button>
      </div>

      {/* Conflict List */}
      {filteredConflicts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h4 className="font-semibold text-slate-800 text-sm">Không Có Bản Ghi Xung Đột</h4>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu giữa các thiết bị di động Mobile và Máy chủ LAN đang hoàn toàn đồng bộ và nhất quán.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                item.status === 'PENDING_REVIEW'
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Conflict Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900 text-base">{item.boxCode}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    ID: {item.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    item.status === 'PENDING_REVIEW'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : item.status === 'RESOLVED_OVERRIDE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status === 'PENDING_REVIEW' ? 'CẦN ĐỐI SOÁT TAY' : item.status === 'RESOLVED_OVERRIDE' ? 'ĐÃ PHÊ DUYỆT GHI ĐÈ' : 'ĐÃ HỦY BỎ'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Smartphone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Thiết bị: <strong className="ml-1 text-slate-700">{item.deviceCode}</strong>
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Conflict Explanation Message */}
              <div className="my-3 p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lý do phát hiện xung đột: </span>
                  <span>{item.conflictReason}</span>
                </div>
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Server State */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center">
                      <Server className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Dữ Liệu Hiện Tại Trên Máy Chủ (Server)
                    </span>
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Server Version: v{item.currentServerVersion}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vị trí giá/kệ:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.currentServerData?.locationShelf || 'Chưa xếp kệ'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className="font-semibold text-slate-900">{item.currentServerData?.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời gian cập nhật:</span>
                      <span className="text-slate-700">
                        {item.currentServerData?.updatedAt ? new Date(item.currentServerData.updatedAt).toLocaleString('vi-VN') : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Offline Attempt */}
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center">
                      <Smartphone className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                      Thao Tác Từ Thiết Bị Mobile (Offline)
                    </span>
                    <span className="font-mono text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      Mobile Expected: v{item.expectedVersion}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vị trí giá/kệ quét được:</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                        {item.attemptedPayload?.locationShelf || 'Không đổi'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trạng thái gửi lên:</span>
                      <span className="font-semibold text-slate-900">{item.attemptedPayload?.status || 'Không đổi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ghi chú thao tác:</span>
                      <span className="italic text-slate-700">{item.attemptedPayload?.note || 'Không có ghi chú'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (For Pending items) */}
              {item.status === 'PENDING_REVIEW' && (
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleResolve(item.id, 'DISCARD')}
                    className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span>Hủy Bỏ Thao Tác Mobile (Giữ Server)</span>
                  </button>
                  <button
                    onClick={() => handleResolve(item.id, 'RESOLVE_OVERRIDE')}
                    className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Phê Duyệt Ghi Đè Dữ Liệu Mobile (Admin Override)</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
