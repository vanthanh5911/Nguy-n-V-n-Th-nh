import React, { useState } from 'react';
import {
  DestructionBatch,
  DestructionBatchStatus,
  Box,
  BoxStatus,
  User,
  Role
} from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  Flame,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  FileCheck2,
  Calendar,
  Eye,
  Info,
  Clock
} from 'lucide-react';

interface DestructionManagerProps {
  batches: DestructionBatch[];
  boxes: Box[];
  currentUser: User;
  onRefresh: () => void;
}

export const DestructionManager: React.FC<DestructionManagerProps> = ({
  batches,
  boxes,
  currentUser,
  onRefresh
}) => {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<'BATCHES' | 'CANDIDATES' | 'DESTROYED_ARCHIVE'>('BATCHES');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute eligible candidates based on retention policies
  // A box is expired if: !isPermanent && durationYears && (box.year + durationYears <= currentYear)
  const candidateBoxes = boxes.filter(box => {
    if (box.status === BoxStatus.DESTROYED) return false;
    const policy = box.docType?.retentionPolicy;
    if (!policy || policy.isPermanent || !policy.durationYears) return false;
    return box.year + policy.durationYears <= currentYear;
  });

  // All boxes that are DESTROYED (Historical Archive)
  const destroyedBoxes = boxes.filter(box => box.status === BoxStatus.DESTROYED);

  const handleOpenCreateModal = () => {
    setSelectedBoxIds([]);
    setBatchNote('');
    setErrorMessage(null);
    setShowCreateModal(true);
  };

  const handleToggleSelectBox = (box: Box) => {
    setErrorMessage(null);

    // Business check 1: Borrowed box CANNOT be selected!
    if (box.status === BoxStatus.BORROWED) {
      setErrorMessage(`VI PHẠM QUY TẮC: Thùng "${box.boxCode}" đang được mượn (BORROWED). Không được đưa vào lô tiêu hủy!`);
      return;
    }

    // Business check 2: Permanent box CANNOT be destroyed!
    if (box.docType?.retentionPolicy?.isPermanent) {
      setErrorMessage(`VI PHẠM BẢO QUẢN: Thùng "${box.boxCode}" có chính sách BẢO QUẢN VĨNH VIỄN. Hệ thống chặn hoàn toàn khỏi tiêu hủy!`);
      return;
    }

    if (selectedBoxIds.includes(box.id)) {
      setSelectedBoxIds(selectedBoxIds.filter(id => id !== box.id));
    } else {
      setSelectedBoxIds([...selectedBoxIds, box.id]);
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = archiveStore.createDestructionBatch({
      boxIds: selectedBoxIds,
      note: batchNote.trim() || undefined,
      currentUser
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Lỗi khi tạo lô tiêu hủy');
      return;
    }

    setShowCreateModal(false);
    onRefresh();
  };

  const handleApproveBatch = (batchId: string) => {
    const res = archiveStore.approveDestructionBatch(batchId, currentUser);
    if (!res.success) {
      alert(res.error || 'Lỗi khi duyệt lô tiêu hủy');
      return;
    }
    onRefresh();
  };

  const handleExecuteBatch = (batchId: string) => {
    if (!window.confirm('CẢNH BÁO: Thao tác xuất lệnh tiêu hủy vật lý sẽ chuyển toàn bộ thùng hồ sơ trong lô sang trạng thái DESTROYED và khóa vĩnh viễn mọi thao tác. Bạn có chắc chắn muốn thực hiện?')) {
      return;
    }

    const res = archiveStore.executeDestructionBatch(batchId, currentUser);
    if (!res.success) {
      alert(res.error || 'Lỗi khi thực thi lệnh tiêu hủy');
      return;
    }
    onRefresh();
  };

  const getBatchStatusBadge = (status: DestructionBatchStatus) => {
    switch (status) {
      case DestructionBatchStatus.DRAFT:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">DRAFT (Nháp)</span>;
      case DestructionBatchStatus.PENDING_APPROVE:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">PENDING_APPROVE (Chờ BGĐ Duyệt)</span>;
      case DestructionBatchStatus.APPROVED:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">APPROVED (Đã Phê Duyệt)</span>;
      case DestructionBatchStatus.EXECUTED:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-400">EXECUTED (Đã Hủy Vật Lý)</span>;
      case DestructionBatchStatus.REJECTED:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">REJECTED (Từ Chối)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert & Principles */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Hội Đồng Quản Lý Tiêu Hủy Chứng Từ Hết Hạn</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Tuân thủ Luật Lưu trữ &amp; Luật Kế toán: Đến hạn không tự động tiêu hủy. Hồ sơ ĐANG MƯỢN hoặc VĨNH VIỄN bị chặn tuyệt đối. Hồ sơ đã tiêu hủy (DESTROYED) vẫn lưu vết lịch sử trọn đời.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Lô Tiêu Hủy Mới</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('BATCHES')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'BATCHES'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Danh Sách Lô Tiêu Hủy ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('CANDIDATES')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'CANDIDATES'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Gợi Ý Hồ Sơ Đã Hết Hạn ({candidateBoxes.length})
        </button>

        <button
          onClick={() => setActiveTab('DESTROYED_ARCHIVE')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'DESTROYED_ARCHIVE'
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kho Tra Cứu Lịch Sử Đã Tiêu Hủy ({destroyedBoxes.length})
        </button>
      </div>

      {/* TAB 1: Batches List */}
      {activeTab === 'BATCHES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Lô Tiêu Hủy</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-center">Số Thùng</th>
                  <th className="p-3.5">Căn Cứ / Ghi Chú</th>
                  <th className="p-3.5">Tiến Trình Duyệt &amp; Hủy</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                      Chưa có lô tiêu hủy nào được tạo.
                    </td>
                  </tr>
                ) : (
                  batches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {batch.batchCode}
                      </td>
                      <td className="p-3.5">
                        {getBatchStatusBadge(batch.status)}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {batch.items.length}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">
                        {batch.note || '--'}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px] space-y-0.5">
                        <div>Tạo: {new Date(batch.createdAt).toLocaleDateString('vi-VN')}</div>
                        {batch.approvedAt && (
                          <div className="text-emerald-700 font-semibold">
                            &bull; BGĐ Duyệt: {new Date(batch.approvedAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                        {batch.executedAt && (
                          <div className="text-slate-800 font-mono">
                            &bull; Thực thi: {new Date(batch.executedAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {/* Approval button (BGĐ or ADMIN) */}
                        {(batch.status === DestructionBatchStatus.DRAFT ||
                          batch.status === DestructionBatchStatus.PENDING_APPROVE) && (
                          <button
                            onClick={() => handleApproveBatch(batch.id)}
                            className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded font-bold text-[11px]"
                            title="Phê duyệt lô tiêu hủy (Chỉ BGĐ hoặc Admin)"
                          >
                            Phê Duyệt Lô
                          </button>
                        )}

                        {/* Physical Execution button */}
                        {batch.status === DestructionBatchStatus.APPROVED && (
                          <button
                            onClick={() => handleExecuteBatch(batch.id)}
                            className="px-2.5 py-1 text-white bg-slate-900 hover:bg-slate-800 rounded font-bold text-[11px] flex items-center space-x-1 inline-flex"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>Xuất Lệnh Hủy</span>
                          </button>
                        )}

                        {batch.status === DestructionBatchStatus.EXECUTED && (
                          <span className="text-[11px] font-semibold text-slate-500 italic">
                            Đã hoàn tất lưu kho
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Expiration Candidate Suggestions */}
      {activeTab === 'CANDIDATES' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <strong>Thuật toán rà soát thời hạn bảo quản: </strong>
              Hệ thống lọc các thùng có Năm tài liệu + Thời hạn bảo quản &le; Năm hiện tại ({currentYear}).
              Lưu ý quy tắc bất biến: Đến hạn KHÔNG tự động hủy, cần lập hội đồng thông qua. Các thùng ĐANG MƯỢN bị loại trừ.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Thùng</th>
                  <th className="p-3.5">Loại Hồ Sơ</th>
                  <th className="p-3.5">Năm</th>
                  <th className="p-3.5">Chính Sách Bảo Quản</th>
                  <th className="p-3.5">Trạng Thái Kho</th>
                  <th className="p-3.5">Vị Trí Kệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateBoxes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                      Hiện tại không có thùng hồ sơ nào quá hạn bảo quản.
                    </td>
                  </tr>
                ) : (
                  candidateBoxes.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{b.boxCode}</td>
                      <td className="p-3.5 font-medium text-slate-800">{b.docType?.name}</td>
                      <td className="p-3.5 font-bold text-slate-900">{b.year}</td>
                      <td className="p-3.5 text-slate-700">
                        {b.docType?.retentionPolicy?.durationYears} năm ({b.docType?.retentionPolicy?.name})
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          b.status === BoxStatus.BORROWED ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-blue-600">{b.locationShelf || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Destroyed Historical Archive */}
      {activeTab === 'DESTROYED_ARCHIVE' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 flex items-start space-x-2">
            <Lock className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <div>
              <strong>Quy tắc lưu trữ lịch sử: </strong>
              Hồ sơ ở trạng thái DESTROYED không bao giờ bị xóa cứng khỏi cơ sở dữ liệu. Toàn bộ thông tin, timeline và biên bản tiêu hủy được lưu giữ vĩnh viễn để phục vụ thanh tra, kiểm toán. Toàn bộ nghiệp vụ mượn, chuyển, xuất kho đều bị khóa.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Thùng</th>
                  <th className="p-3.5">Loại Hồ Sơ</th>
                  <th className="p-3.5">Năm Chứng Từ</th>
                  <th className="p-3.5">Trạng Thái Lưu Trữ</th>
                  <th className="p-3.5">Thời Điểm Hủy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destroyedBoxes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 italic">
                      Chưa có hồ sơ nào đã tiêu hủy trong kho lịch sử.
                    </td>
                  </tr>
                ) : (
                  destroyedBoxes.map(b => (
                    <tr key={b.id} className="bg-slate-50/50 hover:bg-slate-100/50">
                      <td className="p-3.5 font-mono font-bold text-slate-700 line-through">
                        {b.boxCode}
                      </td>
                      <td className="p-3.5 text-slate-600">{b.docType?.name}</td>
                      <td className="p-3.5 text-slate-600">{b.year}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          ĐÃ TIÊU HỦY (LƯU LỊCH SỬ)
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(b.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Destruction Batch */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Lập Lô Tiêu Hủy Chứng Từ Mới</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start space-x-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Căn cứ pháp lý / Ghi chú đề xuất tiêu hủy *
                </label>
                <input
                  type="text"
                  placeholder="VD: Căn cứ Điều 41 Luật Kế toán 88/2015/QH13 và Biên bản họp hội đồng"
                  value={batchNote}
                  onChange={e => setBatchNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Chọn các thùng đưa vào lô tiêu hủy ({selectedBoxIds.length} đã chọn)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Chặn tự động: Đang mượn, Bảo quản vĩnh viễn
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {boxes
                    .filter(b => b.status !== BoxStatus.DESTROYED)
                    .map(box => {
                      const isSelected = selectedBoxIds.includes(box.id);
                      const isBorrowed = box.status === BoxStatus.BORROWED;
                      const isPerm = box.docType?.retentionPolicy?.isPermanent;

                      return (
                        <div
                          key={box.id}
                          onClick={() => handleToggleSelectBox(box)}
                          className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isBorrowed || isPerm
                              ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-50/70 border-l-4 border-amber-500'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isBorrowed || isPerm}
                              onChange={() => {}}
                              className="w-4 h-4 text-amber-600 rounded"
                            />
                            <div>
                              <div className="flex items-center space-x-2 font-mono">
                                <span className="font-bold text-slate-900">{box.boxCode}</span>
                                <span className="text-[11px] text-slate-500">Năm {box.year}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {box.docType?.name} &bull; Lưu: {isPerm ? 'VĨNH VIỄN' : `${box.docType?.retentionPolicy?.durationYears || 10} năm`}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isBorrowed && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                ĐANG MƯỢN (CHẶN HỦY)
                              </span>
                            )}
                            {isPerm && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                                VĨNH VIỄN (CHẶN HỦY)
                              </span>
                            )}
                            {!isBorrowed && !isPerm && (
                              <span className="text-[11px] font-mono text-slate-500">
                                {box.locationShelf || 'Chưa kệ'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={selectedBoxIds.length === 0}
                  className="px-6 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Tạo Dự Thảo Lô Tiêu Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
