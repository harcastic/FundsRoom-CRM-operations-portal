import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from '../validators/customer.validator';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Customer CRUD
router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  CustomerController.getCustomers
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  CustomerController.getCustomerById
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);

// Follow-ups
router.get(
  '/:id/followups',
  authorizeRoles('ADMIN', 'SALES'),
  CustomerController.getFollowUps
);

router.post(
  '/:id/followups',
  authorizeRoles('ADMIN', 'SALES'),
  validateRequest(createFollowUpSchema),
  CustomerController.createFollowUp
);

export default router;
