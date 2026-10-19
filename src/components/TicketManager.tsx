import React, { useState } from 'react';
import {
  InventoryTicket,
  TicketType,
  TicketStatus,
  Box,
  BoxStatus,
  User,
  Role
} from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface TicketManagerProps {
  tickets: InventoryTicket[];
  boxes: Box[];
  currentUser: User;
  onRefresh: () => void;
}

export const TicketManager: React.FC<TicketManagerProps> = ({
  tickets,
  boxes,
  currentUser,
  onRefresh
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<InventoryTicket | null>(null);

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.TRANSFER);
  const [ticketNote, setTicketNote] = useState('');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [shelfTargetMap, setShelfTargetMap] = useState<{ [boxId: string]: string }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Void Prompt State
  const [voidTicketId, setVoidTicketId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const handleOpenCreateModal = () => {
    setSelectedBoxIds([]);
    setShelfTargetMap({});
    setTicketNote('');
    setErrorMsg(null);
    setShowCreateModal(true);
  };

  const handleToggleBoxSelect = (boxId: string) => {
    if (selectedBoxIds.includes(boxId)) {
      setSelectedBoxIds(selectedBoxIds.filter(id => id !== boxId));
    } else {
      setSelectedBoxIds([...selectedBoxIds, boxId]);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedBoxIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 thùng hồ sơ.');
      return;
    }

    const details = selectedBoxIds.map(boxId => {
      const box = boxes.find(b => b.id === boxId);
      return {
        boxId,
        fromShelf: box?.locationShelf || undefined,
        toShelf: shelfTargetMap[boxId]?.trim() || undefined
      };
    });

    const res = archiveStore.createInventoryTicket({
      type: ticketType,
      note: ticketNote.trim() || undefined,
      details,
      currentUser
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Có lỗi khi tạo phiếu');
      return;
    }

    setShowCreateModal(false);
    onRefresh();
  };

  const handleConfirmTicket = (ticketId: string) => {
    const res = archiveStore.confirmInventoryTicket(ticketId, currentUser);
    if (!res.success) {
      alert(res.error || 'Lỗi khi duyệt phiếu');
      return;
    }
    onRefresh();
    if (selectedTicket?.id === ticketId) {
      const updated = archiveStore.getState().inventoryTickets.find(t => t.id === ticketId);
      setSelectedTicket(updated || null);
    }
  };

  const handleVoidTicket = () => {
    if (!voidTicketId || !voidReason.trim()) return;
    const res = archiveStore.voidInventoryTicket(voidTicketId, currentUser, voidReason.trim());
    if (!res.success) {
      alert(res.error || 'Lỗi khi hủy phiếu');
      return;
    }
    setVoidTicketId(null);
    setVoidReason('');
    onRefresh();
  };

  const getTypeLabel = (type: TicketType) => {
    switch (type) {
      case TicketType.IMPORT:
        return { label: 'Nhập Kho (IMPORT)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case TicketType.EXPORT:
        return { label: 'Xuất Kho (EXPORT)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case TicketType.TRANSFER:
        return { label: 'Chuyển Kệ / Kho (TRANSFER)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case TicketType.BORROW:
        return { label: 'Mượn Hồ Sơ (BORROW)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case TicketType.RETURN:
        return { label: 'Trả Hồ Sơ (RETURN)', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case TicketType.DESTROY_EXPORT:
        return { label: 'Xuất Tiêu Hủy (DESTROY)', color: 'bg-slate-200 text-slate-800 border-slate-400' };
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.DRAFT:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">DRAFT (Nháp)</span>;
      case TicketStatus.CONFIRMED:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">CONFIRMED (Đã Duyệt)</span>;
      case TicketStatus.VOID:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">VOID (Đã Hủy)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value="ALL">Tất cả loại phiếu</option>
              <option value={TicketType.IMPORT}>Nhập kho (IMPORT)</option>
              <option value={TicketType.EXPORT}>Xuất kho (EXPORT)</option>
              <option value={TicketType.TRANSFER}>Chuyển kệ (TRANSFER)</option>
              <option value={TicketType.DESTROY_EXPORT}>Xuất tiêu hủy (DESTROY)</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={TicketStatus.DRAFT}>DRAFT (Nháp - chưa tác động kho)</option>
            <option value={TicketStatus.CONFIRMED}>CONFIRMED (Đã xác nhận)</option>
            <option value={TicketStatus.VOID}>VOID (Đã hủy)</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Nghiệp Vụ Mới</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Phiếu</th>
                <th className="p-3.5">Loại Nghiệp Vụ</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-center">Số Thùng</th>
                <th className="p-3.5">Ghi Chú</th>
                <th className="p-3.5">Người Tạo / Thời Gian</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                    Không tìm thấy phiếu nghiệp vụ nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const typeMeta = getTypeLabel(ticket.type);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 text-xs">
                        {ticket.ticketCode}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {ticket.details.length}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">
                        {ticket.note || '--'}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        <div>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-[11px] text-slate-400">Tạo bởi: {ticket.createdBy}</div>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px]"
                        >
                          Chi Tiết
                        </button>

                        {ticket.status === TicketStatus.DRAFT && (
                          <>
                            <button
                              onClick={() => handleConfirmTicket(ticket.id)}
                              className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded font-bold text-[11px]"
                              title="Chỉ phiếu CONFIRMED mới làm thay đổi số lượng tồn và trạng thái vật lý của thùng"
                            >
                              Xác Nhận (CONFIRM)
                            </button>
                            <button
                              onClick={() => setVoidTicketId(ticket.id)}
                              className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded font-semibold text-[11px]"
                            >
                              Hủy (VOID)
                            </button>
                          </>
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

      {/* Ticket Details View Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-base font-mono">{selectedTicket.ticketCode}</h3>
                <span className="text-xs text-slate-400">Chi tiết phiếu nghiệp vụ kho</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Loại phiếu:</span>
                  <span className="font-bold text-slate-900">{selectedTicket.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Trạng thái:</span>
                  <span className="mt-1 block">{getStatusBadge(selectedTicket.status)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Người tạo:</span>
                  <span className="text-slate-800">{selectedTicket.createdBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Xác nhận bởi:</span>
                  <span className="text-slate-800">{selectedTicket.confirmedBy || '(Chưa duyệt)'}</span>
                </div>
              </div>

              {selectedTicket.note && (
                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                  <span className="font-bold">Ghi chú: </span>
                  <span>{selectedTicket.note}</span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Danh sách thùng trong phiếu ({selectedTicket.details.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTicket.details.map(d => {
                    const b = boxes.find(x => x.id === d.boxId);
                    return (
                      <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono">
                        <div>
                          <span className="font-bold text-slate-900">{b?.boxCode || d.boxId}</span>
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                            {b?.docType?.name} &bull; Năm {b?.year}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-[11px]">
                            <span className="text-slate-500">{d.fromShelf || 'Chưa kệ'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-blue-600">{d.toShelf || 'Không đổi'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
              {selectedTicket.status === TicketStatus.DRAFT && (
                <button
                  onClick={() => handleConfirmTicket(selectedTicket.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Xác Nhận Phiếu (Duyệt Thay Đổi Kho)
                </button>
              )}
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base">Lập Phiếu Nghiệp Vụ Kho Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Loại nghiệp vụ *
                  </label>
                  <select
                    value={ticketType}
                    onChange={e => setTicketType(e.target.value as TicketType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    <option value={TicketType.TRANSFER}>Chuyển Vị Trí Kệ / Kho (TRANSFER)</option>
                    <option value={TicketType.EXPORT}>Xuất Kho Luân Chuyển (EXPORT)</option>
                    <option value={TicketType.IMPORT}>Nhập Kho (IMPORT)</option>
                    <option value={TicketType.DESTROY_EXPORT}>Xuất Tiêu Hủy Vật Lý (DESTROY_EXPORT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Ghi chú / Diễn giải nghiệp vụ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Điều chuyển dãy K1 sang dãy K2 bảo trì"
                    value={ticketNote}
                    onChange={e => setTicketNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Select Boxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Chọn các thùng hồ sơ tham gia phiếu ({selectedBoxIds.length} đã chọn)
                </label>
                <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {boxes
                    .filter(b => b.status !== BoxStatus.DESTROYED)
                    .map(box => {
                      const isSelected = selectedBoxIds.includes(box.id);
                      return (
                        <div
                          key={box.id}
                          className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleToggleBoxSelect(box.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                              <span className="font-mono font-bold text-slate-900">{box.boxCode}</span>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Vị trí hiện tại: {box.locationShelf || 'Chưa kệ'} | Trạng thái: {box.status}
                              </div>
                            </div>
                          </div>

                          {isSelected && ticketType === TicketType.TRANSFER && (
                            <div className="w-44" onClick={e => e.stopPropagation()}>
                              <input
                                type="text"
                                placeholder="Kệ mới (VD: K1-B-02-01)"
                                value={shelfTargetMap[box.id] || ''}
                                onChange={e =>
                                  setShelfTargetMap({ ...shelfTargetMap, [box.id]: e.target.value })
                                }
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <p>
                  Phiếu sau khi tạo sẽ ở trạng thái <strong>DRAFT (Nháp)</strong>. Chỉ sau khi được Trưởng kho hoặc Quản trị viên duyệt (CONFIRM), dữ liệu tồn kho và vị trí vật lý mới chính thức thay đổi.
                </p>
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
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Lưu Phiếu Nháp (DRAFT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Reason Modal */}
      {voidTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Hủy Phiếu Nghiệp Vụ (VOID)</h3>
            <p className="text-xs text-slate-600">
              Quy tắc hệ thống: KHÔNG xóa cứng (hard-delete) phiếu nghiệp vụ hoặc lịch sử. Bản ghi sẽ chuyển sang trạng thái VOID kèm lý do hủy.
            </p>
            <textarea
              placeholder="Nhập lý do hủy phiếu bắt buộc..."
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setVoidTicketId(null);
                  setVoidReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleVoidTicket}
                disabled={!voidReason.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:bg-slate-300"
              >
                Xác Nhận Hủy Phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
