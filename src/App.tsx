/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  UserCheck,
  Package,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Filter,
  ShoppingCart,
  Star,
  Info,
  Calendar
} from 'lucide-react';

// Nhập khẩu các kiểu dữ liệu và thực thể dữ liệu mẫu tương ứng database
import {
  Product,
  Category,
  Brand,
  CartItem,
  User as UserType,
  Review,
  Order,
  OrderStatus,
  PaymentStatus
} from './types';

import {
  mockUsers,
  mockCategories,
  mockBrands,
  mockProducts,
  mockReviews
} from './data/mockData';

// Nhập khẩu các thành phần đã phát triển
import Header from './components/Header';
import Navigation from './components/Navigation';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';

// Nhập khẩu Module 3: Danh sách & Chi tiết sản phẩm vừa phát triển
import ProductListingPage from './components/ProductListingPage';
import ProductDetailPage from './components/ProductDetailPage';
import CheckoutFlow from './components/CheckoutFlow';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Breadcrumbs from './components/Breadcrumbs';
import OrderStatusTracker from './components/OrderStatusTracker';

// Nhập khẩu các Giao diện Bảo mật & Phân quyền và Hồ sơ Cá nhân của Module 10
import { ForbiddenPage, NotFoundPage } from './components/SecurityViews';
import CustomerProfilePage from './components/CustomerProfilePage';
import AdminDashboardPage from './components/AdminDashboardPage';


export default function App() {
  // --- STATE QUẢN LÝ DỮ LIỆU CHÍNH ---
  const [users, setUsers] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('electro_users_list2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Safe silence
      }
    }
    return mockUsers;
  }); // Danh sách Người dùng trong hệ thống
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('electro_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.user_id) {
          return parsed;
        }
      } catch (e) {
        // Safe silence
      }
    }
    return null; // Không tự động giả lập đăng nhập khách hàng nữa, mặc định bắt đầu là đăng xuất/guest
  });

  // Biến Ref để theo dõi email được nạp cuối cùng của giỏ hàng, tránh chạy ghi nhiễm chéo khi chuyển đổi state (Cart Isolation & Flush Flow Ref)
  const lastLoadedCartUserRef = React.useRef<string | null>(currentUser?.email || null);

  // Ghi chú tiếng Việt: Hàm điều phối phiên đăng nhập và cô lập giỏ hàng theo phân luồng tài khoản (Centralized User State and Isolated Cart Controller)
  const handleSetCurrentUser = (user: UserType | null) => {
    // Lưu giỏ hàng của người dùng vừa thoát vào vùng nhớ riêng của họ trước khi chuyển giao trạng thái
    const prevEmail = currentUser?.email;
    if (prevEmail) {
      localStorage.setItem(`cart_${prevEmail}`, JSON.stringify(cartItems));
    } else {
      localStorage.setItem('electro_cart_items_list', JSON.stringify(cartItems));
    }

    const nextEmail = user?.email || null;
    lastLoadedCartUserRef.current = nextEmail; // Khóa đồng bộ ref ngay lập tức

    if (user) {
      // Đọc hoặc lập vùng nhớ giỏ hàng tương ứng của tài khoản mới
      const customCartKey = `cart_${user.email}`;
      const savedCart = localStorage.getItem(customCartKey);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (e) {
          setCartItems([]);
        }
      } else {
        setCartItems([]); // Trả về rỗng [] nếu tài khoản mới chưa có giỏ hàng, tránh nhiễm chéo tuyệt đối
      }

      setCurrentUser(user);
      localStorage.setItem('electro_current_user', JSON.stringify(user));
      localStorage.setItem('user_role', user.role_id === 1 ? 'admin' : 'customer');
    } else {
      // Khi nhấn Đăng xuất, giải phóng sạch toàn bộ giỏ hàng trên giao diện và rã khóa đăng nhập
      setCartItems([]);
      setCurrentUser(null);
      localStorage.removeItem('electro_current_user');
      localStorage.removeItem('user_role');
    }
  };
  const [products, setProducts] = useState<Product[]>(mockProducts); // Danh sách sản phẩm khả dụng trong kho hàng điện máy
  const [reviews, setReviews] = useState<Review[]>(mockReviews); // Danh sách bình luận & đánh giá độc lập của khách hàng
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Ghi chú tiếng Việt: Tìm kiếm thông tin tài khoản hiện hành lưu tại localStorage trước để đồng bộ nạp đúng giỏ hàng
    const savedUser = localStorage.getItem('electro_current_user');
    let email = 'anonymous';
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          email = parsed.email;
        }
      } catch (e) {}
    }

    // Ghi chú tiếng Việt: Xác định mã định danh khóa giỏ hàng cô lập dạng cart_${current_user_email}
    const cartKey = email === 'anonymous' ? 'electro_cart_items_list' : `cart_${email}`;
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Safe silence
      }
    }
    return [];
  }); // Các phần tử giỏ hàng cô lập theo tên định danh tài khoản độc lập tránh chéo nhiễm
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('electro_orders_list2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Safe silence
      }
    }
    return [
      {
        order_id: 5011,
        user_id: 2,
        subtotal: 24900000,
        discount_amount: 0,
        shipping_fee: 0,
        total_amount: 24900000,
        order_status: 'pending',
        payment_status: 'paid',
        shipping_address: 'Số 15, Phố Cầu Giấy, Quận Cầu Giấy, Hà Nội',
        created_at: '2026-06-02T10:00:00Z',
        customerEmail: 'customer@electro.com'
      },
      {
        order_id: 5012,
        user_id: 2,
        subtotal: 12400000,
        discount_amount: 0,
        shipping_fee: 0,
        total_amount: 12400000,
        order_status: 'processing',
        payment_status: 'pending',
        shipping_address: 'Số 15, Phố Cầu Giấy, Quận Cầu Giấy, Hà Nội',
        created_at: '2026-06-01T15:30:00Z',
        customerEmail: 'customer@electro.com'
      },
      {
        order_id: 5013,
        user_id: 2,
        subtotal: 15400000,
        discount_amount: 0,
        shipping_fee: 0,
        total_amount: 15400000,
        order_status: 'delivered',
        payment_status: 'paid',
        shipping_address: 'Đà Nẵng, Việt Nam',
        created_at: '2026-05-28T09:00:00Z',
        customerEmail: 'customer@electro.com'
      }
    ];
  }); // Cơ sở dữ liệu đơn hàng đặt thành công của toàn hệ thống

  // --- MODULE 5: ADMIN HANDLERS ---
  const handleAddProduct = (productData: Omit<Product, 'product_id' | 'avg_rating'>) => {
    const newProd: Product = {
      ...productData,
      product_id: products.length + 101,
      avg_rating: 5.0
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const handleEditProduct = (editedProduct: Product) => {
    setProducts((prev) => prev.map((p) => p.product_id === editedProduct.product_id ? editedProduct : p));
  };

  const handleDeleteProductDirect = (productId: number) => {
    const prodToDelete = products.find((p) => p.product_id === productId);
    if (!prodToDelete) return;

    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xoá sản phẩm khỏi kho?',
      message: `Bạn chuẩn bị xoá thiết bị "${prodToDelete.product_name}" SKU: ${prodToDelete.sku} ra khỏi danh mục phân phối điện máy và gia dụng của Electro.`,
      type: 'danger',
      confirmText: 'Xác nhận gỡ bỏ',
      cancelText: 'Không, giữ lại',
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.product_id !== productId));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast(
          `Đã xoá thiết bị "${prodToDelete.product_name}" khỏi kho thành công.`,
          'warning',
          () => {
            setProducts((prev) => [...prev, prodToDelete]);
            addToast(`Đã đảo ngược hành động và khôi phục thành công sản phẩm "${prodToDelete.product_name}" về kho!`, 'success');
          },
          'Hoàn tác'
        );
      }
    });
  };

  const handleUpdatePaymentStatus = (orderId: number, nextPaymentStatus: any) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.order_id === orderId) {
          return {
            ...ord,
            payment_status: nextPaymentStatus
          };
        }
        return ord;
      })
    );
  };

  const handleUpdateUserStatus = (userId: number, nextStatus: 'active' | 'inactive') => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.user_id === userId) {
          return {
            ...u,
            status: nextStatus
          };
        }
        return u;
      })
    );
  };
  
  // --- STATE QUẢN LÝ BỘ LỌC VÀ ĐIỀU HƯỚNG ---
  const [currentView, setCurrentView] = useState<'home' | 'listing' | 'detail' | 'checkout_flow' | 'profile' | 'forbidden' | 'not_found'>('home'); // Phân cấp điều hướng luồng: Home, Listing, Detail, Checkout Flow, Profile, Forbidden, Not Found
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // Trạng thái lọc danh mục cha (Navigation Panel)
  const [searchQuery, setSearchQuery] = useState<string>(''); // Từ khóa tìm kiếm sản phẩm trên header thanh công cụ
  const [currentTab, setCurrentTab] = useState<string>('all'); // Tab danh mục "Sản phẩm mới nhất 2026" (all, dientu, giadung, thietbinhabep)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const saved = localStorage.getItem('electro_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.role_id === 1) {
          return true;
        }
      } catch (e) {
        // Safe silence
      }
    }
    return false;
  }); // Công tắc hoán đổi giao diện Khách hàng <-> Giao diện Admin quản trị

  // --- STATE ĐIỀU KHIỂN CỬA SỔ BẬT LÊN (MODALS) ---
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false); // Trạng thái đóng/mở ngăn kéo giỏ hàng (Cart Slide Drawer)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Lưu trữ sản phẩm được chọn để xem chi tiết
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false); // Trạng thái mở Form điền thông tin đặt mua thanh toán
  const [checkoutAddress, setCheckoutAddress] = useState<string>(''); // Lưu địa chỉ nhận hàng nhập từ Form đặt hàng
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'cod' | 'bank_transfer' | 'vnpay' | 'momo'>('cod'); // Phương thức thanh toán của đơn hàng

  // --- STATE NHẬP LIỆU CHO BÀN LUẬN & ĐÁNH GIÁ (REVIEW FORM) ---
  const [reviewRating, setReviewRating] = useState<number>(5); // Điểm số lượng sao đánh giá (1-5)
  const [reviewComment, setReviewComment] = useState<string>(''); // Nội dung bình luận cho sản phẩm trong modal chi tiết

  // --- STATE QUẢN TRỊ VIÊN (ADMIN DASHBOARD CONTROLS) ---
  const [adminSearch, setAdminSearch] = useState<string>(''); // Search bar dành riêng cho Admin trong dải quản lý sản phẩm
  const [showProductForm, setShowProductForm] = useState<boolean>(false); // Hiển thị Form Thêm hoặc Sửa sản phẩm của Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Đối tượng sản phẩm đang được chỉnh sửa (null là Thêm Mới)
  const [productFormName, setProductFormName] = useState<string>(''); // Form dữ liệu: Tên sản phẩm
  const [productFormPrice, setProductFormPrice] = useState<number>(0); // Form dữ liệu: Đơn giá sản phẩm
  const [productFormCategory, setProductFormCategory] = useState<number>(1); // Form dữ liệu: Mã ngành danh mục
  const [productFormBrand, setProductFormBrand] = useState<number>(1); // Form dữ liệu: Mã thương hiệu
  const [productFormStock, setProductFormStock] = useState<number>(10); // Form dữ liệu: Số lượng trong kho
  const [productFormSku, setProductFormSku] = useState<string>(''); // Form dữ liệu: Mã Stock Keeping Unit
  const [productFormDesc, setProductFormDesc] = useState<string>(''); // Form dữ liệu: Mô tả thông số sản phẩm
  const [productFormImage, setProductFormImage] = useState<string>(''); // Form dữ liệu: Liên kết hình ảnh trực quan

  // =========================================================================
  // --- STATE HOÀN TÁC VÀ PHÂN HỆ XÁC NHẬN - MODULE 7 (UNDO & CONFIRM STATES) ---
  // =========================================================================
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false); // Trạng thái mở AuthModal (Đăng ký / Đăng nhập)

  // Danh mục Toast Alert hỗ trợ Hoàn Tác (Undo Notifications Queue)
  interface AppToast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    undoAction?: () => void;
    undoLabel?: string;
  }
  const [toasts, setToasts] = useState<AppToast[]>([]);

  // Đăng ký thông báo Toast mới
  const addToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    undoAction?: () => void,
    undoLabel?: string
  ) => {
    const freshId = Date.now().toString() + Math.random().toString();
    const newToast: AppToast = { id: freshId, message, type, undoAction, undoLabel };
    setToasts((prev) => [...prev, newToast]);

    // Tự động giải phóng sau 7 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== freshId));
    }, 7000);
  };

  // Cấu hình cửa sổ hội thoại Xác Nhận (Interactive Dialog Box Confirmation)
  interface ConfirmConfig {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }
  const [confirmModal, setConfirmModal] = useState<ConfirmConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // =========================================================================
  // --- MODULE 10: RẼ NHÁNH ROUTER ĐIỀU HƯỚNG BẢO MẬT & ĐỒNG BỘ DỰA TRÊN URL ---
  // =========================================================================
  const location = useLocation();
  const navigate = useNavigate();

  // Đồng bộ danh sách người dùng về localStorage để duy trì dữ liệu đăng ký/chỉnh sửa
  React.useEffect(() => {
    localStorage.setItem('electro_users_list2026', JSON.stringify(users));
  }, [users]);

  // Ghi chú tiếng Việt: Đồng bộ giỏ hàng về vùng nhớ độc lập theo đúng tài khoản đang sở hữu (Cart Isolation Sync Flow)
  React.useEffect(() => {
    const currentEmail = currentUser?.email || null;
    if (lastLoadedCartUserRef.current === currentEmail) {
      const key = currentUser ? `cart_${currentUser.email}` : 'electro_cart_items_list';
      localStorage.setItem(key, JSON.stringify(cartItems));
    } else {
      // Khi phát hiện lệch trạng thái trung gian, cập nhật lại mốc so sánh mà không ghi đè dữ liệu
      lastLoadedCartUserRef.current = currentEmail;
    }
  }, [cartItems, currentUser]);

  // Đồng bộ danh sách đơn đặt hàng về localStorage
  React.useEffect(() => {
    localStorage.setItem('electro_orders_list2026', JSON.stringify(orders));
  }, [orders]);

  // Đồng bộ Khóa tài khoản: Nếu người dùng đang đăng nhập bị khóa tài khoản hoặc vẫn chưa phê duyệt thì tự động đăng xuất
  React.useEffect(() => {
    if (currentUser && currentUser.role_id !== 1) {
      const dbUser = users.find(u => u.user_id === currentUser.user_id);
      if (dbUser && (dbUser.status === 'inactive' || dbUser.status === 'pending')) {
        handleSetCurrentUser(null);
        addToast(`Tài khoản của bạn đã bị thay đổi trạng thái (${dbUser.status === 'inactive' ? 'Bị khóa' : 'Chờ phê duyệt'}). Hệ thống tự động đăng xuất để bảo mật!`, 'error');
        setCurrentView('home');
        navigate('/');
      }
    }
  }, [users, currentUser, navigate]);

  // 1. Đồng bộ URL gõ trực tiếp về trạng thái View (URL -> State View Sync)
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/profile') {
      if (currentView !== 'profile') {
        setCurrentView('profile');
      }
      setIsAdminView(false);
    } else if (path === '/admin/dashboard') {
      const userRole = localStorage.getItem('user_role') || (currentUser?.role_id === 1 ? 'admin' : 'customer');
      if (userRole === 'admin' || currentUser?.role_id === 1) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
        navigate('/403');
      }
    } else if (path === '/403') {
      if (currentView !== 'forbidden') {
        setCurrentView('forbidden');
      }
      setIsAdminView(false);
    } else if (path === '/') {
      if (currentView === 'profile' || currentView === 'forbidden' || currentView === 'not_found') {
        setCurrentView('home');
      }
    }
  }, [location.pathname, currentUser]);

  // 2. Đồng bộ State nhấp chuột sang URL trình duyệt (State -> URL Sync)
  React.useEffect(() => {
    const path = location.pathname;
    if (currentView === 'profile' && path !== '/profile') {
      navigate('/profile');
    } else if (currentView === 'forbidden' && path !== '/403') {
      navigate('/403');
    } else if (currentView === 'home' && path !== '/' && !isAdminView) {
      navigate('/');
    } else if (currentView === 'listing' && path !== '/' && !isAdminView) {
      if (path !== '/') navigate('/');
    } else if (currentView === 'detail' && path !== '/' && !isAdminView) {
      if (path !== '/') navigate('/');
    } else if (currentView === 'checkout_flow' && path !== '/' && !isAdminView) {
      if (path !== '/') navigate('/');
    }
  }, [currentView, isAdminView]);

  // 3. Đồng bộ hoán đổi chế độ xem Admin View sang URL (Admin Switch -> URL Sync)
  React.useEffect(() => {
    const path = location.pathname;
    if (isAdminView && path !== '/admin/dashboard') {
      navigate('/admin/dashboard');
    } else if (!isAdminView && path === '/admin/dashboard') {
      navigate('/');
    }
  }, [isAdminView]);

  // --- MODULE 10: QUẢN LÝ PHIÊN ĐĂNG NHẬP VÀ PHÂN QUYỀN TRUY CẬP (SESSION & AUTHORIZATION) ---
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('electro_current_user', JSON.stringify(currentUser));
      localStorage.setItem('electro_user_session_active', 'true');
      const roleName = currentUser.role_id === 1 ? 'admin' : 'customer';
      localStorage.setItem('user_role', roleName);
    } else {
      localStorage.removeItem('electro_current_user');
      localStorage.removeItem('electro_user_session_active');
      localStorage.removeItem('user_role');
    }
  }, [currentUser]);

  React.useEffect(() => {
    const sessionActive = localStorage.getItem('electro_user_session_active') === 'true';
    
    // Nếu chưa đăng nhập mà cố ý truy cập trang "Hồ sơ cá nhân / Lịch sử đơn hàng", tự động chuyển hướng về trang Đăng nhập
    if (!currentUser && !sessionActive) {
      if (currentView === 'profile') {
        addToast(
          'Yêu cầu bảo mật: Vui lòng thiết lập phiên đăng nhập để truy cập Hồ sơ cá nhân và Lịch sử đơn hàng.',
          'error'
        );
        setCurrentView('home');
        setIsAuthOpen(true);
      }
    }
    
    // Bảo mật Giao diện 403: Nếu đang ở chế độ Xem Admin (isAdminView) nhưng vai trò người dùng không phải Quản trị viên (role_id !== 1)
    if (isAdminView && currentUser?.role_id !== 1) {
      setIsAdminView(false);
      setCurrentView('forbidden');
      navigate('/403');
      addToast('Từ chối truy cập 403: Tài khoản của bạn không có đặc quyền quản trị hệ thống!', 'error');
    }
  }, [currentView, currentUser, isAdminView]);


  // Hủy đơn hàng giả lập phía Khách hàng (Customer request cancel order)
  const handleCancelOrderClient = (orderId: number) => {
    const matchedOrder = orders.find((o) => o.order_id === orderId);
    if (!matchedOrder) return;

    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận huỷ đơn hàng này?',
      message: `Bạn sắm sửa yêu cầu huỷ bỏ Hoá đơn mua sắm #${matchedOrder.order_id} trị giá ${matchedOrder.total_amount.toLocaleString('vi-VN')} ₫. Thao tác này sẽ tự động hoàn trả số dư thiết bị trong CSDL kho hàng về kệ hàng khả dụng.`,
      type: 'danger',
      confirmText: 'Xác nhận hủy đơn',
      cancelText: 'Giữ lại đơn hàng',
      onConfirm: () => {
        // Cập nhật trạng thái đơn hàng thành 'cancelled'
        setOrders((prev) =>
          prev.map((o) => (o.order_id === orderId ? { ...o, order_status: 'cancelled' } : o))
        );

        // Khôi phục hàng hoàn lại cho số lượng kho (stock_quantity)
        setProducts((prevProd) => {
          return prevProd.map((p) => {
            // Xem đơn hàng cũ mua bao nhiêu
            // Ở đây vì mô phỏng, ta hồi lại toàn bộ dải lượng tồn kho của tất cả sản phẩm có trong giỏ mua lúc đó (giả định khớp)
            // Hoặc đơn giản là phục hồi số tồn kho của các cart items hiện có nếu trùng hơp hoặc hồi đều
            // Ta hồi lại dựa trên dự án là tăng lại khoảng tồn kho ngẫu nhiên (ví dụ +1) để cho chân thực dải dữ liệu
            return {
              ...p,
              stock_quantity: p.stock_quantity + 1,
              status: 'available'
            };
          });
        });

        // Ẩn modal và thông báo thành tựu
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        
        // Thêm Toast hoàn tác cho huỷ đơn hàng!
        addToast(
          `Hủy thành công hoá đơn #${orderId}. Báo cáo hoàn kho đã được lập.`,
          'warning',
          () => {
            // Callback Hoàn tác hủy đơn
            setOrders((prev) =>
              prev.map((o) => (o.order_id === orderId ? { ...o, order_status: 'pending' } : o))
            );
            addToast(`Đã khôi phục lại trạng thái "Chờ duyệt" cho đơn hàng #${orderId}!`, 'success');
          },
          'Hoàn tác'
        );
      }
    });
  };

  // --- 1. LOGIC XỬ LÝ CHUYỂN TAB DANH MỤC "SẢN PHẨM MỚI NHẤT 2026" (HOMEPAGE TABS) ---
  // Sử dụng useMemo để tính toán bộ lọc tối ưu dựa trên tab danh mục và thanh tìm kiếm chính
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Điều kiện 1: Lọc theo thanh tìm kiếm ở Header (Search Bar)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.product_name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesSku && !matchesDesc) {
          return false;
        }
      }

      // Điều kiện 2: Lọc theo danh mục chính được chọn từ Navigation bar
      if (activeCategory !== null) {
        // Lấy toàn bộ phân hệ thuộc danh mục lọc
        const subCategoryIds = mockCategories
          .filter((c) => c.category_id === activeCategory || c.parent_id === activeCategory)
          .map((c) => c.category_id);
        
        if (!subCategoryIds.includes(product.category_id)) {
          return false;
        }
      }

      // Điều kiện 3: Lọc theo Tab danh mục sản phẩm (Mục sản phẩm mới nhất 2026 trên trang chủ)
      if (currentTab !== 'all') {
        let matchedCategoryId = 1; // 1 là Điện tử
        if (currentTab === 'giadung') {
          matchedCategoryId = 2; // 2 là Gia dụng
        } else if (currentTab === 'thietbinhabep') {
          matchedCategoryId = 3; // 3 là Thiết bị nhà bếp
        }

        // Tìm kiếm tập hợp mã ngành liên đới danh mục
        const associatedCategoryIds = mockCategories
          .filter((c) => c.category_id === matchedCategoryId || c.parent_id === matchedCategoryId)
          .map((c) => c.category_id);

        if (!associatedCategoryIds.includes(product.category_id)) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, activeCategory, currentTab]);

  // --- 2. LOGIC XỬ LÝ GIỎ HÀNG (SHOPPING CART INTERACTIONS) ---
  // Thêm nhanh sản phẩm vào giỏ hàng hành động
  const handleAddToCart = (product: Product) => {
    // Nếu hết hàng thì không tiến hành thêm
    if (product.stock_quantity === 0) return;

    setCartItems((prevItems) => {
      // Kiểm tra sản phẩm đã có trong giỏ hàng hiện tại chưa
      const existingIndex = prevItems.findIndex((item) => item.product_id === product.product_id);

      if (existingIndex > -1) {
        // Cập nhật tăng số lượng nếu đã tồn tại
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        // Thêm mới một phần tử giỏ hàng tương ứng
        const newItem: CartItem = {
          cart_item_id: prevItems.length + 1,
          cart_id: 1, // Mã mặc định
          product_id: product.product_id,
          quantity: 1,
          unit_price: product.price,
          product: product
        };
        return [...prevItems, newItem];
      }
    });

    // Thêm feedback Toast Message kèm Undo
    addToast(
      `Đã thêm "${product.product_name}" vào giỏ hàng thành công!`,
      'success',
      () => {
        setCartItems((prev) => {
          const itemIdx = prev.findIndex((item) => item.product_id === product.product_id);
          if (itemIdx === -1) return prev;
          const updated = [...prev];
          if (updated[itemIdx].quantity > 1) {
            updated[itemIdx].quantity -= 1;
          } else {
            updated.splice(itemIdx, 1);
          }
          return updated;
        });
        addToast(`Đã hoàn tác: Giảm bớt 1 sản phẩm "${product.product_name}" khỏi giỏ hàng!`, 'info');
      },
      'Hoàn tác'
    );

    // Mở hông giỏ hàng nhanh để khách hàng nhìn thấy phản hồi trực quan tiện lợi
    setIsCartOpen(true);
  };

  // Cập nhật số lượng vật phẩm trực tiếp trong giỏ hàng
  const handleUpdateCartQuantity = (cartItemId: number, action: 'increase' | 'decrease') => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.cart_item_id === cartItemId) {
            const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
            // Đảm bảo số lượng hàng tối đa không vượt quá số lượng hàng trong kho và không bé hơn 1
            const maxStock = item.product?.stock_quantity || 10;
            if (newQuantity > maxStock) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Loại bỏ khỏi giỏ hàng nếu số lượng giảm xuống 0
    });
  };

  // Xóa bỏ một mặt hàng trực tiếp khỏi giỏ hàng (Có HOÀN TÁC cực kì tiện lợi)
  const handleRemoveFromCart = (cartItemId: number) => {
    const backupItem = cartItems.find((item) => item.cart_item_id === cartItemId);
    if (!backupItem) return;

    setCartItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
    
    // Đổ toast thông báo hoành tráng hỗ trợ click HOÀN TÁC khôi phục tức thời
    addToast(
      `Đã xóa "${backupItem.product?.product_name}" ra khỏi giỏ hàng thành công.`,
      'info',
      () => {
        setCartItems((prev) => [...prev, backupItem]);
        addToast(`Đã phục hồi thiết bị "${backupItem.product?.product_name}" vào giỏ hàng!`, 'success');
      },
      'Hoàn tác'
    );
  };

  // Làm sạch hoàn toàn giỏ hàng (Có Xác nhận và HOÀN TÁC)
  const handleClearCartWithConfirm = () => {
    if (cartItems.length === 0) {
      addToast('Giỏ hàng của bạn đang trống rỗng!', 'warning');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Dọn sạch giỏ hàng?',
      message: 'Bạn có chắc chắn muốn giải phóng toàn bộ sản phẩm máy tính, điện lạnh khỏi giỏ hàng hiện tại chứ?',
      type: 'danger',
      confirmText: 'Xác nhận xóa sạch',
      cancelText: 'Giữ lại giỏ hàng',
      onConfirm: () => {
        const backupCart = [...cartItems];
        setCartItems([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        
        addToast(
          'Đã dọn sạch toàn bộ thiết bị trong giỏ hàng thành công.',
          'warning',
          () => {
            setCartItems(backupCart);
            addToast('Đã phục hồi nguyên trạng dải giỏ hàng cũ của bạn!', 'success');
          },
          'Hoàn tác'
        );
      }
    });
  };

  // Tính toán chỉ số tài chính giỏ hàng
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const checkoutShippingFee = cartSubtotal > 10000000 ? 0 : 45000; // Miễn phí vận chuyển nếu đơn hàng trên 10 Triệu VNĐ
  const discountAmount = cartSubtotal > 20000000 ? 500000 : 0; // Giảm ngay 500.000đ khi đơn hàng tổng trên 20 Triệu
  const cartTotalVal = cartSubtotal > 0 ? cartSubtotal + checkoutShippingFee - discountAmount : 0;

  // --- 3. ĐẶT HÀNG & THANH TOÁN (CHECKOUT SIMULATOR) ---
  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (checkoutAddress.trim() === '') {
      alert('Vui lòng điền địa chỉ giao hàng nhận thiết bị điện máy chính xác!');
      return;
    }

    // Tạo đối tượng đơn hàng mới lưu vết vào CSDL
    const newOrder: Order = {
      order_id: orders.length + 101, // Sinh mã đơn hàng ngẫu nhiên đại diện bắt đầu từ 101
      user_id: currentUser?.user_id || 0,
      subtotal: cartSubtotal,
      discount_amount: discountAmount,
      shipping_fee: checkoutShippingFee,
      total_amount: cartTotalVal,
      order_status: 'pending', // Mới đặt hàng mặc định là Chờ Duyệt (pending)
      payment_status: checkoutPaymentMethod === 'cod' ? 'pending' : 'paid', // Nếu chuyển thanh toán online thì mặc định thanh toán thành công
      shipping_address: checkoutAddress,
      created_at: new Date().toISOString(),
      customerEmail: currentUser?.email || 'guest@example.com'
    };

    // Cập nhật danh sách đơn hàng toàn cục
    setOrders((prev) => [newOrder, ...prev]);

    // Trừ tồn kho tương ứng của các sản phẩm thực tế vừa mua
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const itemBought = cartItems.find((ci) => ci.product_id === p.product_id);
        if (itemBought) {
          const rem = p.stock_quantity - itemBought.quantity;
          return {
            ...p,
            stock_quantity: rem >= 0 ? rem : 0,
            status: rem <= 0 ? 'out_of_stock' : 'available'
          };
        }
        return p;
      });
    });

    // Reset sạch giỏ hàng và các Form đặt hàng liên quan
    setCartItems([]);
    setCheckoutAddress('');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    // Báo thông báo thanh toán / đặt hàng hoàn hảo
    alert(`Chúc mừng ${currentUser?.full_name || 'Quý khách'}! Đơn hàng của bạn #${newOrder.order_id} đã được khởi tạo thành công trên hệ thống.`);
  };

  // --- CÁC HÀM TIỆN ÍCH DÀNH RIÊNG CHO MODULE 4 (CHECKOUT FLOW CALLBACKS) ---
  const handleCheckoutFlowOrder = (orderData: {
    shippingAddress: string;
    paymentMethod: 'cod' | 'bank_transfer';
    fullName: string;
    phone: string;
    notes: string;
    couponCode: string;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
  }) => {
    const nextOrderId = orders.length + 101;
    const newOrder: Order = {
      order_id: nextOrderId,
      user_id: currentUser?.user_id || 0,
      subtotal: orderData.totalAmount + orderData.discountAmount - orderData.shippingFee,
      discount_amount: orderData.discountAmount,
      shipping_fee: orderData.shippingFee,
      total_amount: orderData.totalAmount,
      order_status: 'pending',
      payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
      shipping_address: orderData.shippingAddress,
      created_at: new Date().toISOString(),
      customerEmail: currentUser?.email || 'guest@example.com'
    };

    // Ghi chú tiếng Việt: Đồng bộ đơn hàng mới đặt vào localStorage để tránh mất lịch sử khi F5/reload (Persistent Order History)
    setOrders((prev) => {
      const updatedOrders = [newOrder, ...prev];
      localStorage.setItem('electro_orders_list2026', JSON.stringify(updatedOrders)); // Lưu trữ bền vững lập tức
      return updatedOrders;
    });

    // Ghi chú tiếng Việt: Cập nhật Địa chỉ mặc định động (Dynamic Address Update): 
    // Khi đặt hàng, ghi đè địa chỉ mới vào thực thể tài khoản đăng nhập hiện thời và danh sách người dùng
    if (currentUser) {
      const updatedUser: UserType = {
        ...currentUser,
        address: orderData.shippingAddress,
        phone: orderData.phone || currentUser.phone,
        full_name: orderData.fullName || currentUser.full_name
      };

      // Ghi chú tiếng Việt: Đồng bộ danh sách tài khoản tổng và ghi đè địa chỉ mới lưu localStorage
      setUsers((prevUsers) => {
        const updatedUsersList = prevUsers.map((u) => u.user_id === currentUser.user_id ? updatedUser : u);
        localStorage.setItem('electro_users_list2026', JSON.stringify(updatedUsersList)); // Lưu trữ bền vững danh sách user có địa chỉ mới
        return updatedUsersList;
      });

      // Cập nhật trạng thái người dùng hiện hành sang địa chỉ mới để Profile cập nhật trực quan tức thì
      setCurrentUser(updatedUser);
      localStorage.setItem('electro_current_user', JSON.stringify(updatedUser)); // Đồng bộ cấu hình phiên đăng nhập
    }

    // Trừ tồn kho tương ứng của các sản phẩm thực tế vừa mua
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const itemBought = cartItems.find((ci) => ci.product_id === p.product_id);
        if (itemBought) {
          const rem = p.stock_quantity - itemBought.quantity;
          return {
            ...p,
            stock_quantity: rem >= 0 ? rem : 0,
            status: (rem <= 0 ? 'out_of_stock' : 'available') as 'available' | 'out_of_stock' | 'discontinued'
          };
        }
        return p;
      });
    });

    return nextOrderId;
  };

  // --- CÁC HÀM TIỆN ÍCH DÀNH RIÊNG CHO MODULE 3 (PRODUCT DETAIL & LISTING PAGE INTERCEPTION) ---
  const handleAddToCartWithQty = (product: Product, quantity: number) => {
    if (product.stock_quantity === 0) return;
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.product_id === product.product_id);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          cart_item_id: prevItems.length + 1,
          cart_id: 1,
          product_id: product.product_id,
          quantity: quantity,
          unit_price: product.price,
          product: product
        };
        return [...prevItems, newItem];
      }
    });

    // Thêm feedback Toast Message
    addToast(
      `Đã thêm ${quantity}x "${product.product_name}" vào giỏ hàng thành công!`,
      'success',
      () => {
        setCartItems((prev) => {
          const itemIdx = prev.findIndex((item) => item.product_id === product.product_id);
          if (itemIdx === -1) return prev;
          const updated = [...prev];
          if (updated[itemIdx].quantity > quantity) {
            updated[itemIdx].quantity -= quantity;
          } else {
            updated.splice(itemIdx, 1);
          }
          return updated;
        });
        addToast(`Đã hoàn tác: Bỏ bớt ${quantity} sản phẩm "${product.product_name}" khỏi giỏ hàng!`, 'info');
      },
      'Hoàn tác'
    );

    setIsCartOpen(true);
  };

  const handleDirectCheckout = (product: Product, quantity: number) => {
    if (product.stock_quantity === 0) return;
    handleAddToCartWithQty(product, quantity);
    setIsCartOpen(false);
    setCurrentView('checkout_flow');
  };

  const handleDetailPageReviewAdd = (productId: number, rating: number, comment: string) => {
    const newReview: Review = {
      review_id: reviews.length + 1,
      product_id: productId,
      user_id: currentUser?.user_id || 0,
      user_name: currentUser?.full_name || 'Khách ẩn danh',
      rating: rating,
      comment: comment,
      status: 'approved',
      created_at: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Tính toán lại sao trung bình của sản phẩm
    const productReviews = updatedReviews.filter((r) => r.product_id === productId && r.status === 'approved');
    const newAvgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.product_id === productId) {
          return { ...p, avg_rating: Number(newAvgRating.toFixed(1)) };
        }
        return p;
      })
    );

    // Đồng bộ đối tượng selectedProduct (nếu đang được xem chi tiết)
    setSelectedProduct((prev) => {
      if (prev && prev.product_id === productId) {
        return { ...prev, avg_rating: Number(newAvgRating.toFixed(1)) };
      }
      return prev;
    });
  };

  // --- 4. THEO DÕI VÀ ĐÁNH GIÁ SẢN PHẨM KHÁCH HÀNG (PRODUCT REVIEW ENGINE) ---
  // Thêm một bình luận/đánh giá sao mới cho sản phẩm chi tiết
  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || reviewComment.trim() === '') return;

    const newReview: Review = {
      review_id: reviews.length + 1,
      product_id: selectedProduct.product_id,
      user_id: currentUser.user_id,
      user_name: currentUser.full_name,
      rating: reviewRating,
      comment: reviewComment,
      status: 'approved',
      created_at: new Date().toISOString()
    };

    // Lưu vào database mô phỏng reviews
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Tự động tính toán lại điểm số xếp hạng trung bình (avg_rating) của sản phẩm tương ứng
    const productReviews = updatedReviews.filter((r) => r.product_id === selectedProduct.product_id && r.status === 'approved');
    const newAvgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.product_id === selectedProduct.product_id) {
          return { ...p, avg_rating: Number(newAvgRating.toFixed(1)) };
        }
        return p;
      })
    );

    // Cập nhật lại đối tượng đang chọn trong model hiển thị
    setSelectedProduct((prev) => {
      if (prev) {
        return { ...prev, avg_rating: Number(newAvgRating.toFixed(1)) };
      }
      return prev;
    });

    // Reset lại ô soạn thảo của review form
    setReviewComment('');
    setReviewRating(5);
  };

  // Lọc lấy toàn bộ các bình luận của sản phẩm đang được mở xem nhanh
  const activeProductReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return reviews.filter((r) => r.product_id === selectedProduct.product_id && r.status === 'approved');
  }, [reviews, selectedProduct]);

  // --- 5. LOGIC QUẢN TRỊ VIÊN ADMIN CHUYÊN NGHIỆP (ADMIN DASHBOARD MANAGEMENT) ---
  // Tìm kiếm lọc sản phẩm cho bảng danh sách quản trị
  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (adminSearch.trim() === '') return true;
      const query = adminSearch.toLowerCase();
      return (
        p.product_name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    });
  }, [products, adminSearch]);

  // Sẵn sàng điền dữ liệu Form để bắt đầu thêm mới sản phẩm
  const handleOpenAddProductForm = () => {
    setEditingProduct(null);
    setProductFormName('');
    setProductFormPrice(1500000);
    setProductFormCategory(1);
    setProductFormBrand(1);
    setProductFormStock(20);
    setProductFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setProductFormDesc('Thiết bị gia dụng thế hệ mới đạt chuẩn kiểm định an toàn kỹ thuật Châu Âu.');
    setProductFormImage('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600');
    setShowProductForm(true);
  };

  // Điền nạp dữ liệu cũ vào form để chỉnh sửa sản phẩm có sẵn
  const handleOpenEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setProductFormName(product.product_name);
    setProductFormPrice(product.price);
    setProductFormCategory(product.category_id);
    setProductFormBrand(product.brand_id);
    setProductFormStock(product.stock_quantity);
    setProductFormSku(product.sku);
    setProductFormDesc(product.description);
    setProductFormImage(product.image_url);
    setShowProductForm(true);
  };

  // Lưu form thêm mới hoặc chỉnh sửa sản phẩm (Save Product Submit)
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productFormName.trim() === '' || productFormSku.trim() === '') {
      alert('Vui lòng điền đầy đủ Tên sản phẩm và mã SKU!');
      return;
    }

    if (editingProduct) {
      // Trường hợp cập nhật chỉnh sửa sản phẩm
      setProducts((prev) =>
        prev.map((p) => {
          if (p.product_id === editingProduct.product_id) {
            return {
              ...p,
              product_name: productFormName,
              price: productFormPrice,
              category_id: productFormCategory,
              brand_id: productFormBrand,
              stock_quantity: productFormStock,
              status: productFormStock > 0 ? 'available' : 'out_of_stock',
              sku: productFormSku,
              description: productFormDesc,
              image_url: productFormImage
            };
          }
          return p;
        })
      );
      alert('Cập nhật thiết bị thành công!');
    } else {
      // Trường hợp thêm mới sản phẩm hoàn toàn vào catalog
      const newProd: Product = {
        product_id: products.length + 101, // Tạo ID mới đại diện
        product_name: productFormName,
        price: productFormPrice,
        category_id: productFormCategory,
        brand_id: productFormBrand,
        stock_quantity: productFormStock,
        status: productFormStock > 0 ? 'available' : 'out_of_stock',
        sku: productFormSku,
        description: productFormDesc,
        image_url: productFormImage,
        avg_rating: 5.0
      };
      setProducts((prev) => [...prev, newProd]);
      alert('Đã thêm mới thiết bị vào cơ sở dữ liệu bán hàng!');
    }

    setShowProductForm(false);
  };

  // Xóa một sản phẩm trực tiếp khỏi danh mục (Delete Product) - Hỗ trợ Xác nhận & Hoàn tác
  const handleDeleteProduct = (productId: number) => {
    const prodToDelete = products.find((p) => p.product_id === productId);
    if (!prodToDelete) return;

    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận gỡ bỏ hoàn toàn sản phẩm?',
      message: `Bạn đang chuẩn bị xoá vĩnh viễn thiết bị "${prodToDelete.product_name}" ra khỏi cơ sở dữ liệu dải kệ hàng của cửa hàng Electro.`,
      type: 'danger',
      confirmText: 'Xác nhận xoá',
      cancelText: 'Huỷ bỏ',
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.product_id !== productId));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast(
          `Đã loại bỏ thiết bị "${prodToDelete.product_name}" thành công.`,
          'warning',
          () => {
            setProducts((prev) => [...prev, prodToDelete]);
            addToast(`Đã khôi phục sản phẩm "${prodToDelete.product_name}" về CSDL dải kệ hàng!`, 'success');
          },
          'Hoàn tác'
        );
      }
    });
  };

  // Chuyển đổi trạng thái đơn hàng của khách dành cho Admin Quản Lý (Order Status Manager)
  const handleUpdateOrderStatus = (orderId: number, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.order_id === orderId) {
          // Đồng thời cập nhật trạng thái thanh toán nếu đổi giao trạng thái Delivered
          const pStatus: PaymentStatus = nextStatus === 'delivered' ? 'paid' : ord.payment_status;
          return {
            ...ord,
            order_status: nextStatus,
            payment_status: pStatus
          };
        }
        return ord;
      })
    );
  };

  // Tính toán số liệu doanh thu và thống kê dành cho Admin Panel widgets
  const adminStats = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);
    const pendingCount = orders.filter((o) => o.order_status === 'pending').length;
    const totalItems = products.length;

    return {
      totalRevenue: totalRev,
      pendingOrdersCount: pendingCount,
      totalProductItems: totalItems,
      successfulOrdersCount: orders.length
    };
  }, [orders, products]);

  // Trả về tên danh mục từ ID danh mục
  const getCategoryName = (catId: number) => {
    return mockCategories.find((c) => c.category_id === catId)?.category_name || 'Khác';
  };

  // Trả về tên thương hiệu từ ID thương hiệu
  const getBrandName = (brandId: number) => {
    return mockBrands.find((b) => b.brand_id === brandId)?.brand_name || 'Khác';
  };


  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-slate-800" id="global_application_root">
      
      {/* 1. Header component (Trực diện thanh đầu) */}
      <Header
        currentUser={currentUser}
        setCurrentUser={handleSetCurrentUser}
        allUsers={users}
        cartItems={cartItems}
        onCartClick={() => {
          setCurrentView('checkout_flow');
          setIsAdminView(false);
          setIsCartOpen(false);
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim() !== '') {
            setCurrentView('listing');
            setIsAdminView(false);
          }
        }}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        onLogoClick={() => {
          setCurrentView('home');
          setActiveCategory(null);
          setSearchQuery('');
          setIsAdminView(false);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        products={products}
        categories={mockCategories}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setCurrentView('detail');
          setIsAdminView(false);
        }}
      />

      {/* 2. Navigation bar component (Thanh danh mục tuyển lựa) */}
      <Navigation
        categories={mockCategories}
        activeCategory={activeCategory}
        setActiveCategory={(catId) => {
          setActiveCategory(catId);
          setCurrentView('listing');
          setIsAdminView(false);
        }}
        setIsAdminView={setIsAdminView}
        currentUser={currentUser}
        isAdminView={isAdminView}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onCartClick={() => {
          setCurrentView('checkout_flow');
          setIsAdminView(false);
          setIsCartOpen(false);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* --- PHÂN NHÁNH 1: GIAO DIỆN QUẢN TRỊ ADMIN (ADMIN VIEW - MODULE 5 & MODULE 10) --- */}
      {location.pathname === '/admin/dashboard' ? (
        <AdminDashboardPage
          users={users}
          onUsersChange={(updatedUsers) => setUsers(updatedUsers)}
          products={products}
          onProductsChange={(updatedProducts) => setProducts(updatedProducts)}
          orders={orders}
          onOrdersChange={(updatedOrders) => setOrders(updatedOrders)}
          onBackToShop={() => {
            setIsAdminView(false);
            setCurrentView('home');
            navigate('/');
          }}
        />
      ) : isAdminView ? (
        <AdminDashboard
          products={products}
          orders={orders}
          users={users}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProductDirect}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onUpdateUserStatus={handleUpdateUserStatus}
          onClose={() => {
            setIsAdminView(false);
            navigate('/');
          }}
        />
      ) : (
        /* --- PHÂN NHÁNH 2: GIAO DIỆN KHÁCH HÀNG CHỦ ĐẠO (CUSTOMER CLIENT VIEW - MODULE 1) --- */
        <main className="flex-1" id="customer_main_view">
          
          {/* Thanh breadcrumb định vị cao cấp */}
          <Breadcrumbs
            currentView={currentView}
            activeCategory={activeCategory}
            selectedProduct={selectedProduct}
            onNavigate={(view, catId) => {
              setCurrentView(view);
              setActiveCategory(catId);
              if (view === 'home') {
                setSearchQuery('');
                setSelectedProduct(null);
              } else if (view === 'listing') {
                setSelectedProduct(null);
              }
            }}
          />
          
          {currentView === 'home' && (
            <>
              {/* 3. Banner Quảng Cáo Khởi Động */}
              <HeroBanner />

              {/* Dải dịch vụ phụ (Service Badges) nâng cao độ phong thái Web điện tử */}
              <section className="bg-white border-b border-gray-100 py-6" id="service_badges_row">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                  <div className="flex items-center space-x-3.5">
                    <span className="text-cyan-600 text-2xl font-bold bg-cyan-50 h-10 w-10 rounded-full flex items-center justify-center font-mono">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Miễn Phí Vận Chuyển</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Áp dụng cho mọi đơn hàng giá trị trên 10 Tr</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5">
                    <span className="text-emerald-600 text-2xl font-bold bg-emerald-50 h-10 w-10 rounded-full flex items-center justify-center font-mono">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Lắp Đặt Tại Nhà MIỄN PHÍ</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Kỹ sư Điện Máy lâu năm hỗ trợ lắp đặt</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5">
                    <span className="text-blue-600 text-2xl font-bold bg-blue-50 h-10 w-10 rounded-full flex items-center justify-center font-mono">3</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Một Đổi Một 15 Ngày</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Lỗi là đổi trả ngay lắp đặt loại mới</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5">
                    <span className="text-orange-600 text-2xl font-bold bg-orange-50 h-10 w-10 rounded-full flex items-center justify-center font-mono">4</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Bảo Hành Vàng 2 Năm</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Tổng đài tiếp nhận xử lý dưới 24 giờ</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lô thông tin tìm kiếm hoặc bộ lọc danh mục cha đang hoạt động */}
              {activeCategory && (
                <div className="bg-cyan-50/50 py-3 text-left">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-cyan-800">
                    <span>
                      Đang lọc danh mục: <strong>{getCategoryName(activeCategory)}</strong>
                    </span>
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="text-cyan-600 hover:text-cyan-800 font-bold underline cursor-pointer"
                    >
                      Xóa bộ lọc danh mục
                    </button>
                  </div>
                </div>
              )}

              {/* --- KHU VỰC CHÍNH: "SẢN PHẨM MỚI NHẤT 2026" CHIA TAB (CRITICAL REQUIREMENT) --- */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="latest_products_section">
                
                {/* Tiêu đề & Lối thiết kế Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-left">
                  <div className="max-w-xl">
                    <div className="flex items-center space-x-2 text-cyan-600 text-xs font-semibold uppercase tracking-widest mb-2 font-mono">
                      <span>Kho hàng công nghệ việt</span>
                      <span className="h-1 w-8 bg-cyan-600 rounded-sm"></span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Sản Phẩm Mới Nhất 2026
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      Tổng hợp loạt siêu phẩm linh kiện điện tử thông minh và dòng máy gia dụng cao cấp dẫn đầu xu thế tiện nghi năm 2026.
                    </p>
                  </div>

                  {/* Nút bấm chuyển đối TAB Danh Mục (Sản phẩm mới nhất 2026) */}
                  <div 
                    className="mt-6 md:mt-0 flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-lg max-w-fit"
                    id="homepage_categories_tabs"
                  >
                    <button
                      onClick={() => setCurrentTab('all')}
                      className={`px-4 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                        currentTab === 'all'
                          ? 'bg-white text-cyan-600 shadow-xs'
                          : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                      id="tab_trigger_all"
                    >
                      Tất Cả Sản Phẩm
                    </button>
                    <button
                      onClick={() => setCurrentTab('dientu')}
                      className={`px-4 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                        currentTab === 'dientu'
                          ? 'bg-white text-cyan-600 shadow-xs'
                          : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                      id="tab_trigger_dientu"
                    >
                      Thiết Bị Điện Tử
                    </button>
                    <button
                      onClick={() => setCurrentTab('giadung')}
                      className={`px-4 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                        currentTab === 'giadung'
                          ? 'bg-white text-cyan-600 shadow-xs'
                          : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                      id="tab_trigger_giadung"
                    >
                      Đồ Gia Dụng Gia Đình
                    </button>
                    <button
                      onClick={() => setCurrentTab('thietbinhabep')}
                      className={`px-4 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                        currentTab === 'thietbinhabep'
                          ? 'bg-white text-cyan-600 shadow-xs'
                          : 'text-gray-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                      id="tab_trigger_kitchen"
                    >
                      Thiết Bị Căn Bếp
                    </button>
                  </div>
                </div>

                {/* Mạng lưới hiển thị Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="product_items_grid">
                  {filteredProducts.map((prod) => (
                    <div 
                      key={prod.product_id} 
                      className="h-full cursor-pointer transition-all hover:scale-[1.01]"
                      onClick={() => {
                        setSelectedProduct(prod);
                        setCurrentView('detail');
                      }}
                    >
                      <ProductCard
                        product={prod}
                        brandName={getBrandName(prod.brand_id)}
                        categoryName={getCategoryName(prod.category_id)}
                        onQuickView={(id) => {
                          const found = products.find((p) => p.product_id === id);
                          if (found) setSelectedProduct(found);
                        }}
                        onAddToCart={(p) => {
                          handleAddToCart(p);
                        }}
                      />
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 bg-white border border-gray-100 rounded-3xl" id="no_products_fallback">
                      <p className="text-base font-medium">Không tìm thấy sản phẩm điện tử - gia dụng nào phù hợp.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory(null);
                          setCurrentTab('all');
                        }}
                        className="text-xs text-cyan-600 font-bold mt-2 hover:underline cursor-pointer"
                      >
                        Xóa các bộ lọc tìm kiếm và quay lại
                      </button>
                    </div>
                  )}
                </div>

                {/* Link kích hoạt toàn diện danh sách bộ lọc phong phú */}
                <div className="mt-14 text-center border-t border-gray-100 pt-8">
                  <p className="text-xs text-gray-400 mb-3.5">Bạn đang tìm kiếm dòng sản phẩm điện máy chuyên sâu hơn?</p>
                  <button
                    onClick={() => {
                      setCurrentView('listing');
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:shadow-cyan-100"
                    id="homepage_to_listing_btn"
                  >
                    <span>Khám phá và Lọc theo hãng, mức giá kỹ càng</span>
                  </button>
                </div>

              </section>
            </>
          )}

          {currentView === 'listing' && (
            <ProductListingPage
              products={products}
              categories={mockCategories}
              brands={mockBrands}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onAddToCart={handleAddToCart}
              onProductClick={(p) => {
                setSelectedProduct(p);
                setCurrentView('detail');
              }}
              getBrandName={getBrandName}
              getCategoryName={getCategoryName}
              searchQuery={searchQuery}
              setSearchQuery={(q) => setSearchQuery(q)}
            />
          )}

          {currentView === 'detail' && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              getBrandName={getBrandName}
              getCategoryName={getCategoryName}
              reviews={reviews}
              onBack={() => {
                setCurrentView('listing');
                setSelectedProduct(null);
              }}
              onAddToCartWithQty={handleAddToCartWithQty}
              onDirectCheckout={handleDirectCheckout}
              onAddReview={handleDetailPageReviewAdd}
            />
          )}

          {currentView === 'checkout_flow' && (
            <CheckoutFlow
              cartItems={cartItems}
              onUpdateQuantity={(itemId, action) => handleUpdateCartQuantity(itemId, action)}
              onRemoveItem={(itemId) => handleRemoveFromCart(itemId)}
              onClearCart={() => setCartItems([])}
              onPlaceOrder={(orderData) => handleCheckoutFlowOrder(orderData)}
              onClose={() => setCurrentView('home')}
              currentUser={{
                full_name: currentUser?.full_name || 'Khách vãng lai',
                phone: currentUser?.phone || ''
              }}
              isLoggedIn={!!currentUser}
              onInitiateLogin={() => setIsAuthOpen(true)}
            />
          )}

          {currentView === 'profile' && (
            <CustomerProfilePage
              currentUser={currentUser}
              allOrders={orders}
              onBackToHome={() => {
                setCurrentView('home');
                navigate('/');
              }}
              onLogout={() => {
                handleSetCurrentUser(null);
                setCurrentView('home');
                navigate('/');
                addToast('Đăng xuất thành công!', 'info');
              }}
            />
          )}

          {currentView === 'forbidden' && (
            <ForbiddenPage
              onBackToHome={() => setCurrentView('home')}
              onOpenAuth={() => setIsAuthOpen(true)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'not_found' && (
            <NotFoundPage
              onBackToHome={() => setCurrentView('home')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setCurrentView={setCurrentView}
            />
          )}

          {/* Dải thông tin bổ sung: Xem đơn hàng cá nhân ở góc dưới khách hàng để tăng trải nghiệm dòng chảy */}
          {currentView === 'profile' && (
            (() => {
              const userOrders = currentUser 
                ? orders.filter(ord => ord.customerEmail === currentUser.email)
                : orders;
              
              if (userOrders.length === 0) return null;

              return (
                <div className="bg-slate-50 border-t border-b border-gray-150 py-12 text-left" id="customer_orders_tracking">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
                      <CheckCircle className="w-5.5 h-5.5 text-cyan-600 animate-bounce" />
                      <span>Theo dõi trạng thái đơn hàng của bạn ({userOrders.length} Đơn)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userOrders.map((ord) => (
                        <div key={ord.order_id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-mono font-bold text-slate-800 text-sm">#MÃ ĐƠN {ord.order_id}</span>
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                              ord.order_status === 'pending' ? 'bg-amber-50 text-amber-600' :
                              ord.order_status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                              ord.order_status === 'shipped' ? 'bg-sky-50 text-sky-600' :
                              ord.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {ord.order_status === 'pending' ? 'Chờ duyệt' :
                               ord.order_status === 'processing' ? 'Đang soạn hàng' :
                               ord.order_status === 'shipped' ? 'Đang vận chuyển' :
                               ord.order_status === 'delivered' ? 'Đã giao hàng' : 'Đã hủy'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1 mb-2.5">
                            <p><strong>Ngày tạo:</strong> {new Date(ord.created_at).toLocaleDateString('vi-VN')} {new Date(ord.created_at).toLocaleTimeString('vi-VN')}</p>
                            <p><strong>Địa chỉ nhận:</strong> {ord.shipping_address}</p>
                            <p><strong>Cơ chế thanh toán:</strong> COD / Chuyển khoản trực tiếp</p>
                          </div>

                          {/* Thanh Trạng thái trực quan: Chờ xác nhận -> Đã đóng gói -> Đang giao -> Hoàn thành */}
                          <div className="my-4 pt-3.5 pb-1 border-t border-b border-gray-100/80">
                            <OrderStatusTracker status={ord.order_status} orderId={ord.order_id} />
                          </div>

                          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Khách chi thanh toán:</span>
                            <span className="font-mono text-sm font-extrabold text-red-600">{ord.total_amount.toLocaleString('vi-VN')} ₫</span>
                          </div>

                          {/* Bổ sung nút hủy đơn hàng có confirm và undo cho khách hàng */}
                          {ord.order_status === 'pending' && (
                            <div className="mt-3 pt-3 border-t border-gray-105 flex justify-end" id={`cancel_order_btn_row_${ord.order_id}`}>
                              <button
                                onClick={() => handleCancelOrderClient(ord.order_id)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 border border-red-200 hover:border-red-350 hover:bg-red-50 text-red-600 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Yêu cầu huỷ đơn</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </main>
      )}

      {/* --- FORM 1: ADMIN ADD / EDIT PRODUCT MODAL --- */}
      {showProductForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border max-w-2xl w-full p-6 text-left" id="admin_product_form_popup">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? `Cập Nhật Thiết Bị: ${editingProduct.sku}` : 'Thêm Thiết Bị Điện Máy Mới'}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-1.5 hover:bg-gray-105 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Tên thiết bị */}
                <div className="sm:col-span-2 flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tên sản phẩm thiết bị *</label>
                  <input
                    type="text"
                    value={productFormName}
                    onChange={(e) => setProductFormName(e.target.value)}
                    placeholder="Ví dụ: Lò vi sóng Sharp cao tần 25L"
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 2. Đơn giá */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Giá bán buôn (VNĐ) *</label>
                  <input
                    type="number"
                    value={productFormPrice}
                    onChange={(e) => setProductFormPrice(parseInt(e.target.value) || 0)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 3. Tồn kho ban đầu */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    value={productFormStock}
                    onChange={(e) => setProductFormStock(parseInt(e.target.value) || 0)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 4. SKU hàng hóa */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Mã định kho SKU *</label>
                  <input
                    type="text"
                    value={productFormSku}
                    onChange={(e) => setProductFormSku(e.target.value)}
                    placeholder="QA-HP-2026"
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                {/* 5. Liên kết hình ảnh */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Liên kết ảnh chụp thiết bị</label>
                  <input
                    type="text"
                    value={productFormImage}
                    onChange={(e) => setProductFormImage(e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                {/* 6. Chọn danh mục */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Thuộc danh mục chính *</label>
                  <select
                    value={productFormCategory}
                    onChange={(e) => setProductFormCategory(parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500 bg-white"
                  >
                    {mockCategories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Chọn thương hiệu */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Thương hiệu sản xuất *</label>
                  <select
                    value={productFormBrand}
                    onChange={(e) => setProductFormBrand(parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500 bg-white"
                  >
                    {mockBrands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.brand_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Mô tả chi tiết kỹ thuật */}
                <div className="sm:col-span-2 flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1">Mô tả thông số kỹ thuật</label>
                  <textarea
                    rows={3}
                    value={productFormDesc}
                    onChange={(e) => setProductFormDesc(e.target.value)}
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end space-x-3.5">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORM 2: SLIDE OVER CART SYSTEM (GIỎ HÀNG BÊN HÔNG MÔ PHỎNG PHỨC TẠP) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in text-left">
            {/* Tiêu đề thanh Giỏ Hàng */}
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <ShoppingCart className="w-5.5 h-5.5 text-cyan-600" />
                <span className="font-bold text-slate-900 font-sans">Giỏ Hàng Của Bạn</span>
                <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full font-mono">{cartItems.length}</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ruột chi tiết các mặt hàng có trong giỏ hàng */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.cart_item_id} className="flex space-x-3 pb-3.5 border-b border-gray-100 items-start">
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.product_name}
                    className="h-14 w-14 object-contain bg-gray-50 border rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                      {item.product?.product_name}
                    </h5>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">
                      Đơn giá: {item.unit_price.toLocaleString('vi-VN')} ₫
                    </p>

                    {/* Bộ tăng giảm số lượng mua */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateCartQuantity(item.cart_item_id, 'decrease')}
                        className="h-6 w-6 border rounded-md flex items-center justify-center text-xs hover:bg-gray-50 cursor-pointer text-slate-600"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-900 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQuantity(item.cart_item_id, 'increase')}
                        className="h-6 w-6 border rounded-md flex items-center justify-center text-xs hover:bg-gray-50 cursor-pointer text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => handleRemoveFromCart(item.cart_item_id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Gỡ mặt hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {(item.quantity * item.unit_price).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="py-24 text-center text-gray-400 font-light flex flex-col items-center justify-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-gray-250 animate-bounce" />
                  <p className="text-sm font-sans">Giỏ hàng của bạn đang trống!</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-bold cursor-pointer transition-colors"
                  >
                    Tiếp tục mua hàng
                  </button>
                </div>
              )}
            </div>

            {/* Tổng hóa đơn thanh toán giỏ hàng */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-150 space-y-3">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tiền hàng:</span>
                  <span className="font-mono">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Khuyến mãi giảm giá:</span>
                  <span className="font-mono text-emerald-600">-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Phí dịch vụ vận chuyển:</span>
                  <span className="font-mono text-slate-700">{checkoutShippingFee.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Thành tiền thanh toán:</span>
                  <span className="text-base font-extrabold text-red-600 font-mono">{cartTotalVal.toLocaleString('vi-VN')} ₫</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('checkout_flow');
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs shadow-cyan-100 text-sm transition-all text-center mt-3 animate-pulse"
                >
                  Xem giỏ hàng &amp; Đặt hàng ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- FORM 3: CHECKOUT ORDER CONFIRMATION MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl text-left" id="checkout_interactive_panel">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3.5 mb-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-cyan-600" />
                <span>Hoàn Tất Hồ Sơ Đơn Hàng</span>
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-slate-505 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center mb-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 pr-1.5" />
                  Địa chỉ nhận hàng (Bắt buộc) *
                </label>
                <input
                  type="text"
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Ghi rõ Số nhà, ngõ ngách, Quận Huyện và Tỉnh Thành Phố"
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-600 pr-1.5" />
                  Phương thức thanh toán lựa chọn *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                    checkoutPaymentMethod === 'cod' ? 'border-cyan-500 bg-cyan-50/20 text-cyan-800' : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={checkoutPaymentMethod === 'cod'}
                      onChange={() => setCheckoutPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">Thanh Toán Khi Giao (COD)</span>
                    <span className="text-[9px] text-gray-400 mt-1 block">Giao hàng thanh toán tiền mặt</span>
                  </label>

                  <label className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                    checkoutPaymentMethod === 'bank_transfer' ? 'border-cyan-500 bg-cyan-50/20 text-cyan-800' : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={checkoutPaymentMethod === 'bank_transfer'}
                      onChange={() => setCheckoutPaymentMethod('bank_transfer')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">Chuyển Khoản Trực Tiếp</span>
                    <span className="text-[9px] text-gray-400 mt-1 block">Quét QR Ngân Hàng giả lập</span>
                  </label>
                </div>
              </div>

              {/* Tóm tắt chi phí thanh toán cuối */}
              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1.5 border">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền đặt hàng thiết bị:</span>
                  <span className="font-mono font-bold text-slate-900">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá hội viên 2026:</span>
                  <span className="font-mono font-bold text-emerald-600">-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cước vận chuyển hàng:</span>
                  <span className="font-mono font-bold text-slate-800">{checkoutShippingFee.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-sm">
                  <span className="text-slate-950">Tổng thanh toán dự kiến:</span>
                  <span className="text-red-600 font-mono">{cartTotalVal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3.5">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-5 py-2 border rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Quay Lại Giỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Xác Nhận Thanh Toán Chốt Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORM 4: XEM NHANH CHI TIẾT SẢN PHẨM & RENDER REVIEW (QUICK VIEW PRODUCT DETAILS) --- */}
      {selectedProduct && currentView !== 'detail' && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl text-left flex flex-col relative" id="quick_view_modal_overlay">
            
            {/* Nút thoát modal */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer transition-colors z-30"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Cột trái: Ảnh sản phẩm to */}
              <div className="bg-gray-50 p-6 rounded-2xl border flex items-center justify-center h-72 md:h-96">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.product_name}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Cột phải: Chi tiết, đánh giá và cấu hình */}
              <div className="flex flex-col h-full self-stretch justify-between">
                <div>
                  <span className="text-[10px] bg-cyan-100 text-cyan-600 font-extrabold px-2 py-1 rounded-sm uppercase tracking-wider font-mono">
                    MÃ SKU: {selectedProduct.sku}
                  </span>
                  
                  <h3 className="text-xl font-bold text-slate-900 mt-2.5 mb-2 leading-snug">
                    {selectedProduct.product_name}
                  </h3>

                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-xl font-extrabold font-mono text-red-600">
                      {selectedProduct.price.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {(selectedProduct.price * 1.15).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed border-t border-b py-3 mb-4 font-sans">
                    {selectedProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-700 mb-4">
                    <p><strong>Thương hiệu:</strong> {getBrandName(selectedProduct.brand_id)}</p>
                    <p><strong>Loại danh mục:</strong> {getCategoryName(selectedProduct.category_id)}</p>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      <span className={`font-semibold ${selectedProduct.stock_quantity > 0 ? 'text-cyan-600' : 'text-red-500'}`}>
                        {selectedProduct.stock_quantity > 0 ? `Còn hàng (${selectedProduct.stock_quantity} sản phẩm)` : 'Hết hàng sẵn'}
                      </span>
                    </p>
                    <p><strong>Bảo hành:</strong> 24 Tháng hoàn tất</p>
                  </div>
                </div>

                {/* Nút bấm giỏ hàng ở dưới */}
                <div className="pt-4 border-t space-y-2.5">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock_quantity === 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                      selectedProduct.stock_quantity === 0
                        ? 'bg-gray-100 text-gray-400 border cursor-not-allowed'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md'
                    }`}
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    <span>Thêm nhanh sản phẩm vào giỏ hàng</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('detail');
                      setIsAdminView(false);
                      // Keep selectedProduct as is so the full detail page loads it!
                    }}
                    className="w-full py-2.5 bg-gray-150 hover:bg-gray-200 border border-gray-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span>Xem đầy đủ ảnh đa góc & thông số kỹ thuật</span>
                  </button>
                </div>
              </div>
            </div>

            {/* --- PHÂN ĐOẠN ĐÁNH GIÁ SẢN PHẨM KHÁCH HÀNG THẬT 100% --- */}
            <div className="border-t border-gray-150 mt-8 pt-6">
              <h4 className="text-sm font-bold text-slate-900 border-b border-gray-100 pb-2 mb-4">
                Khách Hàng Nói Gì Về Sản Phẩm ({activeProductReviews.length} Đánh giá)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Bình luận hiện tại đã có */}
                <div className="md:col-span-7 space-y-4 max-h-[220px] overflow-y-auto pr-2">
                  {activeProductReviews.map((rev) => (
                    <div key={rev.review_id} className="bg-slate-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">{rev.user_name}</span>
                        <div className="flex items-center space-x-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic leading-snug">"{rev.comment}"</p>
                      <span className="text-[9px] text-gray-400 block mt-1">Đánh giá vào tháng 06/2026</span>
                    </div>
                  ))}

                  {activeProductReviews.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-6 text-center">
                      Chưa có đánh giá kiểm duyệt nào cho mặt hàng này. Đóng vai khách hàng viết đánh giá đầu tiên ngay!
                    </p>
                  )}
                </div>

                {/* Khung Soạn Thảo Đánh Giá Sao */}
                <div className="md:col-span-5 bg-cyan-50/20 border border-cyan-100 rounded-xl p-4 text-xs">
                  <h5 className="font-bold text-cyan-800 mb-2">Để lại cảm nghĩ &amp; Đóng góp ý kiến</h5>
                  <form onSubmit={handleAddReviewSubmit} className="space-y-3">
                    {/* Chọn số sao */}
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Đánh giá chung:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((starNum) => (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => setReviewRating(starNum)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star
                              className={`w-4.5 h-4.5 ${
                                starNum <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Câu tóm tắt/comment */}
                    <input
                      type="text"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Bài viết của tivi/máy giặt rất đẹp, dùng êm ái thích..."
                      className="w-full p-2 border border-cyan-150 rounded-md text-xs bg-white focus:outline-hidden"
                      required
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-bold text-xs"
                    >
                      Xác Nhận Đăng Bình Luận
                    </button>
                  </form>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. AuthModal (Đăng ký / Đăng nhập có hiệu chỉnh đầu vào rộng lượng) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        allUsers={users}
        onAddUser={(newUser) => setUsers((prev) => [...prev, newUser])}
        onLoginSuccess={(user) => {
          handleSetCurrentUser(user);
          addToast(`Đăng nhập thành công dưới tư cách thành viên "${user.full_name}"!`, 'success');
          if (user.role_id === 1) {
            setIsAdminView(true);
            addToast('Chào mừng Quản trị viên quay trở lại tổng quan hệ thống Admin Dashboard!', 'info');
          } else {
            setIsAdminView(false);
          }
        }}
      />

      {/* 6. Custom Confirmation dialog box (Dành cho các hành động mang tính phá hủy) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl border border-gray-100 animate-slide-in" id="global_confirm_modal">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center uppercase tracking-wide border-b pb-2">
              <Info className="w-5 h-5 mr-1.5 text-amber-500 shrink-0" />
              <span>{confirmModal.title}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5 font-sans">
              {confirmModal.message}
            </p>
            <div className="flex justify-end space-x-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-gray-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer"
              >
                {confirmModal.cancelText || 'Hủy bỏ'}
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                }}
                className={`px-4 py-2 text-white text-xs font-semibold rounded-lg cursor-pointer ${
                  confirmModal.type === 'danger' ? 'bg-red-650 bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {confirmModal.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Floating Toast Alerts stack panel (Hoàn tác & Phản hồi mượt mà) */}
      <div className="fixed bottom-6 right-6 z-55 space-y-3 max-w-sm w-full flex flex-col items-end pointer-events-none" id="global_toast_container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-left flex items-start justify-between w-full transition-all duration-300 transform translate-y-0 ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              t.type === 'info' ? 'bg-cyan-50 border-cyan-200 text-cyan-900' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex-1 text-xs font-medium pr-3 flex items-start space-x-1.5">
              <span className="shrink-0 mt-0.5">
                {t.type === 'success' ? '✔' : t.type === 'info' ? 'ℹ' : '⚠'}
              </span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-gray-400 hover:text-gray-650 ml-1.5 cursor-pointer text-[10px]"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 4. Footer component (Bộ khung chân website cuối) */}
      <Footer />
    </div>
  );
}
