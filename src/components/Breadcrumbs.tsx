/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Home, LayoutGrid, ShoppingCart, Info, Award } from 'lucide-react';
import { Product, Category } from '../types';
import { mockCategories } from '../data/mockData';

interface BreadcrumbsProps {
  currentView: 'home' | 'listing' | 'detail' | 'checkout_flow';
  activeCategory: number | null;
  selectedProduct: Product | null;
  onNavigate: (view: 'home' | 'listing' | 'detail' | 'checkout_flow', catId: number | null) => void;
}

export default function Breadcrumbs({
  currentView,
  activeCategory,
  selectedProduct,
  onNavigate
}: BreadcrumbsProps) {
  
  // Hàm đệ quy/vòng lặp truy vết cây danh mục ngược lên gốc
  const getCategoryPath = (catId: number | null): Category[] => {
    if (!catId) return [];
    const path: Category[] = [];
    let current = mockCategories.find((c) => c.category_id === catId);
    while (current) {
      path.unshift(current);
      if (current.parent_id) {
        // Tìm tiếp cha của nó
        const parentId = current.parent_id;
        current = mockCategories.find((c) => c.category_id === parentId);
      } else {
        break;
      }
    }
    return path;
  };

  // Xác định danh mục dựa vào view hiện tại
  let finalCategoryId: number | null = null;
  if (currentView === 'listing' && activeCategory) {
    finalCategoryId = activeCategory;
  } else if (currentView === 'detail' && selectedProduct) {
    finalCategoryId = selectedProduct.category_id;
  }

  const categoryPath = getCategoryPath(finalCategoryId);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8 text-left"
      id="custom_multi_level_breadcrumbs"
    >
      <div className="max-w-7xl mx-auto flex items-center flex-wrap space-x-1.5 text-xs text-gray-500 font-sans">
        
        {/* Lớp gốc: Trang chủ */}
        <button
          onClick={() => onNavigate('home', null)}
          className="flex items-center space-x-1 hover:text-cyan-600 font-bold transition-colors cursor-pointer"
          title="Về Trang chủ Electro"
          id="breadcrumb_root_home"
        >
          <Home className="w-4 h-4 text-gray-400" />
          <span>Trang chủ</span>
        </button>

        {/* Khúc rẽ 1: Nếu là ở sản phẩm chi tiết hoặc listing */}
        {currentView === 'home' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-400 font-medium">Bảng tin mua sắm</span>
          </>
        )}

        {currentView === 'checkout_flow' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-cyan-600 font-bold flex items-center space-x-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Giỏ hàng &amp; Thanh toán</span>
            </span>
          </>
        )}

        {currentView === 'listing' && !activeCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-cyan-600 font-bold flex items-center space-x-1">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tất cả sản phẩm 2026</span>
            </span>
          </>
        )}

        {/* Khúc rẽ 2: Nếu có path của Category */}
        {categoryPath.length > 0 && categoryPath.map((cat, index) => {
          const isLastCategoryInPath = index === categoryPath.length - 1;
          const isListingView = currentView === 'listing';
          const isCurrentActive = isLastCategoryInPath && isListingView;

          return (
            <React.Fragment key={cat.category_id}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              {isCurrentActive ? (
                <span className="text-cyan-600 font-bold" id={`breadcrumb_cat_active_${cat.category_id}`}>
                  {cat.category_name}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate('listing', cat.category_id)}
                  className="hover:text-cyan-600 hover:underline transition-colors font-semibold cursor-pointer"
                  id={`breadcrumb_cat_link_${cat.category_id}`}
                >
                  {cat.category_name}
                </button>
              )}
            </React.Fragment>
          );
        })}

        {/* Khúc rẽ 3: Nếu là Detail của sản phẩm cụ thể */}
        {currentView === 'detail' && selectedProduct && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span 
              className="text-cyan-600 font-extrabold max-w-[200px] sm:max-w-xs md:max-w-md truncate" 
              title={selectedProduct.product_name}
              id={`breadcrumb_prod_active_${selectedProduct.product_id}`}
            >
              {selectedProduct.product_name}
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
