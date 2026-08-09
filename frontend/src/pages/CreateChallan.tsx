import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import type { Customer } from '../types/customer.types';
import type { Product } from '../types/product.types';
import type { CreateChallanInput } from '../types/challan.types';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { challanService } from '../services/challan.service';
import { extractErrorMessage } from '../services/api';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/Button';

interface LineItem {
  productId: number | '';
  quantity: number;
}

export const CreateChallan: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [items, setItems] = useState<LineItem[]>([
    { productId: '', quantity: 1 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadSelectOptions();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productId' | 'quantity',
    value: number | ''
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'quantity') {
        const qtyVal = value === '' ? 1 : Math.max(1, Number(value));
        updated[index] = { ...updated[index], quantity: qtyVal };
      } else {
        updated[index] = { ...updated[index], productId: value };
      }
      return updated;
    });
  };

  const calculateTotalQuantity = (): number => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const calculateTotalAmount = (): number => {
    return items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const price = prod ? Number(prod.unit_price) : 0;
      return sum + price * (Number(item.quantity) || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer for this sales challan');
      return;
    }

    const validItems = items.filter((item) => item.productId !== '' && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please select at least one valid product line item');
      return;
    }

    // Check duplicate products
    const productIds = validItems.map((i) => i.productId);
    const hasDuplicates = new Set(productIds).size !== productIds.length;
    if (hasDuplicates) {
      setError('Duplicate products detected in line items. Please combine quantities into a single row.');
      return;
    }

    const payload: CreateChallanInput = {
      customerId: Number(selectedCustomerId),
      items: validItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      setIsSubmitting(true);
      const newChallan = await challanService.createChallan(payload);
      navigate(`/challans/${newChallan.id}`, {
        state: { message: `Challan ${newChallan.challan_number} created as draft.` },
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loading message="Loading customer & product options..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/challans')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h2 className="page-title">Create Sales Challan</h2>
            <p className="page-subtitle">Select customer and items to create a draft sales challan</p>
          </div>
        </div>
      </div>

      <ErrorMessage message={error || ''} />

      <form onSubmit={handleSubmit}>
        {/* Customer Selection Card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Customer Details</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="customerSelect">Select Customer *</label>
            <select
              id="customerSelect"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={isSubmitting}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.business_name}) - {c.mobile}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Items Card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Product Items</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              <Plus size={14} /> Add Product Row
            </Button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Product *</th>
                  <th style={{ width: '20%' }}>Unit Price</th>
                  <th style={{ width: '20%' }}>Quantity *</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Subtotal</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const selectedProd = products.find((p) => p.id === row.productId);
                  const price = selectedProd ? Number(selectedProd.unit_price) : 0;
                  const rowSubtotal = price * (row.quantity || 0);

                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          value={row.productId}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'productId',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          disabled={isSubmitting}
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) | Stock: {p.current_stock} | ${Number(p.unit_price).toFixed(2)}
                            </option>
                          ))}
                        </select>
                        {selectedProd && (
                          <div style={{ fontSize: '0.75rem', color: selectedProd.current_stock > 0 ? 'var(--text-secondary)' : 'var(--danger)', marginTop: '0.25rem' }}>
                            Available in stock: <strong>{selectedProd.current_stock} units</strong>
                          </div>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'top', paddingTop: '1.1rem' }}>
                        {selectedProd ? `$${price.toFixed(2)}` : '-'}
                      </td>

                      <td style={{ verticalAlign: 'top' }}>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'quantity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          disabled={isSubmitting}
                          required
                        />
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600, verticalAlign: 'top', paddingTop: '1.1rem' }}>
                        ${rowSubtotal.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '0.85rem' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1 || isSubmitting}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: items.length === 1 ? 'var(--border)' : 'var(--danger)',
                            cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                            padding: '0.25rem',
                          }}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              Total Line Items: <strong>{items.length}</strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Total Quantity: <strong>{calculateTotalQuantity()} units</strong>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                Total Estimated Value: ${calculateTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/challans')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Save size={16} /> Save as Draft
          </Button>
        </div>
      </form>
    </div>
  );
};
