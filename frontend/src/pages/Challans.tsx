import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import type { Challan, ChallanStatus } from '../types/challan.types';
import { challanService } from '../services/challan.service';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChallans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await challanService.getChallans({
        status: statusFilter !== 'ALL' ? (statusFilter as ChallanStatus) : undefined,
        page,
        limit: 10,
      });
      setChallans(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Challans</h2>
          <p className="page-subtitle">Track sales challans, draft orders, and inventory dispatch confirmations</p>
        </div>

        {permissions.canCreateChallan(user) && (
          <Button variant="primary" onClick={() => navigate('/challans/create')}>
            <Plus size={16} /> Create Challan
          </Button>
        )}
      </div>

      <ErrorMessage message={error || ''} onRetry={fetchChallans} />

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1rem',
          display: 'flex',
          justifyContent: 'flex-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Challans</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading sales challans..." />
      ) : challans.length === 0 ? (
        <EmptyState
          title="No sales challans found"
          description={
            statusFilter !== 'ALL'
              ? 'No challans found for the selected status.'
              : 'Create your first sales challan to start tracking dispatches.'
          }
          actionLabel={permissions.canCreateChallan(user) ? 'Create Challan' : undefined}
          onAction={() => navigate('/challans/create')}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Total Items</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Created By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <code style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {ch.challan_number}
                    </code>
                  </td>
                  <td style={{ fontWeight: 500 }}>{ch.customer_name || `Customer #${ch.customer_id}`}</td>
                  <td style={{ fontWeight: 600 }}>{ch.total_quantity}</td>
                  <td>
                    <StatusBadge status={ch.status} />
                  </td>
                  <td>{new Date(ch.created_at).toLocaleDateString()}</td>
                  <td>{ch.creator_name || `User #${ch.created_by}`}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/challans/${ch.id}`)}
                    >
                      <Eye size={14} /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
