/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Định nghĩa kiểu dữ liệu cho vai trò (Role) tương ứng với bảng 'roles' trong cơ sở dữ liệu
export interface Role {
  role_id: number; // Mã định danh vai trò (Khóa chính)
  role_name: string; // Tên vai trò (Ví dụ: 'Customer', 'Admin')
}

// Định nghĩa kiểu dữ liệu cho người dùng (User) tương ứng với bảng 'users' trong cơ sở dữ liệu
export interface User {
  user_id: number; // Mã định danh người dùng (Khóa chính)
  role_id: number; // Mã định danh vai trò liên kết (Khóa ngoại đến bảng roles)
  full_name: string; // Họ và tên đầy đủ của người dùng
  email: string; // Địa chỉ email đăng nhập
  phone: string; // Số điện thoại liên hệ
  status: 'active' | 'inactive' | 'pending'; // Trạng thái tài khoản hoạt động, khóa hoặc chờ duyệt
  created_at: string; // Ngày tạo tài khoản (định dạng ngày tháng)
}

// Định nghĩa kiểu dữ liệu cho danh mục sản phẩm (Category) tương ứng với bảng 'categories'
export interface Category {
  category_id: number; // Mã định danh danh mục (Khóa chính)
  category_name: string; // Tên danh mục (ví dụ: Điện thoại, Laptop, Gia dụng...)
  parent_id: number | null; // Mã danh mục cha nếu có (dành cho cấu trúc phân cấp)
}

// Định nghĩa kiểu dữ liệu cho thương hiệu sản phẩm (Brand) tương ứng với bảng 'brands'
export interface Brand {
  brand_id: number; // Mã định danh thương hiệu (Khóa chính)
  brand_name: string; // Tên thương hiệu (ví dụ: Samsung, Apple, LG, Panasonic)
}

// Định nghĩa kiểu dữ liệu cho sản phẩm (Product) tương ứng với bảng 'products'
export interface Product {
  product_id: number; // Mã định danh sản phẩm (Khóa chính)
  category_id: number; // Khóa ngoại liên kết danh mục sản phẩm
  brand_id: number; // Khóa ngoại liên kết thương hiệu sản phẩm
  product_name: string; // Tên gọi đầy đủ của sản phẩm thiết bị
  sku: string; // Mã lưu kho (Stock Keeping Unit) duy nhất cho sản phẩm
  description: string; // Mô tả chi tiết các thông số kỹ thuật và tính năng
  price: number; // Giá bán hiện tại (VNĐ)
  stock_quantity: number; // Số lượng tồn kho có sẵn để mua
  status: 'available' | 'out_of_stock' | 'discontinued'; // Trạng thái sản phẩm
  avg_rating: number; // Điểm đánh giá trung bình từ phía khách hàng (từ 1 đến 5 sao)
  image_url: string; // Liên kết hình ảnh trực quan của sản phẩm
  category?: string; // Tên phân loại sản phẩm hiển thị thêm
  brand?: string; // Tên thương hiệu hiển thị thêm
}

// Định nghĩa kiểu dữ liệu giỏ hàng (Cart) ứng với bảng 'carts'
export interface Cart {
  cart_id: number; // Mã định danh giỏ hàng
  user_id: number; // Mã định danh người dùng sở hữu giỏ hàng này
}

// Định nghĩa kiểu dữ liệu thành phần trong giỏ hàng (CartItem) ứng với bảng 'cart_items'
export interface CartItem {
  cart_item_id: number; // Mã định danh thành phần giỏ hàng (Khóa chính)
  cart_id: number; // Mã giỏ hàng liên kết
  product_id: number; // Mã sản phẩm được thêm vào giỏ hàng
  quantity: number; // Số lượng khách hàng muốn mua
  unit_price: number; // Đơn giá sản phẩm tại thời điểm hiển thị hoặc lưu trữ
  product?: Product; // Thông tin sản phẩm chi tiết đi kèm (nếu có để render)
}

// Định nghĩa trạng thái đơn hàng (Order Status) trong hệ thống
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Định nghĩa trạng thái thanh toán (Payment Status) trong hệ thống
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Định nghĩa kiểu dữ liệu đơn hàng (Order) tương ứng với bảng 'orders'
export interface Order {
  order_id: number; // Mã định danh đơn hàng (Khóa chính)
  user_id: number; // Mã người dùng đặt đơn hàng này
  subtotal: number; // Tổng tiền hàng trước thuế/giảm giá
  discount_amount: number; // Số tiền được giảm giá qua voucher hoặc khuyến mãi
  shipping_fee: number; // Phí vận chuyển áp dụng
  total_amount: number; // Thực thu (Tổng tiền thanh toán cuối cùng của đơn hàng)
  order_status: OrderStatus; // Trạng thái vận hành đơn hàng
  payment_status: PaymentStatus; // Trạng thái thanh toán của đơn hàng
  shipping_address: string; // Địa chỉ nhận hàng của người dùng
  created_at: string; // Ngày đặt hàng
}

// Định nghĩa chi tiết vật phẩm trong đơn hàng (OrderItem) tương ứng với bảng 'order_items'
export interface OrderItem {
  order_item_id: number; // Mã chi tiết đơn hàng (Khóa chính)
  order_id: number; // Mã đơn hàng cha sở hữu vật phẩm
  product_id: number; // Mã sản phẩm được đặt mua
  quantity: number; // Số lượng đặt mua thực tế
  unit_price: number; // Đơn giá sản phẩm tại thời điểm mua
  product?: Product; // Đối tượng thông tin sản phẩm đính kèm hiển thị
}

// Định nghĩa đánh giá sản phẩm từ người dùng (Review) tương ứng với bảng 'reviews'
export interface Review {
  review_id: number; // Mã đánh giá (Khóa chính)
  product_id: number; // Mã sản phẩm được đánh giá
  user_id: number; // Mã khách hàng thực hiện đánh giá
  user_name?: string; // Tên khách hàng đính kèm để hiển thị thuận tiện
  rating: number; // Số sao đánh giá từ 1 đến 5
  comment: string; // Bình luận cụ thể từ người mua
  status: 'approved' | 'pending' | 'spam'; // Trạng thái kiểm duyệt đánh giá
  created_at: string; // Ngày bình luận
}

// Định nghĩa hóa đơn thanh toán (Payment) tương ứng với bảng 'payments'
export interface Payment {
  payment_id: number; // Mã giao dịch thanh toán (Khóa chính)
  order_id: number; // Mã đơn hàng thực hiện thanh toán
  payment_method: 'cod' | 'vnpay' | 'momo' | 'bank_transfer'; // Phương thức thanh toán lựa chọn
  amount: number; // Số tiền giao dịch thực tế thanh toán
  payment_status: PaymentStatus; // Trạng thái xử lý cổng thanh toán
  transaction_ref?: string; // Mã tham chiếu giao dịch từ ngân hàng hoặc ví điện tử nếu có
  created_at: string; // Ngày giao dịch
}
