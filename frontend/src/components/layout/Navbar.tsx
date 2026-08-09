import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/customers/')) return 'Customer Details';
    if (pathname === '/customers') return 'Customer Directory';
    if (pathname.startsWith('/products/')) return 'Product Details';
    if (pathname === '/products') return 'Product Catalog';
    if (pathname === '/inventory') return 'Inventory & Stock';
    if (pathname === '/challans/create') return 'Create Sales Challan';
    if (pathname.startsWith('/challans/')) return 'Challan Details';
    if (pathname === '/challans') return 'Sales Challans';
    return 'ERP / CRM';
  };

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm navbar-menu-btn"
          style={{ padding: '0.375rem' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ textAlign: 'right' }} className="desktop-user-info">
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Role: <span style={{ fontWeight: 600 }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
