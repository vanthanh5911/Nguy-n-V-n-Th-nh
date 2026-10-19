import React, { useState } from 'react';
import { Box, BoxStatus, User } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface RetentionExpiryAlertProps {
  boxes: Box[];
  currentUser: User;
  onUpdate: () => void;
  onNavigateToDestruction?: () => void;
  onQuickFilterChange?: (filter: 'ALL' | 'EXPIRED' | 'NEARING') => void;
  activeQuickFilter?: 'ALL' | 'EXPIRED' | 'NEARING';
}

export const RetentionExpiryAlert: React.FC<RetentionExpiryAlertProps> = ({
  boxes,
  currentUser,
  onUpdate,
  onNavigateToDestruction,
  onQuickFilterChange,
  activeQuickFilter = 'ALL'
}) => {
  const currentYear = new Date().getFullYear();
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'EXPIRED' | 'NEARING' | 'ALL_FLAGGED'>('EXPIRED');

  // Compute analytics for all non-destroyed boxes
  const activeBoxes = boxes.filter(b => b.status !== BoxStatus.DESTROYED);

  // 1. Boxes whose (current year - year stored) >= durationYears
  const expiredBoxes = activeBoxes.filter(box => {
    if (box.status === BoxStatus.PENDING_DESTROY) return false;
    const policy = box.docType?.retentionPolicy;
    if (!policy || policy.isPermanent || !policy.durationYears) return false;
    const yearsStored = currentYear - box.year;
    return yearsStored >= policy.durationYears;
  });

  // 2. Boxes nearing expiration (expiring in 1 year: currentYear - box.year === durationYears - 1)
  const nearingExpiryBoxes = activeBoxes.filter(box => {
    if (box.status === BoxStatus.PENDING_DESTROY) return false;
    const policy = box.docType?.retentionPolicy;
    if (!policy || policy.isPermanent || !policy.durationYears) return false;
    const yearsStored = currentYear - box.year;
    return yearsStored === policy.durationYears - 1;
  });

  // 3. Permanent boxes
  const permanentBoxes = activeBoxes.filter(box => box.docType?.retentionPolicy?.isPermanent);

  // 4. In-retention safe boxes
  const safeRetentionBoxes = activeBoxes.filter(box => {
    if (box.docType?.retentionPolicy?.isPermanent) return true;
    const policy = box.docType?.retentionPolicy;
    if (!policy?.durationYears) return true;
    const yearsStored = currentYear - box.year;
    return yearsStored < policy.durationYears - 1;
  });

  // Map enriched details
  const mapBoxDetail = (box: Box) => {
    const policy = box.docType?.retentionPolicy;
    const yearsStored = currentYear - box.year;
    const durationYears = policy?.durationYears || 0;
    const yearsExceeded = yearsStored - durationYears;
    const expiryYear = box.year + durationYears;
    const isBorrowed = box.status === BoxStatus.BORROWED;
    const isExpired = yearsStored >= durationYears;
    const isNearing = yearsStored === durationYears - 1;

    return {
      box,
      yearsStored,
      durationYears,
      yearsExceeded,
      expiryYear,
      policyName: policy?.name || '',
      isBorrowed,
      isExpired,
      isNearing
    };
  };

  const displayedItems = (
    viewMode === 'EXPIRED'
      ? expiredBoxes.map(mapBoxDetail)
      : viewMode === 'NEARING'
      ? nearingExpiryBoxes.map(mapBoxDetail)
      : [...expiredBoxes, ...nearingExpiryBoxes].map(mapBoxDetail)
  ).sort((a, b) => b.yearsExceeded - a.yearsExceeded);

  // Actionable items (only expired & not borrowed)
  const actionableExpired = displayedItems.filter(item => item.isExpired && !item.isBorrowed);
  const isAllActionableSelected =
    actionableExpired.length > 0 && selectedBoxIds.length === actionableExpired.length;

  const handleToggleSelectAll = () => {
    if (isAllActionableSelected) {
      setSelectedBoxIds([]);
    } else {
      setSelectedBoxIds(actionableExpired.map(item => item.box.id));
    }
  };

  const handleToggleSelectBox = (boxId: string, isBorrowed: boolean, isExpired: boolean) => {
    if (isBorrowed || !isExpired) return;
    if (selectedBoxIds.includes(boxId)) {
      setSelectedBoxIds(selectedBoxIds.filter(id => id !== boxId));
    } else {
      setSelectedBoxIds([...selectedBoxIds, boxId]);
    }
  };

  // Bulk update to PENDING_DESTROY
  const handleBulkMarkPendingDestruction = () => {
    setActionMessage(null);
    const targetIds = selectedBoxIds.length > 0
      ? selectedBoxIds
      : actionableExpired.map(item => item.box.id);

    if (targetIds.length === 0) {
      setActionMessage({
        type: 'error',
        text: 'Vui lòng chọn ít nhất 1 thùng hồ sơ đã hết hạn để chuyển sang Chờ Hủy.'
      });
      return;
    }

    const res = archiveStore.markBoxesPendingDestroy(targetIds, currentUser);
    setSelectedBoxIds([]);
    setActionMessage({
      type: 'success',
      text: `Đã cập nhật thành công ${res.count} thùng hồ sơ sang trạng thái 'CHỜ HỦY' (PENDING_DESTROY).`
    });
    onUpdate();
  };

  // Individual update
  const handleMarkSingleBox = (boxId: string, boxCode: string) => {
    setActionMessage(null);
    const res = archiveStore.markBoxPendingDestroy(boxId, currentUser);
    if (!res.success) {
      setActionMessage({ type: 'error', text: res.error || 'Lỗi khi cập nhật trạng thái' });
    } else {
      setSelectedBoxIds(prev => prev.filter(id => id !== boxId));
      setActionMessage({
        type: 'success',
        text: `Đã chuyển thùng "${boxCode}" sang trạng thái 'CHỜ HỦY' (PENDING_DESTROY).`
      });
      onUpdate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-orange-300 shadow-sm overflow-hidden space-y-0">
      {/* 1. Summary Header Card Grid (Displays count of boxes nearing expiration and expired) */}
      <div className="p-5 bg-gradient-to-r from-orange-50 via-amber-50/50 to-white border-b border-orange-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-md shadow-orange-600/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-slate-900 text-base">
                  Cảnh Báo Hết Hạn &amp; Sắp Đến Hạn Bảo Quản
                </h3>
                <span className="text-[11px] font-mono font-bold bg-orange-100 text-orange-950 px-2 py-0.5 rounded border border-orange-200">
                  Năm Hiện Tại: {currentYear}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Công thức: <code className="font-mono font-bold text-orange-900">Số năm lưu = {currentYear} - Năm lưu trữ</code> so sánh với <code className="font-mono font-bold text-orange-900">durationYears</code> trong RetentionPolicy.
              </p>
            </div>
          </div>

          {/* Quick Filter Toggle Button for Main List */}
          {onQuickFilterChange && (
            <div className="flex items-center space-x-2 bg-white/90 p-1.5 rounded-xl border border-orange-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-600 px-2 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-orange-600" />
                Lọc Nhanh Bảng Chính:
              </span>
              <button
                onClick={() => onQuickFilterChange(activeQuickFilter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeQuickFilter === 'EXPIRED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Hết Hạn ({expiredBoxes.length})
              </button>
              <button
                onClick={() => onQuickFilterChange(activeQuickFilter === 'NEARING' ? 'ALL' : 'NEARING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeQuickFilter === 'NEARING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Sắp Đến Hạn ({nearingExpiryBoxes.length})
              </button>
              {activeQuickFilter !== 'ALL' && (
                <button
                  onClick={() => onQuickFilterChange('ALL')}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                >
                  Xóa Lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Analytics KPI Mini-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Expired count */}
          <div
            onClick={() => setViewMode('EXPIRED')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              viewMode === 'EXPIRED'
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-white hover:bg-rose-50/50 border-rose-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase ${viewMode === 'EXPIRED' ? 'text-rose-100' : 'text-rose-700'}`}>
                Đã Hết Hạn Bảo Quản
              </span>
              <Flame className={`w-4 h-4 ${viewMode === 'EXPIRED' ? 'text-rose-200' : 'text-rose-600'}`} />
            </div>
            <span className="text-2xl font-black font-mono block mt-1">
              {expiredBoxes.length} thùng
            </span>
            <span className={`text-[10px] block mt-0.5 ${viewMode === 'EXPIRED' ? 'text-rose-100' : 'text-slate-500'}`}>
              (Lưu trữ &ge; thời hạn quy định)
            </span>
          </div>

          {/* Nearing Expiration count (Prompt requirement) */}
          <div
            onClick={() => setViewMode('NEARING')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              viewMode === 'NEARING'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white hover:bg-amber-50/50 border-amber-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase ${viewMode === 'NEARING' ? 'text-amber-100' : 'text-amber-800'}`}>
                Sắp Đến Hạn Bảo Quản
              </span>
              <Clock className={`w-4 h-4 ${viewMode === 'NEARING' ? 'text-amber-200' : 'text-amber-600'}`} />
            </div>
            <span className="text-2xl font-black font-mono block mt-1">
              {nearingExpiryBoxes.length} thùng
            </span>
            <span className={`text-[10px] block mt-0.5 ${viewMode === 'NEARING' ? 'text-amber-100' : 'text-slate-500'}`}>
              (Còn 1 năm &rarr; Đến hạn năm {currentYear + 1})
            </span>
          </div>

          {/* Safe In-Retention count */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-700">
                Trong Hạn Bảo Quản
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black font-mono block mt-1 text-emerald-700">
              {safeRetentionBoxes.length} thùng
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Hồ sơ lưu trữ bình thường
            </span>
          </div>

          {/* Permanent retention count */}
          <div className="p-3 bg-white rounded-xl border border-purple-200 text-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-purple-700">
                Bảo Quản Vĩnh Viễn
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-black font-mono block mt-1 text-purple-700">
              {permanentBoxes.length} thùng
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Tuyệt đối không tiêu hủy
            </span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Tab Toolbar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Hiển thị danh sách:</span>
          <button
            onClick={() => setViewMode('EXPIRED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'EXPIRED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đã Hết Hạn ({expiredBoxes.length})
          </button>
          <button
            onClick={() => setViewMode('NEARING')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'NEARING'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Sắp Đến Hạn ({nearingExpiryBoxes.length})
          </button>
          <button
            onClick={() => setViewMode('ALL_FLAGGED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'ALL_FLAGGED'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất Cả Cảnh Báo ({expiredBoxes.length + nearingExpiryBoxes.length})
          </button>
        </div>

        {/* Bulk Action: 'Mark as Pending Destruction' Button */}
        {actionableExpired.length > 0 && (
          <button
            onClick={handleBulkMarkPendingDestruction}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            title="Bulk-updates status to PENDING_DESTROY for selected or all eligible boxes"
          >
            <Flame className="w-4 h-4 text-amber-200" />
            <span>
              Mark as Pending Destruction ({selectedBoxIds.length > 0 ? `${selectedBoxIds.length} đã chọn` : `Tất cả ${actionableExpired.length}`})
            </span>
          </button>
        )}
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className={`p-3 text-xs font-semibold flex items-center justify-between border-b ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-2 text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Table / List View */}
      {displayedItems.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-50/50">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h4 className="font-bold text-slate-800 text-sm">Không Có Thùng Nào Trong Mục Này</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Toàn bộ hồ sơ đang an toàn trong hạn bảo quản hoặc không có cảnh báo tương ứng.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="p-1 hover:text-slate-900"
                    title={isAllActionableSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả thùng hợp lệ'}
                  >
                    {isAllActionableSelected ? (
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3">Mã Thùng Bất Biến</th>
                <th className="p-3">Loại Hồ Sơ &amp; Kho</th>
                <th className="p-3">Năm Lưu Trữ</th>
                <th className="p-3">Thời Hạn Bảo Quản</th>
                <th className="p-3">Số Năm Đã Lưu Trữ</th>
                <th className="p-3">Vị Trí Giá Kệ</th>
                <th className="p-3">Trạng Thái Hạn</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedItems.map(item => {
                const { box, yearsStored, durationYears, yearsExceeded, expiryYear, isBorrowed, isExpired, isNearing } = item;
                const isSelected = selectedBoxIds.includes(box.id);

                return (
                  <tr
                    key={box.id}
                    className={`transition-colors ${
                      isBorrowed
                        ? 'bg-amber-50/50'
                        : isSelected
                        ? 'bg-orange-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isBorrowed || !isExpired}
                        onChange={() => handleToggleSelectBox(box.id, isBorrowed, isExpired)}
                        className="w-4 h-4 text-orange-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>

                    {/* Box Code */}
                    <td className="p-3">
                      <span className="font-mono font-black text-slate-900 text-xs block">
                        {box.boxCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ver: v{box.version}
                      </span>
                    </td>

                    {/* Doc Type & Unit */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{box.docType?.name}</div>
                      <div className="text-[11px] text-slate-500">{box.unit?.name} ({box.warehouse?.name})</div>
                    </td>

                    {/* Year Stored */}
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {box.year}
                    </td>

                    {/* Policy Duration */}
                    <td className="p-3 font-mono">
                      <span className="font-bold text-slate-800">{durationYears} năm</span>
                      <div className="text-[10px] text-slate-500 font-sans">{item.policyName}</div>
                    </td>

                    {/* Calculation breakdown: (current year - year stored) */}
                    <td className="p-3 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          isExpired ? 'text-rose-700 bg-rose-100' : 'text-amber-800 bg-amber-100'
                        }`}>
                          {yearsStored} năm
                        </span>
                        <span className="text-[10px] font-sans text-slate-500">
                          ({currentYear} - {box.year})
                        </span>
                      </div>
                      <div className="text-[10px] font-sans mt-0.5">
                        {isExpired ? (
                          <span className="text-rose-600 font-bold">
                            {yearsExceeded === 0 ? 'Đúng hạn năm nay' : `Vượt hạn ${yearsExceeded} năm`}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            Còn 1 năm nữa
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location Shelf */}
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {box.locationShelf || <span className="text-slate-400 font-normal italic">Chưa kệ</span>}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      {isBorrowed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ĐANG MƯỢN (CHẶN HỦY)
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          ĐÃ HẾT HẠN ({expiryYear})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          SẮP ĐẾN HẠN ({expiryYear})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      {isExpired ? (
                        <button
                          onClick={() => handleMarkSingleBox(box.id, box.boxCode)}
                          disabled={isBorrowed}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            isBorrowed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                          title={isBorrowed ? 'Thùng đang được mượn, không được chuyển Chờ Hủy' : 'Chuyển sang trạng thái PENDING_DESTROY'}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Chuyển 'CHỜ HỦY'</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold italic">
                          Chưa đến hạn hủy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info Notice & Navigation */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            Quy tắc nghiệp vụ: Thùng sau khi chuyển sang <strong>CHỜ HỦY (PENDING_DESTROY)</strong> sẽ được đưa vào module Tiêu Hủy để Hội đồng thẩm định và phê duyệt trước khi xuất lệnh tiêu hủy vật lý.
          </span>
        </div>

        {onNavigateToDestruction && (
          <button
            onClick={onNavigateToDestruction}
            className="text-orange-700 hover:text-orange-800 font-bold flex items-center space-x-1 text-xs"
          >
            <span>Đến Quản Lý Hội Đồng Tiêu Hủy</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
