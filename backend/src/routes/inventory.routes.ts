import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { adjustStockSchema } from '../validators/inventory.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/:productId/adjust',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validateRequest(adjustStockSchema),
  InventoryController.adjustStock
);

router.get(
  '/:productId/movements',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  InventoryController.getMovements
);

export default router;
