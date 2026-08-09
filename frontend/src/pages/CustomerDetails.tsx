import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Customer, CustomerFollowUp, CreateFollowUpInput } from '../types/customer.types';
import { customerService } from '../services/customer.service';
import { extractErrorMessage } from '../services/api';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || '0', 10);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  // Edit Customer modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      setError(null);
      const [custData, followUpData] = await Promise.all([
        customerService.getCustomerById(customerId),
        customerService.getFollowUps(customerId).catch(() => []),
      ]);
      setCustomer(custData);
      setFollowUps(followUpData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFollowUpError(null);

    if (!followUpNote.trim()) {
      setFollowUpError('Follow-up note is required');
      return;
    }

    const payload: CreateFollowUpInput = {
      note: followUpNote.trim(),
      follow_up_date: nextFollowUpDate || null,
    };

    try {
      setIsSubmittingFollowUp(true);
      await customerService.createFollowUp(customerId, payload);
      setFollowUpNote('');
      setNextFollowUpDate('');
      setIsFollowUpModalOpen(false);
      loadData();
    } catch (err) {
      setFollowUpError(extractErrorMessage(err));
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleUpdateCustomer = async (data: any) => {
    await customerService.updateCustomer(customerId, data);
    loadData();
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loading message="Loading customer profile..." />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="page-container">
        <Button variant="secondary" onClick={() => navigate('/customers')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Customers
        </Button>
        <ErrorMessage message={error || 'Customer not found'} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h2 className="page-title">{customer.name}</h2>
            <p className="page-subtitle">{customer.business_name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {permissions.canManageCustomers(user) && (
            <>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </Button>
              <Button variant="primary" onClick={() => setIsFollowUpModalOpen(true)}>
                <Plus size={16} /> Add Follow-up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Customer Info Grid */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Customer Overview
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ marginTop: '0.25rem' }}>
              <StatusBadge status={customer.status} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Customer Type</div>
            <div style={{ marginTop: '0.25rem' }}>
              <StatusBadge status={customer.customer_type} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile Number</div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {customer.mobile}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {customer.email}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GST Number</div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {customer.gst_number || '-'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Next Follow-up Date</div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Address
          </div>
          <div style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>{customer.address}</div>
        </div>

        {customer.notes && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Notes
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>{customer.notes}</div>
          </div>
        )}
      </div>

      {/* Follow-up History */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Follow-up History</h3>
          {permissions.canManageCustomers(user) && (
            <Button variant="secondary" size="sm" onClick={() => setIsFollowUpModalOpen(true)}>
              <Plus size={14} /> Add Note
            </Button>
          )}
        </div>

        {followUps.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No follow-up notes recorded yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Next Follow-up</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(f.created_at).toLocaleString()}
                    </td>
                    <td style={{ maxWidth: '400px' }}>{f.note}</td>
                    <td>
                      {f.follow_up_date
                        ? new Date(f.follow_up_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{f.creator_name || `User #${f.created_by}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Follow-up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Add Follow-up Note"
      >
        <form onSubmit={handleAddFollowUp}>
          <ErrorMessage message={followUpError || ''} />

          <div className="form-group">
            <label htmlFor="followUpNote">Follow-up Note *</label>
            <textarea
              id="followUpNote"
              rows={3}
              placeholder="Record call summary, client feedback, next steps..."
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              disabled={isSubmittingFollowUp}
              required
              autoFocus
            />
          </div>

          <Input
            label="Set Next Follow-up Date (Optional)"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            disabled={isSubmittingFollowUp}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFollowUpModalOpen(false)}
              disabled={isSubmittingFollowUp}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingFollowUp}>
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCustomer}
        initialData={customer}
      />
    </div>
  );
};
