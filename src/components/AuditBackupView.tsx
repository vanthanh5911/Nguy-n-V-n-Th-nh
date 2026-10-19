import React, { useState } from 'react';
import {
  AuditLog,
  BackupLog,
  AuditSource,
  BackupStatus,
  User
} from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  FileText,
  Database,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  Smartphone,
  Globe,
  Upload,
  HardDrive
} from 'lucide-react';

interface AuditBackupViewProps {
  auditLogs: AuditLog[];
  backupLogs: BackupLog[];
  currentUser: User;
  onRefresh: () => void;
}

export const AuditBackupView: React.FC<AuditBackupViewProps> = ({
  auditLogs,
  backupLogs,
  currentUser,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'BACKUP'>('AUDIT');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleCreateBackup = () => {
    const log = archiveStore.createSystemBackup();
    alert(`Đã hoàn tất sao lưu dữ liệu máy chủ LAN: ${log.filename} (${(log.fileSize / 1024).toFixed(1)} KB)`);
    onRefresh();
  };

  const handleDownloadBackup = (log: BackupLog) => {
    const state = archiveStore.getState();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', log.filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSourceBadge = (source: AuditSource) => {
    switch (source) {
      case AuditSource.WEB:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Globe className="w-3 h-3" />
            <span>WEB ADMIN</span>
          </span>
        );
      case AuditSource.MOBILE_SYNC:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Smartphone className="w-3 h-3" />
            <span>MOBILE SYNC</span>
          </span>
        );
      case AuditSource.IMPORT:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Upload className="w-3 h-3" />
            <span>EXCEL IMPORT</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'AUDIT' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Nhật Ký Kiểm Toán Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'BACKUP' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sao Lưu Mạng LAN ({backupLogs.length})</span>
          </button>
        </div>

        {activeTab === 'BACKUP' && (
          <button
            onClick={handleCreateBackup}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <HardDrive className="w-4 h-4" />
            <span>Tạo Bản Sao Lưu LAN Ngay</span>
          </button>
        )}
      </div>

      {/* TAB: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Nguồn Thao Tác</th>
                  <th className="p-3.5">Hành Động (Action)</th>
                  <th className="p-3.5">Đối Tượng (Target)</th>
                  <th className="p-3.5">Người Dùng / Địa Chỉ IP</th>
                  <th className="p-3.5 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5 font-sans">
                      {getSourceBadge(log.source)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 font-sans">
                      {log.action}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="font-semibold">{log.targetTable}</span>
                      {log.targetId && <span className="text-slate-400 ml-1">({log.targetId})</span>}
                    </td>
                    <td className="p-3.5 text-slate-600 font-sans">
                      <div>{log.userId || 'system'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</div>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px]"
                      >
                        So Sánh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Backup Logs */}
      {activeTab === 'BACKUP' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Cơ chế tự động sao lưu mạng nội bộ LAN: </strong>
              Dữ liệu được chụp lại (Snapshot) đầy đủ kèm mã kiểm tra băm (Checksum SHA256) để chống chỉnh sửa gian lận. Bạn có thể tải file sao lưu về máy trạm hoặc đưa sang ổ cứng dự phòng bất cứ lúc nào.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tên Tệp Sao Lưu</th>
                  <th className="p-3.5">Kích Thước</th>
                  <th className="p-3.5">Mã Băm Checksum (SHA256)</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5">Thời Điểm Tạo</th>
                  <th className="p-3.5 text-right">Tải Về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {backupLogs.map(bak => (
                  <tr key={bak.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{bak.filename}</td>
                    <td className="p-3.5 text-slate-700 font-sans">
                      {(bak.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                      {bak.checksum}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {bak.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-sans">
                      {new Date(bak.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => handleDownloadBackup(bak)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-slate-800 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải tệp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: View Audit Detail Comparison */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Chi Tiết Nhật Ký Kiểm Toán: {selectedLog.action}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Dữ liệu Trước (Before Data):</span>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-56 overflow-y-auto text-[11px] font-mono text-slate-800">
                  {selectedLog.beforeData ? JSON.stringify(selectedLog.beforeData, null, 2) : '(Không có - Tạo mới)'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Dữ liệu Sau (After Data):</span>
                <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg max-h-56 overflow-y-auto text-[11px] font-mono text-emerald-900">
                  {selectedLog.afterData ? JSON.stringify(selectedLog.afterData, null, 2) : '(Không có)'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
