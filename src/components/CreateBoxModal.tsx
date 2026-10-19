import React, { useState, useEffect } from 'react';
import { Unit, Warehouse, DocumentType, User } from '../types';
import { archiveStore } from '../services/archiveStore';
import { X, Box as BoxIcon, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface CreateBoxModalProps {
  units: Unit[];
  warehouses: Warehouse[];
  documentTypes: DocumentType[];
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBoxModal: React.FC<CreateBoxModalProps> = ({
  units,
  warehouses,
  documentTypes,
  currentUser,
  onClose,
  onSuccess
}) => {
  const currentYear = new Date().getFullYear();
  const [unitId, setUnitId] = useState<string>(units[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [docTypeId, setDocTypeId] = useState<string>(documentTypes[0]?.id || '');
  const [year, setYear] = useState<number>(currentYear);
  const [locationShelf, setLocationShelf] = useState<string>('');
  
  // Initial documents inside box
  const [documents, setDocuments] = useState<{ docCode: string; title: string; note: string }[]>([
    { docCode: '', title: '', note: '' }
  ]);

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Filter warehouses belonging to selected unit
  const filteredWarehouses = warehouses.filter(w => w.unitId === unitId);

  // Auto-select warehouse when unit changes
  useEffect(() => {
    if (filteredWarehouses.length > 0 && !filteredWarehouses.some(w => w.id === warehouseId)) {
      setWarehouseId(filteredWarehouses[0].id);
    }
  }, [unitId, filteredWarehouses, warehouseId]);

  // Live preview calculation of Box Code
  useEffect(() => {
    const selUnit = units.find(u => u.id === unitId);
    const selDocType = documentTypes.find(d => d.id === docTypeId);
    const selWh = warehouses.find(w => w.id === warehouseId);

    if (selUnit && selDocType && selWh && year) {
      const code = archiveStore.generateBoxCode(selUnit.code, selDocType.code, year, selWh.code);
      setGeneratedCode(code);
    }
  }, [unitId, warehouseId, docTypeId, year, units, warehouses, documentTypes]);

  const handleAddDocRow = () => {
    setDocuments([...documents, { docCode: '', title: '', note: '' }]);
  };

  const handleRemoveDocRow = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleDocChange = (index: number, field: 'docCode' | 'title' | 'note', value: string) => {
    const next = [...documents];
    next[index][field] = value;
    setDocuments(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validDocs = documents.filter(d => d.title.trim().length > 0);

    const res = archiveStore.createBox({
      unitId,
      warehouseId,
      docTypeId,
      year: Number(year),
      locationShelf: locationShelf.trim() || undefined,
      currentUser,
      initialDocuments: validDocs
    });

    if (!res.success) {
      setError(res.error || 'Có lỗi xảy ra khi tạo thùng');
      return;
    }

    onSuccess();
  };

  const selectedDocType = documentTypes.find(d => d.id === docTypeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <BoxIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Tạo Mới Thùng Hồ Sơ Lưu Trữ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Code Live Badge */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Mã Thùng Chuẩn Hệ Thống (Bất Biến)
                </span>
                <div className="text-2xl font-black font-mono text-emerald-950 mt-1">
                  {generatedCode || 'Đang tạo...'}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="block font-medium">Quy chuẩn ISO/Lưu trữ:</span>
                <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                  &#123;ĐV&#125;-&#123;Loại&#125;-&#123;Năm&#125;-&#123;Kho&#125;-&#123;STT&#125;
                </code>
              </div>
            </div>
            {selectedDocType?.retentionPolicy && (
              <div className="mt-2 pt-2 border-t border-emerald-500/20 text-xs text-slate-600">
                <span className="font-semibold">Thời hạn bảo quản: </span>
                <span className={selectedDocType.retentionPolicy.isPermanent ? 'text-purple-700 font-bold' : 'text-slate-800'}>
                  {selectedDocType.retentionPolicy.isPermanent
                    ? 'Bảo quản VĨNH VIỄN (Chặn tiêu hủy)'
                    : `${selectedDocType.retentionPolicy.durationYears} năm (${selectedDocType.retentionPolicy.name})`}
                </span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Đơn vị / Chi nhánh *
              </label>
              <select
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    [{u.code}] - {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kho lưu trữ ban đầu *
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              >
                {filteredWarehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Loại hồ sơ / Chứng từ *
              </label>
              <select
                value={docTypeId}
                onChange={e => setDocTypeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              >
                {documentTypes.map(dt => (
                  <option key={dt.id} value={dt.id}>
                    [{dt.code}] - {dt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Năm tài liệu chứng từ *
              </label>
              <input
                type="number"
                min="1980"
                max="2050"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                required
              />
            </div>
          </div>

          {/* Location Shelf (Dynamic) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Vị trí giá/kệ lưu trữ (Thuộc tính động)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: K1-A-01-05 (Kho K1, Kệ A, Tầng 1, Ngăn 5)"
                value={locationShelf}
                onChange={e => setLocationShelf(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ghi chú: Vị trí giá/kệ có thể thay đổi linh hoạt qua phiếu chuyển kho hoặc mobile scan mà không làm đổi Mã Thùng.
            </p>
          </div>

          {/* Initial Documents List inside box */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-700">
                Danh sách hồ sơ / chứng từ bên trong thùng
              </span>
              <button
                type="button"
                onClick={handleAddDocRow}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dòng chứng từ</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-mono text-slate-400 w-5 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Số/Ký hiệu (UNC-01)"
                    value={doc.docCode}
                    onChange={e => handleDocChange(idx, 'docCode', e.target.value)}
                    className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Tiêu đề hồ sơ (bắt buộc)"
                    value={doc.title}
                    onChange={e => handleDocChange(idx, 'title', e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                  />
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDocRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              Tạo Thùng Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
