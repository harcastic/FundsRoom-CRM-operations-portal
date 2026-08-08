import { pool } from '../config/database';
import { Customer, CustomerFollowUp, CustomerQueryFilters, CustomerStatus } from '../types/customer.types';
import { CreateCustomerInput, UpdateCustomerInput, CreateFollowUpInput } from '../validators/customer.validator';
import { AppError, PaginationMeta } from '../utils/response';

export class CustomerService {
  static async getCustomers(filters: CustomerQueryFilters): Promise<{ data: Customer[]; pagination: PaginationMeta }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex} OR mobile ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query Total Count
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM customers ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Query Page Data
    const dataResult = await pool.query<Customer>(
      `SELECT id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_at, updated_at
       FROM customers
       ${whereClause}
       ORDER BY id DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getCustomerById(id: number): Promise<Customer> {
    const result = await pool.query<Customer>(
      `SELECT id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_at, updated_at
       FROM customers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const result = await pool.query<Customer>(
      `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_at, updated_at`,
      [
        input.name,
        input.mobile,
        input.email.toLowerCase(),
        input.business_name,
        input.gst_number || null,
        input.customer_type,
        input.address,
        input.status || 'LEAD',
        input.follow_up_date || null,
        input.notes || null,
      ]
    );

    return result.rows[0];
  }

  static async updateCustomer(id: number, input: UpdateCustomerInput): Promise<Customer> {
    // Check existence
    await this.getCustomerById(id);

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(key === 'email' && typeof value === 'string' ? value.toLowerCase() : value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getCustomerById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_at, updated_at
    `;

    const result = await pool.query<Customer>(query, params);
    return result.rows[0];
  }

  static async getFollowUps(customerId: number): Promise<CustomerFollowUp[]> {
    // Ensure customer exists
    await this.getCustomerById(customerId);

    const result = await pool.query<CustomerFollowUp>(
      `SELECT f.id, f.customer_id, f.note, f.follow_up_date, f.created_by, f.created_at, u.name as creator_name
       FROM customer_followups f
       JOIN users u ON f.created_by = u.id
       WHERE f.customer_id = $1
       ORDER BY f.created_at DESC`,
      [customerId]
    );

    return result.rows;
  }

  static async createFollowUp(customerId: number, userId: number, input: CreateFollowUpInput): Promise<CustomerFollowUp> {
    // Ensure customer exists
    await this.getCustomerById(customerId);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const followUpRes = await client.query<CustomerFollowUp>(
        `INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, customer_id, note, follow_up_date, created_by, created_at`,
        [customerId, input.note, input.follow_up_date || null, userId]
      );

      // If follow_up_date was provided, update customer's next follow_up_date
      if (input.follow_up_date) {
        await client.query(
          `UPDATE customers SET follow_up_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [input.follow_up_date, customerId]
        );
      }

      await client.query('COMMIT');
      return followUpRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
