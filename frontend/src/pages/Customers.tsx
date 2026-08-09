import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2 } from 'lucide-react';
import type { Customer, CustomerStatus, CreateCustomerInput } from '../types/customer.types';
import { customerService } from '../services/customer.service';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomers({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as CustomerStatus) : undefined,
        page,
        limit: 10,
      });
      setCustomers(res.data);
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
    fetchCustomers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateOrUpdate = async (data: CreateCustomerInput) => {
    if (editingCustomer) {
      await customerService.updateCustomer(editingCustomer.id, data);
    } else {
      await customerService.createCustomer(data);
    }
    fetchCustomers();
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers Directory</h2>
          <p className="page-subtitle">Manage customer profiles, status, and follow-up schedules</p>
        </div>

        {permissions.canManageCustomers(user) && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Customer
          </Button>
        )}
      </div>

      <ErrorMessage message={error || ''} onRetry={fetchCustomers} />

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by name, business, email, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Loading customer records..." />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            search || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Add your first customer to start tracking contacts and follow-ups.'
          }
          actionLabel={permissions.canManageCustomers(user) ? 'Add Customer' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Business Name</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td style={{ fontWeight: 600 }}>{cust.name}</td>
                  <td>{cust.business_name}</td>
                  <td>{cust.mobile}</td>
                  <td>
                    <StatusBadge status={cust.customer_type} />
                  </td>
                  <td>
                    <StatusBadge status={cust.status} />
                  </td>
                  <td>
                    {cust.follow_up_date
                      ? new Date(cust.follow_up_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/customers/${cust.id}`)}
                        title="View Details"
                      >
                        <Eye size={14} /> View
                      </Button>
                      {permissions.canManageCustomers(user) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(cust)}
                          title="Edit Customer"
                        >
                          <Edit2 size={14} /> Edit
                        </Button>
                      )}
                    </div>
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

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCustomer}
      />
    </div>
  );
};
