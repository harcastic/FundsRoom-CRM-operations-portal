import { pool } from '../config/database';
import { Product, ProductQueryFilters } from '../types/product.types';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { AppError, PaginationMeta } from '../utils/response';

export class ProductService {
  static async getProducts(filters: ProductQueryFilters): Promise<{ data: Product[]; pagination: PaginationMeta }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 10));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.lowStock) {
      conditions.push(`current_stock <= minimum_stock`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataResult = await pool.query<Product>(
      `SELECT id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
       FROM products
       ${whereClause}
       ORDER BY id DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // Ensure unit_price is converted to a JavaScript number
    const data = dataResult.rows.map((row) => ({
      ...row,
      unit_price: parseFloat(row.unit_price as any),
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getProductById(id: number): Promise<Product> {
    const result = await pool.query<Product>(
      `SELECT id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
       FROM products WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const row = result.rows[0];
    return {
      ...row,
      unit_price: parseFloat(row.unit_price as any),
    };
  }

  static async createProduct(input: CreateProductInput): Promise<Product> {
    // Check SKU uniqueness
    const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1', [input.sku]);
    if (skuCheck.rows.length > 0) {
      throw new AppError(`Product with SKU '${input.sku}' already exists`, 409, 'DUPLICATE_SKU');
    }

    const result = await pool.query<Product>(
      `INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at`,
      [
        input.name,
        input.sku,
        input.category,
        input.unit_price,
        input.current_stock ?? 0,
        input.minimum_stock ?? 0,
        input.warehouse_location,
      ]
    );

    const row = result.rows[0];
    return {
      ...row,
      unit_price: parseFloat(row.unit_price as any),
    };
  }

  static async updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
    const existing = await this.getProductById(id);

    if (input.sku && input.sku !== existing.sku) {
      const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1 AND id != $2', [input.sku, id]);
      if (skuCheck.rows.length > 0) {
        throw new AppError(`Product with SKU '${input.sku}' already exists`, 409, 'DUPLICATE_SKU');
      }
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return existing;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
    `;

    const result = await pool.query<Product>(query, params);
    const row = result.rows[0];
    return {
      ...row,
      unit_price: parseFloat(row.unit_price as any),
    };
  }
}
