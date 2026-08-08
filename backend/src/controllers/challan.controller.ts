import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess } from '../utils/response';
import { ChallanStatus } from '../types/challan.types';

export class ChallanController {
  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const challan = await ChallanService.createChallan(userId, req.body);
      return sendSuccess(res, challan, 'Sales challan created successfully as DRAFT', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as ChallanStatus | undefined;
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ChallanService.getChallans({ status, customerId, page, limit });
      return sendSuccess(res, result.data, 'Challans retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, challan, 'Challan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.userId;
      const challan = await ChallanService.confirmChallan(id, userId);
      return sendSuccess(res, challan, 'Challan confirmed successfully and stock updated');
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const challan = await ChallanService.cancelChallan(id);
      return sendSuccess(res, challan, 'Challan cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}
