/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Phone, MapPin, Cpu, Facebook, Youtube, CreditCard, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 font-sans" id="main_app_footer">
      {/* Tối ưu hóa dải liên hệ bên trên thông qua các khối nhỏ liên lạc */}
      <div className="border-b border-gray-800" id="footer_top_links">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-3 text-left">
            <div className="p-3 bg-gray-800 rounded-lg text-cyan-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Trụ sở chính &amp; Kho vận</p>
              <p className="text-xs text-gray-400 mt-1">Hà Nội: Số 8 Tôn Thất Thuyết, Mỹ Đình, Nam Từ Liêm, Hà Nội</p>
              <p className="text-xs text-gray-400 mt-0.5">TP.HCM: Lầu 5, 201 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-left">
            <div className="p-3 bg-gray-800 rounded-lg text-cyan-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Bộ phận Chăm sóc Khách hàng</p>
              <p className="text-xs text-gray-400 mt-1">Trung tâm hỗ trợ kỹ thuật: 1900-5454 (7:30 - 22:00)</p>
              <p className="text-xs text-gray-400 mt-0.5">Email tiếp nhận bảo hành: baohanh@dienmay2026.vn</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-left">
            <div className="p-3 bg-gray-800 rounded-lg text-cyan-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Chứng nhận Uy tín &amp; Bảo mật</p>
              <p className="text-xs text-gray-400 mt-1">Đã thông báo Bộ Công Thương Việt Nam về TMĐT.</p>
              <p className="text-xs text-gray-400 mt-0.5">Mã số thuế doanh nghiệp thành phố: 01020262026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phần liên kết trang (Links & Descriptions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left" id="footer_middle_links">
        {/* Cột giới thiệu công ty */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">ELECTRO GIA DỤNG</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Website thương mại điện tử chuyên nghiệp cung cấp hệ thống thiết bị điện tử siêu việt, đồ gia dụng thế hệ mới và đồ dùng căn bếp đa dạng cho mọi gia đình Việt Nam hiện đại.
          </p>
          <div className="flex items-center space-x-3.5 pt-2">
            <button className="h-8 w-8 rounded-full bg-gray-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer" title="Facebook">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="h-8 w-8 rounded-full bg-gray-800 hover:bg-red-650 hover:text-white flex items-center justify-center transition-colors cursor-pointer" title="Youtube">
              <Youtube className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cột ngành hàng sản phẩm chính */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-sans">Danh Mục Sản Phẩm</h4>
          <ul className="space-y-2 text-xs text-gray-400 pl-0">
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Thiết bị Tivi giải trí 4K vòm</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Tủ lạnh bảo quản thực phẩm</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Máy giặt thế hệ Inverter khử mùi</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Bếp điện từ &amp; Thiết bị gia nhiệt</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Nồi cơm điện &amp; Nồi áp suất cao tần</span></li>
          </ul>
        </div>

        {/* Cột các chính sách và tiện ích hỗ trợ khách hàng */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-sans">Chính Sách &amp; Trợ Giúp</h4>
          <ul className="space-y-2 text-xs text-gray-400 pl-0">
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Chính sách giao nhận hoả tốc 2H</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Đăng ký đổi trả lỗi phần cứng trong 15 ngày</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Chính sách bảo hành vàng nhà sản xuất</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Hướng dẫn tích điểm hội viên vàng</span></li>
            <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Giải pháp thanh toán trực tuyến bảo mật</span></li>
          </ul>
        </div>

        {/* Cột phương thức giao dịch chấp nhận thanh toán */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2 font-sans">Phương Thức Thanh Toán</h4>
          <p className="text-xs text-gray-400">Chúng tôi đồng hành liên kết bảo mật với các tổ chức ví điện tử và ngân hàng trung ương Việt Nam:</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
            <span className="bg-slate-800 px-2 py-1.5 rounded-sm font-semibold tracking-wider text-center border border-gray-700/60 font-mono">VNPAY QR</span>
            <span className="bg-slate-800 px-2 py-1.5 rounded-sm font-semibold tracking-wider text-center border border-gray-700/60 font-mono">MOMO WALLET</span>
            <span className="bg-slate-800 px-2 py-1.5 rounded-sm font-semibold tracking-wider text-center border border-gray-700/60 font-mono">VISA / MASTERCARD</span>
            <span className="bg-slate-800 px-2 py-1.5 rounded-sm font-semibold tracking-wider text-center border border-gray-700/60 font-mono">COD (CASH ON DELIVER)</span>
          </div>
        </div>
      </div>

      {/* Dòng chữ bản quyền đăng ký bản sắc thương hiệu dưới đáy */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500" id="footer_bottom_copyright">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            &copy; 2026 Electro Gia Dụng System. Bản quyền thuộc về Đội ngũ Kỹ thuật Lập trình Công nghệ.
          </p>
          <div className="flex space-x-6 text-[10px] uppercase font-semibold">
            <span className="hover:text-gray-400 cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-gray-400 cursor-pointer">Cam kết dữ liệu thông tin cá nhân</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
