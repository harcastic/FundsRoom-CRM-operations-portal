import type { User } from '../types/auth.types';

export const permissions = {
  canViewDashboard: (_user: User | null): boolean => true,

  canViewCustomers: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES', 'ACCOUNTS'].includes(user.role),

  canManageCustomers: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES'].includes(user.role),

  canViewProducts: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user.role),

  canManageProducts: (user: User | null): boolean =>
    !!user && ['ADMIN', 'WAREHOUSE'].includes(user.role),

  canViewInventory: (user: User | null): boolean =>
    !!user && ['ADMIN', 'WAREHOUSE'].includes(user.role),

  canAdjustStock: (user: User | null): boolean =>
    !!user && ['ADMIN', 'WAREHOUSE'].includes(user.role),

  canViewChallans: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user.role),

  canCreateChallan: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES'].includes(user.role),

  canConfirmChallan: (user: User | null): boolean =>
    !!user && ['ADMIN', 'SALES'].includes(user.role),
};
