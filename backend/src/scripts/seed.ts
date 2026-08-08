import bcrypt from 'bcrypt';
import { pool } from '../config/database';

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'Admin User', email: 'admin@demo.com', role: 'ADMIN' },
      { name: 'Sales Rep', email: 'sales@demo.com', role: 'SALES' },
      { name: 'Warehouse Mgr', email: 'warehouse@demo.com', role: 'WAREHOUSE' },
      { name: 'Accountant', email: 'accounts@demo.com', role: 'ACCOUNTS' },
    ];

    const seededUsers: Record<string, number> = {};

    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
         RETURNING id, role`,
        [u.name, u.email, passwordHash, u.role]
      );
      seededUsers[u.role] = res.rows[0].id;
    }
    console.log('  └─ Users seeded successfully.');

    // 2. Seed Customers
    const customers = [
      {
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh@acmelogistics.com',
        business_name: 'Acme Logistics Pvt Ltd',
        gst_number: '27AAAAA0000A1Z5',
        customer_type: 'WHOLESALE',
        address: '123 Industrial Area, Phase 1, Mumbai, MH',
        status: 'ACTIVE',
        notes: 'Key client for wholesale computer peripherals.',
      },
      {
        name: 'Priya Sharma',
        mobile: '9812345678',
        email: 'priya@techsolutions.io',
        business_name: 'Tech Solutions Inc',
        gst_number: '27BBBBA1111B1Z2',
        customer_type: 'RETAIL',
        address: '45 Tech Park, Whitefield, Bengaluru, KA',
        status: 'LEAD',
        notes: 'Interested in bulk ergonomic accessories.',
      },
      {
        name: 'Amit Patel',
        mobile: '9765432109',
        email: 'amit@globaltraders.in',
        business_name: 'Global Traders',
        gst_number: null,
        customer_type: 'DISTRIBUTOR',
        address: '78 Commercial Street, Ahmedabad, GJ',
        status: 'ACTIVE',
        notes: 'Distributor for Western region.',
      },
    ];

    for (const c of customers) {
      await client.query(
        `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [c.name, c.mobile, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.notes]
      );
    }
    console.log('  └─ Customers seeded successfully.');

    // 3. Seed Products & Stock Movements
    const products = [
      {
        name: 'Mechanical Gaming Keyboard',
        sku: 'PROD-KB-001',
        category: 'Peripherals',
        unit_price: 2999.00,
        current_stock: 50,
        minimum_stock: 10,
        warehouse_location: 'Rack-A1',
      },
      {
        name: 'Ergonomic Wireless Mouse',
        sku: 'PROD-MS-002',
        category: 'Peripherals',
        unit_price: 1499.00,
        current_stock: 100,
        minimum_stock: 20,
        warehouse_location: 'Rack-A2',
      },
      {
        name: 'UltraWide 4K Monitor 27-inch',
        sku: 'PROD-MN-003',
        category: 'Displays',
        unit_price: 24999.00,
        current_stock: 5,
        minimum_stock: 10,
        warehouse_location: 'Rack-B1',
      },
    ];

    const adminUserId = seededUsers['ADMIN'];

    for (const p of products) {
      const prodRes = await client.query(
        `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (sku) DO UPDATE 
         SET current_stock = EXCLUDED.current_stock, unit_price = EXCLUDED.unit_price
         RETURNING id`,
        [p.name, p.sku, p.category, p.unit_price, p.current_stock, p.minimum_stock, p.warehouse_location]
      );

      const productId = prodRes.rows[0].id;

      // Seed initial stock movement log
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [productId, p.current_stock, 'IN', 'Initial seed stock entry', adminUserId]
      );
    }
    console.log('  └─ Products and initial stock movements seeded successfully.');

    await client.query('COMMIT');
    console.log('✅ Database seeding complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
