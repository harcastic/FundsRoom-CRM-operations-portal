import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response';

export class InventoryController {
  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const userId = req.user!.userId;
      const result = await InventoryService.adjustStock(productId, userId, req.body);
      return sendSuccess(res, result, 'Stock adjusted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const movements = await InventoryService.getMovements(productId);
      return sendSuccess(res, movements, 'Stock movements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
