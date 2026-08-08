import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response';
import { CustomerStatus } from '../types/customer.types';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as CustomerStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await CustomerService.getCustomers({ search, status, page, limit });
      return sendSuccess(res, result.data, 'Customers retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const customer = await CustomerService.updateCustomer(id, req.body);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.id, 10);
      const followUps = await CustomerService.getFollowUps(customerId);
      return sendSuccess(res, followUps, 'Customer follow-ups retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.id, 10);
      const userId = req.user!.userId;
      const followUp = await CustomerService.createFollowUp(customerId, userId, req.body);
      return sendSuccess(res, followUp, 'Customer follow-up created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
