/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, User, Category, Brand, Product, Review } from '../types';

// Dữ liệu mẫu khởi tạo cho bảng Vai trò (Roles) trong CSDL
export const mockRoles: Role[] = [
  { role_id: 1, role_name: 'Admin' },      // Vai trò Quản trị viên điều hành hệ thống
  { role_id: 2, role_name: 'Customer' }   // Vai trò Khách hàng mua sắm trực tuyến
];

// Dữ liệu mẫu khởi tạo cho bảng Người dùng (Users) trong CSDL
export const mockUsers: User[] = [
  {
    user_id: 1,
    role_id: 1,
    full_name: 'Nguyễn Văn Admin',
    email: 'admin@electro.com',
    phone: '0987654321',
    status: 'active',
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    user_id: 2,
    role_id: 2,
    full_name: 'Trần Thị Khách Hàng',
    email: 'customer@electro.com',
    phone: '0912345678',
    status: 'active',
    created_at: '2026-02-15T10:30:00Z'
  },
  {
    user_id: 3,
    role_id: 2,
    full_name: 'Phạm Minh Tuấn',
    email: 'ngocduonganhxk@gmail.com',
    phone: '0933445566',
    status: 'active',
    created_at: '2026-03-10T14:24:00Z'
  }
];

// Dữ liệu mẫu khởi tạo cho bảng Danh mục (Categories) theo cấu trúc điện tử - gia dụng
export const mockCategories: Category[] = [
  { category_id: 1, category_name: 'Điện tử', parent_id: null },            // Nhóm ngành hàng Điện tử giải trí chung
  { category_id: 2, category_name: 'Gia dụng', parent_id: null },           // Nhóm ngành hàng Thiết bị gia dụng chăm sóc nhà cửa
  { category_id: 3, category_name: 'Thiết bị nhà bếp', parent_id: null },   // Nhóm ngành hàng Chuyên biệt cho phòng bếp
  { category_id: 4, category_name: 'Tivi & Âm thanh', parent_id: 1 },       // Danh mục con của Điện tử
  { category_id: 5, category_name: 'Điều hòa & Giặt ủi', parent_id: 2 },    // Danh mục con của Gia dụng
  { category_id: 6, category_name: 'Nấu nướng tiện ích', parent_id: 3 }      // Danh mục con của Thiết bị nhà bếp
];

// Dữ liệu mẫu khởi tạo cho bảng Thương hiệu (Brands) trong hệ thống thương mại điện tử
export const mockBrands: Brand[] = [
  { brand_id: 1, brand_name: 'Samsung' },       // Tập đoàn thiết bị điện tử - gia dụng Hàn Quốc
  { brand_id: 2, brand_name: 'Sony' },          // Thương hiệu công nghệ giải trí đỉnh cao đến từ Nhật Bản
  { brand_id: 3, brand_name: 'LG' },            // Thương hiệu thiết bị gia dụng và màn hình cao cấp Hàn Quốc
  { brand_id: 4, brand_name: 'Panasonic' },     // Thương hiệu nổi tiếng sản xuất tủ lạnh, máy giặt, nồi cơm
  { brand_id: 5, brand_name: 'Philips' },       // Hãng thiết bị gia dụng và điện gia dụng thông minh Châu Âu
  { brand_id: 6, brand_name: 'Xiaomi' }         // Thương hiệu công nghệ thông minh, robot hút bụi tân tiến
];

// Dữ liệu mẫu khởi tạo cho bảng Sản phẩm (Products) bao gồm đầy đủ thông số cần thiết
export const mockProducts: Product[] = [
  {
    product_id: 1,
    category_id: 1, // Điện tử
    brand_id: 1, // Samsung
    product_name: 'Smart TV Neo QLED 4K Samsung 65 inch QA65QN85C',
    sku: 'QA65QN85C-2026',
    description: 'Màn hình công nghệ Quantum Matrix, bộ xử lý Neural Quantum 4K với AI tăng cường độ tương phản và chi tiết hình ảnh, loa thanh âm thanh vòm Dolby Atmos mạnh mẽ 60W.',
    price: 32900000, // 32.900.000 VNĐ
    stock_quantity: 15,
    status: 'available',
    avg_rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600' // Ảnh TV hiện đại trong phòng khách
  },
  {
    product_id: 2,
    category_id: 1, // Điện tử
    brand_id: 2, // Sony
    product_name: 'Google Tivi Sony 4K 55 inch KD-55X75K',
    sku: 'KD-55X75K-SONY',
    description: 'Bộ xử lý 4K Processor X1 nâng cao chi tiết, công nghệ Motionflow XR cho chuyển động mượt mà, âm thanh Dolby Audio sống động tích hợp trợ lý ảo Google Assistant.',
    price: 13490000, // 13.490.000 VNĐ
    stock_quantity: 28,
    status: 'available',
    avg_rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1601944114954-467a6daeebe3?auto=format&fit=crop&q=80&w=600' // Ảnh Tivi tinh tế
  },
  {
    product_id: 3,
    category_id: 2, // Gia dụng
    brand_id: 4, // Panasonic
    product_name: 'Máy giặt Panasonic Inverter 10kg NA-V10FG1WVT',
    sku: 'NA-V10FG1WVT-PANA',
    description: 'Công nghệ giặt nước nóng StainMaster+ diệt 99.99% vi khuẩn, hệ thống Active Foam đánh tan xà phòng thành bọt siêu mịn, động cơ 3Di Inverter tiết kiệm điện tối ưu.',
    price: 15990000, // 15.990.000 VNĐ
    stock_quantity: 10,
    status: 'available',
    avg_rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=600' // Ảnh máy giặt cửa trước hiện đại
  },
  {
    product_id: 4,
    category_id: 2, // Gia dụng
    brand_id: 3, // LG
    product_name: 'Tủ lạnh LG Side by Side Inverter 635 Lít GR-D257JS',
    sku: 'GR-D257JS-LG',
    description: 'Tủ lạnh Multi Air Flow làm lạnh đa chiều, hệ thống lấy nước ngoài diệt khuẩn UVnano tự động, công nghệ DoorCooling làm lạnh nhanh từ cửa tủ, khay đá xoay tiện lợi.',
    price: 21500000, // 21.500.000 VNĐ
    stock_quantity: 8,
    status: 'available',
    avg_rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1571175432247-50a2e4c6bb77?auto=format&fit=crop&q=80&w=600' // Ảnh tủ lạnh side-by-side inox sáng bóng
  },
  {
    product_id: 5,
    category_id: 3, // Thiết bị nhà bếp
    brand_id: 5, // Philips
    product_name: 'Nồi chiên không dầu Philips HD9280/90 6.2 Lít',
    sku: 'HD9280-90-PHILIPS',
    description: 'Công nghệ Rapid Air lốc xoáy cho dòng khí nóng lưu chuyển đều, giảm đến 90% lượng chất béo, điều khiển kết nối ứng dụng Wifi thông minh qua điện thoại di động.',
    price: 3690000, // 3.690.000 VNĐ
    stock_quantity: 45,
    status: 'available',
    avg_rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600' // Ảnh thiết bị gia dụng nhà bếp sang trọng
  },
  {
    product_id: 6,
    category_id: 3, // Thiết bị nhà bếp
    brand_id: 6, // Xiaomi
    product_name: 'Bếp từ đôi thông minh Xiaomi Mijia Double Burner',
    sku: 'MIJIA-BURNER-XIAOMI',
    description: 'Mặt kính cường lực chống trầy xước, 100 mức gia nhiệt tuyến tính linh hoạt, trang bị cảm biến nhiệt độ thông minh tự động ngắt khi quá nhiệt, kết nối app Mi Home tùy biến công thức nấu ăn.',
    price: 4290000, // 4.290.000 VNĐ
    stock_quantity: 12,
    status: 'available',
    avg_rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600' // Nhà bếp và thiết bị lò nướng/bếp từ cao cấp
  },
  {
    product_id: 7,
    category_id: 2, // Gia dụng
    brand_id: 6, // Xiaomi
    product_name: 'Robot hút bụi lau nhà Xiaomi Vacuum Mop X20+',
    sku: 'VACUUM-X20-XIAOMI',
    description: 'Lực hút siêu mạnh 6000Pa hút sạch bụi mịn khe sàn, trạm sạc đa năng tự động giặt giẻ, sấy khô bằng khí nóng và đổ rác thông minh tích hợp, quét bản đồ laser LDS 3D chuẩn xác.',
    price: 11990000, // 11.990.000 VNĐ
    stock_quantity: 20,
    status: 'available',
    avg_rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1589134707641-fcdaee6dd529?auto=format&fit=crop&q=80&w=600' // Robot hút bụi thông minh đang làm việc
  },
  {
    product_id: 8,
    category_id: 3, // Thiết bị nhà bếp
    brand_id: 4, // Panasonic
    product_name: 'Nồi cơm điện cao tần Panasonic SR-HL151KRA 1.5 Lít',
    sku: 'SR-HL151KRA-PANA',
    description: 'Công nghệ cảm ứng từ cao tần IH nấu chín đều từng hạt gạo, lòng nồi phủ lớp bột kim cương nhân tạo siêu bền dẫn nhiệt tốt, tích hợp 11 thực đơn nấu thông minh tùy chọn.',
    price: 5290000, // 5.290.000 VNĐ
    stock_quantity: 30,
    status: 'available',
    avg_rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600' // Bánh hoặc thực phẩm mộc mạc thơm ngon phù hợp nhà bếp
  },
  {
    product_id: 9,
    category_id: 1, // Điện tử
    brand_id: 3, // LG
    product_name: 'Loa Thanh Soundbar LG S75Q 480W Dolby Atmos',
    sku: 'S75Q-LOA-BAR-LG',
    description: 'Tổng công suất loa lớn 480W kết hợp loa siêu trầm không dây mạnh mẽ, hỗ trợ hoàn hảo chuẩn High-Resolution Audio mang lại âm thanh trung thực, tích hợp công nghệ AI Sound Pro tối ưu.',
    price: 5890000, // 5.890.000 VNĐ
    stock_quantity: 15,
    status: 'available',
    avg_rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600' // Loa và dàn âm thanh hiện đại rạp hát gia đình
  }
];

// Dữ liệu mẫu khởi tạo cho bảng Đánh Giá (Reviews) người mua hàng
export const mockReviews: Review[] = [
  {
    review_id: 1,
    product_id: 1, // TV Samsung QA65QN85C
    user_id: 2,
    user_name: 'Trần Thị Khách Hàng',
    rating: 5,
    comment: 'Màn hình tivi siêu nét, màu đen sâu không khác gì OLED mà độ sáng đỉnh cao hơn nhiều. Âm thanh vòm trong phòng ngủ nghe cực phê luôn, rất đáng đồng tiền chén bát!',
    status: 'approved',
    created_at: '2026-03-01T09:12:00Z'
  },
  {
    review_id: 2,
    product_id: 1,
    user_id: 3,
    user_name: 'Phạm Minh Tuấn',
    rating: 4,
    comment: 'Chất lượng sản phẩm tuyệt vời, giao hàng lắp ráp tại nhà chuyên nghiệp. Có điều điều khiển tivi hơi nhỏ khó bấm một tí nhưng bù lại dùng pin sạc năng lượng mặt trời bảo vệ môi trường.',
    status: 'approved',
    created_at: '2026-04-12T15:45:00Z'
  },
  {
    review_id: 3,
    product_id: 3, // Máy giặt Panasonic
    user_id: 2,
    user_name: 'Trần Thị Khách Hàng',
    rating: 5,
    comment: 'Máy giặt êm ái, tính năng giặt nước nóng giặt quần áo cho trẻ sơ sinh sạch tinh tươm. Nhà mình dùng đồ Panasonic chục năm nay cực kỳ yên tâm độ bền.',
    status: 'approved',
    created_at: '2026-03-25T11:00:00Z'
  }
];
