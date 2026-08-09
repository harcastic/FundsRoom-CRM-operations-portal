import React, { useState, useEffect } from 'react';
import type { Product, CreateProductInput } from '../../types/product.types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { extractErrorMessage } from '../../services/api';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  initialData?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minimumStock, setMinimumStock] = useState<number | ''>(5);
  const [warehouseLocation, setWarehouseLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || '');
      setCategory(initialData.category || '');
      setUnitPrice(initialData.unit_price ?? '');
      setCurrentStock(initialData.current_stock ?? 0);
      setMinimumStock(initialData.minimum_stock ?? 5);
      setWarehouseLocation(initialData.warehouse_location || '');
    } else {
      setName('');
      setSku('');
      setCategory('');
      setUnitPrice('');
      setCurrentStock(0);
      setMinimumStock(5);
      setWarehouseLocation('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !sku || !category || unitPrice === '' || !warehouseLocation) {
      setError('Please fill in all required fields (Name, SKU, Category, Price, Location)');
      return;
    }

    const payload: CreateProductInput = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      unit_price: Number(unitPrice),
      current_stock: Number(currentStock || 0),
      minimum_stock: Number(minimumStock || 0),
      warehouse_location: warehouseLocation.trim(),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add New Product'}
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error || ''} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Product Name *"
            placeholder="Wireless Keyboard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="SKU *"
            placeholder="KB-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Category *"
            placeholder="Electronics"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Unit Price ($) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="49.99"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Current Stock"
            type="number"
            min="0"
            placeholder="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={isSubmitting || !!initialData} // Stock edits should use inventory adjustment flow
          />

          <Input
            label="Minimum Stock Level *"
            type="number"
            min="0"
            placeholder="5"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={isSubmitting}
            required
          />
        </div>

        <Input
          label="Warehouse Location *"
          placeholder="Shelf A-12, Aisle 3"
          value={warehouseLocation}
          onChange={(e) => setWarehouseLocation(e.target.value)}
          disabled={isSubmitting}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
