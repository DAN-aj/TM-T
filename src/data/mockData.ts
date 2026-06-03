/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, User, Category, Brand, Product, Review } from '../types';
import { tiviProducts } from './tiviProducts';
import { refrigeratorProducts } from './refrigeratorProducts';
import { washerProducts } from './washerProducts';
import { acProducts } from './acProducts';
import { kitchenProducts } from './kitchenProducts';

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

// Dữ liệu mẫu khởi tạo cho bảng Danh mục (Categories) theo cấu trúc 5 ngành hàng chính của TMĐT
export const mockCategories: Category[] = [
  { category_id: 1, category_name: 'Tivi', parent_id: null },
  { category_id: 2, category_name: 'Tủ lạnh', parent_id: null },
  { category_id: 3, category_name: 'Máy giặt', parent_id: null },
  { category_id: 4, category_name: 'Điều hòa', parent_id: null },
  { category_id: 5, category_name: 'Gia dụng bếp', parent_id: null }
];

// Dữ liệu mẫu khởi tạo cho bảng Thương hiệu (Brands) trong hệ thống thương mại điện tử
export const mockBrands: Brand[] = [
  { brand_id: 1, brand_name: 'Samsung' },       // Tập đoàn thiết bị điện tử - gia dụng Hàn Quốc
  { brand_id: 2, brand_name: 'Sony' },          // Thương hiệu công nghệ giải trí đỉnh cao đến từ Nhật Bản
  { brand_id: 3, brand_name: 'LG' },            // Thương hiệu thiết bị gia dụng và màn hình cao cấp Hàn Quốc
  { brand_id: 4, brand_name: 'Panasonic' },     // Thương hiệu nổi tiếng sản xuất tủ lạnh, máy giặt, nồi cơm
  { brand_id: 5, brand_name: 'Philips' },       // Hãng thiết bị gia dụng và điện gia dụng thông minh Châu Âu
  { brand_id: 6, brand_name: 'Xiaomi' },        // Thương hiệu công nghệ thông minh
  { brand_id: 7, brand_name: 'Bosch' },         // Thiết bị gia dụng cao cấp từ Đức
  { brand_id: 8, brand_name: 'Toshiba' },       // Thương hiệu công nghệ gia dụng lâu đời Nhật Bản
  { brand_id: 9, brand_name: 'Electrolux' },    // Thương hiệu gia dụng Thụy Điển nổi tiếng toàn cầu
  { brand_id: 10, brand_name: 'Sharp' },        // Thương hiệu điện gia dụng cao cấp Nhật Bản
  { brand_id: 11, brand_name: 'Hitachi' },      // Tập đoàn công nghệ và thiết bị gia dụng Nhật Bản
  { brand_id: 12, brand_name: 'Daikin' },       // Chuyên gia giải pháp điều hòa hàng đầu thế giới từ Nhật Bản
  { brand_id: 13, brand_name: 'DeLonghi' }      // Thương hiệu thiết bị pha chế cà phê và gia dụng cao cấp từ Ý
];

// Tích hợp gộp toàn bộ 5 nhóm danh mục gồm đúng 100 sản phẩm chuyên biệt tường minh
export const mockProducts: Product[] = [
  ...tiviProducts,
  ...refrigeratorProducts,
  ...washerProducts,
  ...acProducts,
  ...kitchenProducts
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
    review_id: 21, // Máy lạnh Panasonic
    product_id: 21,
    user_id: 2,
    user_name: 'Trần Thị Khách Hàng',
    rating: 5,
    comment: 'Tủ lạnh chạy rất êm, thiết kế sang trọng đẳng cấp dã man. Ngăn Prime Fresh đông mềm nấu ăn luôn không cần rã đông cực kỳ tiện lợi!',
    status: 'approved',
    created_at: '2026-03-25T11:00:00Z'
  }
];
