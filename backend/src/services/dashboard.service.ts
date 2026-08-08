import { pool } from '../config/database';

export interface DashboardStats {
  customers: number;
  products: number;
  lowStockProducts: number;
  draftChallans: number;
  confirmedChallans: number;
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    const custRes = await pool.query<{ count: string }>('SELECT COUNT(*) FROM customers');
    const prodRes = await pool.query<{ count: string }>('SELECT COUNT(*) FROM products');
    const lowStockRes = await pool.query<{ count: string }>('SELECT COUNT(*) FROM products WHERE current_stock <= minimum_stock');
    const draftRes = await pool.query<{ count: string }>("SELECT COUNT(*) FROM challans WHERE status = 'DRAFT'");
    const confirmedRes = await pool.query<{ count: string }>("SELECT COUNT(*) FROM challans WHERE status = 'CONFIRMED'");

    return {
      customers: parseInt(custRes.rows[0].count, 10),
      products: parseInt(prodRes.rows[0].count, 10),
      lowStockProducts: parseInt(lowStockRes.rows[0].count, 10),
      draftChallans: parseInt(draftRes.rows[0].count, 10),
      confirmedChallans: parseInt(confirmedRes.rows[0].count, 10),
    };
  }
}
