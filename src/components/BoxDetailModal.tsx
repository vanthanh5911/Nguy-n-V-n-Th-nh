import React, { useState } from 'react';
import { Box, BoxStatus, User } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  X,
  Box as BoxIcon,
  Calendar,
  Building,
  MapPin,
  Clock,
  Printer,
  Plus,
  ShieldCheck,
  Lock,
  FileText
} from 'lucide-react';
import { BarcodeModal } from './BarcodeModal';

interface BoxDetailModalProps {
  box: Box;
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void;
}

export const BoxDetailModal: React.FC<BoxDetailModalProps> = ({
  box,
  currentUser,
  onClose,
  onUpdate
}) => {
  const [showBarcode, setShowBarcode] = useState(false);
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCode, setNewDocCode] = useState('');
  const [newDocDate, setNewDocDate] = useState('');
  const [newDocNote, setNewDocNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isDestroyed = box.status === BoxStatus.DESTROYED;
  const isPermanent = box.docType?.retentionPolicy?.isPermanent;

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    try {
      archiveStore.addDocumentToBox(
        box.id,
        {
          title: newDocTitle.trim(),
          docCode: newDocCode.trim() || undefined,
          documentDate: newDocDate || undefined,
          note: newDocNote.trim() || undefined
        },
        currentUser
      );

      setNewDocTitle('');
      setNewDocCode('');
      setNewDocDate('');
      setNewDocNote('');
      setShowAddDocForm(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm chứng từ');
    }
  };

  // Color badge helper
  const getStatusBadge = (status: BoxStatus) => {
    switch (status) {
      case BoxStatus.IN_STOCK:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Trong kho (IN_STOCK)</span>;
      case BoxStatus.BORROWED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Đang mượn (BORROWED)</span>;
      case BoxStatus.TRANSITING:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">Đang chuyển (TRANSITING)</span>;
      case BoxStatus.PENDING_DESTROY:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">Chờ tiêu hủy (PENDING_DESTROY)</span>;
      case BoxStatus.DESTROYED:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-400">Đã tiêu hủy (DESTROYED)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">Cần kiểm tra (NEEDS_REVIEW)</span>;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <BoxIcon className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-lg font-mono">{box.boxCode}</h3>
                <span className="text-xs text-slate-400">Chi tiết thùng lưu trữ &amp; Danh mục hồ sơ</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBarcode(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>In Nhãn Barcode</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {isDestroyed && (
              <div className="p-4 bg-slate-100 border-2 border-slate-400 rounded-xl flex items-start space-x-3 text-slate-700">
                <Lock className="w-6 h-6 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 uppercase">
                    HỒ SƠ ĐÃ TIÊU HỦY THEO QUY ĐỊNH (DESTROYED)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Thùng hồ sơ này đã được hội đồng thông qua tiêu hủy vật lý. Dữ liệu chỉ dùng để tra cứu lịch sử và báo cáo, khóa hoàn toàn các nghiệp vụ Mượn, Chuyển giá kệ hoặc Xuất kho.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Trạng thái</span>
                <div className="mt-1">{getStatusBadge(box.status)}</div>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Vị trí giá/kệ</span>
                <span className="text-sm font-mono font-bold text-blue-700 mt-1 block">
                  {box.locationShelf || 'Chưa gán kệ'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Năm chứng từ</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{box.year}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Phiên bản (Locking)</span>
                <span className="text-sm font-mono font-semibold text-slate-700 mt-1 block">v{box.version}</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 border border-slate-200 p-3 rounded-lg bg-white">
                <div className="flex items-center text-slate-600">
                  <Building className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Đơn vị chủ quản:</span>
                  <span className="ml-auto font-medium text-slate-900">{box.unit?.name} ({box.unit?.code})</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <BoxIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Kho trực thuộc:</span>
                  <span className="ml-auto font-medium text-slate-900">{box.warehouse?.name}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <FileText className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Loại hồ sơ:</span>
                  <span className="ml-auto font-medium text-slate-900">{box.docType?.name} ({box.docType?.code})</span>
                </div>
              </div>

              <div className="space-y-2 border border-slate-200 p-3 rounded-lg bg-white">
                <div className="flex items-center text-slate-600">
                  <ShieldCheck className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Thời hạn bảo quản:</span>
                  <span className="ml-auto font-medium text-slate-900">
                    {isPermanent ? (
                      <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Bảo quản VĨNH VIỄN
                      </span>
                    ) : (
                      `${box.docType?.retentionPolicy?.durationYears || 10} năm`
                    )}
                  </span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Ngày tạo thùng:</span>
                  <span className="ml-auto text-slate-800">{new Date(box.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Clock className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Cập nhật lần cuối:</span>
                  <span className="ml-auto text-slate-800">{new Date(box.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Danh Sách Chứng Từ Bên Trong ({box.documents?.length || 0})
                  </h4>
                </div>
                {!isDestroyed && !showAddDocForm && (
                  <button
                    onClick={() => setShowAddDocForm(true)}
                    className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm chứng từ vào thùng</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="p-2 mb-3 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                  {error}
                </div>
              )}

              {/* Add Doc Inline Form */}
              {showAddDocForm && (
                <form onSubmit={handleAddDoc} className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Thêm hồ sơ / chứng từ mới vào thùng {box.boxCode}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Mã số/Ký hiệu (tùy chọn)"
                      value={newDocCode}
                      onChange={e => setNewDocCode(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Tiêu đề hồ sơ chứng từ *"
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded sm:col-span-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newDocDate}
                      onChange={e => setNewDocDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Ghi chú thêm"
                      value={newDocNote}
                      onChange={e => setNewDocNote(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700"
                    >
                      Lưu chứng từ
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              {box.documents && box.documents.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {box.documents.map((doc, idx) => (
                    <div key={doc.id} className="py-2.5 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                          {doc.docCode && (
                            <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {doc.docCode}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-900">{doc.title}</span>
                        </div>
                        {doc.note && (
                          <p className="text-[11px] text-slate-500 pl-5">{doc.note}</p>
                        )}
                      </div>
                      {doc.documentDate && (
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(doc.documentDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Chưa có danh sách chứng từ chi tiết trong thùng này.
                </div>
              )}
            </div>

            {/* Borrow History */}
            {box.borrowRecords && box.borrowRecords.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Lịch Sử Mượn / Trả Của Thùng ({box.borrowRecords.length})
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {box.borrowRecords.map(br => (
                    <div key={br.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{br.borrowerName}</span>
                        <span className="text-slate-500 ml-1">({br.borrowerDepartment})</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mượn ngày: {new Date(br.borrowDate).toLocaleDateString('vi-VN')} &bull; Hạn trả: {new Date(br.expectedReturnDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        br.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                        br.status === 'BORROWED' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}>
                        {br.status === 'OVERDUE' ? 'QUÁ HẠN' : br.status === 'BORROWED' ? 'ĐANG MƯỢN' : 'ĐÃ TRẢ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {showBarcode && (
        <BarcodeModal box={box} onClose={() => setShowBarcode(false)} />
      )}
    </>
  );
};
