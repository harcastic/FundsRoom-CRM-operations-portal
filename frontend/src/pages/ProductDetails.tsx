import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, Edit2 } from 'lucide-react';
import type { Product, CreateProductInput } from '../types/product.types';
import type { StockMovement, AdjustStockInput } from '../types/inventory.types';
import { productService } from '../services/product.service';
import { inventoryService } from '../services/inventory.service';
import { extractErrorMessage } from '../services/api';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const [prodData, moveData] = await Promise.all([
        productService.getProductById(productId),
        inventoryService.getStockMovements(productId).catch(() => []),
      ]);
      setProduct(prodData);
      setMovements(moveData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleUpdateProduct = async (data: CreateProductInput) => {
    await productService.updateProduct(productId, data);
    loadData();
  };

  const handleAdjustStock = async (pId: number, data: AdjustStockInput) => {
    await inventoryService.adjustStock(pId, data);
    loadData();
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loading message="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <Button variant="secondary" onClick={() => navigate('/products')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </Button>
        <ErrorMessage message={error || 'Product not found'} onRetry={loadData} />
      </div>
    );
  }

  const isLowStock = product.current_stock <= product.minimum_stock;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <h2 className="page-title">{product.name}</h2>
            <p className="page-subtitle">
              SKU: <code>{product.sku}</code> • Category: {product.category}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {permissions.canManageProducts(user) && (
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} /> Edit Product
            </Button>
          )}
          {permissions.canAdjustStock(user) && (
            <Button variant="primary" onClick={() => setIsAdjustModalOpen(true)}>
              <Sliders size={16} /> Adjust Stock
            </Button>
          )}
        </div>
      </div>

      {/* Stock Highlight Card & Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Main Stock Card */}
        <div
          className="card"
          style={{
            borderColor: isLowStock ? '#fecaca' : 'var(--border)',
            backgroundColor: isLowStock ? 'var(--danger-bg)' : 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Current Stock Level</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isLowStock ? 'var(--danger)' : 'var(--primary)', margin: '0.25rem 0' }}>
              {product.current_stock} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>units</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Min Threshold: <strong>{product.minimum_stock}</strong></span>
            <StatusBadge status={isLowStock ? 'Low Stock' : 'In Stock'} />
          </div>
        </div>

        {/* Product Details Card */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.375rem' }}>
            Specification & Location
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unit Price</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                ${Number(product.unit_price).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warehouse Location</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-main)' }}>
                {product.warehouse_location}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{product.category}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last Updated</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                {new Date(product.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Stock Movement History</h3>

        {movements.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No stock adjustments recorded for this product.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={m.movement_type === 'IN' ? 'ACTIVE' : 'CANCELLED'} />
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.375rem', fontWeight: 600 }}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: m.movement_type === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
                      {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td style={{ maxWidth: '300px' }}>{m.reason}</td>
                    <td>{m.creator_name || `User #${m.created_by}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProduct}
        initialData={product}
      />

      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={product}
        onSubmit={handleAdjustStock}
      />
    </div>
  );
};
