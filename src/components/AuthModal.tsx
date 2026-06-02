/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserType[];
  onAddUser: (newUser: UserType) => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  allUsers,
  onAddUser,
  onLoginSuccess
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // --- TRẠNG THÁI LIÊN QUAN ĐẾN ĐĂNG NHẬP (LOGIN STATE) ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});

  // --- TRẠNG THÁI LIÊN QUAN ĐẾN ĐĂNG KÝ (REGISTER STATE) ---
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});

  // Thông báo đăng ký thành công
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- HÀM PARSE VÀ HIỂN THỊ LỖI CHUẨN UX (ERROR PARSER) ---
  const renderFieldError = (errorText: string | undefined) => {
    if (!errorText) return null;
    const parts = errorText.split(' | ');
    if (parts.length < 3) {
      return (
        <span className="text-[10px] text-red-500 font-semibold mt-1 flex items-center">
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
          {errorText}
        </span>
      );
    }
    const errorTitle = parts[0];
    const causePart = parts[1].replace('Nguyên nhân:', '').trim();
    const fixPart = parts[2].replace('Cách sửa:', '').replace('Cách khắc phục:', '').trim();

    return (
      <div className="mt-1.5 p-2.5 bg-red-50/90 border border-red-200 rounded-lg text-left text-[11px] text-red-800 space-y-1">
        <div className="flex items-center font-bold text-red-700">
          <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-red-500" />
          <span>{errorTitle}</span>
        </div>
        <p className="pl-4.5 text-[10px]"><span className="font-semibold text-slate-800">Nguyên nhân:</span> {causePart}</p>
        <p className="pl-4.5 text-[10px]"><span className="font-semibold text-emerald-800 font-bold">Khắc phục:</span> {fixPart}</p>
      </div>
    );
  };

  // --- XỬ LÝ SỰ KIỆN ĐĂNG NHẬP (LOGIN VALIDATE & SUBMIT) ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // 1. Kiểm tra dải Email trống hoặc sai định dạng
    if (!loginEmail.trim()) {
      errors.email = 'Thiếu hụt Email đăng nhập | Nguyên nhân: Ô nhập địa chỉ thư điện tử đang bị bỏ trống | Cách sửa: Vui lòng điền tài khoản email đã thiết lập của bạn.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginEmail.trim())) {
        errors.email = 'Định dạng Email không hợp lệ | Nguyên nhân: Chuỗi văn bản nhập không đáp ứng chuẩn cấu trúc hòm thư (thiếu ký tự @ hoặc tên miền) | Cách sửa: Hãy bổ sung chính xác dạng thức thư tín, ví dụ: dienmayelectro@gmail.com.';
      }
    }

    // 2. Kiểm tra mật khẩu trống hoặc quá ngắn
    if (!loginPassword) {
      errors.password = 'Mật khẩu trống | Nguyên nhân: Ô nhập mật khẩu bảo an hiện đang bỏ trống | Cách sửa: Gõ đầy đủ chuỗi ký tự mật khẩu của bạn vào ô.';
    } else if (loginPassword.length < 6) {
      errors.password = 'Mật khẩu quá ngắn | Nguyên nhân: Chuỗi ký tự nhập vào ngắn hơn 6 ký tự theo tiêu chuẩn bảo mật tối thiểu | Cách sửa: Vui lòng bổ sung số lượng ký tự mật khẩu bảo đảm dài tối thiểu 6 chữ số/chữ cái.';
    }

    // Nếu có lỗi tĩnh thì dừng ngay
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    // 3. Khớp cơ sở dữ liệu giả lập (Matching mockup DB users)
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());

    if (!matchedUser) {
      errors.email = 'Hòm thư chưa kích hoạt | Nguyên nhân: Email này không tồn tại trong danh bạ thành viên của hệ thống Electro | Cách sửa: Vui lòng kiểm tra lại chính xác từng ký tự email, hoặc nhấp sang Tab "Đăng ký thành viên" để khởi tạo tài khoản mới.';
      setLoginErrors(errors);
      return;
    }

    if (matchedUser.status === 'inactive') {
      errors.email = 'Cảnh báo: Tài khoản này đã bị KHÓA do vi phạm chính sách của hệ thống!';
      setLoginErrors(errors);
      return;
    }

    if (matchedUser.status === 'pending') {
      errors.email = 'Tài khoản đang "Chờ phê duyệt" bởi Admin. Vui lòng quay lại sau khi tài khoản được kích hoạt!';
      setLoginErrors(errors);
      return;
    }

    // Nếu thành công (mô phỏng khớp mọi mật khẩu chính xác nếu có độ dài khớp chuẩn để tiện kiểm thử)
    setLoginErrors({});
    onLoginSuccess(matchedUser);
    onClose();
  };

  // --- XỬ LÝ SỰ KIỆN ĐĂNG KÝ (REGISTER VALIDATE & SUBMIT) ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // 1. Kiểm tra họ và tên quý khách
    if (!registerName.trim()) {
      errors.name = 'Chưa điền họ tên | Nguyên nhân: Ô nhập họ tên chưa nhận được dữ liệu đầu vào | Cách sửa: Nhập đầy đủ danh tự giống trên thẻ CCCD để bảo đảm hồ sơ giao dịch sau này.';
    } else if (registerName.trim().length < 2) {
      errors.name = 'Họ tên quá ngắn | Nguyên nhân: Danh tự cung cấp ngắn hơn 2 chữ cái phổ thông | Cách sửa: Nhập cụ thể đầy đủ tên chính và đệm của bạn, không ghi tắt.';
    }

    // 2. Kiểm tra định dạng Email đăng ký & Kiểm tra trùng email
    if (!registerEmail.trim()) {
      errors.email = 'Khuyết thiếu địa chỉ Email | Nguyên nhân: Ô thông tin liên lạc điện tử đang bị bỏ trống | Cách sửa: Hãy nhập địa chỉ email bạn hay dùng để liên kết.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerEmail.trim())) {
        errors.email = 'Cấu trúc Email sai lệch | Nguyên nhân: Đầu vào email không tương thích dải cấu trúc tên_miền@hòm_phát | Cách sửa: Rà soát bổ sung biểu tượng @ và thành phần hậu tố chuẩn (ví dụ: .com, .vn).';
      } else {
        const isDuplicate = allUsers.some(u => u.email.toLowerCase() === registerEmail.trim().toLowerCase());
        if (isDuplicate) {
          errors.email = 'Email đã bị trùng lặp | Nguyên nhân: Hòm thư điện tử này đã được đăng ký liên kết bởi một khách hàng khác | Cách sửa: Sử dụng một mail phụ khác thay thế hoặc click "Đăng nhập" trực tiếp.';
        }
      }
    }

    // 3. Kiểm tra định dạng Số điện thoại di động Việt Nam
    if (!registerPhone.trim()) {
      errors.phone = 'Bỏ trống Số điện thoại | Nguyên nhân: Rào liên lạc khẩn cấp không có dữ liệu để tổng đài viên gọi điện xác minh lắp máy | Cách sửa: Nhập số hotline di động chính chủ.';
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-8]{8})\b$/;
      if (!phoneRegex.test(registerPhone.trim())) {
        errors.phone = 'Sai định dạng viễn thông | Nguyên nhân: Số cung cấp không khớp định dạng nhà mạng Việt Nam (phải là 10 số, bắt đầu bằng 03/05/07/08/09) | Cách sửa: Thử rà xóa chữ số thừa hoặc thiếu và chắc chắn bắt đầu từ đầu 0.';
      }
    }

    // 4. Kiểm tra độ khó của Mật khẩu
    if (!registerPassword) {
      errors.password = 'Mật khẩu trống | Nguyên nhân: Trình bảo mật chưa ghi nhận khóa bảo vệ dự thảo | Cách sửa: Hãy nhập chuỗi ký tự mật khẩu.';
    } else if (registerPassword.length < 6) {
      errors.password = 'Độ bảo mật không tối thiểu | Nguyên nhân: Chuỗi thiết lập ít hơn 6 ký tự bảo mật | Cách sửa: Tạo mật khẩu an toàn hơn có độ dài tối thiểu là 6 ký tự.';
    }

    // 5. Kiểm chứng ô nhập lại mật khẩu trùng khớp
    if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'Bất nhất thông tin mật khẩu | Nguyên nhân: Ô nhập lại mật khẩu xác nhận không trùng khít với trường mật khẩu chuẩn đã khai quát | Cách sửa: Kiểm tra kĩ lưỡng chế độ gõ Unikey/Caps Lock và gõ đồng nhất cả hai trường dữ liệu.';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setRegisterErrors({});

    // Tạo đối tượng người dùng mới gửi lên hệ thống trung tâm
    const newUser: UserType = {
      user_id: allUsers.length + 101, // Sinh mã user id mới đại diện tăng tiến
      role_id: 2, // Mặc định là Customer
      full_name: registerName.trim(),
      email: registerEmail.trim(),
      phone: registerPhone.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    onAddUser(newUser);
    setRegSuccessMsg(`Đăng ký tài khoản thành viên mới cho ${registerName} thành công! Tài khoản của bạn đang ở trạng thái "Chờ phê duyệt" từ Admin.`);
    
    // Tự động nhảy về trang đăng nhập và gán email mới
    setLoginEmail(registerEmail.trim());
    setLoginPassword(registerPassword);
    
    // Làm sạch form đăng ký
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    
    // Chuyển tab sau 1 giây rưỡi để khách hàng kịp quan định
    setTimeout(() => {
      setActiveTab('login');
      setRegSuccessMsg(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4">
      {/* Khung thẻ chính hội thoại có hiệu ứng đóng mở */}
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden text-left relative"
        id="auth_modal_panel"
      >
        {/* Nút thoát modal */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 hover:bg-slate-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
          title="Tắt hộp hội thoại"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Khung ảnh đại diện kết hợp biểu tượng logo thương hiệu */}
        <div className="bg-slate-900 p-6 text-white text-center">
          <div className="inline-flex items-center space-x-2.5 mb-1 bg-cyan-600 px-3.5 py-1.5 rounded-full">
            <span className="font-bold text-xs tracking-wider uppercase font-mono">Bảo mật Electro 2026</span>
          </div>
          <h3 className="text-sm text-slate-300 font-medium">Đăng ký tham gia hội thành viên kết nối ngập tràn ưu đãi</h3>
        </div>

        {/* Navigation Tabs hoán đổi Đăng nhập / Đăng ký */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginErrors({});
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'login' ? 'border-cyan-650 border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập Thành Viên
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegisterErrors({});
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'register' ? 'border-cyan-650 border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>

        {/* Hộp phản hồi thành công sau đăng ký */}
        {regSuccessMsg && (
          <div className="p-4 mx-4 mt-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-normal font-sans font-medium">{regSuccessMsg}</p>
          </div>
        )}

        {/* ==========================================
            TAB 1: FORM ĐĂNG NHẬP (LOGIN TAB FORM) 
           ========================================== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4" id="login_tab_form">
            {/* Nhập Mail */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Địa chỉ Email tài khoản *
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Ví dụ: khachhang1@electro.com"
                className={`border rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden ${
                  loginErrors.email ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(loginErrors.email)}
            </div>

            {/* Nhập Pass */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Mật khẩu mật an bảo vệ *
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Nhập tối thiểu từ 6 ký tự trở lên"
                className={`border rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden ${
                  loginErrors.password ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(loginErrors.password)}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:shadow-cyan-100 cursor-pointer flex items-center justify-center space-x-1.5"
                id="login_submit_button"
              >
                <span>XÁC NHẬN ĐĂNG NHẬP</span>
              </button>
            </div>

            {/* Hint nhanh tài khoản mẫu dưới chân form cho khách dễ thử nghiệm */}
            <div className="bg-slate-50 p-3 rounded-xl border border-dashed mt-4 text-[10px] text-gray-500 leading-normal">
              <span className="font-bold text-slate-700 uppercase block mb-1">Tài khoản hỗ trợ test nhanh:</span>
              <p>📍 Vai trò Customer: <strong className="text-slate-800 select-all">customer@electro.com</strong> (Pass: 123456)</p>
              <p>📍 Vai trò Admin: <strong className="text-slate-800 select-all font-bold text-red-650">admin@electro.com</strong> (Pass: 123456)</p>
            </div>
          </form>
        )}

        {/* ==========================================
            TAB 2: FORM ĐĂNG KÝ (REGISTER TAB FORM)
           ========================================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[480px] overflow-y-auto" id="register_tab_form">
            {/* 1. Nhập họ tên */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-cyan-605 text-cyan-600" />
                Họ và tên quý khách *
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Ví dụ: Đặng Trường Phú"
                className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-hidden ${
                  registerErrors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(registerErrors.name)}
            </div>

            {/* 2. Nhập Email */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Địa chỉ Email liên kết *
              </label>
              <input
                type="text"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="Ví dụ: truongphu91@gmail.com"
                className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-hidden ${
                  registerErrors.email ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(registerErrors.email)}
            </div>

            {/* 3. Nhập Số điện thoại */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Số điện thoại liên hệ *
              </label>
              <input
                type="text"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                placeholder="Ví dụ: 0984859922"
                className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-hidden ${
                  registerErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(registerErrors.phone)}
            </div>

            {/* 4. Nhập Mật khẩu mật */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Mật khẩu mật tối thiểu 6 kí tự *
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Thiết lập chuỗi bảo mật của bạn"
                className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-hidden ${
                  registerErrors.password ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(registerErrors.password)}
            </div>

            {/* 5. Gõ lại mật khẩu */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                Nhập lại mật khẩu để kiểm chứng *
              </label>
              <input
                type="password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                placeholder="Gõ chính xác mật khớp khớp"
                className={`border rounded-xl px-3.5 py-2 text-xs focus:outline-hidden ${
                  registerErrors.confirmPassword ? 'border-red-500 bg-red-50/10' : 'border-gray-250 focus:border-cyan-500'
                }`}
              />
              {renderFieldError(registerErrors.confirmPassword)}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:shadow-cyan-100 cursor-pointer flex items-center justify-center space-x-1.5"
                id="register_submit_button"
              >
                <span>XÁC NHẬN ĐĂNG KÝ HỘI VIÊN</span>
              </button>
            </div>
          </form>
        )}

        <div className="bg-slate-100 p-4 text-center rounded-b-3xl">
          <p className="text-[10px] text-gray-500 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cyan-600" />
            <span>Mọi dữ liệu tài khoản được mã hóa và bảo toàn tuyệt mật.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
