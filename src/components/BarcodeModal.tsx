import React from 'react';
import { Box } from '../types';
import { Printer, X, ShieldCheck, Box as BoxIcon, Calendar, MapPin, Building, FileText } from 'lucide-react';

interface BarcodeModalProps {
  box: Box;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ box, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Generate SVG-based Code128-like barcode visual representation
  const generateBarcodeLines = (code: string) => {
    const chars = code.split('');
    return chars.map((char, index) => {
      const codeVal = char.charCodeAt(0);
      const width = (codeVal % 3) + 1.5;
      const space = ((codeVal * 7) % 3) + 1.2;
      return (
        <rect
          key={index}
          x={index * 9.5}
          y="0"
          width={width}
          height="55"
          fill="#111827"
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <BoxIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">In Nhãn Thùng Lưu Trữ Tiêu Chuẩn</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6">
          <div
            id="printable-label"
            className="border-2 border-dashed border-slate-400 rounded-xl p-6 bg-amber-50/30 print:border-solid print:border-black print:m-0 print:p-4 text-slate-800 relative"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                  KHO LƯU TRỮ HỒ SƠ CHỨNG TỪ - QUỐC GIA / NỘI BỘ
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                VER: v{box.version}
              </span>
            </div>

            {/* Box Code Main Title */}
            <div className="text-center my-2">
              <div className="text-xs uppercase text-slate-500 font-semibold tracking-wide">
                MÃ THÙNG BẤT BIẾN (BOX CODE)
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
                {box.boxCode}
              </div>
            </div>

            {/* Barcode SVG Display */}
            <div className="flex flex-col items-center justify-center my-4 bg-white p-3 rounded-lg border border-slate-200">
              <svg width="260" height="60" className="overflow-visible">
                {generateBarcodeLines(box.boxCode)}
              </svg>
              <span className="text-[11px] font-mono tracking-widest text-slate-600 mt-1 font-semibold">
                *{box.boxCode}*
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-200 py-3 my-3">
              <div className="space-y-1.5">
                <div className="flex items-center text-slate-600">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Đơn vị:</span>
                  <span className="ml-1 text-slate-900 font-medium truncate">{box.unit?.name || box.unitId}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <BoxIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Kho quản lý:</span>
                  <span className="ml-1 text-slate-900 font-medium truncate">{box.warehouse?.name || box.warehouseId}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Loại hồ sơ:</span>
                  <span className="ml-1 text-slate-900 font-medium truncate">{box.docType?.name || box.docTypeId}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Năm tài liệu:</span>
                  <span className="ml-1 text-slate-900 font-bold">{box.year}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Vị trí giá/kệ:</span>
                  <span className="ml-1 font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded">
                    {box.locationShelf || 'Chưa xếp kệ'}
                  </span>
                </div>
                <div className="flex items-center text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span className="font-semibold text-slate-700">Bảo quản:</span>
                  <span className="ml-1 font-medium text-slate-800">
                    {box.docType?.retentionPolicy?.isPermanent
                      ? 'Vĩnh viễn'
                      : `${box.docType?.retentionPolicy?.durationYears || 10} năm`}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer QR & Warning note */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div>
                <p className="italic">Lưu ý: Không bóc hoặc viết đè lên mã nhãn.</p>
                <p className="font-mono text-[10px]">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500 text-emerald-700 bg-emerald-50">
                  TEM NIÊM PHONG KHO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>In Nhãn Thùng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
