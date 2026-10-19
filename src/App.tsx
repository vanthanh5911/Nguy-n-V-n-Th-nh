import React, { useState, useEffect } from 'react';
import {
  Role,
  BoxStatus,
  User,
  Box,
  InventoryTicket,
  BorrowRecord,
  DestructionBatch,
  AuditLog,
  BackupLog,
  SyncConflictRecord
} from './types';
import { archiveStore, DatabaseState } from './services/archiveStore';

// Components
import { BarcodeModal } from './components/BarcodeModal';
import { CreateBoxModal } from './components/CreateBoxModal';
import { BoxDetailModal } from './components/BoxDetailModal';
import { MobileCompanionModal } from './components/MobileCompanionModal';
import { ConflictDesk } from './components/ConflictDesk';
import { ExcelImportWizard } from './components/ExcelImportWizard';
import { TicketManager } from './components/TicketManager';
import { DestructionManager } from './components/DestructionManager';
import { BorrowManager } from './components/BorrowManager';
import { MasterDataView } from './components/MasterDataView';
import { AuditBackupView } from './components/AuditBackupView';
import { RetentionExpiryAlert } from './components/RetentionExpiryAlert';

import {
  LayoutDashboard,
  Box as BoxIcon,
  FileText,
  BookOpen,
  Flame,
  FileSpreadsheet,
  Smartphone,
  ShieldAlert,
  Database,
  Printer,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  ChevronDown,
  Layers,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [dbState, setDbState] = useState<DatabaseState>(archiveStore.getState());
  const [currentUser, setCurrentUser] = useState<User>(dbState.users[0]); // default admin

  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'BOXES' | 'TICKETS' | 'BORROW' | 'DESTRUCTION' | 'EXCEL_IMPORT' | 'CONFLICTS' | 'MASTER_DATA' | 'AUDIT_BACKUP'
  >('DASHBOARD');

  // Modals state
  const [showCreateBoxModal, setShowCreateBoxModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedBoxDetail, setSelectedBoxDetail] = useState<Box | null>(null);
  const [selectedBoxForBarcode, setSelectedBoxForBarcode] = useState<Box | null>(null);

  // Boxes table filter state
  const [boxSearch, setBoxSearch] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterWarehouse, setFilterWarehouse] = useState('ALL');
  const [filterDocType, setFilterDocType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [retentionQuickFilter, setRetentionQuickFilter] = useState<'ALL' | 'EXPIRED' | 'NEARING'>('ALL');

  // Refresh DB state handler
  const refreshData = () => {
    setDbState({ ...archiveStore.getState() });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const boxesWithRelations = archiveStore.getBoxesWithRelations();
  const currentYear = new Date().getFullYear();

  // Retention expiry helpers
  const isBoxExpired = (box: Box) => {
    if (box.status === BoxStatus.DESTROYED || box.status === BoxStatus.PENDING_DESTROY) return false;
    const policy = box.docType?.retentionPolicy;
    if (!policy || policy.isPermanent || !policy.durationYears) return false;
    return (currentYear - box.year) >= policy.durationYears;
  };

  const isBoxNearing = (box: Box) => {
    if (box.status === BoxStatus.DESTROYED || box.status === BoxStatus.PENDING_DESTROY) return false;
    const policy = box.docType?.retentionPolicy;
    if (!policy || policy.isPermanent || !policy.durationYears) return false;
    return (currentYear - box.year) === policy.durationYears - 1;
  };

  // Metrics computation
  const totalBoxes = dbState.boxes.length;
  const inStockCount = dbState.boxes.filter(b => b.status === BoxStatus.IN_STOCK).length;
  const borrowedCount = dbState.boxes.filter(b => b.status === BoxStatus.BORROWED).length;
  const overdueBorrowCount = dbState.borrowRecords.filter(r => r.status === 'OVERDUE').length;
  const pendingDestroyCount = dbState.boxes.filter(b => b.status === BoxStatus.PENDING_DESTROY).length;
  const destroyedCount = dbState.boxes.filter(b => b.status === BoxStatus.DESTROYED).length;
  const pendingConflictsCount = dbState.conflicts.filter(c => c.status === 'PENDING_REVIEW').length;

  // Filtered Boxes
  const filteredBoxes = boxesWithRelations.filter(box => {
    if (filterUnit !== 'ALL' && box.unitId !== filterUnit) return false;
    if (filterWarehouse !== 'ALL' && box.warehouseId !== filterWarehouse) return false;
    if (filterDocType !== 'ALL' && box.docTypeId !== filterDocType) return false;
    if (filterStatus !== 'ALL' && box.status !== filterStatus) return false;
    if (retentionQuickFilter === 'EXPIRED' && !isBoxExpired(box)) return false;
    if (retentionQuickFilter === 'NEARING' && !isBoxNearing(box)) return false;
    if (boxSearch.trim()) {
      const q = boxSearch.toLowerCase();
      const codeMatch = box.boxCode.toLowerCase().includes(q);
      const shelfMatch = (box.locationShelf || '').toLowerCase().includes(q);
      const docMatch = (box.documents || []).some(d => d.title.toLowerCase().includes(q) || (d.docCode || '').toLowerCase().includes(q));
      if (!codeMatch && !shelfMatch && !docMatch) return false;
    }
    return true;
  });

  const getStatusBadge = (status: BoxStatus) => {
    switch (status) {
      case BoxStatus.IN_STOCK:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">TRONG KHO</span>;
      case BoxStatus.BORROWED:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">ĐANG MƯỢN</span>;
      case BoxStatus.TRANSITING:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">LUÂN CHUYỂN</span>;
      case BoxStatus.PENDING_DESTROY:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">CHỜ HỦY</span>;
      case BoxStatus.DESTROYED:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">ĐÃ TIÊU HỦY</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">KIỂM TRA</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BoxIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-wide text-white uppercase">
                  QUẢN LÝ LƯU TRỮ
                </span>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                  LAN 192.168.1.100:3000
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hệ thống quản lý kho hồ sơ &amp; chứng từ &bull; Mobile Offline Sync Companion
              </p>
            </div>
          </div>

          {/* Quick Tools & User Switcher */}
          <div className="flex items-center space-x-3">
            {/* Mobile Companion Trigger */}
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 shadow-sm transition-all"
              title="Mở ứng dụng Mobile Companion mô phỏng quét mã vạch offline"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Mobile Simulator</span>
            </button>

            {/* Conflict desk badge alert */}
            {pendingConflictsCount > 0 && (
              <button
                onClick={() => setActiveTab('CONFLICTS')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white animate-pulse"
                title="Có xung đột phiên bản Mobile Sync cần đối soát tay"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{pendingConflictsCount} Xung Đột</span>
              </button>
            )}

            {/* User & Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <select
                value={currentUser.id}
                onChange={e => {
                  const u = dbState.users.find(x => x.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                title="Chuyển đổi vai trò người dùng để kiểm thử quyền"
              >
                {dbState.users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.fullName} [{u.role}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'DASHBOARD' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tổng Quan Kho</span>
            </button>

            <button
              onClick={() => setActiveTab('BOXES')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'BOXES' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BoxIcon className="w-3.5 h-3.5" />
              <span>Thùng &amp; Hồ Sơ ({totalBoxes})</span>
            </button>

            <button
              onClick={() => setActiveTab('TICKETS')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'TICKETS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Phiếu Nghiệp Vụ ({dbState.inventoryTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BORROW')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'BORROW' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mượn / Trả ({borrowedCount})</span>
              {overdueBorrowCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('DESTRUCTION')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'DESTRUCTION' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Tiêu Hủy Chứng Từ ({pendingDestroyCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('EXCEL_IMPORT')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'EXCEL_IMPORT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Nhập Liệu Excel (Wizard)</span>
            </button>

            <button
              onClick={() => setActiveTab('CONFLICTS')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'CONFLICTS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Đối Soát Xung Đột ({pendingConflictsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('MASTER_DATA')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'MASTER_DATA' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Danh Mục Hệ Thống</span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_BACKUP')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'AUDIT_BACKUP' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Kiểm Toán &amp; Backup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ============================================================== */}
        {/* TAB: DASHBOARD                                                 */}
        {/* ============================================================== */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Tổng Thùng</span>
                <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">{totalBoxes}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Toàn hệ thống</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Trong Kho</span>
                <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">{inStockCount}</span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Sẵn sàng tra cứu</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Đang Mượn</span>
                <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">{borrowedCount}</span>
                <span className="text-[10px] text-amber-700 mt-1 block">Đang lưu hành</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
                <span className="text-[11px] font-bold text-rose-800 uppercase block">Quá Hạn Trả</span>
                <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">{overdueBorrowCount}</span>
                <span className="text-[10px] text-rose-700 mt-1 block">Cần đôn đốc</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs">
                <span className="text-[11px] font-bold text-orange-800 uppercase block">Chờ Tiêu Hủy</span>
                <span className="text-2xl font-black font-mono text-orange-600 mt-1 block">{pendingDestroyCount}</span>
                <span className="text-[10px] text-orange-700 mt-1 block">Hết hạn bảo quản</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-300 bg-slate-100 shadow-xs">
                <span className="text-[11px] font-bold text-slate-700 uppercase block">Đã Tiêu Hủy</span>
                <span className="text-2xl font-black font-mono text-slate-800 mt-1 block">{destroyedCount}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Lưu vết lịch sử</span>
              </div>
            </div>

            {/* Sắp / Đã Đến Hạn Bảo Quản Component */}
            <RetentionExpiryAlert
              boxes={boxesWithRelations}
              currentUser={currentUser}
              onUpdate={refreshData}
              onNavigateToDestruction={() => setActiveTab('DESTRUCTION')}
              activeQuickFilter={retentionQuickFilter}
              onQuickFilterChange={setRetentionQuickFilter}
            />

            {/* Quick Actions & System Info Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Warehouse Structure Overview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Cơ Cấu Kho Lưu Trữ</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('MASTER_DATA')}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Chi tiết
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  {dbState.warehouses.map(wh => {
                    const countInWh = dbState.boxes.filter(b => b.warehouseId === wh.id).length;
                    const u = dbState.units.find(unit => unit.id === wh.unitId);
                    return (
                      <div key={wh.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{wh.name}</span>
                          <div className="text-[11px] text-slate-500 font-mono">[{u?.code}] &bull; {wh.location}</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {countInWh} thùng
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immutable Box Code Principle Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <BoxIcon className="w-4 h-4 text-emerald-600" />
                  <span>Quy Tắc Bất Biến Mã Thùng</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mã thùng được cấu thành từ 5 thành phần: 
                  <code className="block my-1.5 p-2 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg text-center font-bold">
                    &#123;ĐơnVị&#125;-&#123;LoạiHS&#125;-&#123;Năm&#125;-&#123;MãKho&#125;-&#123;STT&#125;
                  </code>
                  Ví dụ: <strong className="font-mono text-slate-900">HY-TT-26-K1-003</strong>. Khi chuyển vị trí hoặc kho, Mã Thùng <strong>KHÔNG ĐỔI</strong>, thuộc tính vị trí giá kệ (location_shelf) là động.
                </p>
                <div className="pt-2 flex space-x-2">
                  <button
                    onClick={() => setShowCreateBoxModal(true)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    + Tạo Thùng Chuẩn
                  </button>
                  <button
                    onClick={() => setActiveTab('EXCEL_IMPORT')}
                    className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Nhập Excel
                  </button>
                </div>
              </div>

              {/* Mobile Companion Simulator Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 flex items-center space-x-1">
                      <Smartphone className="w-3.5 h-3.5 mr-1" />
                      Mobile Offline Companion
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                      LAN Mode
                    </span>
                  </div>
                  <h4 className="font-black text-base text-white">
                    Kiểm Kê Ngoại Tuyến &amp; Quét Barcode
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Thủ kho cầm máy quét Zebra làm việc trong kho mất sóng LAN, lưu hàng đợi sự kiện SQLite, tự động phát hiện xung đột Optimistic Locking khi Server bị thay đổi.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-700/80">
                  <span className="text-xs text-slate-400">
                    Xung đột chờ duyệt: <strong className="text-amber-400">{pendingConflictsCount}</strong>
                  </span>
                  <button
                    onClick={() => setShowMobileModal(true)}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-sm transition-all"
                  >
                    Mở Simulator
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Box Search & Recent Boxes Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <BoxIcon className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Tra Cứu Nhanh Thùng Lưu Trữ</h4>
                </div>

                {/* Dashboard Quick-Filter Toggle Bar */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setRetentionQuickFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      retentionQuickFilter === 'ALL'
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất Cả ({totalBoxes})
                  </button>
                  <button
                    onClick={() => setRetentionQuickFilter('EXPIRED')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      retentionQuickFilter === 'EXPIRED'
                        ? 'bg-rose-600 text-white font-bold shadow-2xs'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <span>Hết Hạn</span>
                    <span className="font-mono text-[10px] bg-rose-200 text-rose-900 px-1 rounded ml-1">
                      {boxesWithRelations.filter(isBoxExpired).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setRetentionQuickFilter('NEARING')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      retentionQuickFilter === 'NEARING'
                        ? 'bg-amber-500 text-white font-bold shadow-2xs'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <span>Sắp Đến Hạn</span>
                    <span className="font-mono text-[10px] bg-amber-200 text-amber-900 px-1 rounded ml-1">
                      {boxesWithRelations.filter(isBoxNearing).length}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('BOXES')}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Xem toàn bộ ({totalBoxes} thùng) &rarr;
                </button>
              </div>

              {(() => {
                const list = retentionQuickFilter === 'EXPIRED'
                  ? boxesWithRelations.filter(isBoxExpired)
                  : retentionQuickFilter === 'NEARING'
                  ? boxesWithRelations.filter(isBoxNearing)
                  : boxesWithRelations.slice(0, 8);

                if (list.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50 rounded-xl">
                      Không có thùng nào thuộc bộ lọc này.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {list.map(box => (
                      <div
                        key={box.id}
                        onClick={() => setSelectedBoxDetail(box)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          retentionQuickFilter === 'EXPIRED'
                            ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                            : retentionQuickFilter === 'NEARING'
                            ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 text-xs">{box.boxCode}</span>
                          <span className="text-[10px] font-mono text-slate-500">v{box.version}</span>
                        </div>
                        <div className="text-xs text-slate-600 truncate">{box.docType?.name} &bull; Năm {box.year}</div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                          <span className="text-[11px] font-mono font-semibold text-blue-600">{box.locationShelf || 'Chưa kệ'}</span>
                          {getStatusBadge(box.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: BOXES & DOCUMENTS                                         */}
        {/* ============================================================== */}
        {activeTab === 'BOXES' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm mã thùng, kệ, chứng từ..."
                    value={boxSearch}
                    onChange={e => setBoxSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-56 font-mono"
                  />
                </div>

                {/* Retention Quick Filter Toggle in Boxes Tab */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setRetentionQuickFilter('ALL')}
                    className={`px-2.5 py-1 text-xs rounded font-bold transition-all ${
                      retentionQuickFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setRetentionQuickFilter('EXPIRED')}
                    className={`px-2.5 py-1 text-xs rounded font-bold transition-all ${
                      retentionQuickFilter === 'EXPIRED'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    Hết hạn ({boxesWithRelations.filter(isBoxExpired).length})
                  </button>
                  <button
                    onClick={() => setRetentionQuickFilter('NEARING')}
                    className={`px-2.5 py-1 text-xs rounded font-bold transition-all ${
                      retentionQuickFilter === 'NEARING'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    Sắp hết hạn ({boxesWithRelations.filter(isBoxNearing).length})
                  </button>
                </div>

                <select
                  value={filterUnit}
                  onChange={e => setFilterUnit(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
                >
                  <option value="ALL">Tất cả đơn vị</option>
                  {dbState.units.map(u => (
                    <option key={u.id} value={u.id}>[{u.code}] {u.name}</option>
                  ))}
                </select>

                <select
                  value={filterWarehouse}
                  onChange={e => setFilterWarehouse(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
                >
                  <option value="ALL">Tất cả kho</option>
                  {dbState.warehouses.map(w => (
                    <option key={w.id} value={w.id}>[{w.code}] {w.name}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value={BoxStatus.IN_STOCK}>Trong kho (IN_STOCK)</option>
                  <option value={BoxStatus.BORROWED}>Đang mượn (BORROWED)</option>
                  <option value={BoxStatus.PENDING_DESTROY}>Chờ hủy (PENDING_DESTROY)</option>
                  <option value={BoxStatus.DESTROYED}>Đã tiêu hủy (DESTROYED)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCreateBoxModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Thùng Mới</span>
                </button>
              </div>
            </div>

            {/* Boxes Main Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Mã Thùng Bất Biến</th>
                      <th className="p-3.5">Đơn Vị &amp; Kho</th>
                      <th className="p-3.5">Loại Hồ Sơ</th>
                      <th className="p-3.5">Năm</th>
                      <th className="p-3.5">Vị Trí Giá Kệ (Động)</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-center">Chứng Từ</th>
                      <th className="p-3.5 text-center">Version</th>
                      <th className="p-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBoxes.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                          Không tìm thấy thùng hồ sơ nào phù hợp bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredBoxes.map(box => (
                        <tr key={box.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900 text-xs">
                            {box.boxCode}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800">{box.warehouse?.name}</div>
                            <div className="text-[11px] text-slate-400">{box.unit?.name} ({box.unit?.code})</div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-800">
                            {box.docType?.name}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {box.year}
                          </td>
                          <td className="p-3.5 font-mono text-blue-700 font-bold">
                            {box.locationShelf || <span className="text-slate-400 font-normal italic">Chưa xếp kệ</span>}
                          </td>
                          <td className="p-3.5">
                            {getStatusBadge(box.status)}
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700">
                            {box.documents?.length || 0}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-500">
                            v{box.version}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBoxDetail(box)}
                              className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px]"
                            >
                              Chi Tiết
                            </button>
                            <button
                              onClick={() => setSelectedBoxForBarcode(box)}
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded font-semibold text-[11px] inline-flex items-center space-x-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>In Nhãn</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: INVENTORY TICKETS                                         */}
        {/* ============================================================== */}
        {activeTab === 'TICKETS' && (
          <TicketManager
            tickets={dbState.inventoryTickets}
            boxes={dbState.boxes}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: BORROW & RETURN                                           */}
        {/* ============================================================== */}
        {activeTab === 'BORROW' && (
          <BorrowManager
            borrowRecords={dbState.borrowRecords}
            boxes={dbState.boxes}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: DESTRUCTION                                               */}
        {/* ============================================================== */}
        {activeTab === 'DESTRUCTION' && (
          <DestructionManager
            batches={dbState.destructionBatches}
            boxes={boxesWithRelations}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: EXCEL IMPORT WIZARD                                       */}
        {/* ============================================================== */}
        {activeTab === 'EXCEL_IMPORT' && (
          <ExcelImportWizard
            units={dbState.units}
            warehouses={dbState.warehouses}
            documentTypes={dbState.documentTypes}
            currentUser={currentUser}
            onImportComplete={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: CONFLICTS                                                 */}
        {/* ============================================================== */}
        {activeTab === 'CONFLICTS' && (
          <ConflictDesk
            conflicts={dbState.conflicts}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: MASTER DATA                                               */}
        {/* ============================================================== */}
        {activeTab === 'MASTER_DATA' && (
          <MasterDataView
            units={dbState.units}
            warehouses={dbState.warehouses}
            retentionPolicies={dbState.retentionPolicies}
            documentTypes={dbState.documentTypes}
            users={dbState.users}
            currentUser={currentUser}
            boxes={boxesWithRelations}
            onUpdate={refreshData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: AUDIT & BACKUP LOGS                                       */}
        {/* ============================================================== */}
        {activeTab === 'AUDIT_BACKUP' && (
          <AuditBackupView
            auditLogs={dbState.auditLogs}
            backupLogs={dbState.backupLogs}
            currentUser={currentUser}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* MODALS */}
      {showCreateBoxModal && (
        <CreateBoxModal
          units={dbState.units}
          warehouses={dbState.warehouses}
          documentTypes={dbState.documentTypes}
          currentUser={currentUser}
          onClose={() => setShowCreateBoxModal(false)}
          onSuccess={() => {
            setShowCreateBoxModal(false);
            refreshData();
          }}
        />
      )}

      {selectedBoxDetail && (
        <BoxDetailModal
          box={selectedBoxDetail}
          currentUser={currentUser}
          onClose={() => setSelectedBoxDetail(null)}
          onUpdate={refreshData}
        />
      )}

      {selectedBoxForBarcode && (
        <BarcodeModal
          box={selectedBoxForBarcode}
          onClose={() => setSelectedBoxForBarcode(null)}
        />
      )}

      {showMobileModal && (
        <MobileCompanionModal
          currentUser={currentUser}
          onClose={() => setShowMobileModal(false)}
          onDataChanged={refreshData}
        />
      )}
    </div>
  );
}
