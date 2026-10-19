import React, { useState } from 'react';
import {
  Unit,
  Warehouse,
  RetentionPolicy,
  DocumentType,
  User,
  Role,
  Box
} from '../types';
import { archiveStore } from '../services/archiveStore';
import { AdminResetPasswordModal } from './PasswordModals';
import {
  Building,
  Box as BoxIcon,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  KeyRound,
  AlertCircle,
  ShieldAlert,
  Info,
  Check,
  X
} from 'lucide-react';

interface MasterDataViewProps {
  units: Unit[];
  warehouses: Warehouse[];
  retentionPolicies: RetentionPolicy[];
  documentTypes: DocumentType[];
  users: User[];
  currentUser: User;
  boxes?: Box[];
  onUpdate: () => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  units,
  warehouses,
  retentionPolicies,
  documentTypes,
  users,
  currentUser,
  boxes = [],
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'UNITS' | 'WAREHOUSES' | 'POLICIES' | 'DOC_TYPES' | 'USERS'>('USERS');

  const isAdmin = currentUser.role === Role.ADMIN;

  // Notification message
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- UNIT MODALS STATE ---
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');

  // --- WAREHOUSE MODALS STATE ---
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [newWhUnitId, setNewWhUnitId] = useState(units[0]?.id || '');
  const [newWhCode, setNewWhCode] = useState('');
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');

  // --- USER MODALS STATE ---
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);

  // Add User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('12345678');
  const [newUserRole, setNewUserRole] = useState<Role>(Role.WAREHOUSE_STAFF);
  const [newUserScopeUnits, setNewUserScopeUnits] = useState<string[]>([]);
  const [newUserScopeWarehouses, setNewUserScopeWarehouses] = useState<string[]>([]);

  // ================= UNIT HANDLERS =================
  const handleUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    const res = archiveStore.updateUnit(editingUnit.id, {
      name: editingUnit.name,
      description: editingUnit.description || undefined
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi cập nhật đơn vị' });
    } else {
      setMsg({ type: 'success', text: `Cập nhật đơn vị "${editingUnit.code}" thành công!` });
      setEditingUnit(null);
      onUpdate();
    }
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = archiveStore.createUnit({
      code: newUnitCode,
      name: newUnitName,
      description: newUnitDesc
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi tạo đơn vị mới' });
    } else {
      setMsg({ type: 'success', text: `Tạo mới đơn vị "${newUnitCode.toUpperCase()}" thành công!` });
      setShowAddUnitModal(false);
      setNewUnitCode('');
      setNewUnitName('');
      setNewUnitDesc('');
      onUpdate();
    }
  };

  // ================= WAREHOUSE HANDLERS =================
  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    const res = archiveStore.createWarehouse({
      unitId: newWhUnitId,
      code: newWhCode,
      name: newWhName,
      location: newWhLocation
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi tạo kho mới' });
    } else {
      setMsg({ type: 'success', text: `Tạo mới kho "${newWhCode.toUpperCase()}" thành công!` });
      setShowAddWhModal(false);
      setNewWhCode('');
      setNewWhName('');
      setNewWhLocation('');
      onUpdate();
    }
  };

  const handleUpdateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    const res = archiveStore.updateWarehouse(editingWarehouse.id, {
      name: editingWarehouse.name,
      location: editingWarehouse.location || undefined
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi cập nhật kho' });
    } else {
      setMsg({ type: 'success', text: `Cập nhật thông tin kho "${editingWarehouse.code}" thành công!` });
      setEditingWarehouse(null);
      onUpdate();
    }
  };

  const handleDeleteWarehouse = (whId: string, whName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kho "${whName}"?`)) return;
    const res = archiveStore.deleteWarehouse(whId, currentUser);
    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Không thể xóa kho' });
    } else {
      setMsg({ type: 'success', text: `Đã xóa kho "${whName}" thành công.` });
      onUpdate();
    }
  };

  // ================= USER HANDLERS =================
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = archiveStore.createUser({
      username: newUsername,
      fullName: newFullName,
      password: newUserPassword,
      role: newUserRole,
      scopeUnits: newUserScopeUnits,
      scopeWarehouses: newUserScopeWarehouses
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi tạo người dùng' });
    } else {
      setMsg({ type: 'success', text: `Tạo tài khoản "${newUsername}" thành công!` });
      setShowAddUserModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewUserPassword('12345678');
      setNewUserScopeUnits([]);
      setNewUserScopeWarehouses([]);
      onUpdate();
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = archiveStore.updateUser(editingUser.id, {
      fullName: editingUser.fullName,
      role: editingUser.role,
      scopeUnits: editingUser.scopeUnits,
      scopeWarehouses: editingUser.scopeWarehouses,
      isActive: editingUser.isActive
    }, currentUser);

    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi cập nhật người dùng' });
    } else {
      setMsg({ type: 'success', text: `Cập nhật phân quyền cho "${editingUser.username}" thành công!` });
      setEditingUser(null);
      onUpdate();
    }
  };

  const handleToggleUserActive = (user: User) => {
    const nextStatus = !user.isActive;
    const actionName = nextStatus ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} "${user.username}"?`)) return;

    const res = archiveStore.updateUser(user.id, { isActive: nextStatus }, currentUser);
    if (!res.success) {
      setMsg({ type: 'error', text: res.error || 'Lỗi khi cập nhật trạng thái' });
    } else {
      setMsg({ type: 'success', text: `Đã ${actionName.toLowerCase()} "${user.username}" thành công.` });
      onUpdate();
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userStatusFilter === 'ACTIVE' && !u.isActive) return false;
    if (userStatusFilter === 'INACTIVE' && u.isActive) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Alert banner if any */}
      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          msg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-500 hover:text-slate-800 font-bold text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Bạn đang đăng nhập với vai trò <strong>{currentUser.role}</strong> (Chế độ chỉ xem danh mục). Để thêm, sửa đơn vị, kho hoặc quản lý tài khoản người dùng, vui lòng đăng nhập với vai trò <strong>ADMIN</strong>.
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'USERS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Người Dùng &amp; Phân Quyền RBAC ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('UNITS')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'UNITS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Đơn Vị &amp; Chi Nhánh ({units.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'WAREHOUSES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BoxIcon className="w-3.5 h-3.5" />
          <span>Kho Lưu Trữ ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DOC_TYPES')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'DOC_TYPES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Loại Hồ Sơ ({documentTypes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'POLICIES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Thời Hạn Bảo Quản ({retentionPolicies.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4.3. QUẢN LÝ & PHÂN QUYỀN NGƯỜI DÙNG (USER & RBAC)             */}
      {/* ============================================================== */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo username, họ tên..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-56 font-medium"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
              >
                <option value="ALL">Tất cả vai trò (Role)</option>
                <option value={Role.ADMIN}>ADMIN</option>
                <option value={Role.WAREHOUSE_MANAGER}>WAREHOUSE_MANAGER</option>
                <option value={Role.WAREHOUSE_STAFF}>WAREHOUSE_STAFF</option>
                <option value={Role.APPROVER}>APPROVER</option>
                <option value={Role.VIEWER}>VIEWER</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động (Active)</option>
                <option value="INACTIVE">Bị khóa (Inactive)</option>
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Người Dùng Mới</span>
              </button>
            )}
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tài Khoản</th>
                  <th className="p-3.5">Họ Và Tên</th>
                  <th className="p-3.5">Vai Trò (Role)</th>
                  <th className="p-3.5">Phạm Vi Chi Nhánh (scope_units)</th>
                  <th className="p-3.5">Phạm Vi Kho (scope_warehouses)</th>
                  <th className="p-3.5">Trạng Thái</th>
                  {isAdmin && <th className="p-3.5 text-right">Thao Tác Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      @{u.username}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{u.fullName}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        u.role === Role.ADMIN ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        u.role === Role.WAREHOUSE_MANAGER ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        u.role === Role.WAREHOUSE_STAFF ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        u.role === Role.APPROVER ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                      {u.role === Role.ADMIN ? (
                        <span className="text-purple-700 font-bold">Toàn hệ thống (ALL)</span>
                      ) : u.scopeUnits && u.scopeUnits.length > 0 ? (
                        u.scopeUnits.map(uid => units.find(x => x.id === uid)?.code || uid).join(', ')
                      ) : (
                        <span className="text-slate-400 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                      {u.role === Role.ADMIN ? (
                        <span className="text-purple-700 font-bold">Tất cả kho</span>
                      ) : u.scopeWarehouses && u.scopeWarehouses.length > 0 ? (
                        u.scopeWarehouses.map(wid => warehouses.find(x => x.id === wid)?.code || wid).join(', ')
                      ) : (
                        <span className="text-slate-400 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          HOẠT ĐỘNG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          BỊ KHÓA
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setEditingUser(JSON.parse(JSON.stringify(u)))}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-bold text-[11px]"
                          title="Sửa phân quyền và thông tin"
                        >
                          Phân Quyền
                        </button>
                        <button
                          onClick={() => setResetTargetUser(u)}
                          className="px-2 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded font-bold text-[11px] inline-flex items-center space-x-1"
                          title="Admin đặt lại mật khẩu"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset MK</span>
                        </button>
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className={`px-2 py-1 rounded font-bold text-[11px] ${
                            u.isActive
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Khóa hoặc mở khóa tài khoản (thay cho xóa cứng)"
                        >
                          {u.isActive ? 'Khóa' : 'Mở'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4.1. QUẢN LÝ & ĐỔI TÊN CHI NHÁNH / ĐƠN VỊ (UNIT MANAGEMENT)    */}
      {/* ============================================================== */}
      {activeTab === 'UNITS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Danh Sách Chi Nhánh / Đơn Vị Trực Thuộc</h4>
                <p className="text-[11px] text-slate-500">
                  Ràng buộc bất biến: Mã đơn vị (code) không được phép sửa đổi sau khi tạo để bảo vệ tính nhất quán của Mã Thùng.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddUnitModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Đơn Vị Mới</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Đơn Vị (Code Bất Biến)</th>
                  <th className="p-3.5">Tên Đơn Vị / Chi Nhánh</th>
                  <th className="p-3.5">Mô Tả &amp; Phạm Vi</th>
                  <th className="p-3.5 text-center">Số Kho Trực Thuộc</th>
                  <th className="p-3.5 text-center">Số Thùng Hiện Lưu</th>
                  {isAdmin && <th className="p-3.5 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map(u => {
                  const whCount = warehouses.filter(w => w.unitId === u.id).length;
                  const boxCount = boxes.filter(b => b.unitId === u.id).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-black text-slate-900 text-sm flex items-center space-x-1.5">
                        <span>{u.code}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans font-bold">
                          IMMUTABLE
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 text-sm">{u.name}</td>
                      <td className="p-3.5 text-slate-600">{u.description || '--'}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{whCount} kho</td>
                      <td className="p-3.5 text-center font-bold text-emerald-700 font-mono">{boxCount} thùng</td>
                      {isAdmin && (
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setEditingUnit(JSON.parse(JSON.stringify(u)))}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs inline-flex items-center space-x-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Đổi Tên / Sửa</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4.2. CẤU HÌNH KHO LƯU TRỮ (WAREHOUSE MANAGEMENT)                */}
      {/* ============================================================== */}
      {activeTab === 'WAREHOUSES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <BoxIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Cấu Hình Danh Sách Kho Lưu Trữ</h4>
                <p className="text-[11px] text-slate-500">
                  Ràng buộc toàn vẹn ON DELETE RESTRICT: Tuyệt đối ngăn chặn xóa kho nếu đang có thùng hồ sơ lưu trữ.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddWhModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Kho Mới</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Kho</th>
                  <th className="p-3.5">Đơn Vị Quản Lý</th>
                  <th className="p-3.5">Tên Kho Lưu Trữ</th>
                  <th className="p-3.5">Vị Trí Địa Lý / Mô Tả</th>
                  <th className="p-3.5 text-center">Thùng Đang Lưu</th>
                  {isAdmin && <th className="p-3.5 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map(w => {
                  const u = units.find(unit => unit.id === w.unitId);
                  const boxCount = boxes.filter(b => b.warehouseId === w.id).length;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-black text-slate-900 text-sm">{w.code}</td>
                      <td className="p-3.5 font-semibold text-emerald-800">
                        [{u?.code}] - {u?.name}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 text-sm">{w.name}</td>
                      <td className="p-3.5 text-slate-600">{w.location || '--'}</td>
                      <td className="p-3.5 text-center font-bold text-slate-900 font-mono">
                        <span className={`px-2 py-0.5 rounded font-mono ${
                          boxCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
                        }`}>
                          {boxCount} thùng
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingWarehouse(JSON.parse(JSON.stringify(w)))}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                          >
                            Chỉnh Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteWarehouse(w.id, w.name)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs inline-flex items-center space-x-1"
                            title={boxCount > 0 ? `Đang có ${boxCount} thùng, ON DELETE RESTRICT sẽ chặn xóa` : 'Xóa kho'}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Document Types */}
      {activeTab === 'DOC_TYPES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Ký Hiệu</th>
                <th className="p-3.5">Tên Loại Hồ Sơ</th>
                <th className="p-3.5">Chính Sách Bảo Quản</th>
                <th className="p-3.5">Căn Cứ Pháp Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentTypes.map(dt => {
                const pol = retentionPolicies.find(rp => rp.id === dt.retentionPolicyId);
                return (
                  <tr key={dt.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900 text-sm">{dt.code}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{dt.name}</td>
                    <td className="p-3.5">
                      {pol?.isPermanent ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Bảo quản VĨNH VIỄN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800">
                          {pol?.durationYears} năm ({pol?.name})
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 italic">{pol?.legalBasis || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Retention Policies */}
      {activeTab === 'POLICIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retentionPolicies.map(pol => (
            <div key={pol.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{pol.name}</span>
                {pol.isPermanent ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>VĨNH VIỄN</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {pol.durationYears} NĂM
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{pol.description || 'Không có mô tả'}</p>
              <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-100">
                <span className="font-semibold text-slate-700">Căn cứ pháp lý: </span>
                <span>{pol.legalBasis || 'Quy chế công ty'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: EDIT UNIT ================= */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Cập Nhật Thông Tin Đơn Vị / Chi Nhánh</h3>
              <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUnit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mã Đơn Vị (Code Bất Biến)
                </label>
                <input
                  type="text"
                  value={editingUnit.code}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed"
                />
                <p className="text-[11px] text-amber-700 font-semibold mt-1">
                  Ràng buộc bất biến: Mã Đơn Vị không được phép sửa đổi để đảm bảo tính nhất quán của Mã Thùng (box_code).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Tên Đơn Vị / Chi Nhánh *
                </label>
                <input
                  type="text"
                  value={editingUnit.name}
                  onChange={e => setEditingUnit({ ...editingUnit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mô Tả &amp; Địa Chỉ
                </label>
                <textarea
                  value={editingUnit.description || ''}
                  onChange={e => setEditingUnit({ ...editingUnit, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD UNIT ================= */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Thêm Chi Nhánh / Đơn Vị Mới</h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mã Đơn Vị (Code viết tắt, duy nhất) *
                </label>
                <input
                  type="text"
                  placeholder="VD: NHL, TTAM, BD..."
                  value={newUnitCode}
                  onChange={e => setNewUnitCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Tên Chi Nhánh / Đơn Vị Đầy Đủ *
                </label>
                <input
                  type="text"
                  placeholder="VD: Chi nhánh Nam Hà Nội"
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mô Tả &amp; Vị Trí
                </label>
                <textarea
                  placeholder="Mô tả chức năng hoặc địa chỉ..."
                  value={newUnitDesc}
                  onChange={e => setNewUnitDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Tạo Đơn Vị Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD WAREHOUSE ================= */}
      {showAddWhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Thêm Kho Lưu Trữ Mới</h3>
              <button onClick={() => setShowAddWhModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Đơn Vị Trực Thuộc *
                </label>
                <select
                  value={newWhUnitId}
                  onChange={e => setNewWhUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  required
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>[{u.code}] - {u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Mã Kho (Code) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: K3, K-VIP..."
                    value={newWhCode}
                    onChange={e => setNewWhCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Tên Kho Lưu Trữ *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Kho Tài Liệu Số 3"
                    value={newWhName}
                    onChange={e => setNewWhName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Vị Trí Địa Lý / Mô Tả Tầng / Dãy
                </label>
                <input
                  type="text"
                  placeholder="VD: Tầng 3 - Tòa nhà Điều hành..."
                  value={newWhLocation}
                  onChange={e => setNewWhLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Tạo Kho Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT WAREHOUSE ================= */}
      {editingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Chỉnh Sửa Thông Tin Kho Lưu Trữ</h3>
              <button onClick={() => setEditingWarehouse(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWarehouse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Mã Kho (Gắn liền lịch sử thùng)
                </label>
                <input
                  type="text"
                  value={editingWarehouse.code}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Tên Kho Lưu Trữ *
                </label>
                <input
                  type="text"
                  value={editingWarehouse.name}
                  onChange={e => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Vị Trí Địa Lý Kho
                </label>
                <input
                  type="text"
                  value={editingWarehouse.location || ''}
                  onChange={e => setEditingWarehouse({ ...editingWarehouse, location: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Lưu Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER (4.3) ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Thêm Mới Người Dùng &amp; Gán Scope RBAC</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Tên Đăng Nhập (Username) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: staff_nam"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().trim())}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Họ Và Tên Đầy Đủ *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Hoàng Văn Nam"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Mật Khẩu Ban Đầu
                  </label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Vai Trò (Role RBAC) *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value={Role.WAREHOUSE_STAFF}>WAREHOUSE_STAFF (Thủ kho)</option>
                    <option value={Role.WAREHOUSE_MANAGER}>WAREHOUSE_MANAGER (Trưởng kho)</option>
                    <option value={Role.APPROVER}>APPROVER (Ban Giám Đốc duyệt)</option>
                    <option value={Role.VIEWER}>VIEWER (Thanh tra / Tra cứu)</option>
                    <option value={Role.ADMIN}>ADMIN (Quản trị viên tối cao)</option>
                  </select>
                </div>
              </div>

              {/* Scope Units Selection */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Phạm Vi Chi Nhánh / Đơn Vị (scope_units)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {units.map(u => {
                    const isChecked = newUserScopeUnits.includes(u.id);
                    return (
                      <label key={u.id} className="flex items-center space-x-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewUserScopeUnits(newUserScopeUnits.filter(x => x !== u.id));
                            } else {
                              setNewUserScopeUnits([...newUserScopeUnits, u.id]);
                            }
                          }}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold">[{u.code}] {u.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Scope Warehouses Selection */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Phạm Vi Kho Lưu Trữ Được Phép (scope_warehouses)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {warehouses.map(w => {
                    const isChecked = newUserScopeWarehouses.includes(w.id);
                    const u = units.find(unit => unit.id === w.unitId);
                    return (
                      <label key={w.id} className="flex items-center space-x-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewUserScopeWarehouses(newUserScopeWarehouses.filter(x => x !== w.id));
                            } else {
                              setNewUserScopeWarehouses([...newUserScopeWarehouses, w.id]);
                            }
                          }}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold">[{u?.code}-{w.code}] {w.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Tạo Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER RBAC ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Chỉnh Sửa Phân Quyền: @{editingUser.username}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Họ Và Tên *
                  </label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Vai Trò (Role) *
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value={Role.WAREHOUSE_STAFF}>WAREHOUSE_STAFF (Thủ kho)</option>
                    <option value={Role.WAREHOUSE_MANAGER}>WAREHOUSE_MANAGER (Trưởng kho)</option>
                    <option value={Role.APPROVER}>APPROVER (Ban Giám Đốc)</option>
                    <option value={Role.VIEWER}>VIEWER (Thanh tra / Tra cứu)</option>
                    <option value={Role.ADMIN}>ADMIN (Quản trị viên tối cao)</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Tài khoản đang Hoạt Động (Bỏ chọn để Khóa tài khoản)</span>
                </label>
              </div>

              {/* Scope Units */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Phạm Vi Chi Nhánh (scope_units)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {units.map(u => {
                    const isChecked = editingUser.scopeUnits?.includes(u.id);
                    return (
                      <label key={u.id} className="flex items-center space-x-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const cur = editingUser.scopeUnits || [];
                            const next = isChecked ? cur.filter(x => x !== u.id) : [...cur, u.id];
                            setEditingUser({ ...editingUser, scopeUnits: next });
                          }}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold">[{u.code}] {u.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Scope Warehouses */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Phạm Vi Kho (scope_warehouses)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {warehouses.map(w => {
                    const isChecked = editingUser.scopeWarehouses?.includes(w.id);
                    const u = units.find(unit => unit.id === w.unitId);
                    return (
                      <label key={w.id} className="flex items-center space-x-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const cur = editingUser.scopeWarehouses || [];
                            const next = isChecked ? cur.filter(x => x !== w.id) : [...cur, w.id];
                            setEditingUser({ ...editingUser, scopeWarehouses: next });
                          }}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold">[{u?.code}-{w.code}] {w.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Lưu Quyền &amp; Trạng Thái
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADMIN RESET PASSWORD (4.4) ================= */}
      {resetTargetUser && (
        <AdminResetPasswordModal
          targetUser={resetTargetUser}
          adminUser={currentUser}
          onClose={() => setResetTargetUser(null)}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
};
