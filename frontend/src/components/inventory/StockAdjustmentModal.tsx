import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/product.types';
import type { MovementType, AdjustStockInput } from '../../types/inventory.types';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { extractErrorMessage } from '../../services/api';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (productId: number, data: AdjustStockInput) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
}) => {
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMovementType('IN');
    setQuantity('');
    setReason('');
    setError(null);
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!product) return;

    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be a positive integer');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for stock adjustment is required');
      return;
    }

    if (movementType === 'OUT' && Number(quantity) > product.current_stock) {
      setError(`Insufficient stock. Available stock: ${product.current_stock}`);
      return;
    }

    const payload: AdjustStockInput = {
      movementType,
      quantity: Number(quantity),
      reason: reason.trim(),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(product.id, payload);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock - ${product.name}`}
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error || ''} />

        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Product SKU: <strong>{product.sku}</strong></div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Current Available Stock: {product.current_stock} units
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select
            label="Adjustment Direction *"
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as MovementType)}
            options={[
              { value: 'IN', label: 'Stock IN (+) Add' },
              { value: 'OUT', label: 'Stock OUT (-) Deduct' },
            ]}
            disabled={isSubmitting}
          />

          <Input
            label="Quantity *"
            type="number"
            min="1"
            placeholder="10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.abs(parseInt(e.target.value, 10)))}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adjustReason">Reason for Adjustment *</label>
          <textarea
            id="adjustReason"
            rows={3}
            placeholder="e.g., Restock shipment, damaged goods, physical count correction..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
