import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
