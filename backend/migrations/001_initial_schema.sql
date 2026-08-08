-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR')),
    address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'LEAD' CHECK (status IN ('LEAD', 'ACTIVE', 'INACTIVE')),
    follow_up_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. customer_followups
CREATE TABLE IF NOT EXISTS customer_followups (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    follow_up_date TIMESTAMP,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    warehouse_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    reason VARCHAR(255) NOT NULL,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. challans
CREATE TABLE IF NOT EXISTS challans (
    id SERIAL PRIMARY KEY,
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    total_quantity INT NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. challan_items
CREATE TABLE IF NOT EXISTS challan_items (
    id SERIAL PRIMARY KEY,
    challan_id INT NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_challans_customer_id ON challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
