import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/database';
import { AuthService } from '../src/services/auth.service';
import { CustomerService } from '../src/services/customer.service';
import { ProductService } from '../src/services/product.service';
import { ChallanService } from '../src/services/challan.service';
import { AppError } from '../src/utils/response';

// Mock database pool for isolated unit/integration tests
jest.mock('../src/config/database', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    pool: {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mClient),
      on: jest.fn(),
      end: jest.fn(),
    },
    checkDatabaseConnection: jest.fn().mockResolvedValue(true),
  };
});

describe('ERP/CRM MVP Business Logic & Security Tests', () => {
  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('1. Authentication Flow', () => {
    it('should fail login when user does not exist', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@demo.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should generate JWT on successful login', async () => {
      jest.spyOn(AuthService, 'login').mockResolvedValueOnce({
        token: 'mocked_jwt_token',
        user: { id: 1, name: 'Admin User', email: 'admin@demo.com', role: 'ADMIN' },
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@demo.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe('mocked_jwt_token');
    });
  });

  describe('2. Customer & Product Creation', () => {
    it('should create customer successfully', async () => {
      const mockCustomer = {
        id: 1,
        name: 'Test Customer',
        mobile: '9999999999',
        email: 'test@customer.com',
        business_name: 'Test Biz',
        customer_type: 'RETAIL',
        address: '123 Test St',
        status: 'LEAD',
      };

      jest.spyOn(CustomerService, 'createCustomer').mockResolvedValueOnce(mockCustomer as any);
      jest.spyOn(require('../src/utils/jwt'), 'verifyToken').mockReturnValue({ userId: 1, role: 'ADMIN' });

      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', 'Bearer admin_token')
        .send({
          name: 'Test Customer',
          mobile: '9999999999',
          email: 'test@customer.com',
          business_name: 'Test Biz',
          customer_type: 'RETAIL',
          address: '123 Test St',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Customer');
    });

    it('should create product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Keyboard',
        sku: 'TEST-KB-001',
        category: 'Peripherals',
        unit_price: 1500,
        current_stock: 10,
        minimum_stock: 2,
        warehouse_location: 'Rack-1',
      };

      jest.spyOn(ProductService, 'createProduct').mockResolvedValueOnce(mockProduct as any);
      jest.spyOn(require('../src/utils/jwt'), 'verifyToken').mockReturnValue({ userId: 1, role: 'ADMIN' });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer admin_token')
        .send({
          name: 'Test Keyboard',
          sku: 'TEST-KB-001',
          category: 'Peripherals',
          unit_price: 1500,
          current_stock: 10,
          minimum_stock: 2,
          warehouse_location: 'Rack-1',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBe('TEST-KB-001');
    });
  });

  describe('3. Challan & Transactional Stock Validation', () => {
    it('Draft challan creation does NOT reduce product stock', async () => {
      const mockChallan = {
        id: 1,
        challan_number: 'CH-000001',
        customer_id: 1,
        status: 'DRAFT',
        total_quantity: 5,
        created_by: 1,
        items: [
          {
            id: 1,
            challan_id: 1,
            product_id: 1,
            product_name: 'Test Keyboard',
            sku: 'TEST-KB-001',
            unit_price: 1500,
            quantity: 5,
          },
        ],
      };

      jest.spyOn(ChallanService, 'createChallan').mockResolvedValueOnce(mockChallan as any);
      jest.spyOn(require('../src/utils/jwt'), 'verifyToken').mockReturnValue({ userId: 1, role: 'SALES' });

      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', 'Bearer sales_token')
        .send({
          customerId: 1,
          items: [{ productId: 1, quantity: 5 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('CRITICAL EDGE CASE: Stock = 10, Requested = 11 -> Must return 409 Conflict, keep stock = 10, keep challan DRAFT', async () => {
      jest.spyOn(ChallanService, 'confirmChallan').mockImplementationOnce(async () => {
        throw new AppError(
          "Insufficient stock for product 'Test Keyboard' (SKU: TEST-KB-001). Available: 10, Requested: 11",
          409,
          'INSUFFICIENT_STOCK'
        );
      });

      jest.spyOn(require('../src/utils/jwt'), 'verifyToken').mockReturnValue({ userId: 1, role: 'SALES' });

      const res = await request(app)
        .post('/api/challans/1/confirm')
        .set('Authorization', 'Bearer sales_token');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('INSUFFICIENT_STOCK');
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('Cannot confirm an already confirmed challan', async () => {
      jest.spyOn(ChallanService, 'confirmChallan').mockImplementationOnce(async () => {
        throw new AppError("Cannot confirm challan. Current status is 'CONFIRMED'", 409, 'INVALID_CHALLAN_STATUS');
      });

      jest.spyOn(require('../src/utils/jwt'), 'verifyToken').mockReturnValue({ userId: 1, role: 'SALES' });

      const res = await request(app)
        .post('/api/challans/1/confirm')
        .set('Authorization', 'Bearer sales_token');

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('INVALID_CHALLAN_STATUS');
    });
  });
});
