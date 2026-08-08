import { pool } from '../config/database';
import { CustomerService } from './customer.service';
import { Challan, ChallanItem, ChallanQueryFilters } from '../types/challan.types';
import { CreateChallanInput } from '../validators/challan.validator';
import { AppError, PaginationMeta } from '../utils/response';

export class ChallanService {
  static async createChallan(userId: number, input: CreateChallanInput): Promise<Challan> {
    // 1. Verify customer exists
    await CustomerService.getCustomerById(input.customerId);

    // 2. Verify all products exist and fetch snapshot data
    const productSnapshots: Array<{
      productId: number;
      name: string;
      sku: string;
      unitPrice: number;
      quantity: number;
    }> = [];

    for (const item of input.items) {
      const prodRes = await pool.query<{ id: number; name: string; sku: string; unit_price: string }>(
        'SELECT id, name, sku, unit_price FROM products WHERE id = $1',
        [item.productId]
      );

      if (prodRes.rows.length === 0) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      const prod = prodRes.rows[0];
      productSnapshots.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        unitPrice: parseFloat(prod.unit_price),
        quantity: item.quantity,
      });
    }

    const totalQuantity = productSnapshots.reduce((sum, i) => sum + i.quantity, 0);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate next database-safe Challan Number
      const seqRes = await client.query<{ next_id: string }>(
        "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM challans"
      );
      const nextId = seqRes.rows[0].next_id;
      const challanNumber = `CH-${String(nextId).padStart(6, '0')}`;

      // Insert Challan header
      const challanRes = await client.query<Challan>(
        `INSERT INTO challans (challan_number, customer_id, status, total_quantity, created_by)
         VALUES ($1, $2, 'DRAFT', $3, $4)
         RETURNING id, challan_number, customer_id, status, total_quantity, created_by, created_at, updated_at`,
        [challanNumber, input.customerId, totalQuantity, userId]
      );

      const challan = challanRes.rows[0];

      // Insert Challan Items with product snapshots
      const insertedItems: ChallanItem[] = [];
      for (const snapshot of productSnapshots) {
        const itemRes = await client.query<ChallanItem>(
          `INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, challan_id, product_id, product_name, sku, unit_price, quantity`,
          [challan.id, snapshot.productId, snapshot.name, snapshot.sku, snapshot.unitPrice, snapshot.quantity]
        );
        const itemRow = itemRes.rows[0];
        insertedItems.push({
          ...itemRow,
          unit_price: parseFloat(itemRow.unit_price as any),
        });
      }

      await client.query('COMMIT');

      return {
        ...challan,
        items: insertedItems,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getChallans(filters: ChallanQueryFilters): Promise<{ data: Challan[]; pagination: PaginationMeta }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`ch.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.customerId) {
      conditions.push(`ch.customer_id = $${paramIndex}`);
      params.push(filters.customerId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM challans ch ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataResult = await pool.query<Challan>(
      `SELECT ch.id, ch.challan_number, ch.customer_id, c.name as customer_name, ch.status, ch.total_quantity, ch.created_by, u.name as creator_name, ch.created_at, ch.updated_at
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       ${whereClause}
       ORDER BY ch.id DESC
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

  static async getChallanById(id: number): Promise<Challan> {
    const challanRes = await pool.query<Challan>(
      `SELECT ch.id, ch.challan_number, ch.customer_id, c.name as customer_name, ch.status, ch.total_quantity, ch.created_by, u.name as creator_name, ch.created_at, ch.updated_at
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       WHERE ch.id = $1`,
      [id]
    );

    if (challanRes.rows.length === 0) {
      throw new AppError('Challan not found', 404, 'CHALLAN_NOT_FOUND');
    }

    const itemsRes = await pool.query<ChallanItem>(
      `SELECT id, challan_id, product_id, product_name, sku, unit_price, quantity
       FROM challan_items
       WHERE challan_id = $1
       ORDER BY id ASC`,
      [id]
    );

    const items = itemsRes.rows.map((item) => ({
      ...item,
      unit_price: parseFloat(item.unit_price as any),
    }));

    return {
      ...challanRes.rows[0],
      items,
    };
  }

  static async confirmChallan(id: number, userId: number): Promise<Challan> {
    const challan = await this.getChallanById(id);

    if (challan.status !== 'DRAFT') {
      throw new AppError(
        `Cannot confirm challan. Current status is '${challan.status}'`,
        409,
        'INVALID_CHALLAN_STATUS'
      );
    }

    const items = challan.items || [];
    if (items.length === 0) {
      throw new AppError('Cannot confirm empty challan', 400, 'EMPTY_CHALLAN');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Step 1: Validate stock for all products with row locking
      for (const item of items) {
        const prodRes = await client.query<{ id: number; name: string; sku: string; current_stock: number }>(
          'SELECT id, name, sku, current_stock FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );

        if (prodRes.rows.length === 0) {
          throw new AppError(`Product with ID ${item.product_id} no longer exists`, 404, 'PRODUCT_NOT_FOUND');
        }

        const prod = prodRes.rows[0];
        if (prod.current_stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product '${prod.name}' (SKU: ${prod.sku}). Available: ${prod.current_stock}, Requested: ${item.quantity}`,
            409,
            'INSUFFICIENT_STOCK'
          );
        }
      }

      // Step 2: Reduce stock and create OUT stock movements
      for (const item of items) {
        // Reduce product stock
        await client.query(
          'UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Create OUT movement record
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
           VALUES ($1, $2, 'OUT', $3, $4)`,
          [
            item.product_id,
            item.quantity,
            `Challan confirmation ${challan.challan_number}`,
            userId,
          ]
        );
      }

      // Step 3: Update challan status to CONFIRMED
      await client.query(
        "UPDATE challans SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.getChallanById(id);
  }

  static async cancelChallan(id: number): Promise<Challan> {
    const challan = await this.getChallanById(id);

    if (challan.status !== 'DRAFT') {
      throw new AppError(
        `Cannot cancel challan. Current status is '${challan.status}'`,
        409,
        'INVALID_CHALLAN_STATUS'
      );
    }

    await pool.query(
      "UPDATE challans SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    return this.getChallanById(id);
  }
}
