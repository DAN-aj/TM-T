/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Filter, Star, RefreshCw, ChevronRight, SlidersHorizontal, Check, Search, ShieldAlert } from 'lucide-react';
import { Product, Category, Brand } from '../types';
import ProductCard from './ProductCard';

interface ProductListingPageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  activeCategory: number | null;
  setActiveCategory: (categoryId: number | null) => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  getBrandName: (brandId: number) => string;
  getCategoryName: (categoryId: number) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProductListingPage({
  products,
  categories,
  brands,
  activeCategory,
  setActiveCategory,
  onAddToCart,
  onProductClick,
  getBrandName,
  getCategoryName,
  searchQuery,
  setSearchQuery
}: ProductListingPageProps) {
  // --- CÁC TRẠNG THÁI SỬ DỤNG CHO BỘ LỌC NÂNG CAO (ADVANCED FILTER STATES) ---
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000000); // 50 triệu VNĐ làm mốc max mặc định
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('popularity'); // Sắp xếp theo: popularity, price_asc, price_desc, rating

  // Phân nhóm danh mục sản phẩm gốc (danh mục chính có parent_id là null)
  const mainCategories = useMemo(() => {
    return categories.filter((c) => c.parent_id === null);
  }, [categories]);

  // Hành vi bật/tắt (toggle) chọn thương hiệu cho danh sách checkbox nhiều tiêu chí
  const handleBrandToggle = (brandId: number) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  // Hàm lập tức reset dọn sạch toàn bộ các tiêu chí lọc về trạng thái ban đầu của hệ thống
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(50000000);
    setMinRating(null);
    setActiveCategory(null);
    setSearchQuery('');
    setSortBy('popularity');
  };

  // ================= CRITICAL LOGIC: BỘ LỌC MẢNG (ARRAY FILTER & SORT JAVASCRIPT MECHANISM) =================
  // Được tính toán qua useMemo để tối ưu hóa hiệu năng render tránh tính toán thừa thãi khi chuyển trang
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Thực hiện lọc mảng (.filter) để loại bỏ các phần tử không thỏa mãn điều kiện tuyển chọn
    const result = products.filter((product) => {
      
      // A. LỌC THEO DANH MỤC (CATEGORY FILTER):
      // Nếu có danh mục đang chọn hoạt động, ta tìm tất cả ID danh mục con thuộc danh mục cha này
      if (activeCategory !== null) {
        const subCategoryIds = categories
          .filter((c) => c.category_id === activeCategory || c.parent_id === activeCategory)
          .map((c) => c.category_id);
        
        // Nếu danh mục của sản phẩm này không thuộc nhóm các danh mục tương thích, loại bỏ lập tức
        if (!subCategoryIds.includes(product.category_id)) {
          return false;
        }
      }

      // B. LỌC THEO TỪ KHÓA TÌM KIẾM NÂNG CAO (KEYWORD SEARCH FILTER):
      // Chuyển toàn bộ chuỗi sang chữ thường (lowercase) để so sánh không phân biệt chữ hoa, chữ thường
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.product_name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        
        // Nếu không khớp tên, mã SKU hay phần mô tả thì loại bài
        if (!matchesName && !matchesSku && !matchesDesc) {
          return false;
        }
      }

      // C. LỌC THEO THƯƠNG HIỆU SẢN XUẤT (MULTI-CHECKBOX BRAND FILTER):
      // Nếu mảng lựa chọn không rỗng, kiểm tra mã hãng sản xuất của sản phẩm có nằm trong danh sách checked không
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand_id)) {
          return false;
        }
      }

      // D. LỌC THEO KHOẢNG GIÁ SẢN PHẨM (PRICE SLIDER RANGE FILTER):
      // Kiểm tra xem đơn giá của sản phẩm có nằm trong giới hạn tối thiểu [minPrice] và tối đa [maxPrice] không
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      // E. LỌC THEO SỐ SAO ĐÁNH GIÁ TRUNG BÌNH (RADIO BUTTON POINT RATING FILTER):
      // Nếu người dùng chọn mốc số sao cụ thể bằng các nút Radio, kiểm tra avg_rating của sản phẩm
      if (minRating !== null) {
        if (product.avg_rating < minRating) {
          return false;
        }
      }

      // Hợp lệ, giữ lại sản phẩm trong mảng kết quả
      return true;
    });

    // 2. Thực hiện sắp xếp mảng (.sort) dựa trên tùy chọn người dùng đã chỉ định trên Dropdown
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          // Sắp xếp tăng dần theo giá bán (Thấp nhất lên cao nhất)
          return a.price - b.price;
        case 'price_desc':
          // Sắp xếp giảm dần theo giá bán (Cao nhất xuống thấp nhất)
          return b.price - a.price;
        case 'rating':
          // Sắp xếp giảm dần theo số sao đánh giá (Sao cao nhất xếp trước)
          return b.avg_rating - a.avg_rating;
        case 'popularity':
        default:
          // Mặc định: Trình bày vị trí ưu tiên dựa trên lượng kho hàng hoặc ID sản phẩm
          return b.product_id - a.product_id;
      }
    });

  }, [products, categories, activeCategory, searchQuery, selectedBrands, minPrice, maxPrice, minRating, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left" id="product_listing_viewport">
      {/* Khối định vị breadcrumb phía trên */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6 font-medium">
        <span className="hover:text-cyan-600 transition-colors cursor-pointer">Trang chủ</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Danh Sách Thiết Bị Điện Máy</span>
        {activeCategory !== null && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cyan-600 font-extrabold">{getCategoryName(activeCategory)}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ================= SIDEBAR BỘ LỌC NÂNG CAO (LEFT SIDEBAR FILTER - MODULE 9 SPECIFIC) ================= */}
        <aside className="lg:col-span-1 space-y-6" id="product_filter_sidebar">
          
          {/* Header liên kết bộ lọc và dọn dẹp */}
          <div className="flex items-center justify-between border-b border-gray-150 pb-4">
            <h3 className="font-extrabold text-slate-900 flex items-center space-x-2 text-base">
              <Filter className="w-5 h-5 text-cyan-600" />
              <span>Bộ Lọc Nâng Cao</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center space-x-1 hover:underline cursor-pointer transition-colors"
              title="Đặt lại tất cả các tiêu chuẩn lọc sản phẩm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>

          {/* Phần lọc 0: Ô tìm kiếm nhanh nội bộ (Local Fast Search) */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tìm theo từ khóa
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên, mã SP cần sục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-8 py-2 bg-white text-xs border border-gray-250 rounded-lg focus:outline-hidden focus:border-cyan-500 transition-all text-slate-850"
                id="sidebar_local_search_input"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 px-1.5 py-1 text-[10px] text-gray-400 hover:text-slate-800 font-bold mt-1"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Phần lọc 1: Khoảng Giá (Range Slider tích hợp ô nhập tự gõ chuẩn xác) */}
          <div className="border-b border-gray-100 pb-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Khoảng Giá Bán (VNĐ)
              </h4>
              <span className="text-[9px] bg-cyan-50 text-cyan-700 font-bold px-1.5 py-0.5 rounded">Range Slider</span>
            </div>
            
            <div className="space-y-4">
              {/* Vành kiểm soát thanh giá trượt tối thiểu - Min Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 inline-block"></span>
                    <span>Giá thấp nhất (Min):</span>
                  </span>
                  <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                    {minPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35000000"
                  step="500000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer transition-all"
                  id="filter_price_min_slider"
                />
              </div>

              {/* Vành kiểm soát thanh giá trượt tối đa - Max Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                    <span>Giá cao nhất (Max):</span>
                  </span>
                  <span className="font-mono text-red-600 font-extrabold bg-red-50 px-1.5 py-0.5 rounded">
                    {maxPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <input
                  type="range"
                  min="5000000"
                  max="50000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-cyan-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer transition-all"
                  id="filter_price_max_slider"
                />
              </div>

              {/* Nhập tay trực tiếp số để tìm kiếm thông minh */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-[9.5px] text-gray-400 font-semibold uppercase">Nhập Giá Min</span>
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 bg-white text-xs border border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-[9.5px] text-gray-400 font-semibold uppercase">Nhập Giá Max</span>
                  <input
                    type="number"
                    min={minPrice}
                    max="100000000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                    className="w-full p-2 bg-white text-xs border border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              {/* Các thẻ bóc mác dải giá bán tuyển chọn nhanh */}
              <div className="pt-1 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setMinPrice(0); setMaxPrice(10000000); }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-205 text-[10px] font-bold text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                >
                  Dưới 10 Triệu
                </button>
                <button
                  onClick={() => { setMinPrice(10000000); setMaxPrice(20000000); }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-205 text-[10px] font-bold text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                >
                  10 - 20 Triệu
                </button>
                <button
                  onClick={() => { setMinPrice(20000000); setMaxPrice(35000000); }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-205 text-[10px] font-bold text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                >
                  20 - 35 Triệu
                </button>
                <button
                  onClick={() => { setMinPrice(35000000); setMaxPrice(50000000); }}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-205 text-[10px] font-bold text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                >
                  Trên 35 Triệu
                </button>
              </div>
            </div>
          </div>

          {/* Phần lọc 2: Danh Mục Sản Phẩm (Category selection) */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">
              Danh Mục Sản Phẩm
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer flex justify-between items-center ${
                  activeCategory === null
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-100 font-extrabold'
                    : 'text-slate-600 hover:bg-gray-100/55'
                }`}
              >
                <span>Tất Cả Thiết Bị</span>
                <span className={`font-mono text-[9.5px] px-2 py-0.5 rounded-full font-bold ${activeCategory === null ? 'bg-cyan-750 text-cyan-200' : 'bg-gray-200/60 text-slate-500'}`}>
                  {products.length}
                </span>
              </button>

              {mainCategories.map((cat) => {
                const count = products.filter((p) => {
                  const subCategoryIds = categories
                    .filter((c) => c.category_id === cat.category_id || c.parent_id === cat.category_id)
                    .map((c) => c.category_id);
                  return subCategoryIds.includes(p.category_id);
                }).length;

                return (
                  <button
                    key={cat.category_id}
                    onClick={() => setActiveCategory(cat.category_id)}
                    className={`w-full text-left text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer flex justify-between items-center ${
                      activeCategory === cat.category_id
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-100 font-extrabold'
                        : 'text-slate-600 hover:bg-gray-100/55'
                    }`}
                  >
                    <span>{cat.category_name}</span>
                    <span className={`font-mono text-[9.5px] px-2 py-0.5 rounded-full font-bold ${activeCategory === cat.category_id ? 'bg-cyan-750 text-cyan-200' : 'bg-gray-200/60 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phần lọc 3: Đánh Giá Sao (RADIO BUTTONS - NHƯ YÊU CẦU ĐẶC BIỆT CỦA TIÊU CHÍ MODULE 9) */}
          <div className="border-b border-gray-100 pb-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">
              Đánh Giá Sao (Radio)
            </h4>
            <div className="space-y-2">
              {/* Option 1: Tất cả */}
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-cyan-600 py-1 px-1 rounded-md transition-colors hover:bg-slate-50">
                <input
                  type="radio"
                  name="rating-radio-group"
                  checked={minRating === null}
                  onChange={() => setMinRating(null)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 transition-all accent-cyan-600 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">Tất cả sản phẩm</span>
              </label>

              {/* Loop qua các mảng điểm số cụ thể */}
              {[
                { stars: 5, text: 'Đúng 5.0 ★ tuyệt hảo' },
                { stars: 4.5, text: 'Từ 4.5 ★ trở lên' },
                { stars: 4, text: 'Từ 4.0 ★ trở lên' },
                { stars: 3.5, text: 'Từ 3.5 ★ sử dụng tốt' }
              ].map((opt) => (
                <label 
                  key={opt.stars} 
                  className="flex items-center space-x-2.5 text-xs text-slate-705 cursor-pointer hover:text-cyan-600 py-1 px-1 rounded-md transition-colors hover:bg-slate-50"
                  id={`rating_radio_label_${opt.stars.toString().replace('.', '_')}`}
                >
                  <input
                    type="radio"
                    name="rating-radio-group"
                    checked={minRating === opt.stars}
                    onChange={() => setMinRating(opt.stars)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 transition-all accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center -space-x-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3 h-3 ${
                            idx < Math.floor(opt.stars) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{opt.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Phần lọc 4: Thương Hiệu (Checkbox chọn kết hợp nhiều phương án) */}
          <div className="pb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">
              Thương Hiệu Sản Xuất
            </h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {brands.map((b) => {
                // Đếm nhẩm số sản phẩm phù hợp cho thương hiệu trong dữ liệu gốc
                const brandProductCount = products.filter((prod) => prod.brand_id === b.brand_id).length;
                return (
                  <label 
                    key={b.brand_id} 
                    className="flex items-center justify-between space-x-2.5 text-xs text-slate-700 cursor-pointer hover:text-cyan-600 py-1 px-1 rounded-md transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.brand_id)}
                        onChange={() => handleBrandToggle(b.brand_id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4 accent-cyan-600 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-850">{b.brand_name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 font-extrabold bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {brandProductCount}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ================= KHU VỰC HIỂN THỊ DS SẢN PHẨM BÊN PHẢI (PRODUCT GRID) ================= */}
        <main className="lg:col-span-3">
          
          {/* Header của vùng danh sách sản phẩm, chứa phần gắt kết chọn sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-100 rounded-2xl p-4.5 mb-6 shadow-2xs">
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded">Hệ thống Lĩnh Vực Máy Móc</span>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight mt-1">
                {activeCategory ? getCategoryName(activeCategory) : 'Tất Cả Sản Phẩm 2026'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Lọc ra được <strong className="text-cyan-600 text-sm font-extrabold">{filteredAndSortedProducts.length}</strong> thiết bị điện lạnh cao cấp tương ứng cấu hình.
              </p>
            </div>
            
            {/* Lọc sắp xếp kết quả chuẩn xác */}
            <div className="mt-3.5 sm:mt-0 flex items-center space-x-3.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg text-xs py-1.5 px-3 bg-white text-slate-700 focus:outline-hidden font-bold cursor-pointer hover:border-slate-300 transition-colors"
                id="listing_sorting_select"
              >
                <option value="popularity">Bán chạy nhất (ID giảm dần)</option>
                <option value="price_asc">Giá bán buôn: Thấp đến Cao</option>
                <option value="price_desc">Giá bán buôn: Cao đến Thấp</option>
                <option value="rating">Được xếp hạng đánh giá tốt nhất (★)</option>
              </select>
            </div>
          </div>

          {/* Vùng các Tag Lọc đang hoạt động để người dùng trực quan xóa bỏ nhanh */}
          {(selectedBrands.length > 0 || minPrice > 0 || maxPrice < 50000000 || minRating !== null || searchQuery !== '') && (
            <div className="flex flex-wrap items-center gap-1.5 mb-5 text-xs text-slate-600 bg-cyan-50/15 px-3.5 py-2.5 border border-cyan-100 rounded-2xl text-left">
              <span className="font-extrabold text-cyan-800 text-[10.5px] uppercase tracking-wider">Tiêu chí bám sát:</span>
              
              {searchQuery !== '' && (
                <span className="bg-white border text-slate-700 hover:text-red-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold shadow-2xs transition-all flex items-center space-x-1" onClick={() => setSearchQuery('')}>
                  <span>Từ khóa: "{searchQuery}"</span>
                  <span className="text-red-500 text-xs">×</span>
                </span>
              )}

              {selectedBrands.length > 0 && selectedBrands.map((bId) => (
                <span 
                  key={bId}
                  onClick={() => handleBrandToggle(bId)}
                  className="bg-white border hover:border-red-400 text-slate-700 hover:text-red-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold shadow-2xs transition-all flex items-center space-x-1"
                >
                  <span>Hãng: {getBrandName(bId)}</span>
                  <span className="text-red-500 text-xs">×</span>
                </span>
              ))}

              {(minPrice > 0 || maxPrice < 50000000) && (
                <span 
                  onClick={() => { setMinPrice(0); setMaxPrice(50000000); }}
                  className="bg-white border hover:border-red-450 text-slate-700 hover:text-red-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold shadow-2xs transition-all flex items-center space-x-1"
                >
                  <span>Giá: {minPrice.toLocaleString('vi-VN')} ₫ - {maxPrice.toLocaleString('vi-VN')} ₫</span>
                  <span className="text-red-500 text-xs">×</span>
                </span>
              )}

              {minRating !== null && (
                <span 
                  onClick={() => setMinRating(null)}
                  className="bg-white border hover:border-red-450 text-slate-700 hover:text-red-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold shadow-2xs transition-all flex items-center space-x-1"
                >
                  <span>Sao ≥ {minRating}★</span>
                  <span className="text-red-500 text-xs">×</span>
                </span>
              )}
              
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-extrabold text-red-600 hover:text-red-800 uppercase tracking-widest ml-auto"
              >
                Dọn sạch tất cả
              </button>
            </div>
          )}

          {/* Grid hiển thị danh sách các thẻ sản phẩm dưới dạng hình thu nhỏ rõ nét */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in" id="listing_products_container">
            {filteredAndSortedProducts.map((p) => (
              <div 
                key={p.product_id} 
                className="transition-transform duration-200 hover:-translate-y-1 block h-full cursor-pointer"
                onClick={() => onProductClick(p)}
                id={`listing_product_card_holder_${p.product_id}`}
              >
                <ProductCard
                  product={p}
                  brandName={getBrandName(p.brand_id)}
                  categoryName={getCategoryName(p.category_id)}
                  onQuickView={(id) => {
                    // Mở xem chi tiết lập tức
                    onProductClick(p);
                  }}
                  onAddToCart={(prod) => {
                    // Thêm nhanh vào giỏ
                    onAddToCart(prod);
                  }}
                />
              </div>
            ))}

            {/* Trình bày fallback giao diện khi lọc ra kết quả rỗng */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="col-span-full py-20 px-4 text-center bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center space-y-3" id="listing_empty_fallback">
                <div className="p-3.5 bg-amber-50 rounded-full text-amber-500">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Không tìm thấy thiết bị phù hợp bộ lọc</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Thiết bị sục bòn hiện tại của bạn có tiêu chuẩn quá hà khắc. Hãy dọn sạch và nới lỏng khoảng giá hoặc sao đánh giá nhé!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xóa tất cả các tiêu chí lọc
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
