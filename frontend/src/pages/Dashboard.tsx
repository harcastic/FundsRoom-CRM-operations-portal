import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { dashboardService, type DashboardStats } from '../services/dashboard.service';
import { extractErrorMessage } from '../services/api';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loading message="Loading dashboard statistics..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome back, {user?.name}</h2>
          <p className="page-subtitle">
            Role: <span style={{ fontWeight: 600 }}>{user?.role}</span> • Summary of operational metrics
          </p>
        </div>

        <div className="flex gap-2">
          {permissions.canCreateChallan(user) && (
            <Button variant="primary" onClick={() => navigate('/challans/create')}>
              <Plus size={16} /> Create Challan
            </Button>
          )}
          {permissions.canManageCustomers(user) && (
            <Button variant="secondary" onClick={() => navigate('/customers')}>
              <Plus size={16} /> Customers
            </Button>
          )}
        </div>
      </div>

      <ErrorMessage message={error || ''} onRetry={fetchStats} />

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Customers Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Total Customers
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.customers}
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Total Products
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.products}
              </div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: stats.lowStockProducts > 0 ? '#fecaca' : 'var(--border)',
              backgroundColor: stats.lowStockProducts > 0 ? 'var(--danger-bg)' : 'var(--surface)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: stats.lowStockProducts > 0 ? '#fee2e2' : 'var(--neutral-badge-bg)',
                color: stats.lowStockProducts > 0 ? 'var(--danger)' : 'var(--neutral-badge)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Low Stock Alert
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: stats.lowStockProducts > 0 ? 'var(--danger)' : 'var(--text-main)',
                }}
              >
                {stats.lowStockProducts}
              </div>
            </div>
          </div>

          {/* Draft Challans Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--warning-bg)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Draft Challans
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.draftChallans}
              </div>
            </div>
          </div>

          {/* Confirmed Challans Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Confirmed Challans
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.confirmedChallans}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
