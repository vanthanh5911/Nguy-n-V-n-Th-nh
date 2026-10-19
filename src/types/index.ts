export enum Role {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF',
  APPROVER = 'APPROVER',
  VIEWER = 'VIEWER',
}

export enum BoxStatus {
  IN_STOCK = 'IN_STOCK', // Xanh lá - Trong kho
  BORROWED = 'BORROWED', // Vàng - Đang mượn
  TRANSITING = 'TRANSITING', // Xanh dương - Đang luân chuyển
  PENDING_DESTROY = 'PENDING_DESTROY', // Cam - Chờ tiêu hủy
  DESTROYED = 'DESTROYED', // Xám - Đã tiêu hủy
  NEEDS_REVIEW = 'NEEDS_REVIEW', // Đỏ cam - Cần kiểm tra
}

export enum TicketType {
  IMPORT = 'IMPORT', // Nhập kho
  EXPORT = 'EXPORT', // Xuất kho
  TRANSFER = 'TRANSFER', // Chuyển kho / Chuyển giá kệ
  BORROW = 'BORROW', // Mượn hồ sơ
  RETURN = 'RETURN', // Trả hồ sơ
  DESTROY_EXPORT = 'DESTROY_EXPORT', // Xuất tiêu hủy
}

export enum TicketStatus {
  DRAFT = 'DRAFT', // Nháp
  CONFIRMED = 'CONFIRMED', // Đã duyệt / Xác nhận (làm thay đổi kho)
  VOID = 'VOID', // Đã hủy (không xóa cứng)
}

export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export enum DestructionBatchStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVE = 'PENDING_APPROVE',
  APPROVED = 'APPROVED',
  EXECUTED = 'EXECUTED',
  REJECTED = 'REJECTED',
}

export enum AuditSource {
  WEB = 'WEB',
  MOBILE_SYNC = 'MOBILE_SYNC',
  IMPORT = 'IMPORT',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export enum BackupStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface Unit {
  id: string;
  code: string; // VD: HY, HN, HCM, DN
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  unitId: string;
  code: string; // VD: K1, K2, K3
  name: string;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  durationYears: number | null; // null if permanent
  isPermanent: boolean;
  legalBasis?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  id: string;
  code: string; // VD: TT (Thanh toán), KT (Kế toán), NS (Nhân sự), HD (Hợp đồng)
  name: string;
  retentionPolicyId?: string | null;
  createdAt: string;
  updatedAt: string;
  retentionPolicy?: RetentionPolicy | null;
}

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  fullName: string;
  role: Role;
  scopeUnits: string[];
  scopeWarehouses: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Box {
  id: string;
  boxCode: string; // {Mã Đơn Vị}-{Mã Loại Hồ Sơ}-{Năm}-{Mã Kho}-{Số Thứ Tự} (VD: HY-TT-26-K1-003)
  unitId: string;
  warehouseId: string;
  docTypeId: string;
  year: number;
  locationShelf?: string | null; // Vị trí giá/kệ động
  status: BoxStatus;
  version: number; // Optimistic locking
  createdAt: string;
  updatedAt: string;

  unit?: Unit;
  warehouse?: Warehouse;
  docType?: DocumentType;
  documents?: Document[];
  ticketDetails?: TicketDetail[];
  borrowRecords?: BorrowRecord[];
  destructionItems?: DestructionItem[];
}

export interface Document {
  id: string;
  boxId: string;
  docCode?: string | null;
  title: string;
  documentDate?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  box?: Box;
}

export interface InventoryTicket {
  id: string;
  ticketCode: string; // VD: PNK-2026-001, PXK-2026-002, PCK-2026-003
  type: TicketType;
  status: TicketStatus;
  note?: string | null;
  createdBy: string;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  creator?: User;
  confirmer?: User | null;
  details: TicketDetail[];
}

export interface TicketDetail {
  id: string;
  ticketId: string;
  boxId: string;
  fromShelf?: string | null;
  toShelf?: string | null;
  note?: string | null;
  box?: Box;
}

export interface BorrowRecord {
  id: string;
  boxId: string;
  documentId?: string | null;
  borrowerName: string;
  borrowerDepartment: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  returnCondition?: string | null;
  status: BorrowStatus;
  createdAt: string;
  updatedAt: string;

  box?: Box;
  document?: Document | null;
}

export interface DestructionBatch {
  id: string;
  batchCode: string; // VD: LTH-2026-001
  status: DestructionBatchStatus;
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  executedAt?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;

  creator?: User;
  approver?: User | null;
  items: DestructionItem[];
}

export interface DestructionItem {
  id: string;
  batchId: string;
  boxId: string;
  reason?: string | null;
  box?: Box;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  targetTable: string;
  targetId?: string | null;
  beforeData?: any | null;
  afterData?: any | null;
  source: AuditSource;
  ipAddress?: string | null;
  createdAt: string;
  user?: User | null;
}

export interface MobileDevice {
  id: string;
  deviceCode: string;
  userId: string;
  deviceName?: string | null;
  status: DeviceStatus;
  lastSyncAt?: string | null;
  createdAt: string;
  user?: User;
}

export interface BackupLog {
  id: string;
  filename: string;
  fileSize: number;
  checksum: string;
  status: BackupStatus;
  logDetail?: string | null;
  createdAt: string;
}

// Mobile Sync Models
export interface SyncEvent {
  eventId: string;
  deviceCode: string;
  userId: string;
  actionType: 'UPDATE_LOCATION' | 'QUICK_CHECK' | 'CHANGE_STATUS';
  boxId: string;
  boxCode: string;
  expectedVersion: number;
  payload: {
    locationShelf?: string;
    status?: BoxStatus;
    note?: string;
    scannedAt?: string;
  };
  clientTimestamp: string;
}

export interface SyncConflictRecord {
  id: string;
  eventId: string;
  deviceCode: string;
  userId: string;
  userName?: string;
  boxId: string;
  boxCode: string;
  expectedVersion: number;
  currentServerVersion: number;
  attemptedPayload: any;
  currentServerData: any;
  status: 'PENDING_REVIEW' | 'RESOLVED_OVERRIDE' | 'DISCARDED';
  conflictReason: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}
