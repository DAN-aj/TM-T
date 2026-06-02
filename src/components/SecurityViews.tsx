/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ShoppingBag, 
  Edit2, 
  Save, 
  FileText,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { User as UserType, Order, Product } from '../types';

// ==========================================
// 1. GIAO DIỆN 403 KHÔNG CÓ QUYỀN TRUY CẬP (FORBIDDEN)
// ==========================================
interface ForbiddenPageProps {
  onBackToHome: () => void;
  onOpenAuth: () => void;
  currentUser: UserType | null;
}

export function ForbiddenPage({ onBackToHome, onOpenAuth, currentUser }: ForbiddenPageProps) {
  return (
    <div className="max-w-3xl mx-auto my-16 px-4 text-center animate-fade-in" id="forbidden_security_screen">
      <div className="bg-white rounded-3xl border border-red-100 shadow-xl overflow-hidden">
        {/* Banner tín hiệu cảnh báo */}
        <div className="bg-red-500 py-10 px-6 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 text-white/20 font-mono font-bold text-6xl select-none">403</div>
          <div className="bg-white/10 p-5 rounded-full ring-8 ring-white/5 animate-pulse mb-4">
            <ShieldAlert className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">403 — TRUY CẬP BỊ TỪ CHỐI</h2>
          <p className="text-red-100 text-xs mt-1 bg-red-600/30 px-3 py-1 rounded-full font-mono uppercase tracking-wider font-semibold">
            Security Exception: Access Denied
          </p>
        </div>

        {/* Nội dung chi tiết lỗi */}
        <div className="p-8 md:p-12 text-left space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 space-y-3.5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Lock className="w-4.5 h-4.5 text-red-500" />
              <span>Chính sách Bảo mật &amp; Phân quyền Electro</span>
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Xin lỗi quý khách, khu vực này yêu cầu tài khoản được cấp quyền <strong className="text-amber-600">Quản trị viên (Admin)</strong> của hệ thống. 
              Tài khoản hiện thời của bạn ({currentUser ? `${currentUser.full_name} — Hạng mục: Khách hàng` : 'Khách vãng lai chưa đăng ký đăng nhập'}) 
              không đáp ứng các dải mã khóa bảo an quy định.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              id="forbidden_back_to_home_btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang Chủ</span>
            </button>

            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                id="forbidden_trigger_login_modal_btn"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập Tk Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                id="forbidden_switching_admin_directly_btn"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập người dùng khác</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. GIAO DIỆN 404 KHÔNG TÌM THẤY TRANG (NOT FOUND)
// ==========================================
interface NotFoundPageProps {
  onBackToHome: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentView: (view: any) => void;
}

export function NotFoundPage({ onBackToHome, searchQuery, setSearchQuery, setCurrentView }: NotFoundPageProps) {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim() !== '') {
      setSearchQuery(localSearch);
      setCurrentView('listing');
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-16 px-4 text-center animate-fade-in" id="not_found_security_screen">
      <div className="bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden p-8 md:p-14 flex flex-col items-center">
        {/* Minh hoạ hình đồ họa 404 tối giản lịch thiệp */}
        <div className="relative mb-6">
          <div className="text-slate-100 font-mono font-black text-9xl leading-none select-none tracking-tighter">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-amber-50 p-4 rounded-full border border-amber-100">
              <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase">Không Tìm Thấy Trang Yêu Cầu</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
          Đường dẫn (URL) bạn đang truy xuất có thể đã bị thay đổi, gỡ bỏ hoặc tạm thời ngừng hoạt động để phục vụ nâng cấp định kỳ 2026.
        </p>

        {/* Thanh tìm kiếm nhanh lỗi 404 */}
        <form onSubmit={handleSearchSubmit} className="mt-8 w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Khám phá các thiết bị điện máy khác tại đây..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm focus:outline-hidden text-center"
              id="not_found_local_search_input"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
            >
              Tìm Kiếm
            </button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full justify-center">
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            id="not_found_back_home_primary_btn"
          >
            <span>Trở về Trang Chủ Electro</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('listing');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>Xem Danh Sách Hàng Hoá</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TRANG HỒ SƠ CỦA TÔI & LỊCH SỬ ĐƠN HÀNG (CUSTOMER PROFILE)
// ==========================================
interface CustomerProfilePageProps {
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  orders: Order[];
  onCancelOrder: (orderId: number) => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function CustomerProfilePage({
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  orders,
  onCancelOrder,
  onAddToast
}: CustomerProfilePageProps) {
  // Lấy các hoá đơn tương ứng của người dùng hiện thời
  const myOrders = orders.filter((o) => o.user_id === currentUser?.user_id);

  // States hỗ trợ chỉnh sửa tài khoản cá nhân
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.full_name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');

  if (!currentUser) {
    return (
      <div className="py-20 text-center text-xs text-gray-400 font-bold">
        Đang chuyển hướng vui lòng chờ...
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      onAddToast('Họ tên không được phép để chuỗi trống!', 'error');
      return;
    }
    if (!editPhone.trim()) {
      onAddToast('Số điện thoại liên lạc đang bị khuyết!', 'error');
      return;
    }

    // Cập nhật state currentUser
    const updatedUser: UserType = {
      ...currentUser,
      full_name: editName,
      phone: editPhone
    };

    setCurrentUser(updatedUser);

    // Cập nhật trong danh sách quản trị mockUsers
    setUsers((prev) => prev.map((u) => u.user_id === currentUser.user_id ? updatedUser : u));

    // Đồng bộ tức thời vào localStorage
    localStorage.setItem('electro_current_user', JSON.stringify(updatedUser));

    setIsEditing(false);
    onAddToast('Cập nhật tài khoản cá nhân của bạn thành công!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="customer_profile_main_screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Cột trái: Thông tin tài khoản & Chỉnh sửa hồ sơ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 border-b border-gray-100 pb-3.5 mb-5 flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-600 animate-pulse" />
              <span>Hồ Sơ Của Tôi</span>
            </h3>

            {/* Chi tiết tài khoản */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5 bg-slate-50/70 p-3 rounded-xl border border-gray-100">
                  <div className="h-10 w-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold uppercase text-sm">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-830 text-slate-800">{currentUser.full_name}</h4>
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {currentUser.role_id === 1 ? 'Quản trị viên' : 'Thành viên Đồng'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-600 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-semibold text-gray-400">Hòm Thư (Email):</span>
                    <span className="font-medium text-slate-800">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-semibold text-gray-400">Số Điện Thoại:</span>
                    <span className="font-medium text-slate-800 font-mono">{currentUser.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-semibold text-gray-400">Trạng Thái:</span>
                    <span className="text-emerald-600 font-bold flex items-center">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block animate-ping"></span>
                      <span>Hoạt động</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-400">Ngày Tham Gia:</span>
                    <span className="font-medium text-slate-800">{new Date(currentUser.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 border border-dashed border-gray-300 hover:border-cyan-500 text-slate-700 hover:text-cyan-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  id="profile_enable_editing_btn"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Cập Nhật Thông Tin Cá Nhân</span>
                </button>
              </div>
            ) : (
              /* Biểu mẫu cập nhật */
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Họ và Tên Quý khách</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 text-xs"
                      required
                    />
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Số điện thoại liên lạc</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 text-xs font-mono"
                      required
                    />
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors text-center"
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Cột phải: Lịch sử đơn hàng của tôi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs min-h-[400px]">
            <h3 className="text-base font-bold text-slate-800 border-b border-gray-100 pb-3.5 mb-5 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-605 text-cyan-605 text-cyan-600" />
              <span>Lịch Sử Giao Dịch &amp; Đơn Hàng ({myOrders.length} Đơn)</span>
            </h3>

            {myOrders.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400 space-y-3">
                <FileText className="w-12 h-12 text-gray-200 mx-auto animate-bounce" />
                <p>Bạn chưa khởi lập giao dịch mua bán điện máy nào của Electro trong năm 2026.</p>
                <p className="text-[10.5px] text-gray-400/80">Hãy thêm sản phẩm mong muốn vào giỏ và hoàn thiện thủ tục Thanh toán.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {myOrders.map((ord) => (
                  <div 
                    key={ord.order_id} 
                    className="p-4 rounded-2xl border border-gray-150 bg-slate-50/50 hover:bg-white transition-all hover:shadow-xs"
                    id={`profile_customer_order_${ord.order_id}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-mono font-bold text-slate-800 text-xs">MÃ ĐƠN: #HD-{ord.order_id}</span>
                        <p className="text-[10px] text-gray-400 font-medium">Đặt ngày: {new Date(ord.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono border ${
                        ord.order_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        ord.order_status === 'processing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        ord.order_status === 'shipped' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        ord.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-650 border-rose-100 text-rose-700'
                      }`}>
                        {ord.order_status === 'pending' ? 'Chờ kiểm duyệt' :
                         ord.order_status === 'processing' ? 'Đang chuẩn bị' :
                         ord.order_status === 'shipped' ? 'Tổng đài giao lưu thông' :
                         ord.order_status === 'delivered' ? 'Giao thành công' : 'Đã huỷ quý khách'}
                      </span>
                    </div>

                    <div className="border-t border-b border-gray-150 py-3.5 my-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium uppercase">Địa chỉ vận đặt:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[130px] inline-block">{ord.shipping_address}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium uppercase">Giá trị hóa đơn:</span>
                        <span className="font-bold text-red-600 font-mono">{ord.total_amount.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium uppercase">Thanh toán:</span>
                        <span className={`font-semibold ${
                          ord.payment_status === 'paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'
                        }`}>{ord.payment_status === 'paid' ? 'Đã thu tiền' : 'Thu COD / Chờ'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium uppercase">Vận chuyển:</span>
                        <span className="font-semibold text-slate-800">{ord.shipping_fee === 0 ? 'Miễn phí VIP' : `${ord.shipping_fee.toLocaleString('vi-VN')} ₫`}</span>
                      </div>
                    </div>

                    {/* Tiến trình thanh điều khiển và trạng thái tracker */}
                    <div className="mt-3.5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                      <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Trạng thái: Hoạt động giám sát tích cực</span>
                      </div>

                      {/* Cho phép khách hàng gửi yêu cầu hủy trực tiếp có tương tác xác thực và hoàn tác ở cấp cao */}
                      {ord.order_status !== 'cancelled' && ord.order_status !== 'delivered' && ord.order_status !== 'shipped' && (
                        <button
                          onClick={() => onCancelOrder(ord.order_id)}
                          className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Huỷ Hoá Đơn Bán Lẻ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
