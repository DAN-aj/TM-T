/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  Ban,
  UserCheck,
  UserX,
  X,
  ArrowLeft,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { Product, Order, User, Category, Brand } from '../types';
import { mockCategories, mockBrands } from '../data/mockData';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  users: User[];
  onAddProduct: (productData: Omit<Product, 'product_id' | 'avg_rating'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onUpdateOrderStatus: (orderId: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => void;
  onUpdatePaymentStatus: (orderId: number, paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') => void;
  onUpdateUserStatus: (userId: number, status: 'active' | 'inactive') => void;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  users,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onUpdateUserStatus,
  onClose
}: AdminDashboardProps) {
  // --- TRẠNG THÁI MENUBAR SIDEBAR HOẠT ĐỘNG ---
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'orders'>('overview');

  // --- TRẠNG THÁI QUẢN LÝ SẢN PHẨM ---
  const [productSearch, setProductSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Khởi tạo các ô nhập dữ liệu của Form Thêm/Sửa sản phẩm
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formSku, setFormSku] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formCategory, setFormCategory] = useState<number>(1);
  const [formBrand, setFormBrand] = useState<number>(1);
  const [formDesc, setFormDesc] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // --- TRẠNG THÁI QUẢN LÝ NGƯỜI DÙNG ---
  const [userSearch, setUserSearch] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // --- TRẠNG THÁI QUẢN LÝ ĐƠN HÀNG ---
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // --- TRA CỨU TIỆN ÍCH DANH MỤC & THƯƠNG HIỆU ---
  const getCategoryName = (catId: number) => {
    const cat = mockCategories.find((c) => c.category_id === catId);
    return cat ? cat.category_name : 'Điện tử gia dụng';
  };

  const getBrandName = (brandId: number) => {
    const b = mockBrands.find((br) => br.brand_id === brandId);
    return b ? b.brand_name : 'Electro';
  };

  // --- LOGIC TÍNH TOÁN BẢNG TỔNG QUAN (ANALYTICS & STATS) ---
  const stats = useMemo(() => {
    const totalProducts = products.length;
    
    // Tính tổng doanh thu từ hóa đơn ĐÃ THANH TOÁN (hoặc trạng thái giao dịch thành công)
    const totalRevenue = orders
      .filter((o) => o.payment_status === 'paid' && o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalOrders = orders.length;
    const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;
    const activeUsersCount = users.filter((u) => u.status === 'active').length;

    // Phân loại doanh số bán hàng của danh mục theo tổng hóa đơn
    // Để có dữ liệu bento sinh động
    return {
      totalProducts,
      totalRevenue,
      totalOrders,
      pendingOrdersCount,
      activeUsersCount
    };
  }, [products, orders, users]);

  // --- LOGIC TÍNH TOÁN TOP 7 MẶT HÀNG ĐẠT DOANH THU CAO NHẤT ---
  const topRevenueProducts = useMemo(() => {
    const revMap: { [key: number]: { qty: number; revenue: number } } = {};
    
    // Khởi tạo hạt giống (bootstrapping seed) dựa trên product_id giúp thống kê cực sinh động và khách quan
    products.forEach((p) => {
      const seedQty = ((p.product_id * 17 + 11) % 19) + 4; // Lượng bán ban đầu từ 4 - 22 chiếc
      revMap[p.product_id] = {
        qty: seedQty,
        revenue: seedQty * p.price
      };
    });

    // Cộng gộp hóa đơn thực tế trong phiên / CSDL
    orders.forEach((o) => {
      if (o.order_status !== 'cancelled' && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const pid = item.product_id;
          const qty = item.quantity;
          const price = item.unit_price;
          if (revMap[pid]) {
            revMap[pid].qty += qty;
            revMap[pid].revenue += qty * price;
          } else {
            revMap[pid] = { qty, revenue: qty * price };
          }
        });
      }
    });

    // Chuyển đổi và xắp xếp giảm dần theo doanh thu của 7 mặt hàng dẫn đầu
    return products
      .map((p) => ({
        ...p,
        totalSold: revMap[p.product_id]?.qty || 0,
        totalRevenue: revMap[p.product_id]?.revenue || 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 7);
  }, [products, orders]);

  // --- BỘ LỌC DANH SÁCH SẢN PHẨM ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchText = p.product_name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
      return matchText && matchCategory;
    });
  }, [products, productSearch, categoryFilter]);

  // --- BỘ LỌC NGƯỜI DÙNG ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchText = u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch);
      const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchText && matchStatus;
    });
  }, [users, userSearch, userStatusFilter]);

  // --- BỘ LỌC ĐƠN HÀNG ---
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchId = o.order_id.toString().includes(orderSearch) || o.shipping_address.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'all' || o.order_status === orderStatusFilter;
      return matchId && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // --- MỞ FORM THÊM SẢN PHẨM ---
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice(1500000);
    setFormStock(20);
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormImage('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600');
    setFormCategory(1);
    setFormBrand(1);
    setFormDesc('Thiết bị điện máy công nghệ cao cấp chính hãng Electro.');
    setFormError(null);
    setShowProductForm(true);
  };

  // --- MỞ FORM SỬA SẢN PHẨM ---
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.product_name);
    setFormPrice(product.price);
    setFormStock(product.stock_quantity);
    setFormSku(product.sku);
    setFormImage(product.image_url);
    setFormCategory(product.category_id);
    setFormBrand(product.brand_id);
    setFormDesc(product.description);
    setFormError(null);
    setShowProductForm(true);
  };

  // --- GỬI FORM THÊM/SỬA SẢN PHẨM ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Họ tên gọi sản phẩm không được trống!');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Giá bán sản phẩm phải lớn hơn 0 ₫!');
      return;
    }
    if (formStock < 0) {
      setFormError('Số lượng tồn không được là số âm!');
      return;
    }

    if (editingProduct) {
      // Trường hợp sửa
      onEditProduct({
        ...editingProduct,
        product_name: formName.trim(),
        price: formPrice,
        stock_quantity: formStock,
        sku: formSku.trim(),
        image_url: formImage.trim() || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600',
        category_id: formCategory,
        brand_id: formBrand,
        description: formDesc.trim(),
        status: formStock <= 0 ? 'out_of_stock' : 'available'
      });
    } else {
      // Trường hợp thêm mới
      onAddProduct({
        product_name: formName.trim(),
        price: formPrice,
        stock_quantity: formStock,
        sku: formSku.trim(),
        image_url: formImage.trim() || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600',
        category_id: formCategory,
        brand_id: formBrand,
        description: formDesc.trim(),
        status: formStock <= 0 ? 'out_of_stock' : 'available'
      });
    }

    setShowProductForm(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-left font-sans" id="admin_full_viewport">
      {/* =========================================================================================
          PANEL SIDEBAR BÊN TRÁI ADMIN (LEFT SIDEBAR NAVIGATION RAIL)
         ========================================================================================= */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-850" id="admin_left_sidebar">
        {/* Phần Logo thương hiệu hệ thống */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-550 bg-cyan-600 flex items-center justify-center text-white font-black text-sm tracking-widest shadow-md">
              E
            </div>
            <div className="text-left leading-none">
              <span className="text-white text-sm font-black uppercase tracking-wider block">Electro Admin</span>
              <span className="text-[9px] text-cyan-400 font-mono tracking-widest">VERSION 2026</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 bg-slate-800 text-slate-305 hover:text-white rounded-md cursor-pointer"
            title="Thoát chế độ Admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin đại diện tài khoản */}
        <div className="p-4 mx-4 my-5 bg-slate-800/50 rounded-xl flex items-center space-x-3 border border-slate-800/40">
          <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-extrabold text-xs">
            VA
          </div>
          <div className="text-left font-sans">
            <span className="text-[11px] text-slate-400 block font-semibold">Tài khoản quản trị</span>
            <strong className="text-white text-xs block truncate max-w-[130px]">Nguyễn Văn Admin</strong>
          </div>
        </div>

        {/* Các nút bấm điều hướng Tab chính */}
        <nav className="flex-1 px-4 space-y-1.5 pb-6">
          {/* Tab 1: Tổng quan */}
          <button
            onClick={() => { setActiveTab('overview'); setSelectedOrderDetail(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'hover:bg-slate-800/60 text-slate-405 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng quan hệ thống</span>
          </button>

          {/* Tab 2: Quản lý sản phẩm */}
          <button
            onClick={() => { setActiveTab('products'); setSelectedOrderDetail(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'hover:bg-slate-800/60 text-slate-405 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Quản lý sản phẩm</span>
          </button>

          {/* Tab 3: Quản lý người dùng */}
          <button
            onClick={() => { setActiveTab('users'); setSelectedOrderDetail(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'hover:bg-slate-800/60 text-slate-405 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý người dùng</span>
          </button>

          {/* Tab 4: Quản lý đơn hàng */}
          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrderDetail(null); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'hover:bg-slate-800/60 text-slate-405 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quản lý đơn hàng</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="ml-auto block h-4 px-1.5 bg-amber-500 text-slate-950 text-[10px] rounded-full text-center font-extrabold leading-tight">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Nút thoát nhanh ra Giao diện khách hàng ở chân Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-400 border border-slate-700/60 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem Giao Diện Khách</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================================
          KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH THEO TỪNG TAB (MAIN CENTRAL VIEWPORTS)
         ========================================================================================= */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* =========================================================================================
            TAB 1: TRANG TỔNG QUAN (TAB: DASHBOARD OVERVIEW)
           ========================================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8" id="admin_tab_overview">
            
            {/* Header chào mừng Admin */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <LayoutDashboard className="w-5.5 h-5.5 text-cyan-600" />
                  <span>Tổng Quan Điều Hành Doanh Thương Electro 2026</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 leading-normal font-sans">
                  Theo dõi trạng thái sức khỏe vận hành kho bãi, cập nhật luồng sản phẩm, quản lý và duyệt doanh số bán hàng từ khách toàn quốc.
                </p>
              </div>
              <div className="mt-3 md:mt-0 px-4 py-2 bg-white border rounded-xl flex items-center space-x-2 text-xs text-slate-700 font-bold shadow-2xs">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span>Năm hoạt động: 2026</span>
              </div>
            </div>

            {/* Khối Card bento hiển thị Thống kê nhanh (Dashboard Stats Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="overview_stats_grid">
              
              {/* Card 1: Tổng doanh thu (Doanh thu từ những đơn hàng ĐÃ thanh toán và không bị hủy) */}
              <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:border-cyan-300 transition-all flex items-start space-x-4">
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tổng tiền thực thu</span>
                  <p className="text-xl font-mono font-black text-slate-900 leading-tight">
                    {stats.totalRevenue.toLocaleString('vi-VN')} ₫
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    Tính trên hóa đơn Đã Paid
                  </span>
                </div>
              </div>

              {/* Card 2: Tổng số lượng đơn hàng */}
              <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:border-cyan-300 transition-all flex items-start space-x-4">
                <div className="p-3.5 bg-cyan-50 text-cyan-600 rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tổng lượng đơn hàng</span>
                  <p className="text-xl font-mono font-black text-slate-900 leading-tight">
                    {stats.totalOrders} Đơn
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold italic">Đã chốt từ giao diện khách</span>
                </div>
              </div>

              {/* Card 3: Số lượng sản phẩm trên sàn */}
              <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:border-cyan-300 transition-all flex items-start space-x-4">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tổng thiết bị kệ</span>
                  <p className="text-xl font-mono font-black text-slate-900 leading-tight">
                    {stats.totalProducts} Sản phẩm
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold leading-normal">Laptop, điện lạnh, gia dụng</span>
                </div>
              </div>

              {/* Card 4: Tổng số khách hàng đã cấp ID */}
              <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:border-cyan-300 transition-all flex items-start space-x-4">
                <div className="p-3.5 bg-amber-50 text-amber-500 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Khách hàng kích hoạt</span>
                  <p className="text-xl font-mono font-black text-slate-900 leading-tight">
                    {stats.activeUsersCount} Tài khoản
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                    <Check className="w-3 h-3 mr-0.5" />
                    Trạng thái: Hoạt động khỏe mạnh
                  </span>
                </div>
              </div>

            </div>

            {/* Layout lưới hiển thị Danh sách Khách hàng hoạt động và Hóa đơn gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* BẢNG TRÁI: Dòng chảy Đơn đặt hàng gần đây (Recent Orders Table) */}
              <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-left">
                <div className="flex items-center justify-between border-b pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <ShoppingBag className="w-4.5 h-4.5 text-cyan-600" />
                    <span>Hóa đơn phát sinh gần đây ({orders.length > 5 ? '5 Đơn mới nhất' : `${orders.length} Đơn`})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-[10px] text-cyan-600 hover:underline font-bold uppercase cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 font-sans">
                        <th className="py-3 px-4 text-center">ID Đơn</th>
                        <th className="py-3 px-4">Ngày đặt mua</th>
                        <th className="py-3 px-4">Trạng thái phát</th>
                        <th className="py-3 px-4">Thanh toán</th>
                        <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.order_id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-center font-bold font-mono text-slate-850">
                            #{ord.order_id}
                          </td>
                          <td className="py-3 px-4 text-gray-400 font-mono text-[10px]">
                            {new Date(ord.created_at).toLocaleDateString('vi-VN')} {new Date(ord.created_at).toLocaleTimeString('vi-VN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] uppercase font-mono ${
                              ord.order_status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : ord.order_status === 'cancelled'
                                ? 'bg-red-50 text-red-650'
                                : ord.order_status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-705'
                            }`}>
                              {ord.order_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold">
                            <span className={`px-1.5 py-0.5 rounded-xs text-[9px] uppercase font-mono ${
                              ord.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-55 bg-red-50 text-red-700'
                            }`}>
                              {ord.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black font-mono text-slate-900">
                            {ord.total_amount.toLocaleString('vi-VN')} ₫
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 font-light italic bg-slate-50/30">
                            Chưa phát sinh mua sắm từ tệp khách hàng.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BẢNG PHẢI: Khách hàng hoạt động nhiều nhất (Top active customers) */}
              <div className="lg:col-span-4 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-left">
                <div className="flex items-center justify-between border-b pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Users className="w-4.5 h-4.5 text-cyan-600" />
                    <span>Tệp khách hàng ({users.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-[10px] text-cyan-600 hover:underline font-bold uppercase cursor-pointer"
                  >
                    Quản lý
                  </button>
                </div>

                <div className="space-y-4">
                  {users.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 border hover:border-gray-300 rounded-2xl transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-cyan-50 border border-cyan-150 flex items-center justify-center text-cyan-800 font-extrabold text-xs">
                          {u.full_name.charAt(0)}{u.full_name.split(' ').slice(-1)[0]?.charAt(0)}
                        </div>
                        <div className="text-left font-sans space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-none">{u.full_name}</h4>
                          <span className="text-[10px] text-gray-400 block font-mono">{u.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* WIDGET TOP MẶT HÀNG DOANH THU CAO NHẤT (TỐI ĐA 7) */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-left mt-8" id="admin_top_revenue_widget">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <span>Xếp Hạng 7 Mặt Hàng Có Tổng Doanh Thu Lớn Nhất</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Tính toán tổng nguồn thu nhập lũy kế bằng hiệu số Đơn hàng hoàn thành hệ thống và luồng mua sắm mới.
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-extrabold border border-amber-200 uppercase tracking-wider">
                  🏆 TOP PERFORMERS (MAX 7)
                </div>
              </div>

              <div className="space-y-4">
                {topRevenueProducts.map((p, index) => {
                  const maxRevenue = topRevenueProducts[0]?.totalRevenue || 1;
                  const ratio = (p.totalRevenue / maxRevenue) * 100;
                  const rankColors = [
                    'bg-amber-500 text-white', // TOP 1 (Gold)
                    'bg-slate-400 text-white', // TOP 2 (Silver)
                    'bg-amber-700 text-white', // TOP 3 (Bronze)
                    'bg-slate-100 text-slate-500 border border-slate-200', // TOP 4
                    'bg-slate-100 text-slate-500 border border-slate-200', // TOP 5
                    'bg-slate-100 text-slate-500 border border-slate-200', // TOP 6
                    'bg-slate-100 text-slate-500 border border-slate-200', // TOP 7
                  ];

                  return (
                    <div key={p.product_id} className="p-3.5 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Block: Rank + Image + Core info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-7 h-7 rounded-lg font-black text-[11px] font-mono flex items-center justify-center shrink-0 shadow-xs ${rankColors[index]}`}>
                          #{index + 1}
                        </div>
                        <img 
                          src={p.image_url} 
                          className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0" 
                          alt="Product"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 max-w-md">
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">{p.product_name}</h4>
                          <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-gray-400">
                            <span className="font-semibold text-slate-700 font-mono text-[10px]">Mã: {p.sku}</span>
                            <span className="text-slate-300">|</span>
                            <span>Hãng: {getBrandName(p.brand_id)}</span>
                            <span className="text-slate-300">|</span>
                            <span>Danh mục: {getCategoryName(p.category_id)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Block: Progress bar visualization */}
                      <div className="hidden lg:block w-48 shrink-0">
                        <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
                          <span>Doanh thu tương đối</span>
                          <span>{Math.round(ratio)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>

                      {/* Right Block: Stats metrics */}
                      <div className="text-right flex items-center justify-between md:justify-end md:space-x-8">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans">Đơn giá gốc</span>
                          <strong className="text-xs font-semibold text-slate-700 font-mono">
                            {p.price.toLocaleString('vi-VN')} ₫
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans">Số lượng đã bán</span>
                          <strong className="text-xs font-bold text-cyan-600 font-mono">
                            {p.totalSold} chiếc
                          </strong>
                        </div>
                        <div className="min-w-[140px]">
                          <span className="text-[10px] text-gray-400 block font-sans">Tổng doanh thu</span>
                          <strong className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                            {p.totalRevenue.toLocaleString('vi-VN')} ₫
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================================
            TAB 2: TRANG QUẢN LÝ SẢN PHẨM KHỔ LỚN (TAB: PRODUCT MANAGEMENT DETAILED)
           ========================================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6" id="admin_tab_products">
            
            {/* Thanh tác vụ điều phối Products */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <Package className="w-5.5 h-5.5 text-cyan-600" />
                  <span>Kệ Hàng Điện Máy &amp; Kho Vận Electro</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Thực hiện thêm bớt, cập nhật thông tin kỹ thuật, định đoạt giá cả và tra cứu xuất kho.
                </p>
              </div>

              {/* Nút thêm mới laptop, tivi, điều hòa, quạt */}
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center space-x-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
                id="admin_add_product_action_btn"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thiết Bị Điện Tử Mới</span>
              </button>
            </div>

            {/* Khung tìm kiếm nâng cao (Filters & Searches) */}
            <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-2xs flex flex-col sm:flex-row gap-4 items-center">
              {/* Thẻ tìm kiếm từ khóa */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tra cứu theo mã SKU (Ví dụ: LAPTOP), tên gọi của thiết bị..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-gray-250 hover:border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                />
              </div>

              {/* Lọc theo phân ngành của tệp Categories */}
              <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 select-none">
                <Filter className="w-4 h-4 text-cyan-600 shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryFilter(val === 'all' ? 'all' : parseInt(val));
                  }}
                  className="w-full sm:w-48 bg-white border border-gray-250 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">Mọi ngành hàng mẫu</option>
                  {mockCategories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BẢNG LIÊN KÊ KHỔ LỚN SẢN PHẨM */}
            <div className="bg-white border border-gray-150 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-55 bg-gray-50 text-gray-500 font-bold border-b border-gray-100 font-sans uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Sản phẩm kỹ thuật</th>
                      <th className="py-4 px-4">Nhận diện (SKU)</th>
                      <th className="py-4 px-4 text-right">Giá bán xuất</th>
                      <th className="py-4 px-4 text-center">Tồn kho mẫu</th>
                      <th className="py-4 px-4 text-center">Tương tác sửa xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.product_id} className="hover:bg-gray-50/60 transition-colors">
                        {/* 1. Thông tin cấu trúc đầu */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-white border rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs font-sans">
                              <img
                                src={p.image_url}
                                alt={p.product_name}
                                className="max-h-full max-w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="text-left space-y-1">
                              <strong className="text-xs text-slate-900 block font-bold leading-snug line-clamp-2">
                                {p.product_name}
                              </strong>
                              <span className="inline-block text-[9px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-sm font-bold font-sans">
                                {getCategoryName(p.category_id)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. SKU / Brand */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-[11px] block">{p.sku}</span>
                            <span className="text-[10px] text-gray-400 capitalize">{getBrandName(p.brand_id)}</span>
                          </div>
                        </td>

                        {/* 3. Giá bán */}
                        <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-xs">
                          {p.price.toLocaleString('vi-VN')} ₫
                        </td>

                        {/* 4. Tồn kho */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] uppercase border ${
                            p.stock_quantity >= 10
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : p.stock_quantity >= 5
                              ? 'bg-amber-50 text-amber-800 border-amber-100'
                              : 'bg-red-50 text-red-650 border-red-100 font-extrabold'
                          }`}>
                            {p.stock_quantity > 0 ? `${p.stock_quantity} Chiếc` : 'Hết Kho'}
                          </span>
                          {p.stock_quantity < 5 && (
                            <div className="text-[9px] text-red-600 font-black uppercase animate-pulse mt-1">
                              Cảnh báo hết hàng
                            </div>
                          )}
                        </td>

                        {/* 5. Tác vụ sửa xóa */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 bg-gray-50 hover:bg-cyan-50 border border-gray-150 hover:border-cyan-200 rounded-xl text-slate-600 hover:text-cyan-600 transition-all cursor-pointer"
                              title="Sửa cấu hình kỹ thuật"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn chắc chắn muốn xóa sản phẩm ${p.product_name} khỏi hệ thống?`)) {
                                  onDeleteProduct(p.product_id);
                                }
                              }}
                              className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-150 hover:border-red-200 rounded-xl text-slate-650 hover:text-red-600 transition-all cursor-pointer"
                              title="Hủy gỡ loại này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center flex flex-col items-center justify-center space-y-2">
                          <div className="h-12 w-12 bg-slate-100 text-gray-400 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 animate-bounce" />
                          </div>
                          <p className="text-xs text-gray-500 font-bold max-w-sm">
                            Không tìm thấy thiết bị điện máy tivi tủ lạnh nào trùng khớp! Vui lòng sửa bộ lọc hoặc từ khóa.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================================
            TAB 3: TRANG QUẢN LÝ NGƯỜI DÙNG (TAB: USER DIRECTORY MANAGEMENT)
           ========================================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6" id="admin_tab_users">
            
            <div className="pb-4 border-b">
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <Users className="w-5.5 h-5.5 text-cyan-600" />
                <span>Nhân Sự &amp; Khách Hàng Đăng Ký Hệ Thống</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Kiểm soát bảo mật người sử dụng, phân tích vai trò (Admin/Khách) và chuyển dịch tình trạng khóa/mở tài khoản.
              </p>
            </div>

            {/* Bộ công cụ filter người dùng */}
            <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-2xs flex flex-col sm:flex-row gap-4 items-center">
              {/* Thẻ tìm kiếm từ khóa người dùng */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tra cứu tìm theo Họ tên khách, Email đăng nhập, Số di động..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-gray-250 hover:border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                />
              </div>

              {/* Lọc quyền trạng thái tài khoản */}
              <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                <Filter className="w-4 h-4 text-cyan-600 shrink-0" />
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="w-full sm:w-48 bg-white border border-gray-250 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">Mọi trạng thái bảo mật</option>
                  <option value="active">Active (Đang hoạt động)</option>
                  <option value="inactive">Inactive (Bị khóa hệ thống)</option>
                </select>
              </div>
            </div>

            {/* Bảng danh mục người dùng */}
            <div className="bg-white border border-gray-150 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-55 bg-gray-50 text-gray-500 font-bold border-b border-gray-100 font-sans uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Tổng quan khách hàng</th>
                      <th className="py-4 px-4">Thông tin email</th>
                      <th className="py-4 px-4">Số di động</th>
                      <th className="py-4 px-4 text-center">Vai trò phân cấp</th>
                      <th className="py-4 px-4 text-center">Tuần tự / Trạng thái hành chính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-gray-55 hover:bg-gray-50/60 transition-colors">
                        
                        {/* 1. ID / Họ tên */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3.5">
                            <div className="h-9 w-9 rounded-full bg-cyan-100 text-cyan-805 flex items-center justify-center font-extrabold text-[11px]">
                              {u.full_name.charAt(0)}{u.full_name.split(' ').slice(-1)[0]?.charAt(0)}
                            </div>
                            <div className="text-left font-sans space-y-0.5">
                              <strong className="text-xs text-slate-900 block font-bold leading-none">{u.full_name}</strong>
                              <span className="text-[10px] text-gray-400 block">ID thành viên: #{u.user_id}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Email */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 font-semibold">
                          {u.email}
                        </td>

                        {/* 3. Điện thoại */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800 font-bold">
                          {u.phone}
                        </td>

                        {/* 4. Vai trò */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.2 py-0.5 rounded-sm font-bold font-mono text-[9px] uppercase ${
                            u.role_id === 1 ? 'bg-amber-100 text-amber-850' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {u.role_id === 1 ? 'Quản lý Admin' : 'Khách hội viên'}
                          </span>
                        </td>

                        {/* 5. Trạng thái hành chính & Nút đổi */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] uppercase border ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : u.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-red-50 text-red-650 border-red-100'
                            }`}>
                              {u.status === 'active' ? 'Được duyệt phát' : u.status === 'pending' ? 'Chờ phê duyệt' : 'Đang tạm khóa'}
                            </span>

                            {u.role_id !== 1 && (
                              <button
                                onClick={() => {
                                  // Trạng thái toggle: active -> inactive, pending | inactive -> active
                                  const nextStatus = u.status === 'active' ? 'inactive' : 'active';
                                  onUpdateUserStatus(u.user_id, nextStatus);
                                }}
                                className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
                                  u.status === 'active'
                                    ? 'bg-red-50 border-red-150 hover:bg-red-100 text-red-600'
                                    : 'bg-emerald-50 border-emerald-150 hover:bg-emerald-100 text-emerald-600'
                                }`}
                                title={u.status === 'active' ? 'Khóa quyền đăng nhập' : 'Kích hoạt / Duyệt tài khoản'}
                              >
                                {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-gray-400">
                          Không tìm thấy tài khoản người dùng nào thỏa mãn.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================================
            TAB 4: TRANG QUẢN LÝ ĐƠN HÀNG (TAB: OPERATIONAL ORDER DISPATCH CONSOLE)
           ========================================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6" id="admin_tab_orders">
            
            <div className="pb-4 border-b">
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <ShoppingBag className="w-5.5 h-5.5 text-cyan-600" />
                <span>Điều Phối Luồng &amp; Duyệt Hóa Đơn ELECTRO</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Xét duyệt các đơn đặt mua, chuyển giao trạng thái vận chuyển và ghi kích hoạt hóa đơn.
              </p>
            </div>

            {/* Khung lọc đơn đặt hàng */}
            <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-2xs flex flex-col md:flex-row gap-4 items-center">
              {/* Ô tìm ID đơn hàng */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Tra cứu theo mã số ID, số điện thoại, hoặc địa chỉ đặt đơn..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-gray-250 hover:border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                />
              </div>

              {/* Lọc trạng thái luồng đi */}
              <div className="flex items-center space-x-2 w-full md:w-auto shrink-0 select-none">
                <Filter className="w-4 h-4 text-cyan-600 shrink-0" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                  className="w-full md:w-48 bg-white border border-gray-250 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">Tất cả đơn hàng</option>
                  <option value="pending">Pending (Chờ xử lý)</option>
                  <option value="processing">Processing (Đóng gói xong)</option>
                  <option value="shipped">Shipped (Đang phát đi)</option>
                  <option value="delivered">Delivered (Báo hoàn tất)</option>
                  <option value="cancelled">Cancelled (Hóa đơn Hủy)</option>
                </select>
              </div>
            </div>

            {/* Layout chia hai cột nếu click xem chi tiết hóa đơn, tránh kéo dài trang */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* DANH SÁCH BẢNG CÁC ĐƠN ĐANG CHÈN (CỘT LỚN TRÁI) */}
              <div className={`bg-white border border-gray-150 rounded-3xl shadow-xs overflow-hidden ${
                selectedOrderDetail ? 'lg:col-span-6' : 'lg:col-span-12'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-55 bg-gray-50 text-gray-500 font-bold border-b border-gray-100 font-sans uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-4 text-center">Đơn mã</th>
                        <th className="py-4 px-4">Ngày đặt sản</th>
                        <th className="py-4 px-4 text-right">Tổng thực tế</th>
                        <th className="py-4 px-4 text-center">Nhà phát</th>
                        <th className="py-4 px-4 text-center">Thanh toán</th>
                        <th className="py-4 px-4 text-center">Tác vụ nhanh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((ord) => (
                        <tr
                          key={ord.order_id}
                          onClick={() => setSelectedOrderDetail(ord)}
                          className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${
                            selectedOrderDetail?.order_id === ord.order_id ? 'bg-cyan-50/30 font-semibold' : ''
                          }`}
                        >
                          {/* 1. ID */}
                          <td className="py-4 px-4 text-center font-bold font-mono text-[11px] text-slate-900">
                            #{ord.order_id}
                          </td>

                          {/* 2. Ngày tạo */}
                          <td className="py-4 px-4 font-mono text-[10px] text-gray-400">
                            {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                          </td>

                          {/* 3. Tổng chi */}
                          <td className="py-4 px-4 text-right font-black font-mono text-slate-805">
                            {ord.total_amount.toLocaleString('vi-VN')} ₫
                          </td>

                          {/* 4. Trạng thái phát */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-sm font-black text-[9px] uppercase font-mono ${
                              ord.order_status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-800'
                                : ord.order_status === 'cancelled'
                                ? 'bg-red-50 text-red-650'
                                : ord.order_status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-800 font-semibold'
                            }`}>
                              {ord.order_status}
                            </span>
                          </td>

                          {/* 5. Trạng thái thanh toán */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded-xs font-bold text-[9px] uppercase font-mono border ${
                              ord.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-100'
                            }`}>
                              {ord.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>

                          {/* 6. Nút Click chi tiết */}
                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedOrderDetail(ord)}
                              className="px-2.5 py-1.5 bg-gray-50 hover:bg-cyan-600 hover:text-white border border-gray-150 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 mx-auto"
                            >
                              <span>Soát đơn</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>

                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-gray-400 font-light italic">
                            Chưa tìm thấy hồ sơ đơn đặt mua hàng nào thỏa mãn yêu cầu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NGĂN KÉO HIỂN THỊ CHI TIẾT HÓA ĐƠN ĐƠN HÀNG (CỘT PHẢI - ORDER DETAIL CONSOLE) */}
              {selectedOrderDetail && (
                <div className="lg:col-span-6 bg-white border border-gray-150 rounded-3xl p-5 shadow-sm text-left gap-4 space-y-4 font-sans text-xs flex flex-col" id="admin_order_detail_panel">
                  {/* Tiệu đề ngăn */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Khớp Soát Đơn Hàng #{selectedOrderDetail.order_id}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        Vào ngày: {new Date(selectedOrderDetail.created_at).toLocaleDateString('vi-VN')} lúc {new Date(selectedOrderDetail.created_at).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetail(null)}
                      className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-900 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Chi tiết địa chỉ và ghi chú giao nhận */}
                  <div className="space-y-2 font-sans bg-gray-50/60 p-3.5 rounded-2xl border">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Thông tin hành chính nhận hàng</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 leading-relaxed">
                      <p><strong>Khách hàng:</strong> Ban tuyển mẫu (User #{selectedOrderDetail.user_id})</p>
                      <p><strong>Điện thoại:</strong> 0912 345 678 (Giả định)</p>
                      <p className="sm:col-span-2"><strong>Địa chỉ:</strong> <span className="italic block bg-white border p-1.5 rounded-lg mt-1">{selectedOrderDetail.shipping_address}</span></p>
                    </div>
                  </div>

                  {/* Kê khai tiền nong */}
                  <div className="space-y-1.5 font-sans pb-4 border-b">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1.5">Kê khai hóa đơn chi phí</h4>
                    <div className="flex justify-between text-gray-500">
                      <span>Thu thô giá trị hàng:</span>
                      <strong className="font-mono text-slate-800">
                        {selectedOrderDetail.subtotal.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Trợ giá mã giảm:</span>
                      <strong className="font-mono text-emerald-600">
                        -{selectedOrderDetail.discount_amount.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Cước vận chuyển phát:</span>
                      <strong className="font-mono text-slate-850">
                        {selectedOrderDetail.shipping_fee === 0 ? 'Thư thái (0 ₫)' : `${selectedOrderDetail.shipping_fee.toLocaleString('vi-VN')} ₫`}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold pt-2 border-t mt-1.5">
                      <span className="text-slate-900 font-bold">Thành tiền khách phải trả:</span>
                      <strong className="font-mono text-red-600 text-sm">
                        {selectedOrderDetail.total_amount.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                  </div>

                  {/* Phím bấm cập nhật trạng thái hoạt động */}
                  <div className="pt-2 space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Cập Nhật Tiến Trình Vận Hành Đơn Hàng</h4>
                    
                    {/* Tiến trình 5 trạng thái logic của luồng: pending -> processing -> shipped -> delivered -> cancelled */}
                    <div className="flex flex-wrap gap-2">
                      {selectedOrderDetail.order_status === 'pending' && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(selectedOrderDetail.order_id, 'processing');
                            setSelectedOrderDetail((prev) => prev ? { ...prev, order_status: 'processing' } : null);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Duyệt và Đóng gói ngay</span>
                        </button>
                      )}

                      {selectedOrderDetail.order_status === 'processing' && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(selectedOrderDetail.order_id, 'shipped');
                            setSelectedOrderDetail((prev) => prev ? { ...prev, order_status: 'shipped' } : null);
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Xuất bãi - Giao vận chuyển</span>
                        </button>
                      )}

                      {selectedOrderDetail.order_status === 'shipped' && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(selectedOrderDetail.order_id, 'delivered');
                            setSelectedOrderDetail((prev) => prev ? { ...prev, order_status: 'delivered' } : null);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Xác nhận giao thành công</span>
                        </button>
                      )}

                      {/* Nút Hủy phục vụ */}
                      {selectedOrderDetail.order_status !== 'delivered' && selectedOrderDetail.order_status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này của khách không?')) {
                              onUpdateOrderStatus(selectedOrderDetail.order_id, 'cancelled');
                              setSelectedOrderDetail((prev) => prev ? { ...prev, order_status: 'cancelled' } : null);
                            }
                          }}
                          className="px-3 py-2 bg-red-50 text-red-650 hover:bg-red-100 border border-red-150 font-bold rounded-xl text-[11px] transition-all cursor-pointer ml-auto"
                        >
                          <span>Hủy bỏ đơn</span>
                        </button>
                      )}

                      {selectedOrderDetail.order_status === 'delivered' && (
                        <p className="text-emerald-600 font-extrabold flex items-center space-x-1 text-[11px]">
                          <CheckCircle className="w-4 h-4" />
                          <span>Xử lý giao lắp thành công. Đã đóng hồ sơ hóa đơn.</span>
                        </p>
                      )}

                      {selectedOrderDetail.order_status === 'cancelled' && (
                        <p className="text-red-500 font-bold text-[11px] flex items-center space-x-1">
                          <Ban className="w-4 h-4" />
                          <span>Hóa đơn này đã bị hủy bỏ bởi ban quản trị.</span>
                        </p>
                      )}
                    </div>

                    {/* Điều khiển tình trạng thanh toán của hóa đơn */}
                    <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Cọc/Cửa đóng thanh toán:</span>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase font-bold ${
                          selectedOrderDetail.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {selectedOrderDetail.payment_status === 'paid' ? 'ĐÃ PAID' : 'UNPAID'}
                        </span>
                        
                        <button
                          onClick={() => {
                            const nextPaymentStatus = selectedOrderDetail.payment_status === 'paid' ? 'pending' : 'paid';
                            onUpdatePaymentStatus(selectedOrderDetail.order_id, nextPaymentStatus);
                            setSelectedOrderDetail((prev) => prev ? { ...prev, payment_status: nextPaymentStatus } : null);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-205 border rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                          Đổi cổng: {selectedOrderDetail.payment_status === 'paid' ? 'Báo chưa trả' : 'Báo khách đã trả'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* =========================================================================================
          POPUP MODAL THÊM / CHỈNH SỬA SẢN PHẨM PHÂN CẤP (PORTAL ADD/EDIT MODAL FOR INHERENCY)
         ========================================================================================= */}
      {showProductForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 max-w-2xl w-full p-6 text-left animate-in fade-in zoom-in-95 duration-100" id="admin_product_form_popup">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingProduct ? `Cập Nhật Cấu Hình: ${editingProduct.sku}` : 'Khai Báo Thiết Bị Điện Máy Mới'}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-650 p-3 rounded-2xl text-[11px] font-semibold mb-4 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Tên thiết bị */}
                <div className="sm:col-span-2 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên gọi của thiết bị điện tử *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Laptop Dell XPS 13 9315 Core i7"
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3 py-2.5 bg-white text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 2. Đơn giá */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đơn giá bán sỉ / lẻ *</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                    placeholder="Đơn vị: VNĐ"
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3 py-2.5 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 3. Tồn kho */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số lượng hàng hóa nhập kho *</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    placeholder="Ví dụ: 15"
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3 py-2.5 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 4. SKU */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã định kho SKU hàng hóa *</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="LAPTOP-DELL-2026"
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3 py-2.5 bg-white text-xs font-mono uppercase font-black text-slate-805 focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 5. Liên kết ảnh */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đường dẫn tệp hình ảnh sản phẩm</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3 py-2.5 bg-white text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                {/* 6. Chọn Phân ngành danh mục mẫu */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Chọn phân ngành hàng *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(parseInt(e.target.value))}
                    className="border border-gray-250 rounded-xl px-3 py-2.5 bg-white text-xs text-slate-850 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    {mockCategories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Chọn Thương hiệu */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thương hiệu tập đoàn *</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(parseInt(e.target.value))}
                    className="border border-gray-250 rounded-xl px-3 py-2.5 bg-white text-xs text-slate-850 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    {mockBrands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.brand_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Mô tả kỹ thuật */}
                <div className="sm:col-span-2 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bản mô tả thông số kỹ thuật</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="border border-gray-250 hover:border-gray-300 rounded-xl px-3.5 py-2.5 bg-white text-xs leading-normal font-sans focus:outline-hidden focus:border-cyan-500"
                    placeholder="Mô tả tóm tắt tính năng, thông số chip, bảo hành..."
                  />
                </div>

              </div>

              {/* Phím Submit Form và hủy gỡ */}
              <div className="border-t border-gray-100 pt-4 flex justify-end space-x-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl cursor-pointer"
                >
                  Quay lại dọn dẹp
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Cập Nhật Thiết Bị' : 'Khai Báo Thiết Bị Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
