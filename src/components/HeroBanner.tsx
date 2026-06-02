/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Percent, Award, Sparkles, Navigation } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  accentColor: string;
  linkText: string;
}

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Định nghĩa danh sách các Slide ưu đãi đặc biệt năm 2026 cho hệ thống điện máy gia dụng
  const slides: Slide[] = [
    {
      id: 1,
      badge: 'ĐIỆN TỬ GIẢI TRÍ ĐỈNH CAO 2026',
      title: 'Tuyệt Tác Nghe Nhìn Thế Hệ Mới',
      subtitle: 'Siêu Ưu Đãi Giảm Lên Đến 40% Toàn Bộ Tivi Cao Cấp',
      description: 'Lần đầu tiên ra mắt thế hệ màn hình hiển thị Samsung Neo QLED phủ AI thông minh. Đổi cũ lấy mới trợ giá đến 5 Triệu đồng kéo dài duy nhất tháng này.',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1200',
      accentColor: 'from-blue-600 to-cyan-500',
      linkText: 'Khám Phá Smart TV'
    },
    {
      id: 2,
      badge: 'GIA DỤNG THÔNG MINH GREEN-LIFE',
      title: 'Công Nghệ Xanh - Chữa Lành Nhà Cửa',
      subtitle: 'Máy giặt & Tủ lạnh Inverter Tiết Kiệm 50% Điện Năng',
      description: 'Trải nghiệm không gian sống vô trùng độc quyền bằng tia cực tím tủ lạnh LG UVnano và máy giặt Panasonic StainMaster+ diệt sạch khuẩn gây hại.',
      image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=1200',
      accentColor: 'from-emerald-600 to-teal-500',
      linkText: 'Nâng Cấp Thiết Bị Giặt & Lạnh'
    },
    {
      id: 3,
      badge: 'THIẾT BỊ NHÀ BẾP HIỆN ĐẠI',
      title: 'Bí Quyết Nấu Ngon Chuẩn Đầu Bếp',
      subtitle: 'Nồi Chiên Không Dầu & Bếp Từ Thông Minh Thế Hệ Mới',
      description: 'Nấu nướng nhàn tênh nhờ liên kết tiện ích Wifi di động qua các dòng nồi nấu cao tần Philips, bếp từ đôi thông minh Xiaomi hỗ trợ 100 chế độ nhiệt.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200',
      accentColor: 'from-amber-500 to-orange-600',
      linkText: 'Mã Giảm Giá Nhà Bếp'
    }
  ];

  // Cơ chế tự động xoay vòng slide banner sau mỗi 6 giây hoạt động liên tục
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Hành động điều hướng sang slide phía trước
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Hành động điều hướng sang slide kế tiếp
  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden" id="hero_banner_slider">
      {/* Container hiển thị cho slide hiện tại */}
      <div className="relative h-[480px] md:h-[520px] transition-all duration-700 ease-in-out">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'
              }`}
            >
              {/* Ảnh nền Unsplash cao cấp sắc sảo */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center opacity-40 mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
                {/* Lớp phủ chuyển màu gradient từ trái sang phải để giữ hiển thị chữ rõ nét */}
                <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/85 to-transparent"></div>
              </div>

              {/* Phần nội dung chữ xuất hiện bên trái Banner */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
                <div className="max-w-xl md:max-w-2xl">
                  {/* Nhãn hiệu ứng độc quyền màu sắc rực rỡ */}
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold leading-5 bg-linear-to-r ${slide.accentColor} text-white shadow-lg shadow-cyan-900/30 mb-5`}>
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>{slide.badge}</span>
                  </span>

                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 font-sans">
                    {slide.title}
                  </h1>
                  <h2 className="text-lg md:text-2xl font-medium text-cyan-300 mb-4">
                    {slide.subtitle}
                  </h2>
                  <p className="text-sm md:text-base text-gray-300 mb-8 leading-relaxed font-sans font-light">
                    {slide.description}
                  </p>

                  {/* Nút lôi kéo hành động (Call To Action Banners) */}
                  <div className="flex items-center space-x-4">
                    <button className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-linear-to-r ${slide.accentColor} hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer shadow-md transition-all`}>
                      <span>{slide.linkText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="px-5 py-3 rounded-full text-sm font-medium border border-gray-500/50 hover:border-white hover:bg-white/10 transition-all cursor-pointer">
                      Xem Chi Tiết Chương Trình
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nút bấm chuyển slide trước đó (Trái) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center border border-white/15 cursor-pointer backdrop-blur-xs transition-all focus:outline-hidden"
        id="hero_btn_prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Nút bấm chuyển slide tiếp theo (Phải) */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center border border-white/15 cursor-pointer backdrop-blur-xs transition-all focus:outline-hidden"
        id="hero_btn_next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Chỉ báo dải tròn phân cấp vị trí các slide dưới đáy (Dots Indicators) */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2.5" id="hero_slider_dots">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide ? 'w-8 bg-cyan-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            title={`Chuyển tới slide ưu đãi số ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
