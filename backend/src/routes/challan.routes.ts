import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createChallanSchema } from '../validators/challan.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  validateRequest(createChallanSchema),
  ChallanController.createChallan
);

router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ChallanController.getChallans
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ChallanController.getChallanById
);

router.post(
  '/:id/confirm',
  authorizeRoles('ADMIN', 'SALES'),
  ChallanController.confirmChallan
);

router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'SALES'),
  ChallanController.cancelChallan
);

export default router;
