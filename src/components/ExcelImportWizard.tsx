import React, { useState } from 'react';
import { Unit, Warehouse, DocumentType, User } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportWizardProps {
  units: Unit[];
  warehouses: Warehouse[];
  documentTypes: DocumentType[];
  currentUser: User;
  onImportComplete: () => void;
}

export const ExcelImportWizard: React.FC<ExcelImportWizardProps> = ({
  units,
  warehouses,
  documentTypes,
  currentUser,
  onImportComplete
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [validationResults, setValidationResults] = useState<{
    validCount: number;
    errorCount: number;
    validatedRows: any[];
  } | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number } | null>(null);

  // Sample data template generator
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Mã Đơn Vị (HY/HN/HCM)': 'HY',
        'Mã Loại Hồ Sơ (TT/KT/HD/NS/VP/TU)': 'TT',
        'Năm Tài Liệu': 2026,
        'Mã Kho (K1/K2)': 'K1',
        'Vị Trí Giá Kệ': 'K1-B-01-08',
        'Tiêu Đề Chứng Từ (Tùy chọn)': 'Hồ sơ quyết toán chi phí tiếp khách Quý 1/2026'
      },
      {
        'Mã Đơn Vị (HY/HN/HCM)': 'HY',
        'Mã Loại Hồ Sơ (TT/KT/HD/NS/VP/TU)': 'HD',
        'Năm Tài Liệu': 2025,
        'Mã Kho (K1/K2)': 'K2',
        'Vị Trí Giá Kệ': 'K2-A-03-02',
        'Tiêu Đề Chứng Từ (Tùy chọn)': 'Hợp đồng mua sắm trang thiết bị bảo hộ lao động'
      },
      {
        'Mã Đơn Vị (HY/HN/HCM)': 'HN',
        'Mã Loại Hồ Sơ (TT/KT/HD/NS/VP/TU)': 'KT',
        'Năm Tài Liệu': 2024,
        'Mã Kho (K1/K2)': 'K1',
        'Vị Trí Giá Kệ': 'HN-B2-01-01',
        'Tiêu Đề Chứng Từ (Tùy chọn)': 'Báo cáo kiểm toán độc lập năm tài chính 2024'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Ho_So');
    XLSX.writeFile(workbook, 'Mau_Nhap_Lieu_Kho_Ho_So_Chuan.xlsx');
  };

  // Load built-in demo data to quickly test the pipeline
  const loadDemoBatch = () => {
    const demoData = [
      { unitCode: 'HY', docTypeCode: 'TT', year: 2026, warehouseCode: 'K1', locationShelf: 'K1-A-04-01', title: 'Chứng từ ngân hàng Agribank Tháng 02/2026' },
      { unitCode: 'HY', docTypeCode: 'KT', year: 2025, warehouseCode: 'K1', locationShelf: 'K1-A-04-02', title: 'Sổ cái tổng hợp tài khoản năm 2025' },
      { unitCode: 'HY', docTypeCode: 'HD', year: 2026, warehouseCode: 'K2', locationShelf: 'K2-B-03-05', title: 'Hợp đồng bảo trì hệ thống PCCC xưởng Hưng Yên' },
      { unitCode: 'HN', docTypeCode: 'NS', year: 2024, warehouseCode: 'K1', locationShelf: 'HN-C1-02-01', title: 'Hồ sơ đánh giá thi đua khen thưởng năm 2024' },
      // Intentionally bad row to test validation engine!
      { unitCode: 'XX_UNKNOWN', docTypeCode: 'TT', year: 1950, warehouseCode: 'K99', locationShelf: '', title: 'Dòng thử nghiệm lỗi xác thực' }
    ];

    setRawRows(demoData);
    setFileName('Bo_Du_Lieu_Thu_Nghiem_San.xlsx');
    setCurrentStep(2);
  };

  // Handle actual file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Normalize keys
        const mapped = data.map((row: any) => ({
          unitCode: row['Mã Đơn Vị (HY/HN/HCM)'] || row['unitCode'] || row['Mã Đơn Vị'] || '',
          docTypeCode: row['Mã Loại Hồ Sơ (TT/KT/HD/NS/VP/TU)'] || row['docTypeCode'] || row['Loại Hồ Sơ'] || '',
          year: Number(row['Năm Tài Liệu'] || row['year'] || row['Năm']),
          warehouseCode: row['Mã Kho (K1/K2)'] || row['warehouseCode'] || row['Mã Kho'] || '',
          locationShelf: row['Vị Trí Giá Kệ'] || row['locationShelf'] || '',
          title: row['Tiêu Đề Chứng Từ (Tùy chọn)'] || row['title'] || row['Tiêu Đề'] || ''
        }));

        setRawRows(mapped);
        setCurrentStep(2);
      } catch (err) {
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Step 2 -> Step 3: Run Validation Engine
  const handleRunValidation = () => {
    const res = archiveStore.validateExcelRows(rawRows);
    setValidationResults(res);
    setCurrentStep(3);
  };

  // Step 3 -> Step 4: Commit Valid Rows to Database
  const handleCommit = () => {
    if (!validationResults) return;

    const validItems = validationResults.validatedRows
      .filter(r => r.isValid)
      .map(r => ({ data: r.data, generatedBoxCode: r.generatedBoxCode }));

    const res = archiveStore.commitExcelImport(validItems, currentUser);
    setImportResult({ success: res.success, count: res.importedCount });
    setCurrentStep(4);
    onImportComplete();
  };

  const handleReset = () => {
    setCurrentStep(1);
    setRawRows([]);
    setFileName('');
    setValidationResults(null);
    setImportResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Wizard Step Stepper */}
      <div className="bg-slate-900 text-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Quy Trình Nhập Khẩu Excel Chuẩn 4 Bước</h3>
          </div>
          <span className="text-xs text-slate-400">
            Tuân thủ: Upload &rarr; Analyze &amp; Preview &rarr; Validate &rarr; Commit
          </span>
        </div>

        {/* 4 Steps progress bar */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`p-2 rounded-lg border flex items-center space-x-2 ${
            currentStep >= 1 ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">1</span>
            <span className="truncate">Tải lên File</span>
          </div>

          <div className={`p-2 rounded-lg border flex items-center space-x-2 ${
            currentStep >= 2 ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">2</span>
            <span className="truncate">Xem trước</span>
          </div>

          <div className={`p-2 rounded-lg border flex items-center space-x-2 ${
            currentStep >= 3 ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">3</span>
            <span className="truncate">Xác thực mã</span>
          </div>

          <div className={`p-2 rounded-lg border flex items-center space-x-2 ${
            currentStep >= 4 ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold' : 'border-slate-800 text-slate-500'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">4</span>
            <span className="truncate">Nhập vào Kho</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-slate-50 hover:bg-slate-100/50 transition-colors text-center relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="p-4 bg-emerald-100 text-emerald-700 rounded-full mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Kéo thả file Excel hoặc bấm để chọn tệp</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hỗ trợ định dạng .xlsx, .xls. Hệ thống sẽ đọc dữ liệu và đưa vào bước Phân tích &amp; Xem trước trước khi xác thực.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Tải File Mẫu Excel Chuẩn (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={loadDemoBatch}
                className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Nạp Dữ Liệu Mẫu Thử Nghiệm Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Analyze & Preview */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Bước 2: Phân Tích &amp; Xem Trước ({rawRows.length} dòng dữ liệu)
                </h4>
                <span className="text-xs text-slate-500">Tệp: {fileName}</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chọn file khác</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Đơn Vị</th>
                    <th className="p-3">Loại Hồ Sơ</th>
                    <th className="p-3">Năm</th>
                    <th className="p-3">Kho</th>
                    <th className="p-3">Vị Trí Kệ</th>
                    <th className="p-3">Tiêu Đề Chứng Từ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {rawRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{row.unitCode || '--'}</td>
                      <td className="p-3 text-slate-800">{row.docTypeCode || '--'}</td>
                      <td className="p-3 text-slate-800">{row.year || '--'}</td>
                      <td className="p-3 text-slate-800">{row.warehouseCode || '--'}</td>
                      <td className="p-3 text-blue-600">{row.locationShelf || '--'}</td>
                      <td className="p-3 font-sans text-slate-700">{row.title || '(Không có)'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg"
              >
                Quay lại
              </button>
              <button
                onClick={handleRunValidation}
                className="flex items-center space-x-2 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                <span>Chạy Kiểm Tra &amp; Xác Thực (Bước 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Validate */}
        {currentStep === 3 && validationResults && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Bước 3: Kết Quả Xác Thực &amp; Sinh Mã Thùng Bất Biến
                </h4>
                <div className="flex items-center space-x-3 text-xs mt-1">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Hợp lệ: {validationResults.validCount} dòng
                  </span>
                  {validationResults.errorCount > 0 && (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Có lỗi: {validationResults.errorCount} dòng
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3">Mã Thùng Dự Kiến Sinh</th>
                    <th className="p-3">Thông Tin Lô</th>
                    <th className="p-3">Chi Tiết Kiểm Tra / Lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResults.validatedRows.map(row => (
                    <tr key={row.index} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                      <td className="p-3 text-center font-mono text-slate-400">{row.index}</td>
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>HỢP LỆ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-700 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>CÓ LỖI</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-black text-slate-900">
                        {row.isValid ? row.generatedBoxCode : '--'}
                      </td>
                      <td className="p-3 text-slate-700 font-mono text-[11px]">
                        {row.data.unitCode} - {row.data.docTypeCode} - {row.data.year} ({row.data.warehouseCode})
                      </td>
                      <td className="p-3">
                        {row.errors.length > 0 && (
                          <div className="text-rose-700 font-semibold space-y-0.5">
                            {row.errors.map((e: string, i: number) => (
                              <div key={i}>&bull; {e}</div>
                            ))}
                          </div>
                        )}
                        {row.warnings.length > 0 && (
                          <div className="text-amber-700 italic space-y-0.5 mt-0.5">
                            {row.warnings.map((w: string, i: number) => (
                              <div key={i}>&bull; {w}</div>
                            ))}
                          </div>
                        )}
                        {row.isValid && row.warnings.length === 0 && (
                          <span className="text-emerald-600">Đầy đủ thông tin hợp lệ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg"
              >
                Quay lại Xem trước
              </button>
              <button
                onClick={handleCommit}
                disabled={validationResults.validCount === 0}
                className={`flex items-center space-x-2 px-6 py-2 text-xs font-bold text-white rounded-lg shadow-sm ${
                  validationResults.validCount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Cam Kết Nhập Kho ({validationResults.validCount} Dòng Hợp Lệ)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Commit Success */}
        {currentStep === 4 && importResult && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-xl text-slate-900">
              Nhập Kho Thành Công {importResult.count} Thùng Hồ Sơ!
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Các thùng hồ sơ mới đã được tạo với mã chuẩn bất biến, vị trí giá kệ ban đầu và đã ghi nhận vào Nhật ký Kiểm toán (Audit Log) với nguồn IMPORT.
            </p>
            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={handleReset}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Nhập Thêm File Khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
