/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, ChevronDown, RefreshCw, Zap, ShieldCheck, Sliders, User, ShoppingCart, Lock, X } from 'lucide-react';
import { Category, User as UserType } from '../types';

interface NavigationProps {
  categories: Category[]; // Danh sách các danh mục sản phẩm từ CSDL
  activeCategory: number | null; // Danh mục đang được chọn lọc hiện tại
  setActiveCategory: (categoryId: number | null) => void; // Hàm đổi lọc danh mục hoạt động
  setIsAdminView: (isAdmin: boolean) => void; // Cho phép reset giao diện khi cần thiết rẽ nhánh
  currentUser: UserType | null; // Tài khoản đang đăng nhập hiện tại
  isAdminView: boolean; // Trạng thái xem Admin
  currentView: string; // Trạng thái xem hiện tại
  setCurrentView: (view: any) => void; // Hàm đổi view hoạt động
  onCartClick: () => void; // Hành động mở giỏ hàng
  onOpenAuth: () => void; // Hành động đăng nhập của Module 7
}

export default function Navigation({
  categories,
  activeCategory,
  setActiveCategory,
  setIsAdminView,
  currentUser,
  isAdminView,
  currentView,
  setCurrentView,
  onCartClick,
  onOpenAuth
}: NavigationProps) {
  // Lấy các danh mục hàng đầu có parent_id là null (Cha) để lập trình thanh menu chính
  const mainCategories = categories.filter((c) => c.parent_id === null);

  return (
    <nav className="bg-slate-50 border-b border-gray-200" id="main_navigation_bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Cụm dải thả xuống tất cả các danh mục sản phẩm */}
          <div className="flex items-center space-x-4 h-full">
            <div className="relative group h-full">
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setIsAdminView(false);
                }}
                className={`flex items-center space-x-2 px-4 h-full font-semibold text-sm cursor-pointer transition-colors ${
                  activeCategory === null
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'text-slate-700 hover:text-cyan-600 hover:bg-gray-100'
                }`}
                id="all_products_menu_trigger"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Tất Cả Danh Mục</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Menu con thả xuống khi hover (Dropdown Mega Menu) */}
              <div
                className="absolute left-0 top-full hidden group-hover:block w-56 bg-white border border-gray-200 shadow-xl py-1 z-40 rounded-b-lg"
                id="mega_menu_dropdown"
              >
                {mainCategories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => {
                      setActiveCategory(cat.category_id);
                     setIsAdminView(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex justify-between items-center transition-colors cursor-pointer ${
                      activeCategory === cat.category_id ? 'text-cyan-600 font-semibold bg-cyan-50/40' : 'text-slate-700'
                    }`}
                  >
                    <span>{cat.category_name}</span>
                    {categories.some((sub) => sub.parent_id === cat.category_id) && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm">Có mục con</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setIsAdminView(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-cyan-600 font-medium hover:bg-cyan-50/20 transition-colors cursor-pointer"
                >
                  Xem toàn bộ sản phẩm
                </button>
              </div>
            </div>

            {/* Các liên kết nhóm danh mục trực diện trên thanh gác */}
            <div className="hidden md:flex items-center space-x-1.5 h-full" id="navigation_quick_links">
              {mainCategories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => {
                    setActiveCategory(category.category_id);
                    setIsAdminView(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    activeCategory === category.category_id
                      ? 'bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200 shadow-2xs'
                      : 'text-slate-600 hover:text-cyan-600 hover:bg-gray-100/50'
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>

            {/* PHÂN HỆ MENU THEO VAI TRÒ (MODULE 10 ROLE-BASED MENUS) */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 h-full" id="role_based_navigation_menus">
              {/* CUSTOMER HOẶC CHƯA ĐĂNG NHẬP: Hồ sơ cá nhân & Giỏ hàng */}
              {(!currentUser || currentUser.role_id === 2) && (
                <>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        // Gọi hàm để xử lý chuyển hướng về đăng nhập
                        onOpenAuth();
                      } else {
                        setCurrentView('profile');
                        setIsAdminView(false);
                      }
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentView === 'profile'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-700 bg-white hover:bg-slate-100 border border-gray-200'
                    }`}
                    id="nav_my_profile_lnk"
                    title="Xem cài đặt tài khoản cá nhân và lịch sử xử lý (Chỉ sau login)"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Hồ sơ của tôi</span>
                  </button>

                  <button
                    onClick={onCartClick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-705 text-slate-700 bg-white hover:bg-slate-100 border border-gray-200 transition-all cursor-pointer"
                    id="nav_my_cart_lnk"
                    title="Truy cập nhanh danh sách giỏ hàng của bạn"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Giỏ hàng</span>
                  </button>
                </>
              )}
            </div>

            {/* Removed shortcut buttons */}
          </div>

          {/* Các tiện ích cam kết chất lượng của thương hiệu bên cột phải */}
          <div className="hidden lg:flex items-center space-x-5 text-xs text-gray-500" id="navigation_commitments">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-slate-600 text-[11px]">Chính hãng</span>
            </div>
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium text-slate-600 text-[11px]">15 ngày đổi trả</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium text-slate-600 text-[11px]">Giao siêu tốc 2H</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
