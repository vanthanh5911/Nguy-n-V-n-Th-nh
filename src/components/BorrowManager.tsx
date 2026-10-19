import React, { useState } from 'react';
import {
  BorrowRecord,
  BorrowStatus,
  Box,
  BoxStatus,
  User
} from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  User as UserIcon,
  RotateCcw,
  Search
} from 'lucide-react';

interface BorrowManagerProps {
  borrowRecords: BorrowRecord[];
  boxes: Box[];
  currentUser: User;
  onRefresh: () => void;
}

export const BorrowManager: React.FC<BorrowManagerProps> = ({
  borrowRecords,
  boxes,
  currentUser,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Create Borrow Modal
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowBoxId, setBorrowBoxId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerDept, setBorrowerDept] = useState('');
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [borrowError, setBorrowError] = useState<string | null>(null);

  // Return Modal
  const [returningRecord, setReturningRecord] = useState<BorrowRecord | null>(null);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnCondition, setReturnCondition] = useState('Nguyên vẹn, đầy đủ tem niêm phong và chứng từ');

  const filteredRecords = borrowRecords.filter(r => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const bCode = r.box?.boxCode?.toLowerCase() || '';
      const bName = r.borrowerName.toLowerCase();
      const bDept = r.borrowerDepartment.toLowerCase();
      if (!bCode.includes(kw) && !bName.includes(kw) && !bDept.includes(kw)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenBorrowModal = () => {
    const available = boxes.find(b => b.status === BoxStatus.IN_STOCK);
    setBorrowBoxId(available?.id || '');
    setBorrowerName('');
    setBorrowerDept('');
    // Default expected return: 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setExpectedReturnDate(d.toISOString().slice(0, 10));
    setBorrowError(null);
    setShowBorrowModal(true);
  };

  const handleCreateBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    setBorrowError(null);

    if (!borrowBoxId) {
      setBorrowError('Vui lòng chọn thùng hồ sơ cần mượn.');
      return;
    }

    const res = archiveStore.borrowBox({
      boxId: borrowBoxId,
      borrowerName: borrowerName.trim(),
      borrowerDepartment: borrowerDept.trim(),
      borrowDate: new Date(borrowDate).toISOString(),
      expectedReturnDate: new Date(expectedReturnDate).toISOString(),
      currentUser
    });

    if (!res.success) {
      setBorrowError(res.error || 'Lỗi khi tạo phiếu mượn');
      return;
    }

    setShowBorrowModal(false);
    onRefresh();
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningRecord) return;

    const res = archiveStore.returnBox({
      recordId: returningRecord.id,
      actualReturnDate: new Date(actualReturnDate).toISOString(),
      returnCondition: returnCondition.trim(),
      currentUser
    });

    if (!res.success) {
      alert(res.error || 'Lỗi khi xác nhận trả');
      return;
    }

    setReturningRecord(null);
    onRefresh();
  };

  const overdueCount = borrowRecords.filter(r => r.status === BorrowStatus.OVERDUE).length;
  const activeCount = borrowRecords.filter(r => r.status === BorrowStatus.BORROWED).length;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Đang Mượn Sử Dụng</span>
            <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">{activeCount}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-700 font-bold block uppercase flex items-center space-x-1">
              <span>Cảnh Báo Quá Hạn Trả</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono mt-0.5 block">{overdueCount}</span>
          </div>
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Tổng Lượt Mượn Lưu Trữ</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{borrowRecords.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã thùng, người mượn..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-60"
            />
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus(BorrowStatus.OVERDUE)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                filterStatus === BorrowStatus.OVERDUE
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Quá hạn ({overdueCount})
            </button>
            <button
              onClick={() => setFilterStatus(BorrowStatus.BORROWED)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filterStatus === BorrowStatus.BORROWED
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              Đang mượn ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus(BorrowStatus.RETURNED)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filterStatus === BorrowStatus.RETURNED
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đã trả
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenBorrowModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Mượn Hồ Sơ</span>
        </button>
      </div>

      {/* Table of Borrow Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Thùng / Chứng Từ</th>
                <th className="p-3.5">Người Mượn &amp; Phòng Ban</th>
                <th className="p-3.5">Ngày Mượn</th>
                <th className="p-3.5">Hạn Trả Dự Kiến</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5">Thực Tế Trả / Tình Trạng</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                    Không tìm thấy bản ghi mượn trả nào.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const box = boxes.find(b => b.id === record.boxId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {box?.boxCode || record.boxId}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{record.borrowerName}</div>
                        <div className="text-[11px] text-slate-500">{record.borrowerDepartment}</div>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {new Date(record.borrowDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={record.status === BorrowStatus.OVERDUE ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {new Date(record.expectedReturnDate).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {record.status === BorrowStatus.OVERDUE ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                            QUÁ HẠN TRẢ
                          </span>
                        ) : record.status === BorrowStatus.BORROWED ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ĐANG MƯỢN
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ĐÃ HOÀN TRẢ
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px] max-w-xs truncate">
                        {record.actualReturnDate ? (
                          <div>
                            <span>Trả ngày: {new Date(record.actualReturnDate).toLocaleDateString('vi-VN')}</span>
                            <div className="italic text-slate-500">{record.returnCondition || 'Đầy đủ'}</div>
                          </div>
                        ) : (
                          'Chưa hoàn trả'
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {record.status !== BorrowStatus.RETURNED && (
                          <button
                            onClick={() => {
                              setReturningRecord(record);
                              setActualReturnDate(new Date().toISOString().slice(0, 10));
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                          >
                            Xác Nhận Trả
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Borrow */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base">Lập Phiếu Mượn Thùng / Hồ Sơ</h3>
              <button onClick={() => setShowBorrowModal(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBorrow} className="p-6 space-y-4 text-xs">
              {borrowError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{borrowError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Chọn thùng hồ sơ mượn *
                </label>
                <select
                  value={borrowBoxId}
                  onChange={e => setBorrowBoxId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                  required
                >
                  <option value="">-- Chọn thùng hồ sơ trong kho --</option>
                  {boxes
                    .filter(b => b.status === BoxStatus.IN_STOCK)
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.boxCode} ({b.docType?.name} - Năm {b.year}) [Kệ: {b.locationShelf || 'Chưa kệ'}]
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Chỉ các thùng ở trạng thái IN_STOCK mới được phép mượn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Họ và tên người mượn *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Trần Văn Nam"
                    value={borrowerName}
                    onChange={e => setBorrowerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Phòng ban / Đơn vị mượn *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Ban Pháp chế &amp; Kế hoạch"
                    value={borrowerDept}
                    onChange={e => setBorrowerDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Ngày mượn *
                  </label>
                  <input
                    type="date"
                    value={borrowDate}
                    onChange={e => setBorrowDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Hạn hẹn trả hồ sơ *
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={e => setExpectedReturnDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Xác Nhận Xuất Mượn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Return */}
      {returningRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base">Xác Nhận Hoàn Trả Hồ Sơ Vào Kho</h3>
              <button onClick={() => setReturningRecord(null)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {returningRecord.box?.boxCode}
                </div>
                <div className="text-slate-600 mt-1">
                  Người mượn: <strong>{returningRecord.borrowerName}</strong> ({returningRecord.borrowerDepartment})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Ngày hoàn trả thực tế *
                </label>
                <input
                  type="date"
                  value={actualReturnDate}
                  onChange={e => setActualReturnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Tình trạng kiểm tra hồ sơ khi hoàn trả *
                </label>
                <textarea
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReturningRecord(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Nhận Lại Vào Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
