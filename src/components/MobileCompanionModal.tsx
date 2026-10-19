import React, { useState, useEffect } from 'react';
import { Box, User, SyncEvent, BoxStatus } from '../types';
import { archiveStore } from '../services/archiveStore';
import {
  Smartphone,
  X,
  Wifi,
  WifiOff,
  QrCode,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  CheckCircle2,
  ListPlus,
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';

interface MobileCompanionModalProps {
  currentUser: User;
  onClose: () => void;
  onDataChanged: () => void;
}

export const MobileCompanionModal: React.FC<MobileCompanionModalProps> = ({
  currentUser,
  onClose,
  onDataChanged
}) => {
  // Mobile device state
  const [deviceCode] = useState('MOB-ZBR-TC26-01');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [localSnapshot, setLocalSnapshot] = useState<Box[]>([]);
  const [lastPullTime, setLastPullTime] = useState<string | null>(null);

  // Local Offline Event Queue (Simulating SQLite queue on Mobile device)
  const [eventQueue, setEventQueue] = useState<SyncEvent[]>([]);

  // Barcode Scanning / Manual Input state
  const [scannedCode, setScannedCode] = useState('');
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [newShelfLocation, setNewShelfLocation] = useState('');
  const [newBoxStatus, setNewBoxStatus] = useState<BoxStatus>(BoxStatus.IN_STOCK);
  const [actionNote, setActionNote] = useState('');

  // Sync results state
  const [syncFeedback, setSyncFeedback] = useState<{
    processed: number;
    conflicts: number;
    results: any[];
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial pull on mount
  useEffect(() => {
    handlePullSnapshot();
  }, []);

  const handlePullSnapshot = () => {
    const snapshot = archiveStore.pullMobileSnapshot(currentUser);
    setLocalSnapshot(snapshot.boxes);
    setLastPullTime(new Date().toLocaleTimeString('vi-VN'));
    setSyncFeedback(null);
  };

  const handleSelectBoxToScan = (box: Box) => {
    setSelectedBox(box);
    setScannedCode(box.boxCode);
    setNewShelfLocation(box.locationShelf || '');
    setNewBoxStatus(box.status);
    setActionNote('');
  };

  // Add offline action to event queue
  const handleQueueOfflineAction = () => {
    if (!selectedBox) return;

    const newEvent: SyncEvent = {
      eventId: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceCode,
      userId: currentUser.id,
      actionType: 'UPDATE_LOCATION',
      boxId: selectedBox.id,
      boxCode: selectedBox.boxCode,
      expectedVersion: selectedBox.version, // Capture snapshot version
      payload: {
        locationShelf: newShelfLocation.trim() || undefined,
        status: newBoxStatus,
        note: actionNote.trim() || undefined,
        scannedAt: new Date().toISOString()
      },
      clientTimestamp: new Date().toISOString()
    };

    setEventQueue([...eventQueue, newEvent]);

    // Optimistically update local mobile snapshot preview
    setLocalSnapshot(prev =>
      prev.map(b => (b.id === selectedBox.id ? {
        ...b,
        locationShelf: newShelfLocation.trim() || b.locationShelf,
        status: newBoxStatus
      } : b))
    );

    setSelectedBox(null);
    setScannedCode('');
    setNewShelfLocation('');
    setActionNote('');
  };

  // Simulate concurrent modification on Server to TEST OPTIMISTIC LOCKING CONFLICT!
  const handleSimulateConflictOnServer = () => {
    if (!selectedBox) return;
    // Direct change on server DB without mobile knowing!
    const serverBoxes = archiveStore.getState().boxes;
    const targetBox = serverBoxes.find(b => b.id === selectedBox.id);
    if (targetBox) {
      targetBox.version += 1;
      targetBox.locationShelf = 'SERVER-MODIFIED-SHELF-99';
      targetBox.updatedAt = new Date().toISOString();
      archiveStore.addAuditLog({
        userId: 'usr-admin',
        action: 'WEB_CONCURRENT_UPDATE_SIMULATION',
        targetTable: 'boxes',
        targetId: targetBox.id,
        beforeData: null,
        afterData: { note: 'Giả lập một nhân viên khác sửa vị trí trên máy tính trước' },
        source: 'WEB' as any
      });
      alert(`[MÔ PHỎNG XUNG ĐỘT]: Đã tăng version của ${targetBox.boxCode} trên Server từ v${targetBox.version - 1} lên v${targetBox.version}. Mobile hiện vẫn giữ expectedVersion=v${selectedBox.version}. Khi bấm Đẩy Sự Kiện (Push Events), hệ thống sẽ phát hiện sai lệch và cắm cờ CONFLICT!`);
      onDataChanged();
    }
  };

  // Push Offline Events to Server
  const handlePushEvents = () => {
    if (eventQueue.length === 0) return;
    setIsSyncing(true);

    setTimeout(() => {
      const res = archiveStore.processMobileSyncEvents(eventQueue, currentUser);
      setSyncFeedback({
        processed: res.processedCount,
        conflicts: res.conflictCount,
        results: res.results
      });

      // Clear synced queue
      setEventQueue([]);
      setIsSyncing(false);

      // Re-pull fresh snapshot
      handlePullSnapshot();
      onDataChanged();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      {/* Phone container */}
      <div className="bg-slate-950 text-slate-100 rounded-[38px] p-4 shadow-2xl border-4 border-slate-700 max-w-sm w-full h-[90vh] max-h-[780px] flex flex-col relative overflow-hidden">
        {/* Phone Notch & Speaker */}
        <div className="w-32 h-5 bg-slate-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center relative">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-3 border border-slate-700" />
        </div>

        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[11px] px-3 pb-2 text-slate-400 border-b border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono font-semibold text-slate-200">{deviceCode}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                isOfflineMode
                  ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
              title="Chuyển chế độ Online / Ngoại tuyến để thử nghiệm"
            >
              {isOfflineMode ? <WifiOff className="w-3 h-3 text-rose-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
              <span>{isOfflineMode ? 'OFFLINE' : 'ONLINE LAN'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Controls Bar */}
        <div className="p-2.5 bg-slate-900/90 rounded-xl my-2 flex items-center justify-between border border-slate-800 text-xs">
          <div className="leading-tight">
            <span className="text-[10px] text-slate-400 block">Snapshot: {localSnapshot.length} thùng</span>
            <span className="text-[10px] text-slate-500 font-mono">Sync: {lastPullTime || '--'}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePullSnapshot}
              disabled={isOfflineMode}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium border ${
                isOfflineMode
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
              title="Kéo snapshot mới nhất từ Server"
            >
              <ArrowDownCircle className="w-3 h-3 text-blue-400" />
              <span>Pull</span>
            </button>

            <button
              onClick={handlePushEvents}
              disabled={eventQueue.length === 0 || isOfflineMode || isSyncing}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                eventQueue.length > 0 && !isOfflineMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-900/40 animate-pulse'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
              title="Đẩy các hành động offline lên Server"
            >
              {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowUpCircle className="w-3 h-3 text-emerald-300" />}
              <span>Push ({eventQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Mobile Screen Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-slate-200">
          {/* Barcode Scanner / Picker */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Quét Mã Thùng (Barcode)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Laser Scanner Ready</span>
            </div>

            {/* Simulated fast scan quick dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400">Chọn thùng cần kiểm kê / di chuyển:</label>
              <select
                value={selectedBox?.id || ''}
                onChange={e => {
                  const b = localSnapshot.find(x => x.id === e.target.value);
                  if (b) handleSelectBoxToScan(b);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Bấm để mô phỏng quét mã thùng --</option>
                {localSnapshot.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.boxCode} ({b.locationShelf || 'Chưa kệ'}) [v{b.version}]
                  </option>
                ))}
              </select>
            </div>

            {selectedBox && (
              <div className="mt-3 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-300">{selectedBox.boxCode}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    Local: v{selectedBox.version}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Vị trí hiện tại: <span className="font-mono text-white">{selectedBox.locationShelf || 'Chưa kệ'}</span>
                </div>

                {/* Shelf Update */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Quét / Nhập vị trí kệ mới:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: K1-A-02-09"
                    value={newShelfLocation}
                    onChange={e => setNewShelfLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Trạng thái vật lý:
                  </label>
                  <select
                    value={newBoxStatus}
                    onChange={e => setNewBoxStatus(e.target.value as BoxStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={BoxStatus.IN_STOCK}>IN_STOCK (Trong kho)</option>
                    <option value={BoxStatus.BORROWED}>BORROWED (Đang mượn)</option>
                    <option value={BoxStatus.TRANSITING}>TRANSITING (Đang luân chuyển)</option>
                    <option value={BoxStatus.NEEDS_REVIEW}>NEEDS_REVIEW (Cần kiểm tra)</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={handleQueueOfflineAction}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-2 rounded text-xs flex items-center justify-center space-x-1"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Lưu vào Hàng Đợi Offline</span>
                  </button>

                  {/* Conflict simulation button */}
                  <button
                    type="button"
                    onClick={handleSimulateConflictOnServer}
                    className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-600/50 py-1.5 px-2 rounded text-[10px] font-bold"
                    title="Mô phỏng trường hợp server bị đổi version trước để thử nghiệm xung đột"
                  >
                    <Zap className="w-3 h-3 inline mr-1 text-amber-400" />
                    Gây Xung Đột
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Feedback Result Banner */}
          {syncFeedback && (
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              syncFeedback.conflicts > 0
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center">
                  {syncFeedback.conflicts > 0 ? (
                    <AlertTriangle className="w-4 h-4 mr-1 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                  )}
                  Kết quả Đồng Bộ Server
                </span>
                <span>Thành công: {syncFeedback.processed} | Xung đột: {syncFeedback.conflicts}</span>
              </div>
              <div className="space-y-1 text-[11px] max-h-28 overflow-y-auto">
                {syncFeedback.results.map((r, i) => (
                  <div key={i} className={`p-1.5 rounded ${r.status === 'CONFLICT' ? 'bg-rose-900/60' : 'bg-emerald-900/40'}`}>
                    <span className="font-mono font-bold">{r.boxCode}: </span>
                    <span>{r.message}</span>
                  </div>
                ))}
              </div>
              {syncFeedback.conflicts > 0 && (
                <p className="text-[10px] text-amber-300 font-semibold pt-1">
                  Đã lưu sự kiện xung đột vào "Bàn Đối Soát Xung Đột" trên Web Admin để kiểm tra tay!
                </p>
              )}
            </div>
          )}

          {/* Local Event Queue (SQLite Simulator) */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center">
                <ListPlus className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Hàng Đợi Offline ({eventQueue.length})
              </span>
              {eventQueue.length > 0 && (
                <button
                  onClick={() => setEventQueue([])}
                  className="text-[10px] text-rose-400 hover:text-rose-300"
                >
                  Xóa hàng đợi
                </button>
              )}
            </div>

            {eventQueue.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-[11px] italic">
                Hàng đợi trống. Quét mã thùng và thực hiện thao tác ngoại tuyến để tích lũy sự kiện.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {eventQueue.map((ev, idx) => (
                  <div key={ev.eventId} className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-emerald-400">{ev.boxCode}</span>
                      <span className="text-slate-400 text-[10px]">expVer: v{ev.expectedVersion}</span>
                    </div>
                    <div className="text-slate-300 text-[10px] mt-0.5">
                      Kệ mới: <span className="font-mono text-blue-300">{ev.payload.locationShelf || '--'}</span> | Trạng thái: {ev.payload.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
