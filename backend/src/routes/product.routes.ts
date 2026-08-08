import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ProductController.getProducts
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  ProductController.getProductById
);

router.post(
  '/',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

export default router;
