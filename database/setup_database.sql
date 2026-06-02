-- ==========================================
-- SCRIPT TẠO CẤU TRÚC CƠ SỞ DỮ LIỆU (DDL)
-- HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ ELECTRO 2026
-- Hỗ trợ: Microsoft SQL Server (T-SQL)
-- ==========================================

-- Tạo cơ sở dữ liệu mới (Nếu được yêu cầu trên môi trường thực tế)
-- CREATE DATABASE ElectroDB;
-- GO
-- USE ElectroDB;
-- GO

-- =========================================================================================
-- 1. XÓA BẢNG NẾU ĐÃ TỒN TẠI (Đảm bảo tính tái cấu trúc an toàn theo thứ tự ràng buộc khóa ngoại)
-- =========================================================================================

IF OBJECT_ID('dbo.shipments', 'U') IS NOT NULL DROP TABLE dbo.shipments;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.reviews', 'U') IS NOT NULL DROP TABLE dbo.reviews;
IF OBJECT_ID('dbo.order_items', 'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.cart_items', 'U') IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.products', 'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.brands', 'U') IS NOT NULL DROP TABLE dbo.brands;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;
GO

-- =========================================================================================
-- 2. ĐỊNH NGHĨA CÁC BẢNG (CREATE TABLES WITH PRIMARY KEYS, FOREIGN KEYS & CONSTRAINTS)
-- =========================================================================================

-- BẢNG 1: VAI TRÒ NGƯỜI DÙNG (roles)
CREATE TABLE dbo.roles (
    role_id INT IDENTITY(1,1) NOT NULL,
    role_name NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_roles PRIMARY KEY (role_id),
    CONSTRAINT UQ_role_name UNIQUE (role_name)
);
GO

-- BẢNG 2: TÀI KHOẢN NGƯỜI DÙNG (users)
CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL DEFAULT 2, -- Mặc định: 2 - Khách mua hàng (Customer)
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_users PRIMARY KEY (user_id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES dbo.roles (role_id),
    CONSTRAINT CK_users_status CHECK (status IN ('active', 'inactive'))
);
GO

-- BẢNG 3: DANH MỤC SẢN PHẨM (categories)
CREATE TABLE dbo.categories (
    category_id INT IDENTITY(1,1) NOT NULL,
    category_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    CONSTRAINT PK_categories PRIMARY KEY (category_id),
    CONSTRAINT UQ_category_name UNIQUE (category_name)
);
GO

-- BẢNG 4: THƯƠNG HIỆU SẢN PHẨM (brands)
CREATE TABLE dbo.brands (
    brand_id INT IDENTITY(1,1) NOT NULL,
    brand_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    CONSTRAINT PK_brands PRIMARY KEY (brand_id),
    CONSTRAINT UQ_brand_name UNIQUE (brand_name)
);
GO

-- BẢNG 5: DANH SÁCH THIẾT BỊ SẢN PHẨM (products)
CREATE TABLE dbo.products (
    product_id INT IDENTITY(1,1) NOT NULL,
    product_name NVARCHAR(255) NOT NULL,
    price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NULL,
    image_url VARCHAR(500) NULL,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_products PRIMARY KEY (product_id),
    CONSTRAINT UQ_products_sku UNIQUE (sku),
    CONSTRAINT FK_products_categories FOREIGN KEY (category_id) REFERENCES dbo.categories (category_id),
    CONSTRAINT FK_products_brands FOREIGN KEY (brand_id) REFERENCES dbo.brands (brand_id),
    CONSTRAINT CK_products_price CHECK (price >= 0),
    CONSTRAINT CK_products_stock CHECK (stock_quantity >= 0),
    CONSTRAINT CK_products_status CHECK (status IN ('available', 'out_of_stock', 'discontinued')),
    CONSTRAINT CK_products_rating CHECK (avg_rating >= 0.00 AND avg_rating <= 5.00)
);
GO

-- BẢNG 6: GIỎ HÀNG KHÁCH HÀNG (carts)
CREATE TABLE dbo.carts (
    cart_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_carts PRIMARY KEY (cart_id),
    CONSTRAINT FK_carts_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE CASCADE
);
GO

-- BẢNG 7: CHI TIẾT SẢN PHẨM TRONG GIỎ (cart_items)
CREATE TABLE dbo.cart_items (
    cart_item_id INT IDENTITY(1,1) NOT NULL,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT PK_cart_items PRIMARY KEY (cart_item_id),
    CONSTRAINT FK_cart_items_carts FOREIGN KEY (cart_id) REFERENCES dbo.carts (cart_id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_products FOREIGN KEY (product_id) REFERENCES dbo.products (product_id) ON DELETE CASCADE,
    CONSTRAINT UQ_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT CK_cart_items_qty CHECK (quantity > 0)
);
GO

-- BẢNG 8: ĐƠN ĐẶT HÀNG (orders)
CREATE TABLE dbo.orders (
    order_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NULL, -- Cho phép NULL nếu tài khoản bị xóa để giữ lịch sử hóa đơn
    total_amount DECIMAL(18, 2) NOT NULL,
    order_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_address NVARCHAR(500) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_orders PRIMARY KEY (order_id),
    CONSTRAINT FK_orders_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE SET NULL,
    CONSTRAINT CK_orders_total CHECK (total_amount >= 0),
    CONSTRAINT CK_orders_status CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    CONSTRAINT CK_orders_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);
GO

-- BẢNG 9: CHI TIẾT SẢN PHẨM MUA THEO ĐƠN (order_items)
CREATE TABLE dbo.order_items (
    order_item_id INT IDENTITY(1,1) NOT NULL,
    order_id INT NOT NULL,
    product_id INT NULL, -- Cho phép NULL nếu sản phẩm bị gỡ khỏi kệ hoàn toàn
    quantity INT NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    CONSTRAINT PK_order_items PRIMARY KEY (order_item_id),
    CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id) REFERENCES dbo.orders (order_id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_products FOREIGN KEY (product_id) REFERENCES dbo.products (product_id) ON DELETE SET NULL,
    CONSTRAINT CK_order_items_qty CHECK (quantity > 0),
    CONSTRAINT CK_order_items_price CHECK (price >= 0)
);
GO

-- BẢNG 10: ĐÁNH GIÁ & REVIEW SẢN PHẨM (reviews)
CREATE TABLE dbo.reviews (
    review_id INT IDENTITY(1,1) NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_reviews PRIMARY KEY (review_id),
    CONSTRAINT FK_reviews_products FOREIGN KEY (product_id) REFERENCES dbo.products (product_id) ON DELETE CASCADE,
    CONSTRAINT FK_reviews_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE CASCADE,
    CONSTRAINT CK_reviews_rating CHECK (rating >= 1 AND rating <= 5)
);
GO

-- BẢNG 11: GIAO DỊCH THANH TOÁN (payments)
CREATE TABLE dbo.payments (
    payment_id INT IDENTITY(1,1) NOT NULL,
    order_id INT NOT NULL,
    payment_method NVARCHAR(50) NOT NULL, -- Ví dụ: COD, MoMo, Bank Transfer, Visa
    amount DECIMAL(18, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100) NULL, -- Mã giao dịch từ bên thứ ba hoặc ngân hàng đối chiếu
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_payments PRIMARY KEY (payment_id),
    CONSTRAINT FK_payments_orders FOREIGN KEY (order_id) REFERENCES dbo.orders (order_id) ON DELETE CASCADE,
    CONSTRAINT CK_payments_amount CHECK (amount >= 0),
    CONSTRAINT CK_payments_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
);
GO

-- BẢNG 12: ĐƠN VẬN CHUYỂN GIAO NHẬN (shipments)
CREATE TABLE dbo.shipments (
    shipment_id INT IDENTITY(1,1) NOT NULL,
    order_id INT NOT NULL,
    carrier NVARCHAR(100) NULL, -- Đơn vị vận chuyển (Ví dụ: Giao Hàng Nhanh, Viettel Post)
    tracking_number VARCHAR(100) NULL, -- Mã vận đơn
    shipment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_date DATETIME NULL,
    delivery_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_shipments PRIMARY KEY (shipment_id),
    CONSTRAINT FK_shipments_orders FOREIGN KEY (order_id) REFERENCES dbo.orders (order_id) ON DELETE CASCADE,
    CONSTRAINT CK_shipments_status CHECK (shipment_status IN ('pending', 'shipped', 'delivered', 'returned'))
);
GO

-- =========================================================================================
-- 3. CHÈN DỮ LIỆU ĐỊNH DANH MẪU (BASIC SEED DATA FOR DEMONSTRATION & TESTING)
-- =========================================================================================

-- Chèn dữ liệu Vai trò (Roles)
INSERT INTO dbo.roles (role_name) VALUES (N'Admin');
INSERT INTO dbo.roles (role_name) VALUES (N'Customer');
GO

-- Chèn dữ liệu Tài khoản mẫu (Users)
INSERT INTO dbo.users (full_name, email, phone, password_hash, role_id, status)
VALUES 
(N'Nguyễn Văn Admin', 'admin@electro.com', '0912345678', 'hashed_pass_123', 1, 'active'),
(N'Đào Dương Anh', 'ngocduonganhxk@gmail.com', '0987654321', 'hashed_pass_456', 2, 'active');
GO

-- Chèn dữ liệu Danh mục hàng hoá (Categories)
INSERT INTO dbo.categories (category_name, description)
VALUES 
(N'Laptop & Điện thoại', N'Nơi trưng bày máy tính xách tay cấu hình đồ hoạ cao và smartphone hiện đại'),
(N'Điện lạnh gia dụng', N'Các dòng điều hoà Inverter, tủ lạnh side-by-side nhập khẩu chính hãng'),
(N'Thiết bị thông minh', N'Đồng hồ sức khoẻ thông minh, loa điều khiển rảnh tay và robot hút bụi');
GO

-- Chèn dữ liệu Thương hiệu đối tác (Brands)
INSERT INTO dbo.brands (brand_name, description)
VALUES 
(N'Electro', N'Tập đoàn sản xuất điện máy và phụ tùng cao cấp số một thế giới'),
(N'K-Tech', N'Tinh hoa công nghệ thông tin và giải pháp kỹ thuật di động toàn diện'),
(N'S-Cool', N'Dẫn đầu về các giải pháp nhiệt lạnh và cơ khí thông gió đỉnh cao');
GO

-- Chèn dữ liệu Sản phẩm kệ hàng (Products)
INSERT INTO dbo.products (product_name, price, stock_quantity, sku, description, image_url, category_id, brand_id, status, avg_rating)
VALUES 
(N'Laptop Electro ProBook X14 Carbon', 24990000.00, 15, 'LAPTOP-PRO-X14', N'Màn hình 14.2 inch OLED sắc nét, vỏ nhôm nguyên khối, chip lõi kép thế hệ mới siêu tiết kiệm điện.', 'https://images.unsplash.com/photo-1496181130204-7552cc14acd4?auto=format&fit=crop&q=80&w=600', 1, 1, 'available', 4.80),
(N'Tủ Lạnh Electro Side-by-Side Inverter SBS-600', 18500000.00, 8, 'TULANH-SBS-600', N'Cung tích 600 lít, ngăn cấp đông mềm đỉnh cao bảo quản dinh dưỡng tròn vẹn không phá vỡ liên kết.', 'https://images.unsplash.com/photo-1571175432287-e2b72ae150f9?auto=format&fit=crop&q=80&w=600', 2, 1, 'available', 5.00),
(N'Đồng Hồ Sức Khoẻ Electro Smartband S3', 1250000.00, 45, 'SMARTBAND-S3', N'Đo nhịp tim sinh học, bản đồ vệ tinh tích hợp, pin lithium sạc nhanh duy trì tuần hoàn 14 ngày làm việc.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', 3, 1, 'available', 4.20);
GO

PRINTS 'Khởi tạo cấu trúc cơ sở dữ liệu Electro 2026 trên SQL Server hoàn tất thành công!';
-- GO
