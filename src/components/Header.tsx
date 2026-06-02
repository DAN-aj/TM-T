/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingCart, User, Cpu, Sliders, Menu, X, LogIn } from 'lucide-react';
import { User as UserType, CartItem, Product, Category } from '../types';

interface HeaderProps {
  currentUser: UserType | null; // Họ tên và vai trò hiện tại (Khách hàng hoặc Admin)
  setCurrentUser: (user: UserType | null) => void; // Hàm chuyển đổi người dùng phục vụ test thử nghiệm
  allUsers: UserType[]; // Danh sách toàn bộ các tài khoản để lựa chọn nhanh trên thanh header
  cartItems: CartItem[]; // Toàn bộ phần tử trong giỏ hàng để cập nhật số lượng badge
  onCartClick: () => void; // Hành động mở ngăn kéo hông giỏ hàng
  searchQuery: string; // Truy vấn tìm kiếm hiện tại
  setSearchQuery: (query: string) => void; // Cập nhật từ khóa tìm kiếm trực tiếp
  isAdminView: boolean; // Trạng thái màn hình hiện tại (Khách hàng hay trang quản trị)
  setIsAdminView: (isAdmin: boolean) => void; // Hàm chuyển trạng thái xem quản trị viên
  onLogoClick?: () => void; // Hành động click vào logo để reset về trang chủ
  onOpenAuth?: () => void; // Hành động kích hoạt form Đăng ký / Đăng nhập (Module 7 Validation)
  products?: Product[]; // Toàn bộ danh sách sản phẩm để thực thi chức năng tìm kiếm nhanh trực diện
  categories?: Category[]; // Toàn bộ danh mục để hiển thị thông tin khớp chính xác
  onSelectProduct?: (product: Product) => void; // Callback đi đến trang chi tiết khi click nhanh
}

export default function Header({
  currentUser,
  setCurrentUser,
  allUsers,
  cartItems,
  onCartClick,
  searchQuery,
  setSearchQuery,
  isAdminView,
  setIsAdminView,
  onLogoClick,
  onOpenAuth,
  products = [],
  categories = [],
  onSelectProduct
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Tính toán tổng số lượng sản phẩm có trong giỏ hàng hiện tại để vẽ badge số lượng đỏ
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Xử lý khi khách hàng đổi sang tài khoản khác từ dropdown chọn tài khoản mẫu
  const handleUserSelect = (user: UserType) => {
    setCurrentUser(user);
    setShowUserDropdown(false);
    // Nếu người dùng chọn tài khoản Admin thì tự động mở giao diện quản trị cho họ xem, và ngược lại
    if (user.role_id === 1) {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs" id="main_app_header">
      {/* Thanh rào thông tin nhỏ phía trên cùng (Top Bar) để nâng cao chất lượng thẩm mỹ UI */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4" id="header_top_bar">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="font-sans">Chào mừng đến với Hệ thống thương mại điện tử Điện máy &amp; Gia dụng</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 font-mono text-[10px] tracking-wider hidden sm:inline">HOTLINE: 1900-5454 (Miễn phí)</span>
            
            {/* Lối vào chuẩn xác cho Form Đăng ký / Đăng nhập hoặc nút Đăng xuất */}
            {currentUser ? (
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setIsAdminView(false);
                  localStorage.removeItem('electro_current_user');
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold rounded-md transition-all shadow-xs cursor-pointer"
                id="header_logout_btn"
                title="Đăng xuất khỏi hệ thống"
              >
                <span>Đăng Xuất ({currentUser.full_name})</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth && onOpenAuth()}
                className="flex items-center space-x-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-[10.5px] font-bold rounded-md transition-all shadow-xs cursor-pointer"
                id="header_register_login_custom_btn"
                title="Mở form Đăng nhập / Đăng ký tài khoản mới có xử lý hiệu chỉnh lỗi validation chi tiết"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập / Đăng Ký (Validation)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thanh điều hướng chính (Main Header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between" id="header_main_section">
        {/* Khối Logo thương hiệu */}
        <div
          onClick={() => onLogoClick && onLogoClick()}
          className="flex items-center space-x-3 cursor-pointer select-none group"
          id="header_logo_group"
        >
          <div className="h-10 w-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-cyan-100 group-hover:bg-cyan-700 transition-colors">
            <Cpu className="text-white w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-slate-800 tracking-tight font-sans leading-none group-hover:text-cyan-600 transition-colors">ELECTRO</span>
            <span className="text-[10px] text-cyan-600 font-mono uppercase tracking-widest font-semibold">Gia Dụng 2026</span>
          </div>
        </div>

        {/* Khung tìm kiếm trung tâm (Search Bar) */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block" id="header_search_container">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder="Tìm kiếm Tivi, Tủ Lạnh, Máy Giặt, Nồi chiên thông minh..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-150 focus:bg-white border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm transition-all shadow-xs"
              id="header_search_input"
            />
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer animate-fade-in"
              >
                Xóa
              </button>
            )}

            {/* HỘP GỢI Ý TÌM KIẾM CHI TIẾT ĐI KÈM HÌNH THU NHỎ RÕ NÉT CỦA MỤC TIÊU 9 (ADVANCED SEARCH PREVIEW) */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div 
                className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4.5 z-50 text-left animate-fade-in divide-y divide-gray-100"
                id="advanced_instant_search_dropdown"
              >
                <div className="flex justify-between items-center pb-2.5 mb-2.5">
                  <span className="text-[10.5px] uppercase tracking-wider font-extrabold text-cyan-600">Gợi ý thiết bị thông minh liên quan ({products.filter((p) => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).length})</span>
                  <span className="text-[9.5px] text-gray-400 font-medium">Click để xem ngay chi tiết sản phẩm</span>
                </div>
                
                <div className="space-y-2.5 pt-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {(() => {
                    const matched = products.filter((p) => 
                      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (matched.length > 0) {
                      return (
                        <>
                          {matched.slice(0, 5).map((item) => {
                            const itemCatName = categories.find((c) => c.category_id === item.category_id)?.category_name || 'Thiết bị';
                            return (
                              <div
                                key={item.product_id}
                                onClick={() => {
                                  if (onSelectProduct) {
                                    onSelectProduct(item);
                                  }
                                  setSearchQuery('');
                                }}
                                className="flex items-center space-x-3.5 p-2 hover:bg-slate-50/85 rounded-xl transition-all cursor-pointer border border-transparent hover:border-cyan-150 group"
                                id={`instant_search_item_${item.product_id}`}
                              >
                                {/* Ảnh thu nhỏ thumbnail siêu sắc nét */}
                                <div className="h-11 w-11 bg-gray-50 border border-gray-100 rounded-lg shrink-0 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[12px] font-bold text-slate-800 truncate group-hover:text-cyan-600 transition-colors">
                                    {item.product_name}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <span className="bg-cyan-50 text-cyan-700 text-[8.5px] px-1.5 py-0.5 rounded font-bold font-mono">
                                      {itemCatName}
                                    </span>
                                    <span className="text-[9.5px] text-gray-400 font-medium">SKU: {item.sku}</span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="text-[12px] font-bold text-red-600 font-mono">
                                    {item.price.toLocaleString('vi-VN')} ₫
                                  </p>
                                  <span className="text-[8.5px] font-extrabold text-cyan-600 uppercase tracking-widest group-hover:underline">
                                    Xem Ngay
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {matched.length > 5 && (
                            <div className="pt-2 text-center">
                              <p className="text-[10px] text-slate-500 font-medium italic">
                                Còn hơn {matched.length - 5} thiết bị khác... Nhấn nút Tìm để lọc toàn bộ.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <div className="py-8 text-center text-xs text-gray-400 font-semibold">
                          Không tìm thấy thiết bị điện tử nào khớp với mô tả của bạn.
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cụm chức năng người dùng, giỏ hàng, và điều hướng phân quyền admin */}
        <div className="flex items-center space-x-6" id="header_actions_container">
          {/* Icon Giỏ hàng (Tính năng khách hàng) */}
          {!isAdminView && (
            <button
              onClick={onCartClick}
              className="relative p-2 text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer focus:outline-hidden"
              id="cart_trigger_button"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-mono text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce-subtle"
                  id="cart_quantity_badge"
                >
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* Icon hiển thị tài khoản hiện tại */}
          <div className="flex items-center space-x-2 border-l border-gray-150 pl-4 py-1">
            <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-slate-600 border border-gray-200 shadow-inner">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                {currentUser ? currentUser.full_name : 'Khách vãng lai'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {currentUser ? (currentUser.role_id === 1 ? 'Học viên Quản trị' : 'Thành viên Đồng') : 'Chưa đăng nhập'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
