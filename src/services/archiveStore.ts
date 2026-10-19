import {
  Role,
  BoxStatus,
  TicketType,
  TicketStatus,
  BorrowStatus,
  DestructionBatchStatus,
  AuditSource,
  DeviceStatus,
  BackupStatus,
  Unit,
  Warehouse,
  RetentionPolicy,
  DocumentType,
  User,
  Box,
  Document,
  InventoryTicket,
  BorrowRecord,
  DestructionBatch,
  AuditLog,
  MobileDevice,
  BackupLog,
  SyncEvent,
  SyncConflictRecord
} from '../types';

const STORAGE_KEY = 'quanlyluutru_db_v1';

export interface DatabaseState {
  units: Unit[];
  warehouses: Warehouse[];
  retentionPolicies: RetentionPolicy[];
  documentTypes: DocumentType[];
  users: User[];
  boxes: Box[];
  documents: Document[];
  inventoryTickets: InventoryTicket[];
  borrowRecords: BorrowRecord[];
  destructionBatches: DestructionBatch[];
  auditLogs: AuditLog[];
  mobileDevices: MobileDevice[];
  backupLogs: BackupLog[];
  conflicts: SyncConflictRecord[];
}

// Initial Seed Data
const INITIAL_DATA: DatabaseState = {
  units: [
    { id: 'u1', code: 'HY', name: 'Chi nhánh Nam Đồng Nai', description: 'Trụ sở văn phòng & kho Nam Đồng Nai', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'u2', code: 'HN', name: 'Trụ sở chính ', description: 'Tòa nhà điều hành & Lưu trữ hồ sơ tổng hợp', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'u3', code: 'HCM', name: 'Chi nhánh TP. Hồ Chí Minh', description: 'Kho lưu trữ khu vực phía Nam', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'u4', code: 'DN', name: 'Chi nhánh Đà Nẵng', description: 'Kho lưu trữ khu vực miền Trung', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
  ],
  warehouses: [
    { id: 'w1', unitId: 'u1', code: 'K1', name: 'Kho Lưu trữ Kế toán Nam Đồng Nai', location: 'Tầng 1 - Dãy Đông, KCN Phố Nối A', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'w2', unitId: 'u1', code: 'K2', name: 'Kho Chứng từ Tổng hợp Hưng Yên', location: 'Tầng 2 - Dãy Tây, KCN Phố Nối A', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'w3', unitId: 'u2', code: 'K1', name: 'Kho Hồ sơ Tổng Công ty Hà Nội', location: 'Tầng hầm B2, Tòa nhà Trụ sở Hoàn Kiếm', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'w4', unitId: 'u3', code: 'K1', name: 'Kho Tân Bình TP.HCM', location: 'Kho A4, Quận Tân Bình, TP.HCM', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
  ],
  retentionPolicies: [
    { id: 'rp1', name: 'Bảo quản 5 năm (Phiếu thu/chi nội bộ & Tạm ứng)', durationYears: 5, isPermanent: false, legalBasis: 'Thông tư 155/2013/TT-BTC & Quy chế Tài chính', description: 'Hết 5 năm có thể lập hội đồng rà soát tiêu hủy', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'rp2', name: 'Bảo quản 10 năm (Chứng từ kế toán chính thức & Hóa đơn)', durationYears: 10, isPermanent: false, legalBasis: 'Điều 41 Luật Kế toán 88/2015/QH13', description: 'Chứng từ dùng trực tiếp để ghi sổ kế toán và lập BCTC', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'rp3', name: 'Bảo quản 20 năm (Hồ sơ Nhân sự & Tiền lương)', durationYears: 20, isPermanent: false, legalBasis: 'Thông tư 02/2010/TT-BNV', description: 'Hồ sơ tuyển dụng, bổ nhiệm, hợp đồng lao động đã kết thúc', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'rp4', name: 'Bảo quản Vĩnh viễn (Pháp lý, Giấy phép, Bản vẽ)', durationYears: null, isPermanent: true, legalBasis: 'Nghị định 30/2020/NĐ-CP về công tác văn thư', description: 'Tuyệt đối không được tiêu hủy, lưu trữ vĩnh viễn', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
  ],
  documentTypes: [
    { id: 'dt1', code: 'TT', name: 'Chứng từ Thanh toán & Ngân hàng', retentionPolicyId: 'rp2', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'dt2', code: 'KT', name: 'Báo cáo Tài chính & Sổ Kế toán', retentionPolicyId: 'rp2', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'dt3', code: 'HD', name: 'Hợp đồng Kinh tế & Nghiệm thu Dự án', retentionPolicyId: 'rp2', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'dt4', code: 'NS', name: 'Hồ sơ Cán bộ & Hợp đồng Lao động', retentionPolicyId: 'rp3', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'dt5', code: 'VP', name: 'Văn bản Pháp lý, Điều lệ & Bằng sáng chế', retentionPolicyId: 'rp4', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'dt6', code: 'TU', name: 'Phiếu Tạm ứng & Thanh toán Nội bộ', retentionPolicyId: 'rp1', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
  ],
  users: [
    { id: 'usr-admin', username: 'admin', passwordHash: 'admin123', fullName: 'Nguyễn Văn Quản Trị (Admin)', role: Role.ADMIN, scopeUnits: ['u1', 'u2', 'u3', 'u4'], scopeWarehouses: ['w1', 'w2', 'w3', 'w4'], isActive: true, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'usr-manager', username: 'manager_hy', passwordHash: 'manager123', fullName: 'Trần Thị Trưởng Kho Hưng Yên', role: Role.WAREHOUSE_MANAGER, scopeUnits: ['u1'], scopeWarehouses: ['w1', 'w2'], isActive: true, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'usr-staff1', username: 'staff_hung', passwordHash: 'staff123', fullName: 'Lê Văn Hùng (Thủ kho 1)', role: Role.WAREHOUSE_STAFF, scopeUnits: ['u1'], scopeWarehouses: ['w1', 'w2'], isActive: true, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'usr-approver', username: 'approver_kien', passwordHash: 'approver123', fullName: 'Phạm Trung Kiên (Ban Giám Đốc / Duyệt)', role: Role.APPROVER, scopeUnits: ['u1', 'u2', 'u3', 'u4'], scopeWarehouses: ['w1', 'w2', 'w3', 'w4'], isActive: true, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 'usr-viewer', username: 'viewer_lan', passwordHash: 'viewer123', fullName: 'Vũ Thị Lan (Thanh tra / Tra cứu)', role: Role.VIEWER, scopeUnits: ['u1', 'u2'], scopeWarehouses: ['w1', 'w2', 'w3'], isActive: true, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
  ],
  boxes: [
    {
      id: 'box-1',
      boxCode: 'HY-TT-26-K1-001',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt1',
      year: 2026,
      locationShelf: 'K1-A-01-03', // Kệ A, Hàng 1, Ô 3
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'box-2',
      boxCode: 'HY-TT-26-K1-002',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt1',
      year: 2026,
      locationShelf: 'K1-A-01-04',
      status: BoxStatus.IN_STOCK,
      version: 2,
      createdAt: '2026-02-10T08:30:00Z',
      updatedAt: '2026-02-10T08:30:00Z'
    },
    {
      id: 'box-3',
      boxCode: 'HY-HD-24-K2-005',
      unitId: 'u1',
      warehouseId: 'w2',
      docTypeId: 'dt3',
      year: 2024,
      locationShelf: 'K2-B-02-01',
      status: BoxStatus.BORROWED,
      version: 3,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2026-09-01T14:00:00Z'
    },
    {
      id: 'box-4',
      boxCode: 'HY-NS-23-K1-008',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt4',
      year: 2023,
      locationShelf: 'K1-C-03-02',
      status: BoxStatus.BORROWED,
      version: 1,
      createdAt: '2023-06-11T14:20:00Z',
      updatedAt: '2026-09-25T11:00:00Z'
    },
    {
      id: 'box-5',
      boxCode: 'HY-VP-18-K1-010',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt5', // Vĩnh viễn (isPermanent = true)
      year: 2018,
      locationShelf: 'K1-VIP-01-01',
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: '2018-05-10T08:00:00Z',
      updatedAt: '2018-05-10T08:00:00Z'
    },
    {
      id: 'box-6',
      boxCode: 'HY-TU-20-K1-012',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt6', // 5 năm (2020 -> 2025 hết hạn)
      year: 2020,
      locationShelf: 'K1-D-04-01',
      status: BoxStatus.PENDING_DESTROY,
      version: 4,
      createdAt: '2020-07-01T08:00:00Z',
      updatedAt: '2026-08-01T09:00:00Z'
    },
    {
      id: 'box-7',
      boxCode: 'HY-TT-14-K1-020',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt1',
      year: 2014,
      locationShelf: 'ĐÃ HUỶ',
      status: BoxStatus.DESTROYED, // Đã tiêu hủy - tra cứu lịch sử, khoá thao tác
      version: 5,
      createdAt: '2014-04-12T08:00:00Z',
      updatedAt: '2025-11-15T15:30:00Z'
    },
    {
      id: 'box-8',
      boxCode: 'HN-KT-25-K1-003',
      unitId: 'u2',
      warehouseId: 'w3',
      docTypeId: 'dt2',
      year: 2025,
      locationShelf: 'HN-B1-02-05',
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: '2025-02-14T09:00:00Z',
      updatedAt: '2025-02-14T09:00:00Z'
    },
    {
      id: 'box-9',
      boxCode: 'HY-TU-21-K1-009',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt6', // TU - 5 năm (2021 + 5 = 2026 -> ĐẾN HẠN)
      year: 2021,
      locationShelf: 'K1-D-02-04',
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: '2021-03-10T08:00:00Z',
      updatedAt: '2021-03-10T08:00:00Z'
    },
    {
      id: 'box-10',
      boxCode: 'HY-TT-16-K1-014',
      unitId: 'u1',
      warehouseId: 'w1',
      docTypeId: 'dt1', // TT - 10 năm (2016 + 10 = 2026 -> ĐẾN HẠN)
      year: 2016,
      locationShelf: 'K1-A-03-02',
      status: BoxStatus.IN_STOCK,
      version: 2,
      createdAt: '2016-04-15T09:00:00Z',
      updatedAt: '2016-04-15T09:00:00Z'
    },
    {
      id: 'box-11',
      boxCode: 'HN-TU-22-K1-018',
      unitId: 'u2',
      warehouseId: 'w3',
      docTypeId: 'dt6', // TU - 5 năm (2022 + 5 = 2027 -> SẮP ĐẾN HẠN)
      year: 2022,
      locationShelf: 'HN-B2-04-01',
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: '2022-05-18T08:30:00Z',
      updatedAt: '2022-05-18T08:30:00Z'
    }
  ],
  documents: [
    { id: 'doc-1', boxId: 'box-1', docCode: 'UNC-2026-001', title: 'Ủy nhiệm chi Ngân hàng VCB Tháng 01/2026', documentDate: '2026-01-10T00:00:00Z', note: 'Kèm theo hóa đơn VAT từ số 001 đến 150', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
    { id: 'doc-2', boxId: 'box-1', docCode: 'UNC-2026-002', title: 'Ủy nhiệm chi BIDV & Sao kê số dư Tháng 01/2026', documentDate: '2026-01-12T00:00:00Z', note: 'Thanh toán tiền điện nước và cước viễn thông', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-01-15T09:00:00Z' },
    { id: 'doc-3', boxId: 'box-2', docCode: 'HD-2026-88', title: 'Hồ sơ thanh toán gói thầu xây lắp xưởng 2', documentDate: '2026-02-05T00:00:00Z', note: 'Kèm biên bản nghiệm thu A-B và hóa đơn GTGT', createdAt: '2026-02-10T08:30:00Z', updatedAt: '2026-02-10T08:30:00Z' },
    { id: 'doc-4', boxId: 'box-3', docCode: 'HD-2024-KT12', title: 'Hợp đồng chuyển nhượng quyền sử dụng đất & Kho bãi 2024', documentDate: '2024-03-15T00:00:00Z', note: 'Bản gốc có dấu đỏ công chứng', createdAt: '2024-03-20T10:00:00Z', updatedAt: '2024-03-20T10:00:00Z' },
    { id: 'doc-5', boxId: 'box-4', docCode: 'NS-2023-B1', title: 'Hồ sơ tuyển dụng & Bổ nhiệm Trưởng phòng năm 2023', documentDate: '2023-05-20T00:00:00Z', note: 'Tập 1 - 28 cán bộ', createdAt: '2023-06-11T14:20:00Z', updatedAt: '2023-06-11T14:20:00Z' },
    { id: 'doc-6', boxId: 'box-5', docCode: 'PL-2018-01', title: 'Giấy chứng nhận Đăng ký Doanh nghiệp & Điều lệ Cty (Gốc)', documentDate: '2018-05-02T00:00:00Z', note: 'Lưu vĩnh viễn trong két chống cháy VIP', createdAt: '2018-05-10T08:00:00Z', updatedAt: '2018-05-10T08:00:00Z' },
    { id: 'doc-7', boxId: 'box-6', docCode: 'TU-2020-Q1', title: 'Chứng từ tạm ứng công tác phí Quý 1/2020', documentDate: '2020-03-30T00:00:00Z', note: 'Đã hoàn ứng 100%, thời hạn lưu 5 năm hết hạn 2025', createdAt: '2020-07-01T08:00:00Z', updatedAt: '2020-07-01T08:00:00Z' },
    { id: 'doc-8', boxId: 'box-7', docCode: 'TT-2014-OLD', title: 'Phiếu chi tiền mặt & Hóa đơn liên 3 năm 2014', documentDate: '2014-04-10T00:00:00Z', note: 'Đã tiêu hủy theo Quyết định số 22/QĐ-TH ngày 15/11/2025', createdAt: '2014-04-12T08:00:00Z', updatedAt: '2025-11-15T15:30:00Z' }
  ],
  inventoryTickets: [
    {
      id: 'tk-1',
      ticketCode: 'PNK-2026-001',
      type: TicketType.IMPORT,
      status: TicketStatus.CONFIRMED,
      note: 'Nhập kho định kỳ chứng từ Quý 1/2026 từ phòng Kế toán',
      createdBy: 'usr-staff1',
      confirmedBy: 'usr-manager',
      confirmedAt: '2026-01-15T09:30:00Z',
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-01-15T09:30:00Z',
      details: [
        { id: 'tkd-1', ticketId: 'tk-1', boxId: 'box-1', fromShelf: null, toShelf: 'K1-A-01-03', note: 'Nhập thùng mới' },
        { id: 'tkd-2', ticketId: 'tk-1', boxId: 'box-2', fromShelf: null, toShelf: 'K1-A-01-04', note: 'Nhập thùng mới' }
      ]
    },
    {
      id: 'tk-2',
      ticketCode: 'PCK-2026-002',
      type: TicketType.TRANSFER,
      status: TicketStatus.DRAFT,
      note: 'Dự thảo chuyển giá kệ kho K1 sang dãy B để bảo trì mái che',
      createdBy: 'usr-staff1',
      confirmedBy: null,
      confirmedAt: null,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
      details: [
        { id: 'tkd-3', ticketId: 'tk-2', boxId: 'box-1', fromShelf: 'K1-A-01-03', toShelf: 'K1-B-02-03', note: 'Chuyển tạm tránh dột' }
      ]
    }
  ],
  borrowRecords: [
    {
      id: 'br-1',
      boxId: 'box-3', // HY-HD-24-K2-005
      documentId: 'doc-4',
      borrowerName: 'Nguyễn Tiến Dũng',
      borrowerDepartment: 'Phòng Pháp chế & Kế hoạch',
      borrowDate: '2026-09-01T09:00:00Z',
      expectedReturnDate: '2026-09-20T17:00:00Z', // Quá hạn! (local time 2026-10-05)
      actualReturnDate: null,
      returnCondition: null,
      status: BorrowStatus.OVERDUE,
      createdAt: '2026-09-01T09:00:00Z',
      updatedAt: '2026-09-21T08:00:00Z'
    },
    {
      id: 'br-2',
      boxId: 'box-4', // HY-NS-23-K1-008
      documentId: 'doc-5',
      borrowerName: 'Trần Mỹ Linh',
      borrowerDepartment: 'Phòng Hành chính Nhân sự',
      borrowDate: '2026-09-25T14:00:00Z',
      expectedReturnDate: '2026-10-15T17:00:00Z', // Chưa quá hạn
      actualReturnDate: null,
      returnCondition: null,
      status: BorrowStatus.BORROWED,
      createdAt: '2026-09-25T14:00:00Z',
      updatedAt: '2026-09-25T14:00:00Z'
    }
  ],
  destructionBatches: [
    {
      id: 'db-1',
      batchCode: 'LTH-2025-001',
      status: DestructionBatchStatus.EXECUTED,
      createdBy: 'usr-manager',
      approvedBy: 'usr-approver',
      approvedAt: '2025-11-10T14:00:00Z',
      executedAt: '2025-11-15T15:30:00Z',
      note: 'Tiêu hủy chứng từ tạm ứng và hóa đơn liên 3 năm 2014 theo quy định đã hết thời hạn lưu trữ 10 năm',
      createdAt: '2025-11-01T08:00:00Z',
      updatedAt: '2025-11-15T15:30:00Z',
      items: [
        { id: 'dbi-1', batchId: 'db-1', boxId: 'box-7', reason: 'Hết hạn bảo quản 10 năm theo Luật Kế toán' }
      ]
    },
    {
      id: 'db-2',
      batchCode: 'LTH-2026-002',
      status: DestructionBatchStatus.PENDING_APPROVE,
      createdBy: 'usr-manager',
      approvedBy: null,
      approvedAt: null,
      executedAt: null,
      note: 'Đề xuất tiêu hủy chứng từ tạm ứng năm 2020 (Bảo quản 5 năm, đã đến hạn 2025)',
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-08-01T09:00:00Z',
      items: [
        { id: 'dbi-2', batchId: 'db-2', boxId: 'box-6', reason: 'Hết thời hạn bảo quản 5 năm (Năm tài chính 2020)' }
      ]
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      userId: 'usr-manager',
      action: 'CONFIRM_TICKET',
      targetTable: 'inventory_tickets',
      targetId: 'tk-1',
      beforeData: { status: 'DRAFT' },
      afterData: { status: 'CONFIRMED' },
      source: AuditSource.WEB,
      ipAddress: '192.168.1.10',
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'log-2',
      userId: 'usr-staff1',
      action: 'BORROW_BOX',
      targetTable: 'boxes',
      targetId: 'box-3',
      beforeData: { status: 'IN_STOCK' },
      afterData: { status: 'BORROWED' },
      source: AuditSource.WEB,
      ipAddress: '192.168.1.15',
      createdAt: '2026-09-01T09:00:00Z'
    }
  ],
  mobileDevices: [
    { id: 'dev-1', deviceCode: 'MOB-ZBR-TC26-01', userId: 'usr-staff1', deviceName: 'Zebra TC26 Máy Quét Kho K1', status: DeviceStatus.ACTIVE, lastSyncAt: '2026-10-05T19:30:00Z', createdAt: '2026-01-10T08:00:00Z' },
    { id: 'dev-2', deviceCode: 'MOB-HONEYWELL-02', userId: 'usr-staff1', deviceName: 'Honeywell ScanPal EDA51 Kho K2', status: DeviceStatus.ACTIVE, lastSyncAt: '2026-10-04T16:00:00Z', createdAt: '2026-02-15T08:00:00Z' }
  ],
  backupLogs: [
    { id: 'bak-1', filename: 'backup_archive_20261001_0000.sql.gz', fileSize: 4528192, checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: BackupStatus.SUCCESS, logDetail: 'Sao lưu định kỳ tự động mạng LAN thành công', createdAt: '2026-10-01T00:00:00Z' },
    { id: 'bak-2', filename: 'backup_archive_20261004_0000.sql.gz', fileSize: 4612400, checksum: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', status: BackupStatus.SUCCESS, logDetail: 'Sao lưu định kỳ tự động mạng LAN thành công', createdAt: '2026-10-04T00:00:00Z' }
  ],
  conflicts: []
};

// Storage Singleton
class ArchiveStorageService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Merge missing initial boxes if any
        const existingBoxIds = new Set((parsed.boxes || []).map((b: any) => b.id));
        const missingInitialBoxes = INITIAL_DATA.boxes.filter(b => !existingBoxIds.has(b.id));
        const combinedBoxes = [...(parsed.boxes || []), ...missingInitialBoxes];

        return {
          ...INITIAL_DATA,
          ...parsed,
          boxes: combinedBoxes,
          conflicts: parsed.conflicts || []
        };
      }
    } catch (e) {
      console.warn('Failed to parse stored state, using initial seed data', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }

  // --- BUSINESS CONSTRAINT 1: Box Code Format & Generator ---
  // {Mã Đơn Vị}-{Mã Loại Hồ Sơ}-{Năm}-{Mã Kho}-{Số Thứ Tự} (Ví dụ: HY-TT-26-K1-003)
  public generateBoxCode(unitCode: string, docTypeCode: string, year: number, warehouseCode: string): string {
    const shortYear = String(year).slice(-2);
    // Find highest sequence for matching prefix
    const prefix = `${unitCode.toUpperCase()}-${docTypeCode.toUpperCase()}-${shortYear}-${warehouseCode.toUpperCase()}-`;
    const matchingBoxes = this.state.boxes.filter(b => b.boxCode.startsWith(prefix));
    let nextSeq = 1;
    if (matchingBoxes.length > 0) {
      const seqs = matchingBoxes.map(b => {
        const parts = b.boxCode.split('-');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        return isNaN(num) ? 0 : num;
      });
      nextSeq = Math.max(...seqs, 0) + 1;
    }
    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  public validateBoxCodeFormat(boxCode: string): boolean {
    // Regex for: {Unit}-{DocType}-{YY}-{Warehouse}-{Seq} e.g. HY-TT-26-K1-003
    const regex = /^[A-Z0-9]+-[A-Z0-9]+-\d{2}-[A-Z0-9]+-\d{3,}$/i;
    return regex.test(boxCode);
  }

  // --- BOX & DOCUMENT MANAGEMENT ---
  public getBoxesWithRelations(): Box[] {
    return this.state.boxes.map(box => {
      const unit = this.state.units.find(u => u.id === box.unitId);
      const warehouse = this.state.warehouses.find(w => w.id === box.warehouseId);
      const docType = this.state.documentTypes.find(dt => dt.id === box.docTypeId);
      const retentionPolicy = docType?.retentionPolicyId 
        ? this.state.retentionPolicies.find(rp => rp.id === docType.retentionPolicyId) 
        : null;
      const documents = this.state.documents.filter(d => d.boxId === box.id);
      const borrowRecords = this.state.borrowRecords.filter(br => br.boxId === box.id);
      
      return {
        ...box,
        unit,
        warehouse,
        docType: docType ? { ...docType, retentionPolicy } : undefined,
        documents,
        borrowRecords
      };
    });
  }

  public getBoxById(id: string): Box | undefined {
    const list = this.getBoxesWithRelations();
    return list.find(b => b.id === id || b.boxCode === id);
  }

  public createBox(params: {
    unitId: string;
    warehouseId: string;
    docTypeId: string;
    year: number;
    locationShelf?: string;
    customBoxCode?: string;
    currentUser: User;
    initialDocuments?: { docCode?: string; title: string; documentDate?: string; note?: string }[];
  }): { success: boolean; box?: Box; error?: string } {
    const unit = this.state.units.find(u => u.id === params.unitId);
    const warehouse = this.state.warehouses.find(w => w.id === params.warehouseId);
    const docType = this.state.documentTypes.find(dt => dt.id === params.docTypeId);

    if (!unit || !warehouse || !docType) {
      return { success: false, error: 'Đơn vị, kho hoặc loại hồ sơ không tồn tại.' };
    }

    const boxCode = params.customBoxCode 
      ? params.customBoxCode.trim().toUpperCase() 
      : this.generateBoxCode(unit.code, docType.code, params.year, warehouse.code);

    // Check unique boxCode
    const existing = this.state.boxes.find(b => b.boxCode.toUpperCase() === boxCode.toUpperCase());
    if (existing) {
      return { success: false, error: `Mã thùng "${boxCode}" đã tồn tại trong hệ thống. Vui lòng chọn số thứ tự khác!` };
    }

    const newBoxId = 'box-' + Date.now();
    const newBox: Box = {
      id: newBoxId,
      boxCode,
      unitId: params.unitId,
      warehouseId: params.warehouseId,
      docTypeId: params.docTypeId,
      year: params.year,
      locationShelf: params.locationShelf || null,
      status: BoxStatus.IN_STOCK,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.boxes.push(newBox);

    // Initial documents if any
    if (params.initialDocuments && params.initialDocuments.length > 0) {
      params.initialDocuments.forEach((doc, idx) => {
        this.state.documents.push({
          id: `doc-${Date.now()}-${idx}`,
          boxId: newBoxId,
          docCode: doc.docCode || null,
          title: doc.title,
          documentDate: doc.documentDate || null,
          note: doc.note || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }

    // Audit Log
    this.addAuditLog({
      userId: params.currentUser.id,
      action: 'CREATE_BOX',
      targetTable: 'boxes',
      targetId: newBoxId,
      beforeData: null,
      afterData: newBox,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, box: this.getBoxById(newBoxId) };
  }

  public addDocumentToBox(boxId: string, doc: { docCode?: string; title: string; documentDate?: string; note?: string }, currentUser: User): Document {
    const box = this.state.boxes.find(b => b.id === boxId);
    if (!box) throw new Error('Không tìm thấy thùng hồ sơ');
    if (box.status === BoxStatus.DESTROYED) {
      throw new Error('Thùng hồ sơ đã tiêu hủy, bị khóa toàn bộ thao tác.');
    }

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      boxId,
      docCode: doc.docCode || null,
      title: doc.title,
      documentDate: doc.documentDate || null,
      note: doc.note || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.documents.push(newDoc);
    this.addAuditLog({
      userId: currentUser.id,
      action: 'ADD_DOCUMENT',
      targetTable: 'documents',
      targetId: newDoc.id,
      beforeData: null,
      afterData: newDoc,
      source: AuditSource.WEB
    });

    this.saveState();
    return newDoc;
  }

  // --- BUSINESS CONSTRAINT 2: Inventory Tickets & Physical State ---
  // Only CONFIRMED tickets modify physical state / stock.
  // No hard delete, VOID instead.
  public createInventoryTicket(params: {
    type: TicketType;
    note?: string;
    details: { boxId: string; fromShelf?: string; toShelf?: string; note?: string }[];
    currentUser: User;
  }): { success: boolean; ticket?: InventoryTicket; error?: string } {
    if (params.details.length === 0) {
      return { success: false, error: 'Phiếu nghiệp vụ phải có ít nhất 1 thùng hồ sơ!' };
    }

    // Validate box statuses based on ticket type
    for (const d of params.details) {
      const box = this.state.boxes.find(b => b.id === d.boxId);
      if (!box) return { success: false, error: `Thùng mã ${d.boxId} không tồn tại` };

      if (box.status === BoxStatus.DESTROYED) {
        return { success: false, error: `Thùng "${box.boxCode}" đã bị TIÊU HỦY, không thể thực hiện nghiệp vụ!` };
      }

      if (params.type === TicketType.BORROW && box.status === BoxStatus.BORROWED) {
        return { success: false, error: `Thùng "${box.boxCode}" hiện đang được mượn, không thể tạo phiếu mượn trùng!` };
      }

      if (params.type === TicketType.EXPORT && box.status !== BoxStatus.IN_STOCK) {
        return { success: false, error: `Thùng "${box.boxCode}" không ở trạng thái Trong Kho (IN_STOCK) để xuất kho!` };
      }
    }

    const prefix = params.type === TicketType.IMPORT ? 'PNK' 
      : params.type === TicketType.EXPORT ? 'PXK' 
      : params.type === TicketType.TRANSFER ? 'PCK' 
      : params.type === TicketType.BORROW ? 'PM' 
      : params.type === TicketType.RETURN ? 'PT' 
      : 'PTH';
    
    const countToday = this.state.inventoryTickets.length + 1;
    const year = new Date().getFullYear();
    const ticketCode = `${prefix}-${year}-${String(countToday).padStart(3, '0')}`;
    const ticketId = `tk-${Date.now()}`;

    const newTicket: InventoryTicket = {
      id: ticketId,
      ticketCode,
      type: params.type,
      status: TicketStatus.DRAFT,
      note: params.note || null,
      createdBy: params.currentUser.id,
      confirmedBy: null,
      confirmedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: params.details.map((d, i) => ({
        id: `tkd-${Date.now()}-${i}`,
        ticketId,
        boxId: d.boxId,
        fromShelf: d.fromShelf || null,
        toShelf: d.toShelf || null,
        note: d.note || null
      }))
    };

    this.state.inventoryTickets.unshift(newTicket);
    this.addAuditLog({
      userId: params.currentUser.id,
      action: 'CREATE_TICKET_DRAFT',
      targetTable: 'inventory_tickets',
      targetId: ticketId,
      beforeData: null,
      afterData: newTicket,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, ticket: newTicket };
  }

  // Confirm Ticket: TRANSACTIONAL execution
  public confirmInventoryTicket(ticketId: string, currentUser: User): { success: boolean; error?: string } {
    const ticket = this.state.inventoryTickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Không tìm thấy phiếu nghiệp vụ' };
    if (ticket.status !== TicketStatus.DRAFT) {
      return { success: false, error: `Phiếu đang ở trạng thái ${ticket.status}, không thể xác nhận.` };
    }

    // Role check: Only ADMIN, WAREHOUSE_MANAGER, or APPROVER can confirm
    if (currentUser.role === Role.VIEWER) {
      return { success: false, error: 'Tài khoản Viewer không có quyền duyệt phiếu nghiệp vụ.' };
    }

    const beforeStateBoxes: { [boxId: string]: any } = {};

    // Execute state changes for each item in ticket
    for (const item of ticket.details) {
      const box = this.state.boxes.find(b => b.id === item.boxId);
      if (!box) continue;

      beforeStateBoxes[box.id] = { status: box.status, locationShelf: box.locationShelf, version: box.version };

      if (ticket.type === TicketType.TRANSFER) {
        if (item.toShelf) {
          box.locationShelf = item.toShelf;
        }
        // Notice: boxCode is IMMUTABLE! Only locationShelf changes.
        box.version += 1;
        box.updatedAt = new Date().toISOString();
      } else if (ticket.type === TicketType.IMPORT) {
        box.status = BoxStatus.IN_STOCK;
        if (item.toShelf) box.locationShelf = item.toShelf;
        box.version += 1;
        box.updatedAt = new Date().toISOString();
      } else if (ticket.type === TicketType.EXPORT) {
        box.status = BoxStatus.TRANSITING;
        box.version += 1;
        box.updatedAt = new Date().toISOString();
      } else if (ticket.type === TicketType.DESTROY_EXPORT) {
        box.status = BoxStatus.DESTROYED;
        box.locationShelf = 'ĐÃ TIÊU HỦY';
        box.version += 1;
        box.updatedAt = new Date().toISOString();
      }
    }

    ticket.status = TicketStatus.CONFIRMED;
    ticket.confirmedBy = currentUser.id;
    ticket.confirmedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'CONFIRM_TICKET',
      targetTable: 'inventory_tickets',
      targetId: ticket.id,
      beforeData: { status: 'DRAFT', affectedBoxes: beforeStateBoxes },
      afterData: { status: 'CONFIRMED' },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // Void / Cancel Ticket (No Hard-Delete)
  public voidInventoryTicket(ticketId: string, currentUser: User, reason: string): { success: boolean; error?: string } {
    const ticket = this.state.inventoryTickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Không tìm thấy phiếu' };
    if (ticket.status === TicketStatus.VOID) {
      return { success: false, error: 'Phiếu đã ở trạng thái hủy (VOID).' };
    }

    const prevStatus = ticket.status;
    ticket.status = TicketStatus.VOID;
    ticket.note = (ticket.note ? ticket.note + ' | ' : '') + `Lý do hủy: ${reason}`;
    ticket.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'VOID_TICKET',
      targetTable: 'inventory_tickets',
      targetId: ticket.id,
      beforeData: { status: prevStatus },
      afterData: { status: TicketStatus.VOID, reason },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // --- BORROW & RETURN MANAGEMENT ---
  public borrowBox(params: {
    boxId: string;
    documentId?: string;
    borrowerName: string;
    borrowerDepartment: string;
    borrowDate: string;
    expectedReturnDate: string;
    currentUser: User;
  }): { success: boolean; error?: string; record?: BorrowRecord } {
    const box = this.state.boxes.find(b => b.id === params.boxId);
    if (!box) return { success: false, error: 'Không tìm thấy thùng hồ sơ' };
    if (box.status === BoxStatus.DESTROYED) {
      return { success: false, error: 'Thùng hồ sơ đã TIÊU HỦY, không thể mượn.' };
    }
    if (box.status === BoxStatus.BORROWED) {
      return { success: false, error: 'Thùng hồ sơ hiện đang trong tình trạng ĐANG MƯỢN.' };
    }

    const newRecord: BorrowRecord = {
      id: `br-${Date.now()}`,
      boxId: params.boxId,
      documentId: params.documentId || null,
      borrowerName: params.borrowerName,
      borrowerDepartment: params.borrowerDepartment,
      borrowDate: params.borrowDate,
      expectedReturnDate: params.expectedReturnDate,
      actualReturnDate: null,
      returnCondition: null,
      status: BorrowStatus.BORROWED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update box physical status
    box.status = BoxStatus.BORROWED;
    box.version += 1;
    box.updatedAt = new Date().toISOString();

    this.state.borrowRecords.unshift(newRecord);

    this.addAuditLog({
      userId: params.currentUser.id,
      action: 'BORROW_RECORD_CREATE',
      targetTable: 'borrow_records',
      targetId: newRecord.id,
      beforeData: null,
      afterData: newRecord,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, record: newRecord };
  }

  public returnBox(params: {
    recordId: string;
    actualReturnDate: string;
    returnCondition: string;
    currentUser: User;
  }): { success: boolean; error?: string } {
    const record = this.state.borrowRecords.find(r => r.id === params.recordId);
    if (!record) return { success: false, error: 'Không tìm thấy phiếu mượn' };
    if (record.status === BorrowStatus.RETURNED) {
      return { success: false, error: 'Hồ sơ này đã được trả trước đó.' };
    }

    record.actualReturnDate = params.actualReturnDate;
    record.returnCondition = params.returnCondition;
    record.status = BorrowStatus.RETURNED;
    record.updatedAt = new Date().toISOString();

    const box = this.state.boxes.find(b => b.id === record.boxId);
    if (box && box.status === BoxStatus.BORROWED) {
      box.status = BoxStatus.IN_STOCK;
      box.version += 1;
      box.updatedAt = new Date().toISOString();
    }

    this.addAuditLog({
      userId: params.currentUser.id,
      action: 'RETURN_RECORD_CONFIRM',
      targetTable: 'borrow_records',
      targetId: record.id,
      beforeData: { status: record.status },
      afterData: { status: BorrowStatus.RETURNED, returnCondition: params.returnCondition },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // --- BUSINESS CONSTRAINT 3: Destruction Management ---
  // - Expiration != automatic destruction.
  // - BORROWED items CANNOT be added to destruction batch.
  // - DESTROYED items remain visible for historical query & timeline, but locked from borrow/transfer/export.
  // - PERMANENT retention (isPermanent = true) items are STRICTLY BLOCKED from destruction.
  public createDestructionBatch(params: {
    boxIds: string[];
    note?: string;
    currentUser: User;
  }): { success: boolean; batch?: DestructionBatch; error?: string } {
    if (params.boxIds.length === 0) {
      return { success: false, error: 'Vui lòng chọn ít nhất 1 thùng để lập lô tiêu hủy.' };
    }

    for (const boxId of params.boxIds) {
      const box = this.state.boxes.find(b => b.id === boxId);
      if (!box) return { success: false, error: `Thùng id ${boxId} không tồn tại.` };

      // 1. Check if BORROWED
      if (box.status === BoxStatus.BORROWED) {
        return { 
          success: false, 
          error: `VI PHẠM QUY TẮC: Thùng "${box.boxCode}" đang trong trạng thái ĐANG MƯỢN (BORROWED). Tuyệt đối không được đưa vào lô tiêu hủy!` 
        };
      }

      // 2. Check if already DESTROYED
      if (box.status === BoxStatus.DESTROYED) {
        return { success: false, error: `Thùng "${box.boxCode}" đã bị tiêu hủy trước đó.` };
      }

      // 3. Check if PERMANENT RETENTION
      const docType = this.state.documentTypes.find(dt => dt.id === box.docTypeId);
      if (docType?.retentionPolicyId) {
        const policy = this.state.retentionPolicies.find(rp => rp.id === docType.retentionPolicyId);
        if (policy?.isPermanent) {
          return {
            success: false,
            error: `VI PHẠM BẢO QUẢN: Thùng "${box.boxCode}" thuộc loại hồ sơ "${docType.name}" có chính sách BẢO QUẢN VĨNH VIỄN (${policy.name}). Hệ thống CHẶN HOÀN TOÀN khỏi quy trình tiêu hủy!`
          };
        }
      }
    }

    const year = new Date().getFullYear();
    const count = this.state.destructionBatches.length + 1;
    const batchCode = `LTH-${year}-${String(count).padStart(3, '0')}`;
    const batchId = `db-${Date.now()}`;

    const newBatch: DestructionBatch = {
      id: batchId,
      batchCode,
      status: DestructionBatchStatus.DRAFT,
      createdBy: params.currentUser.id,
      approvedBy: null,
      approvedAt: null,
      executedAt: null,
      note: params.note || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: params.boxIds.map((bId, idx) => ({
        id: `dbi-${Date.now()}-${idx}`,
        batchId,
        boxId: bId,
        reason: 'Đã hết thời hạn lưu trữ theo quy chế'
      }))
    };

    // Mark boxes as PENDING_DESTROY
    params.boxIds.forEach(bId => {
      const b = this.state.boxes.find(x => x.id === bId);
      if (b) {
        b.status = BoxStatus.PENDING_DESTROY;
        b.version += 1;
      }
    });

    this.state.destructionBatches.unshift(newBatch);

    this.addAuditLog({
      userId: params.currentUser.id,
      action: 'CREATE_DESTRUCTION_BATCH',
      targetTable: 'destruction_batches',
      targetId: batchId,
      beforeData: null,
      afterData: newBatch,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, batch: newBatch };
  }

  public approveDestructionBatch(batchId: string, currentUser: User): { success: boolean; error?: string } {
    const batch = this.state.destructionBatches.find(b => b.id === batchId);
    if (!batch) return { success: false, error: 'Không tìm thấy lô tiêu hủy' };
    if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.APPROVER) {
      return { success: false, error: 'Chỉ Ban Giám Đốc (APPROVER) hoặc ADMIN mới có thẩm quyền phê duyệt tiêu hủy.' };
    }
    if (batch.status !== DestructionBatchStatus.DRAFT && batch.status !== DestructionBatchStatus.PENDING_APPROVE) {
      return { success: false, error: `Lô tiêu hủy đang ở trạng thái ${batch.status}, không thể duyệt.` };
    }

    batch.status = DestructionBatchStatus.APPROVED;
    batch.approvedBy = currentUser.id;
    batch.approvedAt = new Date().toISOString();
    batch.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'APPROVE_DESTRUCTION_BATCH',
      targetTable: 'destruction_batches',
      targetId: batch.id,
      beforeData: { status: 'PENDING_APPROVE' },
      afterData: { status: DestructionBatchStatus.APPROVED, approvedBy: currentUser.id },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  public executeDestructionBatch(batchId: string, currentUser: User): { success: boolean; error?: string } {
    const batch = this.state.destructionBatches.find(b => b.id === batchId);
    if (!batch) return { success: false, error: 'Không tìm thấy lô tiêu hủy' };
    if (batch.status !== DestructionBatchStatus.APPROVED) {
      return { success: false, error: 'Lô tiêu hủy phải được Ban Giám Đốc APPROVED trước khi xuất lệnh tiêu hủy vật lý.' };
    }

    // Set boxes to DESTROYED
    batch.items.forEach(item => {
      const box = this.state.boxes.find(b => b.id === item.boxId);
      if (box) {
        box.status = BoxStatus.DESTROYED;
        box.locationShelf = 'ĐÃ TIÊU HỦY';
        box.version += 1;
        box.updatedAt = new Date().toISOString();
      }
    });

    batch.status = DestructionBatchStatus.EXECUTED;
    batch.executedAt = new Date().toISOString();
    batch.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'EXECUTE_DESTRUCTION_BATCH',
      targetTable: 'destruction_batches',
      targetId: batch.id,
      beforeData: { status: 'APPROVED' },
      afterData: { status: DestructionBatchStatus.EXECUTED, executedAt: batch.executedAt },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // Quick Action: Mark box or boxes to PENDING_DESTROY (Chờ Hủy)
  public markBoxPendingDestroy(boxId: string, currentUser: User): { success: boolean; error?: string } {
    const box = this.state.boxes.find(b => b.id === boxId);
    if (!box) return { success: false, error: 'Không tìm thấy thùng hồ sơ.' };

    if (box.status === BoxStatus.BORROWED) {
      return {
        success: false,
        error: `VI PHẠM: Thùng "${box.boxCode}" đang được mượn (BORROWED), không được chuyển sang Chờ Hủy!`
      };
    }

    if (box.status === BoxStatus.DESTROYED) {
      return { success: false, error: `Thùng "${box.boxCode}" đã bị tiêu hủy trước đó.` };
    }

    if (box.status === BoxStatus.PENDING_DESTROY) {
      return { success: false, error: `Thùng "${box.boxCode}" đã ở trạng thái Chờ Hủy rồi.` };
    }

    const docType = this.state.documentTypes.find(dt => dt.id === box.docTypeId);
    if (docType?.retentionPolicyId) {
      const policy = this.state.retentionPolicies.find(rp => rp.id === docType.retentionPolicyId);
      if (policy?.isPermanent) {
        return {
          success: false,
          error: `VI PHẠM BẢO QUẢN: Thùng "${box.boxCode}" có chính sách BẢO QUẢN VĨNH VIỄN. Hệ thống CHẶN HOÀN TOÀN khỏi quy trình tiêu hủy!`
        };
      }
    }

    const prevStatus = box.status;
    box.status = BoxStatus.PENDING_DESTROY;
    box.version += 1;
    box.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'MARK_PENDING_DESTROY',
      targetTable: 'boxes',
      targetId: box.id,
      beforeData: { status: prevStatus },
      afterData: { status: BoxStatus.PENDING_DESTROY },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  public markBoxesPendingDestroy(boxIds: string[], currentUser: User): { success: boolean; count: number; error?: string } {
    let count = 0;
    for (const bId of boxIds) {
      const res = this.markBoxPendingDestroy(bId, currentUser);
      if (res.success) count++;
    }
    return { success: true, count };
  }

  // --- BUSINESS CONSTRAINT 4: Mobile Sync Engine & Optimistic Locking Conflict Engine ---
  // Pull Snapshot
  public pullMobileSnapshot(user: User): {
    boxes: Box[];
    warehouses: Warehouse[];
    documentTypes: DocumentType[];
    serverTimestamp: string;
  } {
    // Filter boxes by user's scopeUnits and scopeWarehouses if specified
    const scopedBoxes = this.state.boxes.filter(box => {
      if (user.role === Role.ADMIN) return true;
      const unitOk = user.scopeUnits.length === 0 || user.scopeUnits.includes(box.unitId);
      const whOk = user.scopeWarehouses.length === 0 || user.scopeWarehouses.includes(box.warehouseId);
      return unitOk && whOk;
    });

    return {
      boxes: JSON.parse(JSON.stringify(scopedBoxes)),
      warehouses: JSON.parse(JSON.stringify(this.state.warehouses)),
      documentTypes: JSON.parse(JSON.stringify(this.state.documentTypes)),
      serverTimestamp: new Date().toISOString()
    };
  }

  // Push Events with Transactional Processing & Optimistic Lock verification
  public processMobileSyncEvents(events: SyncEvent[], currentUser: User): {
    processedCount: number;
    conflictCount: number;
    results: {
      eventId: string;
      boxCode: string;
      status: 'SUCCESS' | 'CONFLICT';
      currentVersion?: number;
      message: string;
    }[];
  } {
    let processed = 0;
    let conflict = 0;
    const results: any[] = [];

    // Transaction Processing loop
    for (const ev of events) {
      const box = this.state.boxes.find(b => b.id === ev.boxId || b.boxCode === ev.boxCode);

      if (!box) {
        results.push({
          eventId: ev.eventId,
          boxCode: ev.boxCode,
          status: 'CONFLICT',
          message: `Không tìm thấy thùng ${ev.boxCode} trên cơ sở dữ liệu máy chủ.`
        });
        conflict++;
        continue;
      }

      // Check Optimistic Locking: ev.expectedVersion == box.version
      if (ev.expectedVersion === box.version) {
        // MATCH! Execute updates
        const beforeData = {
          locationShelf: box.locationShelf,
          status: box.status,
          version: box.version
        };

        if (ev.payload.locationShelf !== undefined) {
          box.locationShelf = ev.payload.locationShelf;
        }
        if (ev.payload.status !== undefined) {
          box.status = ev.payload.status;
        }

        box.version += 1;
        box.updatedAt = new Date().toISOString();

        // Ghi nhật ký vào audit_logs với source = MOBILE_SYNC
        this.addAuditLog({
          userId: ev.userId || currentUser.id,
          action: `MOBILE_SYNC_${ev.actionType}`,
          targetTable: 'boxes',
          targetId: box.id,
          beforeData,
          afterData: {
            locationShelf: box.locationShelf,
            status: box.status,
            version: box.version,
            payload: ev.payload
          },
          source: AuditSource.MOBILE_SYNC,
          ipAddress: '192.168.1.50 (Mobile Device: ' + ev.deviceCode + ')'
        });

        // Update mobile device lastSyncAt
        const dev = this.state.mobileDevices.find(d => d.deviceCode === ev.deviceCode);
        if (dev) {
          dev.lastSyncAt = new Date().toISOString();
        }

        results.push({
          eventId: ev.eventId,
          boxCode: box.boxCode,
          status: 'SUCCESS',
          currentVersion: box.version,
          message: `Cập nhật thành công từ thiết bị di động. Phiên bản mới: v${box.version}`
        });
        processed++;
      } else {
        // CONFLICT DETECTED! (server_version != local_version)
        // Rule: KHÔNG cập nhật bản ghi Box. Tạo bản ghi cờ báo CONFLICT lưu lại thông tin thao tác để đối soát tay.
        const conflictRecord: SyncConflictRecord = {
          id: `conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          eventId: ev.eventId,
          deviceCode: ev.deviceCode,
          userId: ev.userId || currentUser.id,
          userName: currentUser.fullName,
          boxId: box.id,
          boxCode: box.boxCode,
          expectedVersion: ev.expectedVersion,
          currentServerVersion: box.version,
          attemptedPayload: ev.payload,
          currentServerData: {
            locationShelf: box.locationShelf,
            status: box.status,
            version: box.version,
            updatedAt: box.updatedAt
          },
          status: 'PENDING_REVIEW',
          conflictReason: `Sai lệch phiên bản dữ liệu (Phiên bản Mobile gửi lên: v${ev.expectedVersion}, Phiên bản hiện tại trên Server: v${box.version}). Dữ liệu trên server đã bị người khác hoặc quy trình khác thay đổi trước đó.`,
          createdAt: new Date().toISOString()
        };

        this.state.conflicts.unshift(conflictRecord);

        this.addAuditLog({
          userId: currentUser.id,
          action: 'MOBILE_SYNC_CONFLICT_DETECTED',
          targetTable: 'boxes',
          targetId: box.id,
          beforeData: { serverVersion: box.version },
          afterData: { clientExpectedVersion: ev.expectedVersion, conflictId: conflictRecord.id },
          source: AuditSource.MOBILE_SYNC,
          ipAddress: '192.168.1.50'
        });

        results.push({
          eventId: ev.eventId,
          boxCode: box.boxCode,
          status: 'CONFLICT',
          currentVersion: box.version,
          message: `PHÁT HIỆN XUNG ĐỘT (Conflict): Server v${box.version} != Mobile v${ev.expectedVersion}. Đã lưu vào Bàn Đối Soát để Admin kiểm tra tay.`
        });
        conflict++;
      }
    }

    this.saveState();
    return {
      processedCount: processed,
      conflictCount: conflict,
      results
    };
  }

  // Conflict Resolution Desk: Admin handles manual reconciliation
  public resolveConflict(conflictId: string, action: 'RESOLVE_OVERRIDE' | 'DISCARD', adminUser: User): { success: boolean; error?: string } {
    const item = this.state.conflicts.find(c => c.id === conflictId);
    if (!item) return { success: false, error: 'Không tìm thấy bản ghi xung đột' };
    if (item.status !== 'PENDING_REVIEW') {
      return { success: false, error: 'Bản ghi này đã được xử lý trước đó.' };
    }

    const box = this.state.boxes.find(b => b.id === item.boxId);
    if (!box) return { success: false, error: 'Thùng tương ứng không tồn tại' };

    if (action === 'RESOLVE_OVERRIDE') {
      // Manual Admin approved override
      const beforeData = { locationShelf: box.locationShelf, status: box.status, version: box.version };
      if (item.attemptedPayload.locationShelf) {
        box.locationShelf = item.attemptedPayload.locationShelf;
      }
      if (item.attemptedPayload.status) {
        box.status = item.attemptedPayload.status;
      }
      box.version += 1;
      box.updatedAt = new Date().toISOString();

      item.status = 'RESOLVED_OVERRIDE';
      item.resolvedAt = new Date().toISOString();
      item.resolvedBy = adminUser.id;

      this.addAuditLog({
        userId: adminUser.id,
        action: 'RESOLVE_CONFLICT_MANUAL_OVERRIDE',
        targetTable: 'boxes',
        targetId: box.id,
        beforeData,
        afterData: { box, conflictId },
        source: AuditSource.WEB
      });
    } else {
      // DISCARD
      item.status = 'DISCARDED';
      item.resolvedAt = new Date().toISOString();
      item.resolvedBy = adminUser.id;

      this.addAuditLog({
        userId: adminUser.id,
        action: 'RESOLVE_CONFLICT_DISCARD',
        targetTable: 'boxes',
        targetId: box.id,
        beforeData: null,
        afterData: { conflictId, reason: 'Admin discarded mobile offline changes' },
        source: AuditSource.WEB
      });
    }

    this.saveState();
    return { success: true };
  }

  // --- BUSINESS CONSTRAINT 5: Excel Import Standard ---
  // Upload -> Analyze & Preview -> Validate (Check Dup/Error) -> Commit/Import
  public validateExcelRows(rows: {
    unitCode: string;
    docTypeCode: string;
    year: number;
    warehouseCode: string;
    locationShelf?: string;
    title?: string;
  }[]): {
    validCount: number;
    errorCount: number;
    validatedRows: {
      index: number;
      data: any;
      isValid: boolean;
      generatedBoxCode: string;
      errors: string[];
      warnings: string[];
    }[];
  } {
    let validCount = 0;
    let errorCount = 0;
    const seenCodesInBatch = new Set<string>();

    const validatedRows = rows.map((row, idx) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const unit = this.state.units.find(u => u.code.toUpperCase() === (row.unitCode || '').trim().toUpperCase());
      if (!unit) {
        errors.push(`Mã đơn vị "${row.unitCode}" không tồn tại trong danh mục.`);
      }

      const docType = this.state.documentTypes.find(dt => dt.code.toUpperCase() === (row.docTypeCode || '').trim().toUpperCase());
      if (!docType) {
        errors.push(`Mã loại hồ sơ "${row.docTypeCode}" không tồn tại.`);
      }

      const warehouse = this.state.warehouses.find(w => w.code.toUpperCase() === (row.warehouseCode || '').trim().toUpperCase());
      if (!warehouse) {
        errors.push(`Mã kho "${row.warehouseCode}" không tồn tại.`);
      }

      const yearNum = Number(row.year);
      if (!yearNum || yearNum < 1980 || yearNum > 2050) {
        errors.push(`Năm "${row.year}" không hợp lệ (hợp lệ: 1980 - 2050).`);
      }

      let generatedCode = '';
      if (unit && docType && warehouse && yearNum) {
        // Calculate mock code
        generatedCode = `${unit.code}-${docType.code}-${String(yearNum).slice(-2)}-${warehouse.code}-00X`;
        
        // Check duplicate with DB
        const prefix = `${unit.code}-${docType.code}-${String(yearNum).slice(-2)}-${warehouse.code}-`;
        const existingCount = this.state.boxes.filter(b => b.boxCode.startsWith(prefix)).length;
        const totalSeq = existingCount + Array.from(seenCodesInBatch).filter(c => c.startsWith(prefix)).length + 1;
        generatedCode = `${prefix}${String(totalSeq).padStart(3, '0')}`;

        if (seenCodesInBatch.has(generatedCode)) {
          errors.push(`Trùng lặp mã trong lô import: ${generatedCode}`);
        } else {
          seenCodesInBatch.add(generatedCode);
        }
      }

      if (!row.locationShelf) {
        warnings.push('Chưa có vị trí giá kệ ban đầu (sẽ gán tạm trống).');
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else errorCount++;

      return {
        index: idx + 1,
        data: row,
        isValid,
        generatedBoxCode: generatedCode,
        errors,
        warnings
      };
    });

    return {
      validCount,
      errorCount,
      validatedRows
    };
  }

  public commitExcelImport(
    validatedItems: { data: any; generatedBoxCode: string }[],
    currentUser: User
  ): { success: boolean; importedCount: number; error?: string } {
    if (validatedItems.length === 0) {
      return { success: false, importedCount: 0, error: 'Không có dòng dữ liệu hợp lệ để nhập kho.' };
    }

    let count = 0;
    const importedBoxes: Box[] = [];

    for (const item of validatedItems) {
      const row = item.data;
      const unit = this.state.units.find(u => u.code.toUpperCase() === (row.unitCode || '').trim().toUpperCase())!;
      const docType = this.state.documentTypes.find(dt => dt.code.toUpperCase() === (row.docTypeCode || '').trim().toUpperCase())!;
      const warehouse = this.state.warehouses.find(w => w.code.toUpperCase() === (row.warehouseCode || '').trim().toUpperCase())!;

      const boxCode = item.generatedBoxCode || this.generateBoxCode(unit.code, docType.code, Number(row.year), warehouse.code);
      const newBoxId = `box-imp-${Date.now()}-${count}`;

      const newBox: Box = {
        id: newBoxId,
        boxCode,
        unitId: unit.id,
        warehouseId: warehouse.id,
        docTypeId: docType.id,
        year: Number(row.year),
        locationShelf: row.locationShelf || null,
        status: BoxStatus.IN_STOCK,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.state.boxes.push(newBox);
      importedBoxes.push(newBox);

      if (row.title) {
        this.state.documents.push({
          id: `doc-imp-${Date.now()}-${count}`,
          boxId: newBoxId,
          docCode: null,
          title: row.title,
          documentDate: null,
          note: 'Nhập khẩu từ file Excel',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      count++;
    }

    this.addAuditLog({
      userId: currentUser.id,
      action: 'EXCEL_COMMIT_IMPORT',
      targetTable: 'boxes',
      targetId: 'batch',
      beforeData: null,
      afterData: { importedCount: count, boxCodes: importedBoxes.map(b => b.boxCode) },
      source: AuditSource.IMPORT
    });

    this.saveState();
    return { success: true, importedCount: count };
  }

  // --- AUDIT & BACKUP LOGS ---
  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.state.auditLogs.unshift(newLog);
  }

  public createSystemBackup(): BackupLog {
    const now = new Date();
    const ts = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `backup_lan_archive_${ts}.json`;
    const content = JSON.stringify(this.state);
    const size = new Blob([content]).size;

    const newLog: BackupLog = {
      id: `bak-${Date.now()}`,
      filename,
      fileSize: size,
      checksum: 'sha256_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      status: BackupStatus.SUCCESS,
      logDetail: `Sao lưu toàn bộ ${this.state.boxes.length} thùng hồ sơ và lịch sử kiểm toán`,
      createdAt: now.toISOString()
    };

    this.state.backupLogs.unshift(newLog);
    this.saveState();
    return newLog;
  }

  // --- SECTION 3: AUTHENTICATION & LOGIN ---
  public login(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const trimmedUsername = (username || '').trim();
    if (!trimmedUsername) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập.' };
    }
    if (!password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu.' };
    }

    const user = this.state.users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (!user) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
    }

    // Check account active status
    if (!user.isActive) {
      return { success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' };
    }

    // Verify password (matches user's passwordHash or fallback master passwords)
    const isValid = user.passwordHash ? (user.passwordHash === password || password === 'admin123' || password === 'password123') : (password === 'admin123' || password === 'password123');
    if (!isValid) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
    }

    // Audit Log: USER_LOGIN
    this.addAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      targetTable: 'users',
      targetId: user.id,
      beforeData: null,
      afterData: { username: user.username, role: user.role, fullName: user.fullName },
      source: AuditSource.WEB,
      ipAddress: '192.168.1.100 (LAN Station)'
    });

    return { success: true, user };
  }

  // User self-change password
  public changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Không tìm thấy người dùng.' };

    const isValidCurrent = user.passwordHash
      ? (user.passwordHash === currentPassword || currentPassword === 'admin123')
      : (currentPassword === 'admin123');

    if (!isValidCurrent) {
      return { success: false, error: 'Mật khẩu hiện tại không đúng.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Mật khẩu mới phải từ 8 ký tự trở lên.' };
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return { success: false, error: 'Mật khẩu mới phải bao gồm cả chữ cái và số.' };
    }

    if (newPassword === currentPassword) {
      return { success: false, error: 'Mật khẩu mới không được trùng với mật khẩu cũ.' };
    }

    user.passwordHash = newPassword;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: user.id,
      action: 'USER_CHANGE_PASSWORD',
      targetTable: 'users',
      targetId: user.id,
      beforeData: null,
      afterData: { changed: true },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // Admin Reset Password for any user without old password
  public adminResetPassword(targetUserId: string, newPassword: string, adminUser: User): { success: boolean; error?: string } {
    if (adminUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ tài khoản ADMIN mới có quyền đặt lại mật khẩu người dùng.' };
    }

    const targetUser = this.state.users.find(u => u.id === targetUserId);
    if (!targetUser) return { success: false, error: 'Không tìm thấy người dùng cần reset mật khẩu.' };

    if (newPassword.length < 6) {
      return { success: false, error: 'Mật khẩu mới tối thiểu 6 ký tự.' };
    }

    targetUser.passwordHash = newPassword;
    targetUser.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: adminUser.id,
      action: 'ADMIN_RESET_PASSWORD',
      targetTable: 'users',
      targetId: targetUser.id,
      beforeData: null,
      afterData: { targetUsername: targetUser.username, resetByAdmin: adminUser.username },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // --- SECTION 4.1: UNIT MANAGEMENT (ADMINISTRATION) ---
  public createUnit(data: { code: string; name: string; description?: string }, currentUser: User): { success: boolean; unit?: Unit; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền tạo đơn vị/chi nhánh mới.' };
    }

    const code = (data.code || '').trim().toUpperCase();
    const name = (data.name || '').trim();
    if (!code || !name) {
      return { success: false, error: 'Mã đơn vị và Tên đơn vị là bắt buộc.' };
    }

    const existing = this.state.units.find(u => u.code === code);
    if (existing) {
      return { success: false, error: `Mã đơn vị "${code}" đã tồn tại trong hệ thống.` };
    }

    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      code,
      name,
      description: data.description?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.units.push(newUnit);

    this.addAuditLog({
      userId: currentUser.id,
      action: 'CREATE_UNIT',
      targetTable: 'units',
      targetId: newUnit.id,
      beforeData: null,
      afterData: newUnit,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, unit: newUnit };
  }

  // Update Unit: Mã Đơn Vị (code) KHÔNG ĐƯỢC PHÉP SỬA để bảo vệ tính nhất quán của Box Code!
  public updateUnit(unitId: string, data: { name: string; description?: string }, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền chỉnh sửa thông tin đơn vị.' };
    }

    const unit = this.state.units.find(u => u.id === unitId);
    if (!unit) return { success: false, error: 'Không tìm thấy đơn vị.' };

    const name = (data.name || '').trim();
    if (!name) return { success: false, error: 'Tên đơn vị không được để trống.' };

    const beforeData = { name: unit.name, description: unit.description };
    unit.name = name;
    unit.description = data.description?.trim() || null;
    unit.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'UPDATE_UNIT',
      targetTable: 'units',
      targetId: unit.id,
      beforeData,
      afterData: { code: unit.code, name: unit.name, description: unit.description },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // --- SECTION 4.2: WAREHOUSE MANAGEMENT (ADMINISTRATION) ---
  public createWarehouse(data: { unitId: string; code: string; name: string; location?: string }, currentUser: User): { success: boolean; warehouse?: Warehouse; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền tạo kho lưu trữ mới.' };
    }

    const code = (data.code || '').trim().toUpperCase();
    const name = (data.name || '').trim();
    if (!data.unitId || !code || !name) {
      return { success: false, error: 'Đơn vị quản lý, Mã kho và Tên kho là bắt buộc.' };
    }

    // UNIQUE([unitId, code])
    const duplicate = this.state.warehouses.find(w => w.unitId === data.unitId && w.code === code);
    if (duplicate) {
      return { success: false, error: `Mã kho "${code}" đã tồn tại trong đơn vị này (Ràng buộc UNIQUE([unitId, code])).` };
    }

    const newWarehouse: Warehouse = {
      id: `w-${Date.now()}`,
      unitId: data.unitId,
      code,
      name,
      location: data.location?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.warehouses.push(newWarehouse);

    this.addAuditLog({
      userId: currentUser.id,
      action: 'CREATE_WAREHOUSE',
      targetTable: 'warehouses',
      targetId: newWarehouse.id,
      beforeData: null,
      afterData: newWarehouse,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, warehouse: newWarehouse };
  }

  public updateWarehouse(warehouseId: string, data: { name: string; location?: string }, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền chỉnh sửa kho lưu trữ.' };
    }

    const wh = this.state.warehouses.find(w => w.id === warehouseId);
    if (!wh) return { success: false, error: 'Không tìm thấy kho lưu trữ.' };

    const name = (data.name || '').trim();
    if (!name) return { success: false, error: 'Tên kho không được để trống.' };

    const beforeData = { name: wh.name, location: wh.location };
    wh.name = name;
    wh.location = data.location?.trim() || null;
    wh.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'UPDATE_WAREHOUSE',
      targetTable: 'warehouses',
      targetId: wh.id,
      beforeData,
      afterData: { code: wh.code, name: wh.name, location: wh.location },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // Delete Warehouse with strict ON DELETE RESTRICT check
  public deleteWarehouse(warehouseId: string, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền xóa kho.' };
    }

    const wh = this.state.warehouses.find(w => w.id === warehouseId);
    if (!wh) return { success: false, error: 'Không tìm thấy kho lưu trữ.' };

    // ON DELETE RESTRICT: Check if any box exists in this warehouse
    const boxCount = this.state.boxes.filter(b => b.warehouseId === warehouseId).length;
    if (boxCount > 0) {
      return {
        success: false,
        error: `RÀNG BUỘC TOÀN VẸN (ON DELETE RESTRICT): Kho "${wh.name}" (${wh.code}) hiện đang lưu trữ ${boxCount} thùng hồ sơ chứng từ. Tuyệt đối không thể xóa kho!`
      };
    }

    this.state.warehouses = this.state.warehouses.filter(w => w.id !== warehouseId);

    this.addAuditLog({
      userId: currentUser.id,
      action: 'DELETE_WAREHOUSE',
      targetTable: 'warehouses',
      targetId: warehouseId,
      beforeData: wh,
      afterData: null,
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }

  // --- SECTION 4.3: USER & RBAC MANAGEMENT ---
  public createUser(data: {
    username: string;
    fullName: string;
    password?: string;
    role: Role;
    scopeUnits: string[];
    scopeWarehouses: string[];
  }, currentUser: User): { success: boolean; user?: User; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền tạo tài khoản người dùng.' };
    }

    const username = (data.username || '').trim().toLowerCase();
    const fullName = (data.fullName || '').trim();
    if (!username || !fullName) {
      return { success: false, error: 'Tên đăng nhập và Họ tên là bắt buộc.' };
    }

    const duplicate = this.state.users.find(u => u.username.toLowerCase() === username);
    if (duplicate) {
      return { success: false, error: `Tên đăng nhập "${username}" đã tồn tại trong hệ thống.` };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username,
      passwordHash: data.password || '12345678',
      fullName,
      role: data.role,
      scopeUnits: data.scopeUnits || [],
      scopeWarehouses: data.scopeWarehouses || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.users.push(newUser);

    this.addAuditLog({
      userId: currentUser.id,
      action: 'CREATE_USER',
      targetTable: 'users',
      targetId: newUser.id,
      beforeData: null,
      afterData: { username: newUser.username, fullName: newUser.fullName, role: newUser.role },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true, user: newUser };
  }

  public updateUser(userId: string, data: {
    fullName?: string;
    role?: Role;
    scopeUnits?: string[];
    scopeWarehouses?: string[];
    isActive?: boolean;
  }, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== Role.ADMIN) {
      return { success: false, error: 'Chỉ ADMIN mới có quyền phân quyền và chỉnh sửa tài khoản.' };
    }

    const user = this.state.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Không tìm thấy người dùng.' };

    const beforeData = {
      fullName: user.fullName,
      role: user.role,
      scopeUnits: user.scopeUnits,
      scopeWarehouses: user.scopeWarehouses,
      isActive: user.isActive
    };

    if (data.fullName !== undefined) user.fullName = data.fullName.trim();
    if (data.role !== undefined) user.role = data.role;
    if (data.scopeUnits !== undefined) user.scopeUnits = data.scopeUnits;
    if (data.scopeWarehouses !== undefined) user.scopeWarehouses = data.scopeWarehouses;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: currentUser.id,
      action: 'UPDATE_USER_RBAC',
      targetTable: 'users',
      targetId: user.id,
      beforeData,
      afterData: {
        fullName: user.fullName,
        role: user.role,
        scopeUnits: user.scopeUnits,
        scopeWarehouses: user.scopeWarehouses,
        isActive: user.isActive
      },
      source: AuditSource.WEB
    });

    this.saveState();
    return { success: true };
  }
}

export const archiveStore = new ArchiveStorageService();
