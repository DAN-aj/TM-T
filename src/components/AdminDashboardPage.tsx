/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  AlertCircle, 
  Calendar, 
  Download, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Info,
  CheckCircle2,
  Trash2,
  Edit3,
  Server,
  Eye,
  ShieldCheck,
  Lock,
  Plus,
  Tag,
  Search,
  Filter,
  Truck,
  Mail,
  RefreshCw,
  Clock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

// =========================================================================================
// I. ĐỊNH NGHĨA PHÂN LOẠI KIỂU DỮ LIỆU ĐỂ ĐẢM BẢO TYPE SAFETY (TYPING SCHEMAS)
// =========================================================================================

// Kiểu dữ liệu Sản phẩm
interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description: string;
  images: string[]; // Chứa đường dẫn ảnh đa chiều
}

// Kiểu dữ liệu Coupon giảm giá
interface Coupon {
  code: string;
  discountPercent: number;
  expiryDate: string;
  minOrderValue: number; // Điều kiện áp dụng
}

// Kiểu dữ liệu Đơn hàng
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  products: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: 'COD' | 'QR';
  status: 'Chờ xác nhận' | 'Đóng gói' | 'Vận chuyển' | 'Hoàn thành' | 'Đã hủy';
  cancelReason?: string; // Lý do hủy nếu có
  trackingNumber?: string; // Mã vận đơn giả lập sinh ra khi gửi API vận chuyển
}

import { User as UserType, Order as OrderType, Product as ProductType } from '../types';

interface AdminDashboardPageProps {
  users?: UserType[];
  onUsersChange?: (updatedUsers: UserType[]) => void;
  orders?: OrderType[];
  onOrdersChange?: (updatedOrders: OrderType[]) => void;
  products?: ProductType[];
  onProductsChange?: (updatedProducts: ProductType[]) => void;
}

// Kiểu dữ liệu Người dùng
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'Chờ phê duyệt' | 'Hoạt động' | 'Đã khóa';
  registeredAt: string;
}

function mapAppUserToAdminUser(u: UserType): User {
  let adminStatus: 'Chờ phê duyệt' | 'Hoạt động' | 'Đã khóa' = 'Chờ phê duyệt';
  if (u.role_id === 1 || u.status === 'active') {
    adminStatus = 'Hoạt động';
  } else if (u.status === 'inactive') {
    adminStatus = 'Đã khóa';
  } else if (u.status === 'pending') {
    adminStatus = 'Chờ phê duyệt';
  }
  return {
    id: String(u.user_id),
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    status: adminStatus,
    registeredAt: u.created_at ? u.created_at.replace('T', ' ').substring(0, 16) : '2026-06-02 00:00'
  };
}

function mapAdminUserToAppUser(u: User, originalUsers: UserType[]): UserType {
  const existing = originalUsers.find(ou => String(ou.user_id) === u.id);
  let appStatus: 'active' | 'inactive' | 'pending' = 'pending';
  if (u.status === 'Hoạt động') {
    appStatus = 'active';
  } else if (u.status === 'Đã khóa') {
    appStatus = 'inactive';
  } else if (u.status === 'Chờ phê duyệt') {
    appStatus = 'pending';
  }
  return {
    user_id: Number(u.id),
    role_id: existing ? existing.role_id : 2,
    full_name: u.fullName,
    email: u.email,
    phone: u.phone,
    status: appStatus,
    created_at: existing ? existing.created_at : new Date().toISOString()
  };
}

function mapAppOrderToAdminOrder(o: OrderType, allUsers: UserType[]): Order {
  const customer = allUsers.find(u => u.user_id === o.user_id);
  let status: 'Chờ xác nhận' | 'Đóng gói' | 'Vận chuyển' | 'Hoàn thành' | 'Đã hủy' = 'Chờ xác nhận';
  if (o.order_status === 'processing') status = 'Đóng gói';
  else if (o.order_status === 'shipped') status = 'Vận chuyển';
  else if (o.order_status === 'delivered') status = 'Hoàn thành';
  else if (o.order_status === 'cancelled') status = 'Đã hủy';

  return {
    id: `DH-${o.order_id}`,
    customerName: customer ? customer.full_name : 'Khách Vãng Lai',
    customerEmail: customer ? customer.email : 'guest@example.com',
    date: o.created_at ? o.created_at.substring(0, 10) : '2026-06-02',
    products: [
      { productName: 'Thiết bị điện máy cao cấp', quantity: 1, price: o.total_amount }
    ],
    totalAmount: o.total_amount,
    paymentMethod: o.payment_status === 'paid' ? 'QR' : 'COD',
    status: status
  };
}

function mapAdminOrderToAppOrder(o: Order, originalOrders: OrderType[]): OrderType {
  const numericId = Number(o.id.replace('DH-', ''));
  const existing = originalOrders.find(oo => oo.order_id === numericId);
  let order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
  if (o.status === 'Đóng gói') order_status = 'processing';
  else if (o.status === 'Vận chuyển') order_status = 'shipped';
  else if (o.status === 'Hoàn thành') order_status = 'delivered';
  else if (o.status === 'Đã hủy') order_status = 'cancelled';

  return {
    order_id: numericId,
    user_id: existing ? existing.user_id : 0,
    subtotal: o.totalAmount,
    discount_amount: existing ? existing.discount_amount : 0,
    shipping_fee: existing ? existing.shipping_fee : 0,
    total_amount: o.totalAmount,
    order_status: order_status,
    payment_status: o.paymentMethod === 'QR' ? 'paid' : 'pending',
    shipping_address: existing ? existing.shipping_address : 'Địa chỉ khách hàng',
    created_at: existing ? existing.created_at : new Date().toISOString()
  };
}

function mapAppProductToAdminProduct(p: ProductType): Product {
  return {
    id: p.product_id,
    name: p.product_name,
    category: p.category || 'Thiết bị điện máy',
    brand: p.brand || 'Khác',
    price: p.price,
    stock: p.stock_quantity,
    description: p.description,
    images: p.image_url ? [p.image_url] : ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=300']
  };
}

function mapAdminProductToAppProduct(p: Product, originalProducts: ProductType[]): ProductType {
  const existing = originalProducts.find(op => op.product_id === p.id);
  const stock_quantity = p.stock;
  return {
    product_id: p.id,
    category_id: existing ? existing.category_id : 1,
    brand_id: existing ? existing.brand_id : 1,
    sku: existing ? existing.sku : `SKU-${p.id}`,
    product_name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    stock_quantity: stock_quantity,
    description: p.description,
    status: stock_quantity <= 0 ? 'out_of_stock' : 'available',
    avg_rating: existing ? existing.avg_rating : 5,
    image_url: p.images[0] || 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=300'
  };
}

export default function AdminDashboardPage(props: AdminDashboardPageProps) {
  // =========================================================================================
  // II. KHAI BÁO CÁC MẢNG DỮ LIỆU MẪU CỐT LÕI (MOCK DATA)
  // =========================================================================================

  // 1. Dữ liệu mẫu Sản phẩm ban đầu - Đồng bộ từ trung tâm hệ thống (props)
  const [products, setProducts] = useState<Product[]>(() => {
    if (props.products) {
      return props.products.map(mapAppProductToAdminProduct);
    }
    return [
      {
        id: 1,
        name: 'Smart Tivi Samsung Neo QLED 4K 65 inch',
        category: 'Điện tử',
        brand: 'Samsung',
        price: 24900000,
        stock: 12,
        description: 'Màn hình Quantum Mini LED siêu sáng, bộ xử lý Neo Quantum 4K AI thông minh.',
        images: [
          'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=300',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=300'
        ]
      },
      {
        id: 2,
        name: 'Tủ lạnh LG Inverter 400 Lít Ngăn đá dưới',
        category: 'Gia dụng',
        brand: 'LG',
        price: 15400000,
        stock: 3, // Sẽ tự kích hoạt "Cảnh báo hết hàng" đỏ nhấp nháy vì dưới 5
        description: 'Công nghệ DoorCooling làm lạnh từ cánh cửa tủ, Inverter tiết kiệm điện vượt trội.',
        images: ['https://images.unsplash.com/photo-1571175452281-0161747eed5d?auto=format&fit=crop&q=80&w=300']
      },
      {
        id: 3,
        name: 'Máy hút bụi Bosch Serie 6 không dây lực hút bão táp',
        category: 'Gia dụng',
        brand: 'Bosch',
        price: 8900000,
        stock: 15,
        description: 'Động cơ siêu bền, pin sạc nhanh Lithium-ion, thiết kế gọn nhẹ cầm tay linh hoạt.',
        images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=300']
      },
      {
        id: 4,
        name: 'Nồi chiên không dầu Philips Premium XXL 7.3L',
        category: 'Thiết bị nhà bếp',
        brand: 'Philips',
        price: 6200000,
        stock: 2, // Kích hoạt cảnh báo hết hàng vì tồn kho = 2 (< 5)
        description: 'Công nghệ Twin TurboStar loại bỏ đến 90% dầu mỡ dư thừa, dung tích khổng lồ.',
        images: ['https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=300']
      }
    ];
  });

  // 2. Dữ liệu mẫu Chương trình khuyến mãi (Coupons)
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'ELECTRO500', discountPercent: 10, expiryDate: '2026-06-30', minOrderValue: 5000000 },
    { code: 'GIADUNGSUPER', discountPercent: 15, expiryDate: '2026-07-15', minOrderValue: 10000000 },
    { code: 'SUMMER2026', discountPercent: 5, expiryDate: '2026-08-31', minOrderValue: 2000000 }
  ]);

  // 3. Dữ liệu mẫu Đơn hàng (Orders) - Đồng bộ từ trung tâm hệ thống (props)
  const [orders, setOrders] = useState<Order[]>(() => {
    if (props.orders && props.users) {
      return props.orders.map(o => mapAppOrderToAdminOrder(o, props.users || []));
    }
    return [
      {
        id: 'DH-5011',
        customerName: 'Nguyễn Văn Hải',
        customerEmail: 'hai.nguyen@gmail.com',
        date: '2026-06-02',
        products: [
          { productName: 'Smart Tivi Samsung Neo QLED 4K 65 inch', quantity: 1, price: 24900000 }
        ],
        totalAmount: 24900000,
        paymentMethod: 'QR',
        status: 'Chờ xác nhận'
      },
      {
        id: 'DH-5012',
        customerName: 'Trần Thị Mai',
        customerEmail: 'mai.tran@yahoo.com',
        date: '2026-06-01',
        products: [
          { productName: 'Nồi chiên không dầu Philips Premium XXL 7.3L', quantity: 2, price: 6200000 }
        ],
        totalAmount: 12400000,
        paymentMethod: 'COD',
        status: 'Đóng gói'
      },
      {
        id: 'DH-5013',
        customerName: 'Lê Hoàng Dương',
        customerEmail: 'duong.lh@gmail.com',
        date: '2026-05-28',
        products: [
          { productName: 'Tủ lạnh LG Inverter 400 Lít Ngăn đá dưới', quantity: 1, price: 15400000 }
        ],
        totalAmount: 15400000,
        paymentMethod: 'QR',
        status: 'Hoàn thành',
        trackingNumber: 'Vận đơn-7729103'
      }
    ];
  });

  // 4. Dữ liệu mẫu Người dùng (Users) - Đồng bộ từ trung tâm hệ thống (props)
  const [users, setUsers] = useState<User[]>(() => {
    if (props.users) {
      return props.users.map(mapAppUserToAdminUser);
    }
    return [
      {
        id: '2',
        fullName: 'Trần Thị Khách Hàng',
        email: 'customer@electro.com',
        phone: '0912345678',
        status: 'Hoạt động',
        registeredAt: '2026-02-15 10:30'
      }
    ];
  });

  React.useEffect(() => {
    if (props.users) {
      setUsers(props.users.map(mapAppUserToAdminUser));
    }
  }, [props.users]);

  React.useEffect(() => {
    if (props.products) {
      setProducts(props.products.map(mapAppProductToAdminProduct));
    }
  }, [props.products]);

  React.useEffect(() => {
    if (props.orders && props.users) {
      setOrders(props.orders.map(o => mapAppOrderToAdminOrder(o, props.users || [])));
    }
  }, [props.orders, props.users]);

  // =========================================================================================
  // III. QUẢN LÝ CÁC TRẠNG THÁI HIỂN THỊ (VIEW STATES)
  // =========================================================================================
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'users'>('analytics');
  
  // Trạng thái bộ lọc thời gian ở Top Control Bar
  const [timeframe, setTimeframe] = useState<string>('month'); // Hôm nay (day), Tuần này (week), Tháng này (month), Tùy chỉnh (custom)
  const [customDates, setCustomDates] = useState({ 
    start: '2026-05-15', 
    end: '2026-06-02' 
  });

  // Trạng thái tương tác biểu đồ
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // =========================================================================================
  // IV. LOGIC NGHIỆP VỤ 1: QUẢN LÝ SẢN PHẨM, KHO, COUPON
  // =========================================================================================
  
  // State phục vụ form Thêm mới / Sửa chữa sản phẩm
  const [productForm, setProductForm] = useState<{
    id?: number;
    name: string;
    category: 'Điện tử' | 'Gia dụng' | 'Thiết bị nhà bếp';
    brand: string;
    price: number;
    stock: number;
    description: string;
    imageInput: string;
    imagesList: string[];
  }>({
    name: '',
    category: 'Điện tử',
    brand: '',
    price: 0,
    stock: 0,
    description: '',
    imageInput: '',
    imagesList: []
  });

  // Trạng thái chỉnh sửa / thêm mới sản phẩm
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [productFormMsg, setProductFormMsg] = useState<string>('');

  // Sửa chữa sản phẩm: Nạp dữ liệu sản phẩm có sẵn vào Form để chỉnh sửa
  const handleEditProductClick = (prod: Product) => {
    setIsEditingProduct(true);
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: prod.price,
      stock: prod.stock,
      description: prod.description,
      imageInput: '',
      imagesList: [...prod.images]
    });
    setProductFormMsg('Nhập điều chỉnh dữ liệu cho sản phẩm #' + prod.id);
  };

  // Reset form sản phẩm
  const handleResetProductForm = () => {
    setIsEditingProduct(false);
    setProductForm({
      name: '',
      category: 'Điện tử',
      brand: '',
      price: 0,
      stock: 0,
      description: '',
      imageInput: '',
      imagesList: []
    });
    setProductFormMsg('');
  };

  // Thêm ảnh vào mảng ảnh đa chiều của sản phẩm
  const handleAddProductImage = () => {
    if (productForm.imageInput.trim()) {
      setProductForm(prev => ({
        ...prev,
        imagesList: [...prev.imagesList, prev.imageInput.trim()],
        imageInput: ''
      }));
    }
  };

  // Xóa ảnh khỏi mảng ảnh đa chiều
  const handleRemoveProductImage = (indexToRemove: number) => {
    setProductForm(prev => ({
      ...prev,
      imagesList: prev.imagesList.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Lưu hoặc cập nhật sản phẩm
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setProductFormMsg('Lỗi: Tên sản phẩm không được trống');
      return;
    }

    // Luôn đảm bảo mảng ảnh có ít nhất một ảnh mặc định nếu để trống
    const finalImages = productForm.imagesList.length > 0 
      ? productForm.imagesList 
      : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300'];

    let nextProducts: Product[] = [];
    if (isEditingProduct && productForm.id) {
      // Cập nhật sản phẩm có sẵn bằng hàm map của mảng
      setProducts(prev => {
        const res = prev.map(p => p.id === productForm.id ? {
          ...p,
          name: productForm.name,
          category: productForm.category,
          brand: productForm.brand,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          description: productForm.description,
          images: finalImages
        } : p);
        nextProducts = res;
        return res;
      });
      setProductFormMsg('Thành công: Đã cập nhật sản phẩm #' + productForm.id);
    } else {
      // Tạo sản phẩm mới
      const newProduct: Product = {
        id: Date.now(),
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        description: productForm.description,
        images: finalImages
      };
      setProducts(prev => {
        const res = [newProduct, ...prev];
        nextProducts = res;
        return res;
      });
      setProductFormMsg('Thành công: Đã thêm mới sản phẩm thành công');
    }

    if (props.onProductsChange && props.products) {
      setTimeout(() => {
        props.onProductsChange?.(nextProducts.map(p => mapAdminProductToAppProduct(p, props.products || [])));
      }, 0);
    }

    handleResetProductForm();
  };

  // Xóa sản phẩm khỏi mảng
  const handleDeleteProduct = (id: number) => {
    if (confirm('Xác nhận xóa bỏ vĩnh viễn sản phẩm này khỏi hệ thống?')) {
      let nextProducts: Product[] = [];
      setProducts(prev => {
        const res = prev.filter(p => p.id !== id);
        nextProducts = res;
        return res;
      });

      if (props.onProductsChange && props.products) {
        setTimeout(() => {
          props.onProductsChange?.(nextProducts.map(p => mapAdminProductToAppProduct(p, props.products || [])));
        }, 0);
      }
    }
  };

  // State phục vụ form Tạo Coupon Khuyến mãi mới
  const [couponForm, setCouponForm] = useState<Coupon>({
    code: '',
    discountPercent: 10,
    expiryDate: '2026-06-30',
    minOrderValue: 2000000
  });
  const [couponFormMsg, setCouponFormMsg] = useState<string>('');

  // Lưu Coupon mới
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      setCouponFormMsg('Mã code không được bỏ trống');
      return;
    }
    const safeCode = couponForm.code.toUpperCase().trim();
    // Kiểm tra trùng lặp mã bằng find
    if (coupons.find(c => c.code === safeCode)) {
      setCouponFormMsg('Mã giảm giá này đã tồn tại');
      return;
    }

    setCoupons(prev => [
      {
        code: safeCode,
        discountPercent: Number(couponForm.discountPercent),
        expiryDate: couponForm.expiryDate,
        minOrderValue: Number(couponForm.minOrderValue)
      },
      ...prev
    ]);

    setCouponFormMsg(`Đã tạo mã ${safeCode} thành công!`);
    setCouponForm({ code: '', discountPercent: 10, expiryDate: '2026-06-30', minOrderValue: 2000000 });
  };

  // Xóa Coupon
  const handleDeleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  };


  // =========================================================================================
  // V. LOGIC NGHIỆP VỤ 2: QUẢN LÝ ĐƠN HÀNG VÀ TÍCH HỢP DOANH THU BIỂU ĐỒ
  // =========================================================================================

  // Các điều kiện lọc đơn hàng (Order filters state)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Tất cả');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('Tất cả');
  const [orderSearchKeyword, setOrderSearchKeyword] = useState<string>('');

  // Lọc thông minh mảng đơn hàng bằng method useMemo
  const filteredOrders = useMemo(() => {
    // Trả ra mảng đã qua xử lý lọc
    return orders.filter(order => {
      const matchStatus = orderStatusFilter === 'Tất cả' || order.status === orderStatusFilter;
      const matchPayment = orderPaymentFilter === 'Tất cả' || order.paymentMethod === orderPaymentFilter;
      const matchText = orderSearchKeyword.trim() === '' || 
        order.id.toLowerCase().includes(orderSearchKeyword.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearchKeyword.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(orderSearchKeyword.toLowerCase());

      return matchStatus && matchPayment && matchText;
    });
  }, [orders, orderStatusFilter, orderPaymentFilter, orderSearchKeyword]);

  // State phục vụ việc hủy đơn hàng (lưu ID đơn hàng và lý do hủy)
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState<string>('Khách đổi ý / Không muốn mua nữa');

  // Chuyển đổi trạng thái đơn hàng nâng cao (Xác nhận -> Đóng gói -> Vận chuyển -> Hoàn thành)
  const handleTransitionOrderStatus = (orderId: string) => {
    let nextOrders: Order[] = [];
    setOrders(prev => {
      const res = prev.map(o => {
        if (o.id !== orderId) return o;
        let nextStatus = o.status;
        if (o.status === 'Chờ xác nhận') nextStatus = 'Đóng gói';
        else if (o.status === 'Đóng gói') nextStatus = 'Vận chuyển';
        else if (o.status === 'Vận chuyển') nextStatus = 'Hoàn thành';
        return { ...o, status: nextStatus };
      });
      nextOrders = res;
      return res;
    });

    if (props.onOrdersChange && props.orders) {
      setTimeout(() => {
        props.onOrdersChange?.(nextOrders.map(o => mapAdminOrderToAppOrder(o, props.orders || [])));
      }, 0);
    }
  };

  // Xác nhận hủy đơn hàng kèm thông tin lý do cụ thể
  const handleConfirmCancelOrder = () => {
    if (!cancelingOrderId) return;
    let nextOrders: Order[] = [];
    setOrders(prev => {
      const res = prev.map(o => {
        if (o.id === cancelingOrderId) {
          return { ...o, status: 'Đã hủy', cancelReason: cancelReasonText };
        }
        return o;
      });
      nextOrders = res;
      return res;
    });

    if (props.onOrdersChange && props.orders) {
      setTimeout(() => {
        props.onOrdersChange?.(nextOrders.map(o => mapAdminOrderToAppOrder(o, props.orders || [])));
      }, 0);
    }
    setCancelingOrderId(null);
  };

  // Giả lập gửi API vận chuyển và lấy về mã vận đơn tự động
  const handleSendToCarrierAPI = (orderId: string) => {
    const randomTracking = `Vận đơn-${Math.floor(1000000 + Math.random() * 9000000)}`;
    let nextOrders: Order[] = [];
    setOrders(prev => {
      const res = prev.map(o => {
        if (o.id === orderId) {
          return { ...o, trackingNumber: randomTracking };
        }
        return o;
      });
      nextOrders = res;
      return res;
    });

    if (props.onOrdersChange && props.orders) {
      setTimeout(() => {
        props.onOrdersChange?.(nextOrders.map(o => mapAdminOrderToAppOrder(o, props.orders || [])));
      }, 0);
    }
    alert(`[Hệ thống] Đã đồng bộ API sang Giao Hàng Nhanh thành công. Mã vận đơn đã gán: ${randomTracking}`);
  };

  // =========================================================================================
  // TÍCH HỢP TÀI CHÍNH TỐT: Doanh thu thực tế chỉ tính trên các đơn hàng đã 'Hoàn thành'
  // =========================================================================================
  const completedOrdersRevenue = useMemo(() => {
    // Tính tổng tiền dựa trên các mặt hàng có trạng thái Hoàn thành
    return orders
      .filter(o => o.status === 'Hoàn thành')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);


  // =========================================================================================
  // SƠ ĐỒ BIẾN ĐỘNG DOANH THU (BIỂU ĐỒ CỘT) DỰA TRÊN LỰA CHỌN CHU KỲ (TIMEFRAME) VÀ MÃ ĐƠN HOÀN THÀNH
  // Sử dụng cấu trúc CSS Flexbox/Grid thuần để tối ưu không bị lỗi thư viện
  // =========================================================================================
  const chartData = useMemo(() => {
    // Tính toán lại biểu đồ dựa trên điều kiện thời gian.
    // Nếu doanh thu từ đơn hàng hoàn thành thay đổi, chúng ta cộng nó vào biểu đồ để biểu thị tính tích hợp
    const baseAmountAddition = completedOrdersRevenue / 5; // Chia đều tăng tích hợp biểu thị

    if (timeframe === 'day') {
      return [
        { label: '08:00', amount: 4800000 + baseAmountAddition * 0.1 },
        { label: '12:00', amount: 9200000 + baseAmountAddition * 0.2 },
        { label: '16:00', amount: 15400000 + baseAmountAddition * 0.4 },
        { label: '20:00', amount: 8200000 + baseAmountAddition * 0.2 },
        { label: '22:00', amount: 3500000 + baseAmountAddition * 0.1 }
      ];
    } else if (timeframe === 'week') {
      return [
        { label: 'Thứ Hai', amount: 12000000 + baseAmountAddition * 0.15 },
        { label: 'Thứ Tư', amount: 31000000 + baseAmountAddition * 0.3 },
        { label: 'Thứ Sáu', amount: 24000000 + baseAmountAddition * 0.2 },
        { label: 'Chủ Nhật', amount: 48000000 + baseAmountAddition * 0.35 }
      ];
    } else if (timeframe === 'custom') {
      return [
        { label: 'Đầu kỳ', amount: 15000000 + baseAmountAddition * 0.3 },
        { label: 'Giữa kỳ', amount: 38000000 + baseAmountAddition * 0.4 },
        { label: 'Cuối kỳ', amount: 22000000 + baseAmountAddition * 0.3 }
      ];
    } else {
      // Mặc định là Tháng này (month)
      return [
        { label: 'Tuần 1', amount: 18000000 + baseAmountAddition * 0.15 },
        { label: 'Tuần 2', amount: 35000000 + baseAmountAddition * 0.25 },
        { label: 'Tuần 3', amount: 12000000 + baseAmountAddition * 0.1 },
        { label: 'Tuần 4', amount: 56000000 + baseAmountAddition * 0.5 }
      ];
    }
  }, [timeframe, completedOrdersRevenue]);

  // Tìm giá trị cao nhất trong cột đồ thị để lập tỷ lệ chiều cao trực quan phù hợp
  const maxRevenueValue = useMemo(() => {
    const vals = chartData.map(d => d.amount);
    return Math.max(...vals, 100000); 
  }, [chartData]);


  // =========================================================================================
  // VI. LOGIC NGHIỆP VỤ 3: QUẢN LÝ NGƯỜI DÙNG & GỬI THÔNG BÁO EMAIL
  // =========================================================================================
  const [userSearchText, setUserSearchText] = useState<string>('');

  // Lọc người dùng theo từ khóa: Email, Số điện thoại hoặc tên đầy đủ
  const filteredUsers = useMemo(() => {
    return users.filter(usr => {
      const kw = userSearchText.trim().toLowerCase();
      if (kw === '') return true;
      return usr.fullName.toLowerCase().includes(kw) || 
             usr.email.toLowerCase().includes(kw) || 
             usr.phone.includes(kw);
    });
  }, [users, userSearchText]);

  // Phê duyệt tài khoản mới (Chờ phê duyệt -> Hoạt động)
  const handleApproveUser = (userId: string) => {
    let nextUsers: User[] = [];
    setUsers(prev => {
      const res = prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'Hoạt động' as const };
        }
        return u;
      });
      nextUsers = res;
      return res;
    });
    alert(`[Hệ thống] Đã phê duyệt tài khoản thành viên thành công!`);
    
    if (props.onUsersChange && props.users) {
      setTimeout(() => {
        props.onUsersChange?.(nextUsers.map(u => mapAdminUserToAppUser(u, props.users || [])));
      }, 0);
    }
  };

  // Toggle Kích hoạt hoặc Khóa tài khoản vi phạm chính sách
  const handleToggleBlockUser = (userId: string) => {
    let nextUsers: User[] = [];
    setUsers(prev => {
      const res = prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Đã khóa' ? 'Hoạt động' as const : 'Đã khóa' as const;
          return { ...u, status: nextStatus };
        }
        return u;
      });
      nextUsers = res;
      return res;
    });

    if (props.onUsersChange && props.users) {
      setTimeout(() => {
        props.onUsersChange?.(nextUsers.map(u => mapAdminUserToAppUser(u, props.users || [])));
      }, 0);
    }
  };

  // Giả lập gửi thông báo email tự động khi trạng thái tài khoản thay đổi
  const handleSendAccountEmail = (user: User) => {
    alert(`[GỬI MAIL THÀNH CÔNG]
To: ${user.fullName} <${user.email}>
Subject: Cập nhật trạng thái tài khoản mua sắm tại ELECTRO2026
Nội dung: Trạng thái tài khoản của bạn hiện tại là: ${user.status}. Vui lòng liên hệ hỗ trợ nếu cần thêm thông tin.`);
  };

  // =========================================================================================
  // VII. LẬP BÁO CÁO THỜI GIAN THỰC ĐỂ KẾT XUẤT CSV / EXCEL GIẢ LẬP
  // =========================================================================================
  const handleExportExcel = () => {
    alert('[Hệ thống] Hệ thống đã kết xuất tệp tin "Báo cáo doanh thu & sản phẩm tối ưu chuỗi cung ứng ELECTRO_' + timeframe.toUpperCase() + '.xlsx" thành công. Tự động mã hóa tàng trữ an an toàn.');
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans" id="master_admin_dashboard_layout">
      
      {/* =========================================================================================
          1. SIDEBAR CỐ ĐINH BÊN TRÁI (SLATE-950 SECURE ARCHITECTURE)
         ========================================================================================= */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between" id="sidebar_container">
        
        {/* Phần Logo và định danh hệ thống */}
        <div>
          <div className="p-6 border-b border-slate-900">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-xl shadow-lg">
                <ShieldAlert className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-wider">ELECTRO MASTER</h1>
                <p className="text-[10px] text-cyan-400 font-bold font-mono tracking-widest">ADMIN SECURE V2.9</p>
              </div>
            </div>
          </div>

          {/* Danh mục các tabs quản trị */}
          <nav className="p-4 space-y-1" id="sidebar_nav_links">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-widest">Nghiệp vụ tổng đài</p>
            
            {/* Tab 1: Tổng quan chiến lược */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all justify-start ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BarChart3 size={16} />
              <span>Tổng quan & Báo cáo</span>
            </button>

            {/* Tab 2: Quản lý sản phẩm & Kho */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all justify-start ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>Quản lý sản phẩm & Kho</span>
            </button>

            {/* Tab 3: Quản lý đơn hàng */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all justify-start ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ShoppingCart size={16} />
              <div className="flex justify-between items-center w-full">
                <span>Quản lý đơn hàng</span>
                <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {orders.filter(o => o.status === 'Chờ xác nhận').length} mới
                </span>
              </div>
            </button>

            {/* Tab 4: Quản lý người dùng */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all justify-start ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Users size={16} />
              <div className="flex justify-between items-center w-full">
                <span>Quản lý người dùng</span>
                <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {users.filter(u => u.status === 'Chờ phê duyệt').length}
                </span>
              </div>
            </button>

          </nav>
        </div>

        {/* Thông tin giấy phép bảo mật & người vận hành */}
        <div className="p-4 border-t border-slate-900">
          <div className="flex items-center space-x-3 p-2 bg-slate-900/60 rounded-xl">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold">Super Admin Live</p>
              <p className="text-[9px] text-slate-500 font-mono">14.161.42.105</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 text-center mt-3 font-mono">Secured by AES-256 System</p>
        </div>

      </aside>

      {/* =========================================================================================
          2. KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH BÊN PHẢI (MAIN WORKSPACE FLUID-SLATE-900)
         ========================================================================================= */}
      <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto" id="main_workspace_container">
        
        {/* TOP CONTROL BAR: PHÂN PHỐI BỘ LỌC THỜI GIAN ĐA CẤP & KHU VỰC XUẤT FILE */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl" id="top_control_filter_bar">
          <div>
            <span className="text-xs font-black uppercase text-cyan-400 tracking-widest font-mono">Hệ thống Điều hành Master</span>
            <h2 className="text-xl font-extrabold text-white">
              {activeTab === 'analytics' && 'Tổng quan Chiến lược & Báo cáo'}
              {activeTab === 'products' && 'Quản lý Sản phẩm, Tồn kho & Sự kiện'}
              {activeTab === 'orders' && 'Hành lang Quản lý Đơn hàng Quốc gia'}
              {activeTab === 'users' && 'Quản trị Hồ sơ & Phê duyệt Thành viên'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Combo-box chọn thời kỳ báo cáo */}
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-transparent text-slate-250 text-xs font-bold outline-none cursor-pointer text-white"
              >
                <option value="day" className="bg-slate-950 text-slate-300">Hôm nay</option>
                <option value="week" className="bg-slate-950 text-slate-300">Tuần này</option>
                <option value="month" className="bg-slate-950 text-slate-300">Tháng này</option>
                <option value="custom" className="bg-slate-950 text-slate-300">Tùy chỉnh ngày</option>
              </select>
            </div>

            {/* Hiển thị form ngày tùy chọn nếu timeframe là 'custom' */}
            {timeframe === 'custom' && (
              <div className="flex items-center space-x-1 bg-slate-900 py-1 px-2 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-transparent border-0 outline-none text-white font-mono cursor-pointer"
                />
                <span className="text-slate-500">→</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-transparent border-0 outline-none text-white font-mono cursor-pointer"
                />
              </div>
            )}

            {/* Nút xuất file Excel có icon Download chuẩn chỉ */}
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 transition-all text-xs font-bold text-white shadow-sm cursor-pointer"
              title="Xuất file XLSX tàng trữ hóa"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file Excel</span>
            </button>
          </div>
        </div>


        {/* =========================================================================================
            TAB 1: TỔNG QUAN CHIẾN LƯỢC & BÁO CÁO (ANALYTICS SCREEN)
           ========================================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6" id="tab_analytics_content">
            
            {/* KPI FINANCIAL STRATEGY BLOCK (3 Cột) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cột 1: Tổng doanh thu thuần */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh thu thuần lũy kế</p>
                  <p className="text-2xl font-black text-cyan-400 mt-2 font-mono">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(completedOrdersRevenue + 85400000)}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center mt-1">
                    <TrendingUp size={12} className="mr-1" />
                    +12.4% so với kỳ trước
                  </span>
                </div>
                <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>

              {/* Cột 2: Sản lượng đơn hàng */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sản lượng đơn hàng</p>
                  <p className="text-2xl font-black text-white mt-2 font-mono">
                    {orders.length} hóa đơn
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center mt-1">
                    <TrendingUp size={12} className="mr-1" />
                    +4.2% duy trì ổn định
                  </span>
                </div>
                <div className="p-3 bg-teal-950 text-teal-400 rounded-xl">
                  <ShoppingCart size={24} />
                </div>
              </div>

              {/* Cột 3: Khách hàng đăng ký mới */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Khách hàng hoạt động</p>
                  <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">
                    {users.length} tài khoản
                  </p>
                  <span className="text-[10px] text-cyan-400 font-semibold flex items-center mt-1">
                    <CheckCircle2 size={12} className="mr-1" />
                    Tỷ lệ hoạt động 100%
                  </span>
                </div>
                <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl">
                  <Users size={24} />
                </div>
              </div>

            </div>

            {/* REVENUE GRAPH - SƠ ĐỒ BIẾN ĐỘNG DOANH THU (CSS PURE FLEXBOX/GRID GRAPH) */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Biểu đồ biến động doanh thu thuần điện máy</h3>
                  <p className="text-xs text-slate-400">Trực quan hóa lượng tiền giao dịch lướt theo chu kỳ <span className="font-bold text-cyan-400">{timeframe.toUpperCase()}</span></p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                  <span className="w-3 h-3 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-sm"></span>
                  <span>Doanh số ước tính dựa theo hóa đơn hoàn thành</span>
                </div>
              </div>

              {/* Grid đồ thị */}
              <div className="h-64 flex items-end justify-between gap-4 border-b border-l border-slate-800 pb-2 pl-4 pt-4 relative">
                
                {/* Lưới ngang định hướng số tiền */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-900 border-dashed pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-900 border-dashed pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-900 border-dashed pointer-events-none"></div>

                {chartData.map((data, idx) => {
                  const percentOfHeight = (data.amount / maxRevenueValue) * 100;
                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip hiển thị số tiền chính xác khi hover vào cột */}
                      {hoveredBarIndex === idx && (
                        <div className="absolute top-0 z-20 bg-slate-950 border border-indigo-500 text-[10px] text-cyan-400 font-extrabold font-mono py-1 px-2.5 rounded-lg shadow-xl -translate-y-8 animate-bounce whitespace-nowrap">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)}
                        </div>
                      )}

                      {/* Thân cột biểu đồ Gradient Indigo-Cyan bo góc trên đầu */}
                      <div 
                        className="w-full max-w-[32px] bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-t-lg transition-all duration-300 group-hover:brightness-125 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        style={{ height: `${percentOfHeight}%` }}
                      ></div>

                      {/* Nhãn nhãn trục X */}
                      <span className="text-[10px] font-bold text-slate-500 mt-2 whitespace-nowrap font-mono">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SPLIT GRID LAYOUT (2 CỘT SONG SONG): ĐIỀU PHỐI CHUỖI CUNG ỨNG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CỘT BÊN TRÁI: TOP SẢN PHẨM BÁN CHẠY (GREEN GREEN GROW) */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Top sản phẩm tối ưu tài chính (Bán Chạy)</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full">TIÊU THỤ MẠNH NHẤT</span>
                </div>

                <div className="space-y-4">
                  {products.slice(0, 2).map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 hover:border-slate-850 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={prod.images[0]} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-800" 
                          alt="Product"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Phân loại: {prod.category} | Hãng: {prod.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-cyan-405 text-cyan-400 font-mono">+{prod.stock + 18} chiếc đã bán</p>
                        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded">Tăng trưởng tốt</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CỘT BÊN PHẢI: TOP SẢN PHẨM KHÓ TIÊU VÀ Ứ ĐỘNG KHO (RED WARNING) */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider font-sans">Top sản phẩm bán kém / Rủi ro tồn kho</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-900 px-2 py-0.5 rounded-full uppercase">Cảnh báo tồn</span>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const lowStockProds = products.filter(p => p.stock < 5);
                    const listToRender = lowStockProds.length > 0 ? lowStockProds : products.filter(p => p.stock > 10).slice(-2);
                    return listToRender.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 hover:border-slate-850 transition-colors">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={prod.images[0]} 
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-800" 
                            alt="Product"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Tồn kho: <span className="text-red-500 font-extrabold">{prod.stock} chiếc</span> | Rủi ro luân chuyển</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-rose-400 font-mono">0 chiếc bán / tháng</p>
                          <span className={`text-[9px] font-black uppercase text-red-500 bg-red-950/60 border border-red-900 px-1.5 py-0.5 rounded tracking-tighter ${prod.stock < 5 ? 'animate-pulse' : ''}`}>RỦI RO TỒN KHO</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

          </div>
        )}


        {/* =========================================================================================
            TAB 2: QUẢN LÝ SẢN PHẨM & KHO & ĐỢT KHUYẾN MÃI (PRODUCTS MANAGEMENT)
           ========================================================================================= */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="tab_products_content">
            
            {/* LƯỚI TRÁI: DÒNG BẢNG DANH SÁCH SẢN PHẨM HIỆN CÓ TRÊN HỆ THỐNG */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Danh mục sản phẩm điện tử & gia dụng tại kho</h3>
                    <p className="text-xs text-slate-400">Hiển thị tình trạng lưu trữ kho thực tế và quản lý trực hệ</p>
                  </div>
                  <span className="bg-slate-900 px-3 py-1 text-xs font-bold rounded-lg border border-slate-800 text-white">
                    Tổng cộng: {products.length} sản phẩm
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-350 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 font-bold uppercase text-[10px] tracking-wider text-slate-400">
                        <th className="p-3">Sản phẩm</th>
                        <th className="p-3">Danh mục / Thương hiệu</th>
                        <th className="p-3 text-right">Đơn giá gốc</th>
                        <th className="p-3 text-center">Tồn kho / Cảnh báo</th>
                        <th className="p-3 text-center">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-medium">
                      {products.map((prod) => {
                        const isOutOfStockRisk = prod.stock < 5;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-900/40">
                            {/* Ảnh và Tên */}
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={prod.images[0]} 
                                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800" 
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-bold text-white text-xs block max-w-[180px] line-clamp-2">{prod.name}</span>
                              </div>
                            </td>

                            {/* Danh mục và thương hiệu */}
                            <td className="p-3">
                              <span className="block font-semibold text-slate-300">{prod.category}</span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">{prod.brand}</span>
                            </td>

                            {/* Giá */}
                            <td className="p-3 text-right font-bold text-cyan-400 font-mono">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                            </td>

                            {/* Số lượng tồn kho và nhãn Cảnh báo hết hàng nhấp nháy đỏ */}
                            <td className="p-3 text-center">
                              <span className="text-white font-mono font-bold block">{prod.stock} chiếc</span>
                              {isOutOfStockRisk && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-red-500 bg-red-950/60 border border-red-900 animate-pulse" title="Sản phẩm đang dưới ngưỡng 5 sản phẩm tồn kho">
                                  Cảnh báo hết hàng
                                </span>
                              )}
                            </td>

                            {/* Nút sửa/xóa */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleEditProductClick(prod)}
                                  className="p-1 px-2 rounded bg-indigo-950 text-indigo-400 hover:bg-indigo-900 transition-colors mr-1 cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1 px-2 rounded bg-red-950/60 text-red-400 hover:bg-red-900 transition-colors cursor-pointer"
                                  title="Gỡ bỏ sản phẩm"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* LƯỚI PHẢI: FORM THÊM MỚI/CẬP NHẬT SẢN PHẨM & CẤU HÌNH PHÂN HỆ KHUYẾN MÃI (COUPONS) */}
            <div className="space-y-6">
              
              {/* PHÂN HỆ SẢN PHẨM FORM */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-805 border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                    {isEditingProduct ? 'Chỉnh sửa sản phẩm #' + productForm.id : 'Nạp dữ liệu thiết bị mới'}
                  </h3>
                  {isEditingProduct && (
                    <button 
                      onClick={handleResetProductForm}
                      className="text-[9px] font-bold text-slate-500 hover:text-white uppercase"
                    >
                      Hủy sửa
                    </button>
                  )}
                </div>

                {productFormMsg && (
                  <div className="p-3 mb-4 rounded bg-slate-900 text-[11px] font-bold text-cyan-400 border border-indigo-950">
                    {productFormMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  {/* Tên Thiết bị */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Tên thiết bị điện máy *</label>
                    <input
                      type="text"
                      required
                      placeholder="Smart Tivi, Tủ Lạnh..."
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-white"
                    />
                  </div>

                  {/* Lọc danh mục cùng thương hiệu */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Danh mục</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none text-white focus:border-indigo-600"
                      >
                        <option value="Điện tử">Điện tử</option>
                        <option value="Gia dụng">Gia dụng</option>
                        <option value="Thiết bị nhà bếp">Thiết bị nhà bếp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Thương hiệu</label>
                      <input
                        type="text"
                        placeholder="Samsung, LG, Bosch..."
                        value={productForm.brand}
                        onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Giá tiền và tồn kho nhập hàng */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Đơn giá gốc (VND) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 text-cyan-405 font-mono text-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Số lượng nhập kho *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Thông số kỹ thuật / Mô tả */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Thông số kỹ thuật / Mô tả ngắn</label>
                    <textarea
                      rows={3}
                      placeholder="Thông số công suất, kích thước, công nghệ tích hợp..."
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 text-white"
                    />
                  </div>

                  {/* Upload ảnh đa chiều giả định */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Khu vực tải lên ảnh đa chiều (Giả định)</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={productForm.imageInput}
                        onChange={(e) => setProductForm(prev => ({ ...prev, imageInput: e.target.value }))}
                        className="flex-1 bg-slate-900 text-xs border border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-600 text-white"
                      />
                      <button 
                        type="button"
                        onClick={handleAddProductImage}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-1 text-xs font-bold text-white cursor-pointer"
                      >
                        Thêm ảnh
                      </button>
                    </div>

                    {/* Danh sách ảnh đa chiều xem trước (Xếp hàng ngang sành điệu) */}
                    {productForm.imagesList.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        {productForm.imagesList.map((img, idx) => (
                          <div key={idx} className="relative group overflow-hidden rounded-md border border-slate-700 w-12 h-12">
                            <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleRemoveProductImage(idx)}
                              className="absolute inset-0 bg-red-950/80 text-[8px] font-bold text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nút gửi */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold text-white shadow shadow-indigo-600/20 cursor-pointer"
                  >
                    {isEditingProduct ? 'Lưu chỉnh sửa ngay' : 'Đồng bộ thêm mới thiết bị'}
                  </button>

                </form>
              </div>

              {/* KHUNG CẤU HÌNH TẠO MÃ GIẢM GIÁ (COUPONS) */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-4">
                  <Tag className="text-teal-400" size={16} />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Tạo mã giảm giá (Coupon Setup)</h3>
                </div>

                {couponFormMsg && (
                  <p className="text-[10px] text-teal-400 p-2 bg-slate-900 rounded border border-teal-950 mb-3">{couponFormMsg}</p>
                )}

                <form onSubmit={handleSaveCoupon} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Mã Code Coupon</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: QUANTRAN50"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 outline-none focus:border-teal-600 text-white font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Mức giảm (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={couponForm.discountPercent}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 outline-none focus:border-teal-600 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hạn tối thiểu (VND)</label>
                      <input
                        type="number"
                        value={couponForm.minOrderValue}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 outline-none focus:border-teal-600 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Thời gian hiệu lực</label>
                    <input
                      type="date"
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 outline-none focus:border-teal-600 text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Kích hoạt Coupon Chương Trình
                  </button>
                </form>

                {/* Danh sách Coupons hiện hành */}
                <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Các Coupon Đang Hiệu Lực</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coupons.map((c) => (
                      <div key={c.code} className="flex items-center space-x-1.5 p-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-white">
                        <span>{c.code} (-{c.discountPercent}%)</span>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="text-red-400 hover:text-red-500 hover:scale-110 shrink-0 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}


        {/* =========================================================================================
            TAB 3: QUẢN LÝ ĐƠN HÀNG (ORDERS MANAGEMENT CORRIDOR)
           ========================================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6" id="tab_orders_content">
            
            {/* THÀNH TRẠM BỘ LỌC ĐƠN HÀNG LINH HOẠT ĐA PHƯƠNG DIỆN */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="border-b border-slate-900 pb-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider">Hành lang giám sát đơn hàng TMĐT</h3>
                  <p className="text-xs text-slate-500">Giám sát dòng hàng, xử lý trạng thái đóng gói, hủy bỏ các đơn gặp sự cố mạng</p>
                </div>
                
                {/* Tổng quan chỉ số đơn */}
                <div className="flex gap-3 text-[11px] font-mono text-slate-400">
                  <span>Chờ xác nhận: <strong className="text-red-400">{orders.filter(o => o.status === 'Chờ xác nhận').length}</strong></span>
                  <span>•</span>
                  <span>Tổng tiền đã hoàn thành: <strong className="text-emerald-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(completedOrdersRevenue)}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Thanh tìm kiếm khách hàng */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Mã đơn, Tên, Mail khách..."
                    value={orderSearchKeyword}
                    onChange={(e) => setOrderSearchKeyword(e.target.value)}
                    className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg pl-9 p-2.5 outline-none focus:border-cyan-500 text-white"
                  />
                </div>

                {/* 2. Lọc theo trạng thái đơn hàng */}
                <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-350">
                  <Filter size={12} className="text-slate-500" />
                  <span className="text-slate-400 whitespace-nowrap">Trạng thái:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-white cursor-pointer font-bold"
                  >
                    <option value="Tất cả" className="bg-slate-950 text-slate-300">Tất cả trạng thái</option>
                    <option value="Chờ xác nhận" className="bg-slate-950 text-slate-300">Chờ xác nhận</option>
                    <option value="Đóng gói" className="bg-slate-950 text-slate-300">Đóng gói</option>
                    <option value="Vận chuyển" className="bg-slate-950 text-slate-300">Vận chuyển</option>
                    <option value="Hoàn thành" className="bg-slate-950 text-slate-300">Hoàn thành</option>
                    <option value="Đã hủy" className="bg-slate-950 text-slate-300">Đã hủy</option>
                  </select>
                </div>

                {/* 3. Lọc theo phương thức thanh toán */}
                <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-350">
                  <DollarSign size={12} className="text-slate-500" />
                  <span className="text-slate-400 whitespace-nowrap">Thanh toán:</span>
                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-white cursor-pointer font-bold"
                  >
                    <option value="Tất cả" className="bg-slate-950 text-slate-300">Tất cả phương thức</option>
                    <option value="COD" className="bg-slate-950 text-slate-300">Trả tiền mặt (COD)</option>
                    <option value="QR" className="bg-slate-950 text-slate-300">Chuyển khoản QR</option>
                  </select>
                </div>

                {/* Reset nhanh bộ lọc đơn hàng */}
                <button
                  onClick={() => {
                    setOrderStatusFilter('Tất cả');
                    setOrderPaymentFilter('Tất cả');
                    setOrderSearchKeyword('');
                  }}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg p-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Reset bộ lọc nhanh
                </button>

              </div>
            </div>

            {/* PHẦN HIỂN THỊ POPUP YÊU CẦU NHẬP LÝ DO HỦY ĐƠN HÀNG */}
            {cancelingOrderId && (
              <div className="bg-red-950/40 border border-red-900 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg animate-pulse" id="order_cancel_confirm_box">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-red-400 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>Xác nhận Hủy Đơn Hàng {cancelingOrderId}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Vui lòng nhập chọn lý do gặp sự cố kỹ thuật chính xác:</p>
                  <select
                    value={cancelReasonText}
                    onChange={(e) => setCancelReasonText(e.target.value)}
                    className="bg-slate-950 border border-red-900 rounded p-1 text-[11px] text-white outline-none mt-1"
                  >
                    <option value="Hết hàng đột ngột / Sai lệch kiểm kho">Hết hàng đột ngột / Sai lệch kiểm kho</option>
                    <option value="Lỗi cổng thanh toán trực tuyến">Lỗi cổng thanh toán trực tuyến</option>
                    <option value="Khách hàng yêu cầu hủy tháo đổi">Khách hàng yêu cầu hủy tháo đổi</option>
                    <option value="Sai giá trị niêm yết trên Web của hãng">Sai giá trị niêm yết trên Web của hãng</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleConfirmCancelOrder}
                    className="px-3 py-1 bg-red-650 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white cursor-pointer"
                  >
                    Đồng ý Hủy Đơn
                  </button>
                  <button 
                    onClick={() => setCancelingOrderId(null)}
                    className="px-3 py-1 bg-slate-900 rounded text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            )}

            {/* BẢNG THỂ HIỆN THÔNG TIN ĐƠN HÀNG CHI TIẾT */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-350 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-3">Mã đơn / Khách hàng</th>
                      <th className="p-3">Sản phẩm / Dữ liệu mua</th>
                      <th className="p-3 text-right">Tổng thanh toán</th>
                      <th className="p-3 text-center">Hình thức</th>
                      <th className="p-3 text-center">Trạng thái hiện tại</th>
                      <th className="p-3 text-center">Hành động điều phối trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-900/30 transition-colors">
                        
                        {/* ID đơn và người đặt */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-mono font-black text-cyan-400 text-xs block">{order.id}</span>
                          <span className="font-bold text-white text-xs block mt-1">{order.customerName}</span>
                          <span className="text-[10px] text-slate-500 block">{order.customerEmail} | {order.date}</span>
                        </td>

                        {/* Sản phẩm trong đơn */}
                        <td className="p-3">
                          <div className="space-y-1">
                            {order.products.map((item, idx) => (
                              <p key={idx} className="text-[11px] text-slate-200 line-clamp-1">
                                {item.productName} <span className="text-slate-500 font-bold">×{item.quantity}</span>
                              </p>
                            ))}
                            {order.trackingNumber && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-mono">
                                <Truck size={10} className="text-cyan-405 text-cyan-400" />
                                <span>GHN: {order.trackingNumber}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tổng thanh toán */}
                        <td className="p-3 text-right font-black text-white font-mono text-xs">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </td>

                        {/* Phương thức */}
                        <td className="p-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${order.paymentMethod === 'QR' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-900 text-slate-400'}`}>
                            {order.paymentMethod}
                          </span>
                        </td>

                        {/* Trạng thái hiện hành */}
                        <td className="p-3 text-center">
                          {order.status === 'Chờ xác nhận' && (
                            <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-500 border border-amber-900 text-[10px] font-black uppercase">
                              Chờ xác nhận
                            </span>
                          )}
                          {order.status === 'Đóng gói' && (
                            <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-450 text-blue-400 border border-blue-900 text-[10px] font-black uppercase">
                              Đang đóng gói
                            </span>
                          )}
                          {order.status === 'Vận chuyển' && (
                            <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-900 text-[10px] font-black uppercase">
                              Đang giao hàng
                            </span>
                          )}
                          {order.status === 'Hoàn thành' && (
                            <span className="px-2.5 py-1 rounded bg-emerald-955 bg-emerald-950 text-emerald-405 text-emerald-400 border border-emerald-900 text-[10px] font-black uppercase">
                              Giao thành công
                            </span>
                          )}
                          {order.status === 'Đã hủy' && (
                            <div className="flex flex-col items-center">
                              <span className="px-2.5 py-1 rounded bg-red-950 text-red-500 border border-red-900 text-[10px] font-black uppercase">
                                Đã hủy bỏ
                              </span>
                              {order.cancelReason && (
                                <span className="text-[9px] text-slate-500 mt-1 max-w-[140px] text-center italic">{order.cancelReason}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Điều phối trạng thái */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            
                            {/* Nút nâng cấp trạng thái hành trình dòng chảy hàng hóa */}
                            {order.status !== 'Hoàn thành' && order.status !== 'Đã hủy' && (
                              <button
                                onClick={() => handleTransitionOrderStatus(order.id)}
                                className="w-full max-w-[120px] py-1 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] font-bold text-white transition-all cursor-pointer"
                              >
                                {order.status === 'Chờ xác nhận' && 'Duyệt đơn hàng'}
                                {order.status === 'Đóng gói' && 'Bàn giao chuyển'}
                                {order.status === 'Vận chuyển' && 'Xác nhận hoàn thành'}
                              </button>
                            )}

                            {/* Nút gửi vận đơn API */}
                            {order.status === 'Đóng gói' && !order.trackingNumber && (
                              <button
                                onClick={() => handleSendToCarrierAPI(order.id)}
                                className="w-full max-w-[120px] py-1 bg-slate-900 border border-slate-705 border-slate-700 hover:bg-slate-800 rounded text-[10px] font-black text-cyan-400 transition-all cursor-pointer"
                              >
                                Gửi API Vận Đơn
                              </button>
                            )}

                            {/* Nút hủy đơn nếu chưa chuyển thành công hay hủy */}
                            {order.status !== 'Hoàn thành' && order.status !== 'Đã hủy' && (
                              <button
                                onClick={() => {
                                  setCancelingOrderId(order.id);
                                  setCancelReasonText('Hết hàng đột ngột / Khách hàng gọi điện thay đổi ý định');
                                }}
                                className="w-full max-w-[120px] py-0.5 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Hủy đơn hàng
                              </button>
                            )}

                            {/* Thông báo khóa cứng sự kiện */}
                            {(order.status === 'Hoàn thành' || order.status === 'Đã hủy') && (
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Hồ sơ đã ghi sổ</span>
                            )}

                          </div>
                        </td>

                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                          Không tìm thấy đơn hàng nào phù hợp với bộ lọc này trên hệ thống.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* =========================================================================================
            TAB 4: QUẢN LÝ NGƯỜI DÙNG & PHÊ DUYỆT (USERS MANAGEMENT SCREEN)
           ========================================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6" id="tab_users_content">
            
            {/* THÀNH TRẠM TÌM KIẾM KHÁCH HÀNG NÂNG CAO */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Bộ lọc & Công tơ tìm kiếm thành viên hồ sơ</h3>
                  <p className="text-xs text-slate-400">Kiểm soát hoạt động, kích hoạt và phê duyệt tài khoản mới của sàn giao dịch</p>
                </div>

                {/* Ô tìm kiếm email sđt họ tên */}
                <div className="relative w-full md:w-80">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo Email, Số điện thoại hoặc Tên..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg pl-9 p-2.5 outline-none focus:border-indigo-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* BẢNG HIỂN THỊ DANH SÁCH KHÁCH HÀNG / THÀNH VIÊN */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-350 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-3">Họ và Tên khách hàng</th>
                      <th className="p-3">Địa chỉ Email đăng nhập</th>
                      <th className="p-3 text-center">Số điện thoại liên hệ</th>
                      <th className="p-3 text-center">Thời gian đăng ký</th>
                      <th className="p-3 text-center">Trạng thái bảo mật</th>
                      <th className="p-3 text-center">Thao tác điều khiển hồ sơ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-900/30 transition-colors">
                        
                        {/* Họ tên */}
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                              {usr.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs block">{usr.fullName}</p>
                              <span className="text-[10px] text-slate-500 font-mono block">ID: {usr.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3 font-mono text-slate-200">
                          {usr.email}
                        </td>

                        {/* Điện thoại */}
                        <td className="p-3 text-center font-mono text-slate-300">
                          {usr.phone}
                        </td>

                        {/* Đăng ký */}
                        <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                          {usr.registeredAt}
                        </td>

                        {/* Trạng thái */}
                        <td className="p-3 text-center">
                          {usr.status === 'Chờ phê duyệt' && (
                            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-500 border border-amber-900 text-[10px] font-black uppercase">
                              Chờ phê duyệt
                            </span>
                          )}
                          {usr.status === 'Hoạt động' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-black uppercase">
                              Active (Hoạt động)
                            </span>
                          )}
                          {usr.status === 'Đã khóa' && (
                            <span className="px-2 py-0.5 rounded bg-red-950 text-red-500 border border-red-900 text-[10px] font-black uppercase">
                              Bị đóng băng
                            </span>
                          )}
                        </td>

                        {/* Điều khiển */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            
                            {/* Phê duyệt tài khoản mới */}
                            {usr.status === 'Chờ phê duyệt' && (
                              <button
                                onClick={() => handleApproveUser(usr.id)}
                                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-[10px] font-bold text-white transition-all cursor-pointer"
                              >
                                Phê duyệt
                              </button>
                            )}

                            {/* Khóa hoặc Kích hoạt vi phạm chính sách */}
                            <button
                              onClick={() => handleToggleBlockUser(usr.id)}
                              className={`p-1 px-2.5 rounded text-[10px] font-bold transition-all cursor-pointer ${usr.status === 'Đã khóa' ? 'bg-emerald-950 text-emerald-450 text-emerald-400 hover:bg-emerald-900' : 'bg-red-950/60 text-red-400 hover:bg-red-905 click-button hover:bg-red-950'}`}
                              title={usr.status === 'Đã khóa' ? 'Mở khóa tài khoản' : 'Khóa đóng băng do vi phạm'}
                            >
                              {usr.status === 'Đã khóa' ? 'Mở Khóa' : 'Khóa lại'}
                            </button>

                            {/* Giả lập gửi mail thông báo cho thành viên */}
                            <button
                              onClick={() => handleSendAccountEmail(usr)}
                              className="p-1 px-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded text-[10px] font-bold text-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
                              title="Gửi thông báo trạng thái tài khoản tự động qua Email"
                            >
                              <Mail size={11} />
                              <span>Gửi Mail</span>
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                          Không tìm thấy khách hàng nào phù hợp với từ khóa này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
