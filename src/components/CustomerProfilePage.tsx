/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShoppingBag, CreditCard, Heart, LogOut, Loader2, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  date: string;
  product: string;
  total: number;
  status: string;
}

export default function CustomerProfilePage() {
  // Trạng thái tải dữ liệu từ API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái lưu trữ thông tin cá nhân của khách hàng
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Dương Ánh Ngọc',
    email: 'anhngoc.duong@gmail.com',
    phone: '0912345678',
    address: 'Số 15, Phố Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    rank: 'Thành viên Vàng (Gold)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  });

  // Giả lập danh sách đơn hàng đã mua của khách hàng
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: 'DH-1024', date: '01/06/2026', product: 'Máy giặt LG Inverter 9.5 kg', total: 12490000, status: 'Đang giao hàng' },
    { id: 'DH-0982', date: '15/05/2026', product: 'Nồi cơm điện cao tần Panasonic 1.8L', total: 3850000, status: 'Đã hoàn thành' }
  ]);

  // Lấy User ID sinh ra từ localStorage nếu đã đăng nhập từ module Auth
  useEffect(() => {
    const fetchProfileData = async () => {
      // Đọc thông tin từ localStorage
      const cachedUserStr = localStorage.getItem('electro_current_user') || localStorage.getItem('user_info');
      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          const userId = cachedUser.user_id || 2; // Đăng nhập mặc định userId = 2 cho Đào Dương Anh

          setLoading(true);
          // Truy xuất từ endpoint /api/profile của dải database
          const response = await fetch(`/api/profile?user_id=${userId}`);
          const data = await response.json();

          if (data.success && data.user) {
            setCustomerInfo({
              name: data.user.full_name || cachedUser.full_name || 'Đào Dương Anh',
              email: data.user.email || cachedUser.email || 'ngocduonganhxk@gmail.com',
              phone: data.user.phone || cachedUser.phone || '0987654321',
              address: 'Số 15, Phố Cầu Giấy, Quận Cầu Giấy, Hà Nội', // Địa chỉ lấy mẫu
              rank: data.user.role_id === 1 ? 'Quản trị viên (Admin)' : 'Thành viên Vàng (Gold)',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            });

            if (data.ordersOrLogs && Array.isArray(data.ordersOrLogs) && data.ordersOrLogs.length > 0) {
              const mappedOrders = data.ordersOrLogs.map((ord: any) => ({
                id: `DH-${ord.order_id || ord.id || 'MOCK'}`,
                date: ord.created_at ? new Date(ord.created_at).toLocaleDateString('vi-VN') : 'Vừa xong',
                product: ord.product_name || 'Laptop Electro ProBook X14 Carbon',
                total: ord.total_amount || ord.price || 24990000,
                status: ord.order_status === 'pending' ? 'Chờ kiểm duyệt' :
                        ord.order_status === 'delivered' ? 'Đã hoàn thành' : 'Đang sửa đổi'
              }));
              setOrders(mappedOrders);
            }
          }
        } catch (err) {
          console.error('Đọc API lỗi: ', err);
          setError('Không kết nối được SQL Server, đang chạy chế độ giả lập dự phòng.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    // Xoá thông tin phân quyền truy cập và chuyển hướng
    localStorage.removeItem('user_role');
    localStorage.removeItem('electro_current_user');
    localStorage.removeItem('user_info');
    window.location.href = '/profile';
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* THANH ĐIỀU HƯỚNG RIÊNG CHO KHÁCH HÀNG (CUSTOMER HEADER) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-blue-600 tracking-tight">TECH<span className="text-slate-900">STORE</span></span>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">Khách hàng</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <a href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <ArrowLeft size={14} /> Quay về Shop
            </a>
            <button className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors cursor-pointer" onClick={handleLogout}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* HIỂN THỊ CHỜ LOAD HOẶC LỖI KHÔNG BLOCK */}
      {loading && (
        <div className="text-center py-4 bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang đồng bộ hồ sơ lưu trên Microsoft SQL Server...</span>
        </div>
      )}

      {/* NỘI DUNG CHÍNH CỦA TRANG KHÁCH HÀNG */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* THẺ THÔNG TIN TÀI KHOẢN KHÁCH HÀNG (Bên trái) */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="px-6 pb-6 relative flex flex-col items-center text-center">
              <img 
                src={customerInfo.avatar} 
                alt={customerInfo.name} 
                className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-md bg-white -mt-10 mb-3"
              />
              <h2 className="text-lg font-bold text-slate-900">{customerInfo.name}</h2>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mt-1">
                {customerInfo.rank}
              </span>

              {/* Danh sách thông tin liên hệ chi tiết */}
              <div className="w-full mt-6 space-y-4 text-left border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Mail size={16} /></div>
                  <span className="truncate font-medium">{customerInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Phone size={16} /></div>
                  <span className="font-medium">{customerInfo.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0"><MapPin size={16} /></div>
                  <span className="font-medium leading-relaxed">{customerInfo.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC QUẢN LÝ ĐƠN MUA & TIỆN ÍCH KHÁCH HÀNG (Bên phải) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Thanh menu tab chức năng phụ phụ */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex gap-2">
              <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer">
                <ShoppingBag size={14} /> Lịch sử đơn hàng
              </button>
              <button className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <CreditCard size={14} /> Sổ địa chỉ nhận hàng
              </button>
              <button className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <Heart size={14} /> Sản phẩm yêu thích
              </button>
            </div>

            {/* Bảng hiển thị danh sách đơn hàng đã mua */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Đơn hàng mua gần đây</h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 font-mono">{order.id}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{order.date}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{order.product}</p>
                      <p className="text-sm font-black text-slate-900 mt-1">{order.total.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${order.status === 'Đã hoàn thành' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
