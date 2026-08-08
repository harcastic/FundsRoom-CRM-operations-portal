import { pool } from '../config/database';
import { ProductService } from './product.service';
import { StockMovement } from '../types/inventory.types';
import { AdjustStockInput } from '../validators/inventory.validator';
import { AppError } from '../utils/response';

export class InventoryService {
  static async adjustStock(
    productId: number,
    userId: number,
    input: AdjustStockInput
  ): Promise<{ updatedStock: number; movement: StockMovement }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Lock product row for update & check current stock
      const prodRes = await client.query<{ id: number; current_stock: number }>(
        'SELECT id, current_stock FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (prodRes.rows.length === 0) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const currentStock = prodRes.rows[0].current_stock;
      let newStock = currentStock;

      if (input.movementType === 'IN') {
        newStock += input.quantity;
      } else {
        if (currentStock < input.quantity) {
          throw new AppError(
            `Insufficient stock. Available: ${currentStock}, Requested: ${input.quantity}`,
            409,
            'INSUFFICIENT_STOCK'
          );
        }
        newStock -= input.quantity;
      }

      // 2. Update stock on product
      await client.query(
        'UPDATE products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStock, productId]
      );

      // 3. Create stock movement record
      const moveRes = await client.query<StockMovement>(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, product_id, quantity, movement_type, reason, created_by, created_at`,
        [productId, input.quantity, input.movementType, input.reason, userId]
      );

      await client.query('COMMIT');

      return {
        updatedStock: newStock,
        movement: moveRes.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMovements(productId: number): Promise<StockMovement[]> {
    // Ensure product exists
    await ProductService.getProductById(productId);

    const result = await pool.query<StockMovement>(
      `SELECT m.id, m.product_id, m.quantity, m.movement_type, m.reason, m.created_by, m.created_at, u.name as creator_name
       FROM stock_movements m
       JOIN users u ON m.created_by = u.id
       WHERE m.product_id = $1
       ORDER BY m.created_at DESC`,
      [productId]
    );

    return result.rows;
  }
}
