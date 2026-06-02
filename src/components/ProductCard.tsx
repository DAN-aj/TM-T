/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, StarHalf, Eye, ShoppingCart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Product, Brand, Category } from '../types';

interface ProductCardProps {
  product: Product; // Thông tin sản phẩm chi tiết cần hiển thị
  brandName: string; // Tên thương hiệu tương ứng
  categoryName: string; // Tên danh mục thiết kế tương ứng
  onQuickView: (productId: number) => void; // Event kích hoạt xem nhanh chi tiết sản phẩm modal
  onAddToCart: (product: Product) => void; // Event thêm nhanh sản phẩm vào giỏ hàng
}

export default function ProductCard({
  product,
  brandName,
  categoryName,
  onQuickView,
  onAddToCart
}: ProductCardProps) {
  // Hàm render số sao đánh giá sản phẩm đẹp mắt dựa vào điểm số trung bình (avg_rating)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-gray-250" />
        );
      }
    }
    return (
      <div className="flex items-center space-x-0.5">
        {stars}
        <span className="text-[11px] text-gray-500 font-mono font-bold pl-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity === 0 || isAdding) return;
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsAdding(false);
    }, 600);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 hover:border-cyan-500/25 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full relative"
      id={`product_card_${product.product_id}`}
    >
      {/* Nhãn hiệu thông số giảm giá/kho hàng đặc trưng hoặc Thương Hiệu nổi tiếng tủ lạnh máy giặt */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1">
        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {brandName}
        </span>
        {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
          <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse">
            Chỉ còn {product.stock_quantity} cái
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
            Hết Hàng
          </span>
        )}
      </div>

      {/* Ảnh sản phẩm đi kèm hiệu ứng Hover zoom */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden pt-4 px-4 flex items-center justify-center">
        <img
          src={product.image_url}
          alt={product.product_name}
          className="max-h-full max-w-full object-contain object-center transform group-hover:scale-108 transition-all duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Lớp màng xám hover hiển thị nút Xem nhanh (Quick View Action) */}
        <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onQuickView(product.product_id)}
            className="bg-white hover:bg-cyan-600 hover:text-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 cursor-pointer"
            title="Xem nhanh thông số và đánh giá"
            id={`quick_view_btn_${product.product_id}`}
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Thông tin phần thân sản phẩm */}
      <div className="p-4 flex flex-col flex-1 text-left">
        {/* Thể loại danh mục đính kèm nhẹ nhàng */}
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 font-mono">
          {categoryName}
        </span>

        {/* Tên sản phẩm chính */}
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-cyan-600 line-clamp-2 h-10 mb-1.5 transition-colors">
          {product.product_name}
        </h3>

        {/* Khung xếp hạng sao */}
        <div className="mb-3">
          {renderStars(product.avg_rating)}
        </div>

        {/* SKU và cam kết bảo hành */}
        <div className="text-[10px] text-gray-500 flex items-center space-x-1 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          <span>Bảo hành chính hãng 24 tháng</span>
        </div>

        {/* Giá bán và nút Thêm vào giỏ ở cuối Card */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through">
              {(product.price * 1.15).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-base font-bold text-red-600 font-mono">
              {product.price.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          <button
            onClick={handleAddClick}
            disabled={product.stock_quantity === 0 || isAdding}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              product.stock_quantity === 0
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : isAdding
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-200 cursor-wait'
                : 'bg-cyan-50 border border-cyan-100 text-cyan-600 hover:bg-cyan-600 hover:text-white hover:shadow-md'
            }`}
            title="Thêm vào giỏ của bạn"
            id={`add_to_cart_btn_${product.product_id}`}
          >
            {isAdding ? (
              <span className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
