import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import type { Challan } from '../types/challan.types';
import { challanService } from '../services/challan.service';
import { extractErrorMessage } from '../services/api';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';

export const ChallanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const challanId = parseInt(id || '0', 10);

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }
  }, [location.state]);

  const loadChallan = async () => {
    if (!challanId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await challanService.getChallanById(challanId);
      setChallan(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallan();
  }, [challanId]);

  const handleConfirmChallan = async () => {
    try {
      setIsConfirming(true);
      setError(null);
      const updated = await challanService.confirmChallan(challanId);
      setChallan(updated);
      setSuccessMsg('Challan confirmed successfully! Inventory stock has been reduced.');
      setIsConfirmModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsConfirmModalOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelChallan = async () => {
    try {
      setIsCancelling(true);
      setError(null);
      const updated = await challanService.cancelChallan(challanId);
      setChallan(updated);
      setSuccessMsg('Challan has been cancelled.');
      setIsCancelModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsCancelModalOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loading message="Loading sales challan details..." />
      </div>
    );
  }

  if (error && !challan) {
    return (
      <div className="page-container">
        <Button variant="secondary" onClick={() => navigate('/challans')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Challans
        </Button>
        <ErrorMessage message={error} onRetry={loadChallan} />
      </div>
    );
  }

  if (!challan) return null;

  const totalValue = (challan.items || []).reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/challans')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="page-title">{challan.challan_number}</h2>
              <StatusBadge status={challan.status} />
            </div>
            <p className="page-subtitle">
              Customer: <strong>{challan.customer_name || `ID #${challan.customer_id}`}</strong>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {challan.status === 'DRAFT' && permissions.canConfirmChallan(user) && (
            <>
              <Button variant="secondary" onClick={() => setIsCancelModalOpen(true)}>
                <XCircle size={16} /> Cancel Challan
              </Button>
              <Button variant="primary" onClick={() => setIsConfirmModalOpen(true)}>
                <CheckCircle2 size={16} /> Confirm Challan
              </Button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius)',
            padding: '0.75rem 1rem',
            color: 'var(--success)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          {successMsg}
        </div>
      )}

      <ErrorMessage message={error || ''} />

      {/* Challan Info Summary Header */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Challan Number</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
              {challan.challan_number}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Customer</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {challan.customer_name || `Customer #${challan.customer_id}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created Date</div>
            <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {new Date(challan.created_at).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created By</div>
            <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {challan.creator_name || `User #${challan.created_by}`}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Line Items</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(challan.items || []).map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                  <td>
                    <code>{item.sku}</code>
                  </td>
                  <td>${Number(item.unit_price).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div>
            Total Line Items: <strong>{(challan.items || []).length}</strong>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Total Dispatch Quantity: <strong>{challan.total_quantity} units</strong>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Grand Total Amount: ${totalValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sales Challan"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            Are you sure you want to confirm sales challan <strong>{challan.challan_number}</strong>?
          </p>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid #fef08a',
              borderRadius: 'var(--radius)',
              color: 'var(--warning)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            <strong>Warning:</strong> Confirming this challan will permanently deduct item quantities from inventory stock and record official stock movements.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmChallan}
              isLoading={isConfirming}
            >
              Confirm & Deduct Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Dialog */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Sales Challan"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            Are you sure you want to cancel draft sales challan <strong>{challan.challan_number}</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCancelling}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelChallan}
              isLoading={isCancelling}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
