import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { permissions } from '../../utils/permissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: permissions.canViewDashboard(user),
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: Users,
      show: permissions.canViewCustomers(user),
    },
    {
      label: 'Products',
      path: '/products',
      icon: Package,
      show: permissions.canViewProducts(user),
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      show: permissions.canViewInventory(user),
    },
    {
      label: 'Challans',
      path: '/challans',
      icon: FileText,
      show: permissions.canViewChallans(user),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
          }}
          className="md-hidden"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '240px',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          zIndex: 45,
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <div>
          {/* Logo / Header */}
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>
                ERP / CRM
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Operations Portal
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-secondary sidebar-close-btn"
              style={{ padding: '0.25rem', display: 'none' }}
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '1rem 0.75rem' }}>
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'nav-item-active' : ''}`
                    }
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius)',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem',
                      textDecoration: 'none',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* User Info Footer */}
        <div
          style={{
            padding: '1rem 0.875rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              {user?.name || 'User'}
            </div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                marginTop: '0.2rem',
                textTransform: 'uppercase',
              }}
            >
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm w-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
