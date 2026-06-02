/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  QrCode,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Phone,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface CheckoutFlowProps {
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: number, action: 'increase' | 'decrease') => void;
  onRemoveItem: (cartItemId: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderData: {
    shippingAddress: string;
    paymentMethod: 'cod' | 'bank_transfer';
    fullName: string;
    phone: string;
    notes: string;
    couponCode: string;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
  }) => number; // Trả về order_id mới sinh ra
  onClose: () => void;
  currentUser: {
    full_name: string;
    phone: string;
  };
  isLoggedIn: boolean;
  onInitiateLogin: () => void;
}

export default function CheckoutFlow({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onClose,
  currentUser,
  isLoggedIn,
  onInitiateLogin
}: CheckoutFlowProps) {
  // --- TRẠNG THÁI CHUNG (GLOBAL STEP MANAGEMENT) ---
  // Các bước: 'cart' (Giỏ hàng) -> 'checkout' (Đặt hàng) -> 'payment' (Thanh toán / QR) -> 'completed' (Hoàn tất)
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment' | 'completed'>('cart');
  const [askedForLogin, setAskedForLogin] = useState<boolean>(false);

  // --- TRẠNG THÁI GIỎ HÀNG (STEP 1) ---
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountVal, setCouponDiscountVal] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // --- TRẠNG THÁI ĐẶT HÀNG (STEP 2) ---
  const [fullName, setFullName] = useState<string>(currentUser.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser.phone || '');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Cập nhật thông tin Khách hàng khi họ thực hiện Đăng nhập thành công từ trạng thái khách vãng lai
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.full_name !== 'Khách vãng lai') {
      setFullName(currentUser.full_name);
      if (currentUser.phone) {
        setPhoneNumber(currentUser.phone);
      }
    }
  }, [isLoggedIn, currentUser]);

  // Luồng tự động chuyển tiếp: Nếu khách vừa đăng nhập thành công sau khi hệ thống yêu cầu ở giỏ hàng
  useEffect(() => {
    if (isLoggedIn && askedForLogin) {
      setStep('checkout');
      setAskedForLogin(false);
    }
  }, [isLoggedIn, askedForLogin]);

  // --- TRẠNG THÁI THANH TOÁN (STEP 3 & 4) ---
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrTimer, setQrTimer] = useState<number>(900); // 15 phút đếm ngược (900s)
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // --- TÍNH TOÁN SỐ LIỆU TÀI CHÍNH ---
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }, [cartItems]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 15000000 ? 0 : 50000; // Miễn phí vận chuyển khi tổng đơn trên 15 Triệu
  }, [subtotal]);

  // Giảm giá cố định theo chính sách thành viên (ví dụ: trên 20 triệu giảm thêm 200.000đ)
  const baseDiscount = useMemo(() => {
    return subtotal > 20000000 ? 300000 : 0;
  }, [subtotal]);

  // Tổng tiền được giảm (Bao gồm chiết khấu thành viên và mã giảm giá)
  const totalDiscount = useMemo(() => {
    return baseDiscount + couponDiscountVal;
  }, [baseDiscount, couponDiscountVal]);

  const grandTotal = useMemo(() => {
    const total = subtotal + shippingFee - totalDiscount;
    return total > 0 ? total : 0;
  }, [subtotal, shippingFee, totalDiscount]);

  // --- ĐẾM NGƯỢC THỜI GIAN THANH TOÁN QR ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'payment' && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, qrTimer]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // --- LOGIC GỬI MÃ GIẢM GIÁ (APPLY COUPON LOGIC) ---
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || isApplyingCoupon) {
      setCouponError('Vui lòng nhập mã giảm giá!');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    setTimeout(() => {
      const code = couponCode.trim().toUpperCase();

      // Mô phỏng kiểm tra mã giảm giá
      if (code === 'ELECTRO500') {
        if (subtotal < 5000000) {
          setCouponError('Mã ELECTRO500 chỉ áp dụng cho đơn hàng từ 5,000,000 ₫ trở lên!');
        } else {
          setCouponDiscountVal(500000);
          setAppliedCoupon('ELECTRO500');
          setCouponSuccessMsg('Áp dụng mã thành công! Bạn nhận được giảm giá trực tiếp 500,000 ₫');
        }
      } else if (code === 'GIAM10') {
        const discount = Math.round(subtotal * 0.1);
        setCouponDiscountVal(discount);
        setAppliedCoupon('GIAM10');
        setCouponSuccessMsg(`Áp dụng mã thành công! Giảm ngay 10% trị giá ${discount.toLocaleString('vi-VN')} ₫`);
      } else if (code === 'FREESHIP') {
        if (shippingFee === 0) {
          setCouponError('Đơn hàng của bạn đã được miễn phí vận chuyển sẵn rồi!');
        } else {
          setCouponDiscountVal(shippingFee);
          setAppliedCoupon('FREESHIP');
          setCouponSuccessMsg(`Áp dụng mã thành công! Miễn phí vận chuyển trị giá ${shippingFee.toLocaleString('vi-VN')} ₫`);
        }
      } else {
        setCouponError('Mã coupon không tồn tại hoặc đã hết hạn sử dụng!');
      }
      setIsApplyingCoupon(false);
    }, 550);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountVal(0);
    setCouponCode('');
    setCouponSuccessMsg(null);
  };

  // --- LOGIC HIỂN THỊ THÔNG BÁO LỖI CHUẨN UX KHẢ DỤNG ---
  const renderFieldError = (errorText: string | undefined) => {
    if (!errorText) return null;
    const parts = errorText.split(' | ');
    if (parts.length < 3) {
      return (
        <span className="text-[10px] text-red-500 font-semibold mt-1 flex items-center">
          <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
          {errorText}
        </span>
      );
    }
    const errorTitle = parts[0];
    const causePart = parts[1].replace('Nguyên nhân:', '').trim();
    const fixPart = parts[2].replace('Cách sửa:', '').replace('Cách khắc phục:', '').trim();

    return (
      <div className="mt-2 p-3 bg-red-50/90 border border-red-200 rounded-xl text-left text-[11px] text-red-800 space-y-1" id="checkout_error_card">
        <div className="flex items-center font-bold text-red-700">
          <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 text-red-500" />
          <span>{errorTitle}</span>
        </div>
        <p className="pl-5"><span className="font-semibold text-slate-800">Nguyên nhân:</span> {causePart}</p>
        <p className="pl-5"><span className="font-semibold text-emerald-800 font-bold">Khắc phục:</span> {fixPart}</p>
      </div>
    );
  };

  // --- LOGIC VALIDATE FORM THÔNG TIN ĐẶT HÀNG ---
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // 1. Kiểm tra Họ tên người nhận
    if (!fullName.trim()) {
      errors.fullName = 'Lỗi thiếu Họ Tên người nhận | Nguyên nhân: Bạn chưa cung cấp Họ tên của người đại diện nhận máy và ký biên bản kiểm thử thiết bị | Cách khắc phục: Vui lòng điền cụ thể họ tên như Nguyễn Văn A để đồng thời thiết lập hợp đồng bảo hành điện tử chính chủ.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Lỗi Họ Tên quá ngắn | Nguyên nhân: Chuỗi ký tự nhập vào ngắn hơn 2 ký tự thông dụng | Cách khắc phục: Điền đầy đủ cả họ và tên chính thức, không viết tắt hay ghi ký hiệu tắt.';
    }

    // 2. Kiểm tra Số di động Việt Nam
    if (!phoneNumber.trim()) {
      errors.phone = 'Lỗi bỏ trống Số điện thoại | Nguyên nhân: Để trống số liên lạc khiến nhân viên kỹ thuật giao lắp không thể liên lạc khi xuất bến | Cách khắc phục: Điền chuẩn xác số di động của bạn (ví dụ: 0987654321).';
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-8]{8})\b$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        errors.phone = 'Sai dải số viễn thông Việt Nam | Nguyên nhân: Số điện thoại không khớp với dải đầu số di động chuẩn hóa tại Việt Nam (như 09x, 03x, 08x, 07x) hoặc thừa thiếu chữ số | Cách khắc phục: Hãy rà soát khớp 10 chữ số khởi đầu bằng số 0.';
      }
    }

    // 3. Kiểm tra Địa chỉ giao nhận
    if (!shippingAddress.trim()) {
      errors.address = 'Chưa điền địa chỉ giao lắp | Nguyên nhân: Điểm đích nhận máy đang để trống | Cách khắc phục: Ghi cụ thể số nhà, ngõ/phố, thôn/xã, phường, quận/huyện để đội ngũ xe vận tải định vị vị trí chuẩn xác.';
    } else if (shippingAddress.trim().length < 10) {
      errors.address = 'Chi tiết địa chỉ quá sơ sài | Nguyên nhân: Địa chỉ khai thác dưới 10 ký tự, thiếu các mốc số nhà hay tên ngõ ngách chi tiết | Cách khắc phục: Bổ sung cụ thể vị trí từng số ngõ, ngách, đường phố để không bị nhầm lẫn khi lắp ráp.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- LOGIC XÁC NHẬN PHIẾU ĐẶT HÀNG (PLACE ORDER LOGIC) ---
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmittingOrder) return;

    setIsSubmittingOrder(true);

    setTimeout(() => {
      // Tiến hành gọi đặt hàng đẩy dữ liệu lên cha quản lý
      const generatedId = onPlaceOrder({
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        fullName: fullName.trim(),
        phone: phoneNumber.trim(),
        notes: orderNotes.trim(),
        couponCode: appliedCoupon || '',
        discountAmount: totalDiscount,
        shippingFee: shippingFee,
        totalAmount: grandTotal
      });

      setOrderId(generatedId);

      // Chuyển bước tùy thuộc phương thức thanh toán
      if (paymentMethod === 'bank_transfer') {
        setStep('payment');
      } else {
        // COD thì hoàn tất trực tiếp
        onClearCart();
        setStep('completed');
      }
      setIsSubmittingOrder(false);
    }, 900);
  };

  // --- SAO CHÉP THÔNG TIN VÀO CLIPBOARD (COPY TO CLIPBOARD) ---
  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // --- XÁC NHẬN ĐÃ THANH TOÁN CHUYỂN KHOẢN (CONFIRM BANK TRANSFER) ---
  const handleConfirmTransfer = () => {
    setIsVerifyingPayment(true);
    // Simulating quick verification delay
    setTimeout(() => {
      setIsVerifyingPayment(false);
      onClearCart();
      setStep('completed');
    }, 2000);
  };

  // --- ĐỊNH NGHĨA LINK VIETQR SẮC NÉT ---
  // VietQR URL API chuẩn: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png
  const vietQrUrl = useMemo(() => {
    if (!orderId || grandTotal <= 0) return '';
    const addInfo = encodeURIComponent(`ELECTRO DH${orderId}`);
    return `https://img.vietqr.io/image/mbbank-190356789999-print.png?amount=${grandTotal}&addInfo=${addInfo}&accountName=CONG%20TY%20CONG%20NGHE%20ELECTRO%20VIET%2520NAM`;
  }, [orderId, grandTotal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left" id="checkout_flow_viewport">
      {/* Bộ hiển thị tiến trình của dải Wizard (Checkout Progress Stepper) */}
      <div className="mb-8 max-w-3xl mx-auto" id="checkout_stepper">
        <div className="flex items-center justify-between relative">
          {/* Đường nối giữa các node */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div
            className="absolute left-0 top-1/2 h-0.5 bg-cyan-600 -translate-y-1/2 transition-all duration-300 z-0"
            style={{
              width:
                step === 'cart'
                  ? '0%'
                  : step === 'checkout'
                  ? '33.33%'
                  : step === 'payment'
                  ? '66.66%'
                  : '100%'
            }}
          ></div>

          {/* Icon Step 1: Giỏ hàng */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                step === 'cart'
                  ? 'bg-cyan-600 border-cyan-600 text-white ring-4 ring-cyan-100'
                  : ['checkout', 'payment', 'completed'].includes(step)
                  ? 'bg-cyan-550 bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold mt-1.5 text-slate-700 font-sans">Giỏ Hàng</span>
          </div>

          {/* Icon Step 2: Nhập thông tin */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                step === 'checkout'
                  ? 'bg-cyan-600 border-cyan-600 text-white ring-4 ring-cyan-100'
                  : ['payment', 'completed'].includes(step)
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold mt-1.5 text-slate-700 font-sans">Thông Tin Nhận</span>
          </div>

          {/* Icon Step 3: Thanh toán */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                step === 'payment'
                  ? 'bg-cyan-600 border-cyan-600 text-white ring-4 ring-cyan-100'
                  : step === 'completed'
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold mt-1.5 text-slate-700 font-sans">Thanh Toán QR</span>
          </div>

          {/* Icon Step 4: Hoàn tất */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                step === 'completed'
                  ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold mt-1.5 text-slate-700 font-sans">Hoàn Tất</span>
          </div>
        </div>
      </div>

      {/* =========================================================================================
          BƯỚC 1: TRANG GIỎ HÀNG CHI TIẾT (STEP 1: DETAILED CART PAGE)
         ========================================================================================= */}
      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="checkout_step_cart">
          {/* Cột trái: Bảng thống kê các sản phẩm trong giỏ hàng và chỉnh sửa số lượng */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-4 mb-5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-cyan-600" />
                  <span>Chi Tiết Giỏ Hàng Mua Sắm ({cartItems.length} Mặt hàng)</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-cyan-600 hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay về cửa hàng</span>
                </button>
              </div>

              {/* Bảng dạng list các Items (Responsive Table-like design) */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl gap-4 transition-all"
                  >
                    {/* Ảnh & thông tin tiêu đề */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-16 w-16 bg-white border rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.product_name}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-sm font-bold font-mono uppercase">
                          MÃ: {item.product?.sku}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.product?.product_name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">
                          Đơn giá: {item.unit_price.toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>

                    {/* Bộ tăng giảm số lượng & Thành tiền */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Bộ điều khiển số lượng */}
                      <div className="flex items-center space-x-1.5 bg-white border px-1.5 py-1 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.cart_item_id, 'decrease')}
                          className="h-6 w-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                          title="Giảm 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cart_item_id, 'increase')}
                          disabled={item.quantity >= (item.product?.stock_quantity || 1)}
                          className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                            item.quantity >= (item.product?.stock_quantity || 1)
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 text-slate-800'
                          }`}
                          title="Tăng 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Phân hệ thành tiền của 1 sản phẩm */}
                      <div className="text-right min-w-[100px]">
                        <span className="text-xs text-gray-400 block text-[10px] font-sans">Thành tiền:</span>
                        <strong className="text-xs font-black font-mono text-slate-900">
                          {(item.quantity * item.unit_price).toLocaleString('vi-VN')} ₫
                        </strong>
                      </div>

                      {/* Icon Gỡ mặt hàng */}
                      <button
                        onClick={() => onRemoveItem(item.cart_item_id)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Xóa mặt khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-4" id="checkout_cart_empty_view">
                    <div className="h-14 w-14 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 max-w-sm">
                      Giỏ hàng của bạn đang trống! Quý khách vui lòng chọn lựa thiết bị điện tử gia dụng và thêm vào giỏ nhé.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Tiếp tục lướt mua sắm
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dải dịch vụ cam kết bảo hộ mua sắm */}
            <div className="bg-slate-900 text-white px-5 py-4 rounded-2xl flex items-center justify-between text-xs space-x-3">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="text-[11px] leading-relaxed block font-sans">
                  <strong>Cam kết chính hãng thương hiệu Electro:</strong> Hàng nhập khẩu mới 100%, bảo hành 2 năm, miễn phí lắp đặt toàn địa bàn tỉnh thành.
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase shrink-0">Bảo mật giao dịch</span>
            </div>
          </div>

          {/* Cột phải: Form nhập mã giảm giá & Tóm tắt hóa đơn thanh toán */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Module nhập Mã Giảm Giá (Coupon Code Module) */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-2xs text-left" id="promo_code_block">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                <Tag className="w-4.5 h-4.5 text-cyan-600" />
                <span>Áp Dụng Mã Giảm Giá</span>
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Nhập coupon hội viên để nhận đặc quyền chiết khấu trực tiếp hoặc mã miễn trừ chi phí lắp ráp giao máy.
              </p>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-2xl flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-[11px] block">Đã áp dụng: {appliedCoupon}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">-{couponDiscountVal.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã: ELECTRO500, GIAM10, FREESHIP"
                      className="flex-1 border border-gray-250 rounded-xl px-3 py-2 text-xs bg-white uppercase font-semibold text-slate-800 focus:outline-hidden focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-[76px]"
                    >
                      {isApplyingCoupon ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Áp dụng</span>
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-red-600 flex items-center font-medium animate-pulse">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {couponError}
                    </p>
                  )}
                </form>
              )}

              {couponSuccessMsg && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {couponSuccessMsg}
                </p>
              )}

              {/* Các mã gợi ý có sẵn */}
              <div className="mt-3.5 pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Đặc quyền có sẵn:</span>
                <div className="space-y-1.5 text-[10px] text-slate-700">
                  <div className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg border-dashed border">
                    <span>Nhập <strong>ELECTRO500</strong> để nhận 500k</span>
                    <button
                      onClick={() => { setCouponCode('ELECTRO500'); }}
                      className="text-cyan-600 font-bold hover:underline"
                    >
                      Lấy mã
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg border-dashed border">
                    <span>Nhập <strong>GIAM10</strong> giảm bớt 10% đơn</span>
                    <button
                      onClick={() => { setCouponCode('GIAM10'); }}
                      className="text-cyan-600 font-bold hover:underline"
                    >
                      Lấy mã
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tổng Hóa Đơn Thanh Toán (Order Summary Cart) */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-2xs text-left text-xs" id="cart_summary_panel">
              <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3 mb-4 flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-cyan-600" />
                <span>Hóa Đơn Thanh Toán</span>
              </h3>

              <div className="space-y-3 font-sans pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Tiền hàng giỏ ({cartItems.length} cái):</span>
                  <span className="font-mono font-bold text-slate-800">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {baseDiscount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Chiết khấu hội viên Electro 2026:</span>
                    <span className="font-mono font-bold text-emerald-600">-{baseDiscount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {couponDiscountVal > 0 && (
                  <div className="flex justify-between text-gray-500">
                     <span>Giảm trừ từ mã ưu đãi:</span>
                     <span className="font-mono font-bold text-emerald-600">-{couponDiscountVal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Cước lắp vận phát hàng tận nhà:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {shippingFee === 0 ? 'Thư Thải (Miễn phí)' : `${shippingFee.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              </div>

              {/* Đại lượng thực thu chung */}
              <div className="py-4 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán dự kiến:</span>
                <span className="text-lg font-black font-mono text-red-650 text-red-600">
                  {grandTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <button
                onClick={() => {
                  if (cartItems.length > 0) {
                    if (!isLoggedIn) {
                      setAskedForLogin(true);
                      onInitiateLogin();
                    } else {
                      setStep('checkout');
                    }
                  }
                }}
                disabled={cartItems.length === 0}
                className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xs transition-all ${
                  cartItems.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer hover:shadow-cyan-100'
                }`}
                id="cart_submit_to_checkout"
              >
                <span>Nhập thông tin giao hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          BƯỚC 2: TRANG FORM THÔNG TIN ĐẶT HÀNG (STEP 2: CHECKOUT ORDER FORM)
         ========================================================================================= */}
      {step === 'checkout' && (
        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" id="checkout_step_form">
          
          {/* Khối bên TRÁI: Form điền thông tin và lựa chọn Phương thức thanh toán */}
          <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between border-b pb-4 mb-2">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <span>Hồ Sơ Đặt Mua &amp; Nhận Lắp Đặt Thiết Bị</span>
              </h2>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-xs text-gray-400 hover:text-cyan-600 hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sửa lại giỏ hàng</span>
              </button>
            </div>

            {/* Khung Thông tin cá nhân */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-cyan-600 pl-2">
                1. Thông Tin Người Nhận Laptop / Điện Máy / Gia Dụng
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trường Họ tên */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                    Họ và tên quý khách (vui lòng điền đủ) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`border rounded-xl px-3.5 py-3 text-xs bg-white focus:outline-hidden ${
                      validationErrors.fullName ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-250 focus:border-cyan-500'
                    }`}
                  />
                  {renderFieldError(validationErrors.fullName)}
                </div>

                {/* Trường Số điện thoại */}
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                    Số điện thoại liên hệ tiện giao nhận *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0987123456"
                    className={`border rounded-xl px-3.5 py-3 text-xs bg-white focus:outline-hidden ${
                      validationErrors.phone ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-250 focus:border-cyan-500'
                    }`}
                  />
                  {renderFieldError(validationErrors.phone)}
                </div>
              </div>

              {/* Trường Địa chỉ */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  Địa chỉ giao và chuyển lắp đặt chính xác *
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ví dụ: Số 12, ngõ 45, phố Trần Duy Hưng, Cầu Giấy, Hà Nội"
                  className={`border rounded-xl px-3.5 py-3 text-xs bg-white focus:outline-hidden ${
                    validationErrors.address ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-250 focus:border-cyan-500'
                  }`}
                />
                {renderFieldError(validationErrors.address)}
              </div>

              {/* Ghi chú nhận hàng */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  Ghi chú khách hàng gửi thêm (Hẹn giờ giao,...)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ví dụ: Giao ngoài giờ hành chính, hoặc gọi cho tôi trước khi xuất kho 30 phút..."
                  className="border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Khung lựa chọn Phương thức thanh toán */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-cyan-600 pl-2">
                2. Chọn Hình Thức Phương Thức Thanh Toán Khả Dụng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-start space-x-3.5 relative ${
                    paymentMethod === 'cod'
                      ? 'border-cyan-600 bg-cyan-50/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 rounded-full h-4 w-4 border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-cyan-600 bg-cyan-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cod' && <span className="h-2 w-2 rounded-full bg-white"></span>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center">
                      <CreditCard className="w-4 h-4 mr-1 text-slate-700" />
                      <span>Thanh Toán COD (Tiền Mặt)</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                      Khách hàng thanh toán trực tiếp bằng tiền mặt hoặc qua ví mPOS cầm tay cho nhân viên vận chuyển sau khi thiết bị đã được lắp ráp hoạt động hoàn hảo.
                    </p>
                  </div>
                </div>

                {/* Method 2: QR BANK TRANSFER */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-start space-x-3.5 relative ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-cyan-600 bg-cyan-50/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 rounded-full h-4 w-4 border flex items-center justify-center ${
                    paymentMethod === 'bank_transfer' ? 'border-cyan-600 bg-cyan-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'bank_transfer' && <span className="h-2 w-2 rounded-full bg-white"></span>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center">
                      <QrCode className="w-4 h-4 mr-1 text-cyan-600" />
                      <span>Quét QR Chuyển Khoản Nhanh VietQR</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                      Màn hình sau hiển thị mã QR Code tích hợp sẵn mệnh giá mua cùng mô tả chuẩn. An toàn tuyệt đối, xử lý kích hoạt bảo hành điện tử nhanh.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Khối bên PHẢI: Tóm tắt danh sách hàng hóa và nút bấm chốt đơn */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-3 mb-4">
                Sản phẩm đặt mua
              </h3>

              {/* Danh sách các item thu nhỏ để tóm gọn diện tích */}
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.cart_item_id} className="flex space-x-3 text-xs">
                    <div className="h-10 w-10 bg-gray-50 border rounded-lg flex items-center justify-center p-1 font-sans shrink-0">
                      <img src={item.product?.image_url} alt="" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 line-clamp-1 leading-normal">
                        {item.product?.product_name}
                      </h4>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
                        <span>SL: {item.quantity} x {item.unit_price.toLocaleString('vi-VN')} ₫</span>
                        <strong className="text-slate-700 font-bold">{(item.quantity * item.unit_price).toLocaleString('vi-VN')} ₫</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tóm tắt tính tiền phân cấp */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border text-[11px] space-y-2 mb-5 font-sans">
                <div className="flex justify-between text-gray-500">
                  <span>Tổng tiền hàng thô:</span>
                  <span className="font-mono font-bold text-slate-800">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tổng giảm giá ưu đãi:</span>
                    <span className="font-mono font-bold text-emerald-600">-{totalDiscount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 border-b pb-2">
                  <span>Phí dịch chuyển tận nhà:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold pt-1.5">
                  <span className="text-slate-900 font-sans">Thực tế phải trả:</span>
                  <span className="text-sm font-black font-mono text-red-650 text-red-600">
                    {grandTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Phím bấm submit đặt hàng */}
              <button
                type="submit"
                disabled={isSubmittingOrder}
                className={`w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-450 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all hover:shadow-cyan-100 ${
                  isSubmittingOrder ? 'bg-cyan-400 opacity-90 cursor-wait' : ''
                }`}
                id="form_submit_order_btn"
              >
                {isSubmittingOrder ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ĐANG KHỞI TẠO HÓA ĐƠN TIỂU CHUẨN...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'cod' ? 'XÁC NHẬN ĐẶT HÀNG COD' : 'XÁC NHẬN & CHUYỂN KHOẢN QR'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}

      {/* =========================================================================================
          BƯỚC 3: TRANG THANH TOÁN QR CODE MÔ PHỎNG (STEP 3: QR CODE BANK TRANSFER PAGE)
         ========================================================================================= */}
      {step === 'payment' && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-xs relative" id="checkout_step_payment_qr">
          
          <div className="flex flex-col items-center border-b pb-5 mb-6">
            <div className="h-12 w-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 font-sans">
              Cổng Quét QR Code Chuyển Khoản An Toàn VietQR
            </h2>
            <p className="text-[11px] text-gray-500 max-w-md leading-relaxed mt-1">
              Hệ thống đã kết xuất mã QR kèm hóa đơn giá trị thực tế của quý khách. Quý khách vui lòng mở ứng dụng ngân hàng di động bất kỳ (SmartBanking) để rà quét hoàn tất giao dịch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Cột trái: QR Code sắc nét thực dụng */}
            <div className="md:col-span-6 flex flex-col items-center justify-center space-y-3 bg-gray-50 p-4 rounded-3xl border">
              
              <div className="relative p-2.5 bg-white rounded-2xl shadow-inner border flex items-center justify-center">
                <img
                  src={vietQrUrl}
                  alt="Mã QR Chuyển Khoản MB Bank Electro"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border-2 border-dashed border-cyan-300 rounded-2xl pointer-events-none opacity-50 m-1"></div>
              </div>

              {/* Đồng hồ đếm ngược giao dịch */}
              <div className="flex items-center space-x-1 text-[11px] font-sans text-gray-500 font-semibold bg-white px-3 py-1 border rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>Thờ hạn hiệu lực mã QR:</span>
                <strong className="text-red-650 text-red-600 font-mono font-bold leading-none">{formatTimer(qrTimer)}</strong>
              </div>
            </div>

            {/* Cột phải: Thông tin giao dịch dạng text để chép tay */}
            <div className="md:col-span-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-l-2 border-cyan-600 pl-2">
                Thông Tin Chuyển Khoản Thủ Công
              </h3>

              <div className="space-y-2.5 font-sans">
                {/* 1. Ngân hàng */}
                <div className="bg-gray-55 bg-gray-50 border p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Ngân hàng thụ hưởng:</span>
                    <strong className="text-slate-800">MB BANK (Quân Đội)</strong>
                  </div>
                  <span className="bg-blue-50 text-blue-650 border text-[9px] font-bold px-1.5 py-0.5 rounded-sm">LIÊN THÔNG</span>
                </div>

                {/* 2. Số tài khoản */}
                <div className="bg-gray-50 border p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Số tài khoản (STK):</span>
                    <strong className="text-slate-900 font-mono">1903 5678 9999</strong>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('190356789999', 'accountNo')}
                    className="p-1 px-2.5 bg-white border hover:bg-gray-100 rounded-lg text-[10px] font-bold font-sans text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedField === 'accountNo' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Chép số</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Tên tài khoản */}
                <div className="bg-gray-50 border p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 block">Chủ tài khoản thụ hưởng:</span>
                  <strong className="text-slate-800 uppercase">CONG TY CONG NGHE ELECTRO VIET NAM</strong>
                </div>

                {/* 4. Số tiền */}
                <div className="bg-red-50/50 border border-red-100 p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-red-600 block font-semibold">Số tiền chốt khoản chuyển:</span>
                    <strong className="text-red-650 text-red-600 font-mono text-sm font-black">{grandTotal.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(grandTotal.toString(), 'amount')}
                    className="p-1 px-2.5 bg-white border hover:bg-gray-100 rounded-lg text-[10px] font-bold font-sans text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 5. Nội dung */}
                <div className="bg-gray-50 border p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Nội dung bắt buộc điền:</span>
                    <strong className="text-slate-900 font-mono">ELECTRO DH{orderId}</strong>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(`ELECTRO DH${orderId}`, 'note')}
                    className="p-1 px-2.5 bg-white border hover:bg-gray-100 rounded-lg text-[10px] font-bold font-sans text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedField === 'note' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Chép ND</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dòng các nút bấm hành động cuối cùng của TRANG THANH TOÁN */}
          <div className="mt-8 pt-6 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-[10px] text-slate-400 flex items-center justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1.5" />
              <span>Giao dịch của bạn thông qua cổng VietQR an toàn tuyệt đối.</span>
            </span>

            <div className="flex items-center space-x-3 justify-center">
              <button
                onClick={() => setStep('checkout')}
                className="px-5 py-2.5 border rounded-xl text-xs font-bold hover:bg-gray-50 font-sans cursor-pointer transition-colors"
                disabled={isVerifyingPayment}
              >
                Trở lại điền đơn
              </button>
              
              <button
                onClick={handleConfirmTransfer}
                disabled={isVerifyingPayment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-emerald-50 cursor-pointer transition-colors"
                id="payment_confirm_paid_btn"
              >
                {isVerifyingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Hệ thống đang đối soát...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tôi đã chuyển khoản thành công</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================================
          BƯỚC 4: MÀN HÌNH HOÀN TẤT THÀNH CÔNG (STEP 4: ORDER PLACED SUCCESS CARD)
         ========================================================================================= */}
      {step === 'completed' && (
        <div className="max-w-xl mx-auto bg-white border border-gray-150 rounded-3xl p-8 shadow-2xl text-center text-xs space-y-6" id="checkout_step_completed_success">
          
          {/* Vùng ảnh/icon động ăn mừng chốt đơn */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Kính Chào Quý Khách! Đặt Hàng Thành Công
            </h2>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm whitespace-normal leading-normal">
              Hệ thống điện tử Electro 2026 đã ghi nhận đơn đặt hàng lắp ráp thiết bị của quý khách. Cảm ơn quý khách đã gửi gắm lòng tin!
            </p>
          </div>

          {/* Chi tiết thông tin tóm tắt đơn */}
          <div className="bg-gray-50 border p-5 rounded-2xl text-left space-y-3 font-sans">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Mã đơn nhận diện:</span>
              <strong className="text-cyan-600 font-mono text-sm">#ELECTRO{orderId}</strong>
            </div>

            <div className="space-y-1">
              <p className="text-slate-700"><strong>Người thụ hưởng máy:</strong> {fullName}</p>
              <p className="text-slate-700"><strong>Số máy rà gọi:</strong> {phoneNumber}</p>
              <p className="text-slate-700"><strong>Điểm hạ lắp máy:</strong> {shippingAddress}</p>
              {orderNotes.trim() && (
                <p className="text-slate-600 italic"><strong>Lời dặn thêm:</strong> "{orderNotes}"</p>
              )}
            </div>

            <div className="pt-2 border-t text-[10px] text-gray-400 flex justify-between leading-normal">
              <span>Phương thức thanh toán:</span>
              <strong className="text-slate-800">
                {paymentMethod === 'cod' ? 'Tiền mặt khi giao sản phẩm (COD)' : 'Chuyển khoản trực tiếp (VietQR đã đối soát)'}
              </strong>
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-90 transition-all border-dashed border-t pt-2 mt-2">
              <span className="text-slate-900 font-sans">Giá trị tổng kết chiết toán:</span>
              <span className="text-red-650 text-red-600 font-mono text-xs">{grandTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="bg-cyan-50/50 border border-cyan-150 p-4 rounded-xl text-left text-cyan-800 leading-relaxed font-sans">
            <span className="font-bold flex items-center text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Lịch giao và kích hoạt bảo hành vàng:
            </span>
            Nhân viên kỹ sư lắp ráp điện máy chuyên sâu của Electro sẽ chủ động gọi điện xác nhận lại hành trình sau 15 - 30 phút. Quý khách vui lòng lưu số điện thoại để trao đổi tiến độ.
          </div>

          {/* Quay lại trang chủ */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => {
                onClose();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              id="completed_back_to_homepage"
            >
              Quay lại Trang Chủ và xem Kho Hàng
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
