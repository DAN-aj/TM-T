/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Star, ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Shield, CheckCircle, Package, Truck, Award, Maximize2, X, Info, Layers, Eye, FileText } from 'lucide-react';
import { Product, Review, Category, Brand } from '../types';

interface ProductDetailPageProps {
  product: Product;
  getBrandName: (brandId: number) => string;
  getCategoryName: (categoryId: number) => string;
  reviews: Review[];
  onBack: () => void;
  onAddToCartWithQty: (product: Product, quantity: number) => void;
  onDirectCheckout: (product: Product, quantity: number) => void;
  onAddReview: (productId: number, rating: number, comment: string) => void;
}

export default function ProductDetailPage({
  product,
  getBrandName,
  getCategoryName,
  reviews,
  onBack,
  onAddToCartWithQty,
  onDirectCheckout,
  onAddReview
}: ProductDetailPageProps) {
  // --- TRẠNG THÁI GIAO DIỆN (LOCAL COMPONENT STATES) ---
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // States mới cho tính năng xem ảnh đa góc chuyên nghiệp (Lightbox) & Tab thông số
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [activeSpecTab, setActiveSpecTab] = useState<'tech' | 'highlight' | 'warranty'>('tech');

  // Trạng thái bình luận cục bộ
  const [localReviewRating, setLocalReviewRating] = useState<number>(5);
  const [localReviewComment, setLocalReviewComment] = useState<string>('');

  // 1. Tạo giả lập bộ ảnh đa góc (Multi-angle product images)
  const angleImages = useMemo(() => {
    // Để phong phú, lấy ảnh chính và tạo thêm 3 ảnh mô phỏng các góc cận cảnh khác nhau
    // sử dụng ảnh Unsplash phù hợp để tạo hiệu ứng chuyên nghiệp
    return [
      product.image_url,
      // Angle 2: Close-up
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=600',
      // Angle 3: Interior / Setup
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600',
      // Angle 4: Remote / Detail
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
    ];
  }, [product.image_url]);

  // Bộ mô tả tiếng Việt chi tiết cho từng góc chụp của sản phẩm
  const angleDetails = useMemo(() => {
    return [
      { title: 'Góc Chụp Trực Diện', desc: 'Kiểu dáng cao cấp tổng quan, các đường viền sắc nét, thanh thoát vô cực.' },
      { title: 'Cận Cảnh Góc Nghiêng Khác Biệt', desc: 'Thể hiện độ mỏng ấn tượng, các mối khít chất lượng tạo nên đẳng cấp thiết bị.' },
      { title: 'Toàn Diện Mặt Sau & Các Cổng Kết Nối', desc: 'Bố cục mặt sau khoa học, thông thoáng, bọc giáp bảo vệ và tối ưu kết nối ngoại vi.' },
      { title: 'Không Gian Sắp Đặt Sang Trọng Thực Tế', desc: 'Sự hài hòa đỉnh cao khi trang trí trong căn nhà của bạn, kiến tạo lối sống chuẩn mực thượng lưu.' }
    ];
  }, []);

  // 2. Tạo bảng thông tin thông số kỹ thuật chi tiết dựa theo loại danh mục (Product Specifications Table)
  const categorizedSpecs = useMemo(() => {
    const isTv = product.product_name.toLowerCase().includes('tv') || product.product_name.toLowerCase().includes('tivi') || product.category_id === 1 || product.category_id === 4;
    const isDryer = product.product_name.toLowerCase().includes('giặt') || product.product_name.toLowerCase().includes('lạnh') || product.category_id === 2 || product.category_id === 5;
    
    if (isTv) {
      return {
        tech: [
          { label: 'Kích thước màn hình', value: '55 inch (139 cm) - Thiết kế tinh giản vô cực' },
          { label: 'Độ phân giải', value: 'Ultra HD 4K (3840 x 2160 pixels) chuẩn điện ảnh' },
          { label: 'Bộ xử lý hình ảnh', value: 'Neural Quantum Alpha 9 thế hệ mới tích hợp AI' },
          { label: 'Tần số quét màn hình', value: '120 Hz mượt mà từng chuyển động hành động' },
          { label: 'Công nghệ âm thanh', value: 'Dolby Atmos + Object Tracking Sound 60W 4.2ch' },
          { label: 'Cổng kết nối đầu vào', value: '4 x HDMI 2.1, 3 x USB, 1 x Optical, Lan, Wifi 6, Bluetooth 5.2' },
          { label: 'Hệ điều hành thông minh', value: 'WebOS 2026 / Google TV bản quyền mượt mà' }
        ],
        highlight: [
          { label: 'AI Super Upscaling 4K', value: 'Nâng cấp mọi nội dung nguồn lên cận chuẩn 4K bằng trí tuệ nhân tạo thông minh' },
          { label: 'Màn hình OLED Evo', value: 'Tự động phát sáng điểm ảnh, tối đen tuyệt đối, độ sáng đột phá 150%' },
          { label: 'Gamer Dashboard', value: 'Hỗ trợ G-Sync, FreeSync Premium đỉnh cao cho giới game thủ chuyên nghiệp' },
          { label: 'Smart Home Hub', value: 'Điều khiển các thiết bị thông minh trong nhà thông qua Apple AirPlay 2 & HomeKit' }
        ],
        warranty: [
          { label: 'Thời hạn bảo hành', value: 'Bảo hành chính hãng 24 Tháng tận nơi sử dụng trên toàn quốc' },
          { label: 'Hãng sản xuất', value: 'Tập đoàn điện gia dụng & điện tử đa quốc gia cao cấp' },
          { label: 'Nơi sản xuất lắp ráp', value: 'Indonesia / Việt Nam (Chuẩn chất lượng nghiêm chuẩn xuất xưởng)' },
          { label: 'Cam kết Electro', value: 'Lỗi 1 đổi 1 trong vòng 15 ngày đầu tiên, hoàn tiền gấp đôi nếu phát hiện hàng nhái giả mạo' }
        ]
      };
    } else if (isDryer) {
      return {
        tech: [
          { label: 'Dung tích chứa thực', value: 'Ngăn mát: 410 Lít, Ngăn đông: 225 Lít (Tủ lạnh) / Giặt 10.5 kg - Sấy 7 kg' },
          { label: 'Động cơ vận hành', value: 'Smart Inverter không chổi than siêu êm ái, tiết kiệm 45% điện năng' },
          { label: 'Hệ thống làm lạnh / Giặt', value: 'DoorCooling thổi gió từ cửa tủ / Giặt hơi nước Steam diệt khuẩn tận gốc 99.9%' },
          { label: 'Chất liệu lồng / Khay', value: 'Thép không gỉ siêu bền chống xước / Thủy tinh chịu lực lực tải lến tới 150kg' },
          { label: 'Điện năng tiêu thụ', value: 'Khoảng 1.1 kWh/ngày (Đạt chứng nhận nhãn năng lượng 5 sao tuyệt đối)' },
          { label: 'Kích thước thiết bị', value: 'Cao 179 cm - Rộng 91.3 cm - Sâu 73.5 cm (Trọng lượng: 115 kg)' }
        ],
        highlight: [
          { label: 'InstaView Door-in-Door', value: 'Gõ nhẹ hai lần lên mặt kính để nhìn thấu bên trong mà không làm thất thoát hơi lạnh' },
          { label: 'Kháng khuẩn UVnano', value: 'Tự động làm sạch vòi nước uống bằng tia cực tím diệt 99.99% loại bỏ vi sinh hại' },
          { label: 'AI DD bảo vệ sợi vải', value: 'Cảm biến tối tân tự động nhận diện chất liệu vải để tối ưu chu trình giặt giũ bảo vệ áo quần' },
          { label: 'Chế độ đông nhanh', value: 'Cấp đông siêu tốc liên tục Express Freeze giữ nguyên chất dinh dưỡng trong thực phẩm' }
        ],
        warranty: [
          { label: 'Thời hạn bảo hành máy', value: 'Bảo hành chính hãng 24 Tháng toàn bộ máy sửa chữa miễn phí tại nhà' },
          { label: 'Bảo hành máy nén/motor', value: 'Bảo hành siêu trường đặc biệt 10 Năm cho bộ Động cơ Inverter cốt lõi' },
          { label: 'Nước sản xuất', value: 'Thái Lan / Việt Nam (Nhập khẩu nguyên chi tiết máy)' },
          { label: 'Hỗ trợ kỹ thuật', value: 'Đường dây nóng hỗ trợ miễn cước 24/7, kỹ thuật viên phủ khắp 63 tỉnh thành phố' }
        ]
      };
    } else {
      return {
        tech: [
          { label: 'Dung tích sử dụng', value: '6.5 Lít - Phù hợp dồi dào cho nướng nguyên con gà 2.2 kg thoải mái' },
          { label: 'Công suất hoạt động', value: '1800W - 2000W gia nhiệt đối lưu đa chiều cực nhanh không cần chờ đợi' },
          { label: 'Dải nhiệt độ cài đặt', value: '40°C - 200°C tùy chỉnh chuẩn xác từng độ C, có chế độ ủ sữa chua tiện dụng' },
          { label: 'Lòng nồi & Phụ kiện', value: 'Kim loại phủ chống dính Ceramic tinh khiết cao cấp, siêu an toàn nhiệt độ cao' },
          { label: 'Bảng điều khiển', value: 'Màn hình cảm ứng LED sắc nét, tích hợp sẵn 8 chương trình nấu ăn thông minh' },
          { label: 'Kích thước / Trọng lượng', value: 'Rộng 32 cm x Sâu 38 cm x Cao 35 cm (Trọng lượng tinh đạt: 5.8 kg)' }
        ],
        highlight: [
          { label: 'Công nghệ Rapid Air 3D', value: 'Luồng khí nóng luân chuyển đối lưu tốc độ cao giúp thực phẩm chín đều, giòn rụm mà không cần dùng dầu mỡ' },
          { label: 'Giảm 85% lượng chất béo', value: 'Thiết kế tách rời tối đa dầu mỡ thừa có sẵn trong thực phẩm xuống khay hứng riêng cực tốt' },
          { label: 'Hẹn giờ siêu lâu', value: 'Lên tới 60 phút tiện nghi, máy tự động ngắt kết thúc hoàn toàn độc lập kèm tiếng chuông báo' },
          { label: 'Cửa kính EasyView', value: 'Cửa kính cường lực chịu nhiệt kèm đèn chiếu sáng sáng sủa khoang nấu giúp xem thực phẩm chín' }
        ],
        warranty: [
          { label: 'Thời hạn bảo hành', value: 'Chính hãng Electro phân phối bảo hành 12 Tháng trên toàn lãnh thổ' },
          { label: 'Chế độ bảo hành vàng', value: '1 đổi 1 trong vòng 30 ngày nếu phát hiện lỗi từ khâu vận chuyển hoặc sản xuất' },
          { label: 'Xuất xứ thương hiệu', value: 'Công nghệ bản quyền Châu Âu, lắp ráp theo chuẩn chất lượng CE, RoHS' },
          { label: 'Quà tặng hậu mãi', value: 'Tặng kèm cẩm nang chế biến 100 món ăn đẳng cấp nhà hàng biên soạn độc quyền' }
        ]
      };
    }
  }, [product]);

  // Lọc lấy đánh giá được duyệt của sản phẩm này
  const activeReviews = useMemo(() => {
    return reviews.filter((r) => r.product_id === product.product_id && r.status === 'approved');
  }, [reviews, product.product_id]);

  // 3. Logic tăng/giảm số lượng mua
  const handleQtyChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      if (purchaseQuantity < product.stock_quantity) {
        setPurchaseQuantity(purchaseQuantity + 1);
      } else {
        triggerToast(`Chỉ còn tối đa ${product.stock_quantity} sản phẩm trong kho lẻ.`);
      }
    } else {
      if (purchaseQuantity > 1) {
        setPurchaseQuantity(purchaseQuantity - 1);
      }
    }
  };

  // Hàm hiển thị thông báo góc màn hình (Toast)
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Thêm vào giỏ hành động
  const handleAddToCartClick = () => {
    if (isAdding) return;
    setIsAdding(true);
    setTimeout(() => {
      onAddToCartWithQty(product, purchaseQuantity);
      triggerToast(`Đã thêm thành công ${purchaseQuantity} sản phẩm: "${product.product_name}" vào giỏ hàng của bạn!`);
      setIsAdding(false);
    }, 600);
  };

  // Đăng ký nhận xét, bình luận mới
  const handleReviewSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localReviewComment.trim() || isReviewing) return;
    setIsReviewing(true);
    setTimeout(() => {
      onAddReview(product.product_id, localReviewRating, localReviewComment);
      triggerToast('Cảm ơn đóng góp ý kiến! Đánh giá của bạn đã được duyệt lên kệ ngay lập tức.');
      setLocalReviewComment('');
      setLocalReviewRating(5);
      setIsReviewing(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left relative" id="product_detail_viewport">
      
      {/* Toast thông báo góc sang xịn (Toast Notification) */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 border border-slate-800 text-white font-sans text-xs font-semibold py-3 px-5 rounded-2xl shadow-2xl z-55 flex items-center space-x-3.5 animate-slide-in">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Nút quay lại màn hình danh sách */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs text-gray-500 hover:text-cyan-600 font-bold mb-6 hover:underline cursor-pointer"
        id="detail_back_to_catalog"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay Lại Danh Sách Sản Phẩm</span>
      </button>

      {/* Layout Grid kép chính của chi tiết hàng hóa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-xs">
        
        {/* ================= CỘT TRÁI: KHU VỰC ẢNH ĐA GÓC TƯƠNG TÁC (DETAILED MULTI-ANGLE GALLERY) ================= */}
        <div className="lg:col-span-6 space-y-5" id="detail_images_wrapper">
          
          {/* Khung ảnh to chính chủ đạo tích hợp bộ phóng to */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-center h-80 md:h-[450px] relative overflow-hidden group">
            <img
              src={angleImages[activeImageIdx]}
              alt={product.product_name}
              className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            
            {/* Nhãn hàng bảo hành */}
            <span className="absolute bottom-4 left-4 bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider font-mono">
              Bảo Hành 2 Năm
            </span>

            {/* Phím phóng to ảnh / Xem đa góc chuyên biệt */}
            <button
              onClick={() => {
                setActiveImageIdx(activeImageIdx);
                setIsLightboxOpen(true);
              }}
              className="absolute top-4 right-4 bg-white/95 hover:bg-slate-950 hover:text-white text-slate-800 transition-all p-2.5 rounded-full shadow-lg border border-gray-150 flex items-center space-x-1.5 cursor-pointer text-[10px] font-bold"
              id="detail_trigger_lightbox_overlay"
              title="Phóng to xem đa góc chi tiết"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">XEM ĐA GÓC (LIGHTBOX)</span>
            </button>
          </div>

          {/* Dòng hiển thị thẻ góc giải thích cao cấp */}
          <div className="bg-cyan-50/35 border border-cyan-100/50 p-3.5 rounded-2xl text-[11px] text-slate-700 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-700 font-extrabold uppercase tracking-wide">
              <Eye className="w-3.5 h-3.5" />
              <span>{angleDetails[activeImageIdx]?.title}</span>
            </div>
            <p className="text-gray-500 leading-relaxed italic">
              "{angleDetails[activeImageIdx]?.desc}"
            </p>
          </div>

          {/* Dòng các ảnh thu nhỏ góc phụ cận khác (Thumbnails Carousel) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-700 font-mono">DANH SÁCH GÓC MỨC ĐỘ CHỤP</span>
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="text-cyan-600 hover:text-cyan-700 hover:underline font-extrabold flex items-center space-x-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Xem Thư Viện Đầy Đủ</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3.5">
              {angleImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIdx(index)}
                  className={`aspect-square bg-gray-50 p-2.5 rounded-xl border-2 transition-all overflow-hidden flex flex-col items-center justify-between cursor-pointer ${
                    activeImageIdx === index ? 'border-cyan-500 shadow-sm' : 'border-gray-150 hover:border-gray-250'
                  }`}
                  title={angleDetails[index]?.title}
                >
                  <img
                    src={img}
                    alt={`Góc phụ ${index + 1}`}
                    className="max-h-[80%] max-w-full object-contain mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[7.5px] text-gray-400 font-bold block uppercase tracking-tighter">GÓC {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dải cam kết khách hàng chất lượng */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-[10px] text-gray-500 font-sans">
            <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-xl border text-center">
              <Truck className="w-5 h-5 text-cyan-600 mb-1" />
              <span className="font-bold text-slate-800">Giao hàng miễn phí</span>
              <p className="scale-95 text-[9px] text-gray-400">Đơn hàng lớn nhanh 2H</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-xl border text-center">
              <Package className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-800">Kiểm tra trả tiền</span>
              <p className="scale-95 text-[9px] text-gray-400">Xem đúng thông số thanh toán</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50/50 rounded-xl border text-center">
              <Award className="w-5 h-5 text-orange-500 mb-1" />
              <span className="font-bold text-slate-800">Một đổi một 15 ngày</span>
              <p className="scale-95 text-[9px] text-gray-400">Lỗi linh kiện máy thay thế mới</p>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: CHI TIẾT THÔNG SỐ VÀ Ô TRẠNG THÁI MUA SẮM ================= */}
        <div className="lg:col-span-6 flex flex-col justify-between" id="detail_info_wrapper">
          <div className="space-y-4">
            
            {/* SKU and Brand Label Info */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                  HÃNG {getBrandName(product.brand_id)}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  MÃ SẢN PHẨM: <strong className="text-slate-800">{product.sku}</strong>
                </span>
              </div>
              <span className="text-xs text-cyan-600 font-bold uppercase tracking-widest font-mono">
                {getCategoryName(product.category_id)}
              </span>
            </div>

            {/* Tên Thiết Bị Tiêu Đề */}
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
              {product.product_name}
            </h1>

            {/* Trạng thái sao và đánh giá */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.avg_rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-250'
                    }`}
                  />
                ))}
                <span className="text-xs font-extrabold text-slate-850 text-slate-800 pl-1">
                  {product.avg_rating.toFixed(1)} / 5.0
                </span>
              </div>
              <span className="h-3 w-px bg-gray-200"></span>
              <span className="text-xs text-gray-400 hover:underline cursor-pointer">
                Có {activeReviews.length} khách bình luận thẩm định
              </span>
            </div>

            {/* Khu vực giá cả */}
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-105 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 block line-through">
                  {(product.price * 1.15).toLocaleString('vi-VN')} VNĐ
                </span>
                <span className="text-xl md:text-2xl font-black font-mono text-red-650 text-red-650 text-red-600 leading-none">
                  {product.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                  Tiết kiệm đến 15%
                </span>
                <p className="text-[9px] text-gray-400 mt-1">Đã bao gồm VAT và gói lắp đặt tại nhà</p>
              </div>
            </div>

            {/* Mô tả tóm tắt ngắn */}
            <p className="text-xs text-gray-500 leading-relaxed font-sans border-b border-gray-100 pb-4">
              {product.description}
            </p>

            {/* Tồn kho trạng thái */}
            <div className="text-xs flex items-center space-x-2 font-semibold">
              <span className="text-gray-400">Trạng thái kho:</span>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${product.stock_quantity > 0 ? 'bg-cyan-50 text-cyan-700' : 'bg-red-50 text-red-600'}`}>
                {product.stock_quantity > 0 ? `CÒN CHỨA TRỰC TIẾP (${product.stock_quantity} CÁI)` : 'HẾT HÀNG TRỰC TIẾP'}
              </span>
            </div>

            {/* ================= SỐ LƯỢNG VÀ PHÍM GIAO DỊCH ================= */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-400 font-semibold font-sans">Chọn mua số lượng:</span>
                
                {/* Bộ đếm số lượng */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleQtyChange('decrease')}
                    className="h-8 w-8 rounded-md bg-white border border-gray-200/50 flex items-center justify-center font-bold text-slate-800 hover:bg-gray-101 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                    {purchaseQuantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange('increase')}
                    className="h-8 w-8 rounded-md bg-white border border-gray-200/50 flex items-center justify-center font-bold text-slate-800 hover:bg-gray-101 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Các nút bấm Thêm giỏ hàng / Thanh toán */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleAddToCartClick}
                  disabled={product.stock_quantity === 0 || isAdding}
                  className={`py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                    product.stock_quantity === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : isAdding
                      ? 'bg-cyan-100 text-cyan-700 border-cyan-200 cursor-wait'
                      : 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-600 hover:text-white shadow-sm'
                  }`}
                  id="detail_add_to_cart_btn"
                >
                  {isAdding ? (
                    <>
                      <span className="w-4 h-4 border-2 border-cyan-650 border-t-transparent rounded-full animate-spin" />
                      <span>ĐANG THÊM VÀO GIỎ...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>THÊM VÀO GIỎ HÀNG</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsCheckingOut(true);
                    setTimeout(() => {
                      onDirectCheckout(product, purchaseQuantity);
                      setIsCheckingOut(false);
                    }, 850);
                  }}
                  disabled={product.stock_quantity === 0 || isCheckingOut}
                  className={`py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    product.stock_quantity === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isCheckingOut
                      ? 'bg-red-350 cursor-wait'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100'
                  }`}
                  id="detail_direct_checkout_btn"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ĐANG CHUYỂN PHÒNG...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>THANH TOÁN NGAY CHỐT ĐƠN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Một sải dịch vụ nhỏ thêm tính bảo vệ người dùng */}
          <div className="border-t border-gray-100 mt-6 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-mono">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sản phẩm chính hãng LG, Samsung, Sony 100%</span>
            </span>
            <span className="text-slate-500 font-bold">ELECTRO 2026 cam kết</span>
          </div>
        </div>

      </div>

      {/* ================= PHẦN DƯỚI LÀ: THÔNG SỐ KỸ THUẬT PHÂN LOẠI & BÌNH LUẬN ĐÁNH GIÁ (DETAILED MULTI-TAB SPECS & REVIEW SECTION) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        
        {/* KHỐI TRÁI: THÔNG SỐ KỸ THUẬT NÂNG CẤP PHÂN LOẠI (DETAILED SPECIFICATIONS WITH CATEGORIZATION TABS) */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 text-left shadow-xs flex flex-col justify-between" id="detail_categorized_specs_card">
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b pb-3 mb-4 uppercase tracking-wider font-sans flex items-center space-x-2">
              <FileText className="w-4.5 h-4.5 text-cyan-600" />
              <span>Phân Tích Thông Số & Cam Kết</span>
            </h3>

            {/* Điều hướng Tab thông số kĩ thuật */}
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-4 text-[10px] font-bold">
              <button
                onClick={() => setActiveSpecTab('tech')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeSpecTab === 'tech'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                Cơ Bản & Kỹ Thuật
              </button>
              <button
                onClick={() => setActiveSpecTab('highlight')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeSpecTab === 'highlight'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                Điểm Nhấn Nổi Bật
              </button>
              <button
                onClick={() => setActiveSpecTab('warranty')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  activeSpecTab === 'warranty'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                Bảo Hành & Đổi Mới
              </button>
            </div>

            {/* Nội dung danh sách thông số tùy chọn active tab */}
            <div className="space-y-1.5 min-h-[280px]">
              {categorizedSpecs[activeSpecTab].map((spec, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 py-2.5 px-3.5 text-xs rounded-xl border border-transparent transition-all hover:bg-cyan-50/20 hover:border-cyan-100/30 ${
                    index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  <div className="col-span-5 font-bold text-gray-500 flex items-center space-x-1">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                    <span>{spec.label}</span>
                  </div>
                  <div className="col-span-7 text-slate-800 font-sans pl-2 leading-relaxed">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-gray-100 rounded-2xl text-[10px] text-gray-400 font-sans flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Các thông số trên được thu thập kiểm chứng từ tài liệu xuất xưởng chính thức của hãng sản xuất. Electro 2026 chịu hoàn toàn trách nhiệm về tính pháp lý.
            </p>
          </div>
        </div>

        {/* KHỐI PHẢI: BÌNH LUẬN & ĐÁNH GIÁ CỦA KHÁCH HÀNG THẬT */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 text-left shadow-xs mb-8" id="detail_reviews_workspace">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4 uppercase tracking-wider font-sans">
            Đánh Giá từ Phía Người Tiêu Dùng ({activeReviews.length} Đánh giá)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Cột trái của review: Danh sách bình luận hiện hành */}
            <div className="md:col-span-7 space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {activeReviews.map((rev) => (
                <div key={rev.review_id} className="bg-slate-50 p-3.5 rounded-xl border border-gray-105 text-xs text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-800">{rev.user_name}</span>
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                  <span className="text-[9px] text-gray-400 block mt-2 font-mono">
                    Đã xuất bài thẩm duyệt: {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}

              {activeReviews.length === 0 && (
                <div className="py-12 text-center text-gray-400 italic font-sans" id="detail_reviews_empty">
                  Chưa có bình luận trải nghiệm nào cho thiết bị điện máy này.
                  <p className="text-[10px] text-gray-300 mt-1">Trở thành người đóng góp bài viết đầu tiên bên hông!</p>
                </div>
              )}
            </div>

            {/* Cột phải: Form soạn thảo nhận xét gửi trực tiếp */}
            <div className="md:col-span-5 bg-cyan-50/20 border border-cyan-100 rounded-2xl p-4 text-xs">
              <h4 className="font-extrabold text-cyan-800 mb-2 font-sans">Đóng Góp Ý Kiến Khách Hàng</h4>
              <p className="text-[10px] text-cyan-600/80 mb-3.5 lead-normal">
                Chia sẻ trải nghiệm sử dụng thực tế giúp Electro 2026 chọn lựa sản phẩm ngày càng hoàn hảo cho quý khách.
              </p>
              
              <form onSubmit={handleReviewSubmitLocal} className="space-y-3">
                {/* Chọn mốc sao */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mức độ hài lòng:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((sVal) => (
                      <button
                        key={sVal}
                        type="button"
                        onClick={() => setLocalReviewRating(sVal)}
                        className="p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`w-4.5 h-4.5 ${
                            sVal <= localReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khung nhập comment */}
                <textarea
                  rows={3}
                  value={localReviewComment}
                  onChange={(e) => setLocalReviewComment(e.target.value)}
                  placeholder="Lò sấy dùng rất bền, tivi màu sắc tươi không sọc màn hình..."
                  className="w-full p-2.5 border border-cyan-150 rounded-lg text-xs bg-white focus:outline-hidden focus:border-cyan-500"
                  required
                />

                <button
                  type="submit"
                  disabled={isReviewing}
                  className={`w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center justify-center space-x-1 ${
                    isReviewing ? 'bg-cyan-400 opacity-80 cursor-wait' : ''
                  }`}
                >
                  {isReviewing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ĐANG ĐĂNG...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Đăng Bình Luận</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>

      {/* ================= NÚT QUAY LẠI LỚN Ở CHÂN TRANG (EXTRA EXIT CONTROLS) ================= */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 mb-6" id="detail_bottom_controls">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-cyan-100 cursor-pointer w-full sm:w-auto"
          id="detail_bottom_back_btn_solid"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
          <span>QUAY LẠI DANH SÁCH SẢN PHẨM</span>
        </button>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            triggerToast('Đã cuộn trang lên đầu thành công!');
          }}
          className="inline-flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-gray-100 text-slate-500 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all border border-gray-200 cursor-pointer w-full sm:w-auto"
        >
          <span>Cuộn Lên Đầu Trang</span>
        </button>
      </div>

      {/* ================= BIỂU DIỄN THƯ VIỆN ĐA GÓC ĐẮT GIÁ (FULL-SCREEN MULTI-ANGLE LIGHTBOX MODAL) ================= */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 select-none animate-fade-in"
          id="detail_multi_angle_lightbox"
        >
          {/* Lightbox Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="text-left">
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest block mb-1">
                ELECTRO 2026 - THƯ VIỆN ĐA GÓC ĐỘ CHUYÊN SÂU
              </span>
              <h2 className="text-sm md:text-base font-extrabold text-white leading-none">
                {product.product_name}
              </h2>
            </div>
            
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all cursor-pointer flex items-center justify-center"
              title="Đóng thư viện ảnh"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Body (Central Viewer + Arrows) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center overflow-hidden">
            
            {/* Cột chính: Khung hiển thị ảnh cực đại */}
            <div className="lg:col-span-8 flex items-center justify-center relative h-full max-h-[50vh] md:max-h-[65vh] bg-black/40 rounded-3xl border border-white/5 p-4">
              
              {/* Nút lướt ảnh sang trái */}
              <button
                onClick={() => {
                  setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : angleImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-cyan-600 text-white p-3 rounded-full transition-all cursor-pointer block"
                title="Góc chụp kế trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={angleImages[activeImageIdx]}
                alt={`Đa góc ${activeImageIdx + 1}`}
                className="max-h-[92%] max-w-[85%] object-contain"
                referrerPolicy="no-referrer"
              />

              {/* Nút lướt ảnh sang phải */}
              <button
                onClick={() => {
                  setActiveImageIdx((prev) => (prev < angleImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-cyan-600 text-white p-3 rounded-full transition-all cursor-pointer block"
                title="Góc chụp tiếp theo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Nhãn mốc hiển thị số trang */}
              <span className="absolute bottom-4 right-4 bg-black/60 text-white/90 text-[10px] font-bold font-mono px-3 py-1.5 rounded-full border border-white/10">
                Góc ảnh {activeImageIdx + 1} / {angleImages.length}
              </span>
            </div>

            {/* Cột phụ: Bảng điều khiển góc chụp tiện ích */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 text-left text-white h-full flex flex-col justify-between overflow-y-auto max-h-[35vh] lg:max-h-full">
              <div className="space-y-4">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide inline-block">
                  Chi tiết góc chụp
                </span>
                <h3 className="text-base font-extrabold text-cyan-400">
                  {angleDetails[activeImageIdx]?.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{angleDetails[activeImageIdx]?.desc}"
                </p>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono block">CHỌN NHANH GÓC ĐỘ PHÙ HỢP:</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {angleImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`p-2 rounded-xl border transition-all text-left flex items-center space-x-2 cursor-pointer ${
                          activeImageIdx === i 
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' 
                            : 'border-white/10 hover:border-white/25 text-slate-300 hover:text-white bg-white/5'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-md bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={img} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-bold leading-none uppercase truncate">
                          Góc {i + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-[10px] text-slate-400 leading-relaxed font-sans mt-4">
                Chụp ảnh thực tế đa góc bằng máy ảnh kỹ thuật số chuyên sâu không qua biến đổi cấu trúc, hỗ trợ quý khách có góc nhìn chính trực nhất về thiết bị trước khi chốt mua.
              </div>
            </div>

          </div>

          {/* Lightbox Footer */}
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-slate-400 gap-3">
            <span>Bản quyền hình ảnh góc rộng thuộc về © Tập đoàn Electro 2026</span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg hover:shadow-cyan-950 cursor-pointer"
            >
              Quay Lại Chi Tiết Sản Phẩm
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
