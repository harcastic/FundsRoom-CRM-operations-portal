import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sliders, Eye } from 'lucide-react';
import type { Product } from '../types/product.types';
import type { AdjustStockInput } from '../types/inventory.types';
import { productService } from '../services/product.service';
import { inventoryService } from '../services/inventory.service';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({
        search: search.trim() || undefined,
        page,
        limit: 10,
      });
      setProducts(res.data);
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
    fetchInventory();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const handleAdjustStock = async (productId: number, data: AdjustStockInput) => {
    await inventoryService.adjustStock(productId, data);
    fetchInventory();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory & Stock Movements</h2>
          <p className="page-subtitle">Track physical stock counts, minimum thresholds, and log stock adjustments</p>
        </div>
      </div>

      <ErrorMessage message={error || ''} onRetry={fetchInventory} />

      {/* Search Filter Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search product name, SKU, location..."
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
      </div>

      {loading ? (
        <Loading message="Loading inventory stock levels..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No inventory records"
          description={search ? 'No products matched your search term.' : 'No products found.'}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min. Stock</th>
                <th>Status</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const isLowStock = prod.current_stock <= prod.minimum_stock;
                const statusText = isLowStock ? 'Low Stock' : 'In Stock';

                return (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td>
                      <code style={{ fontSize: '0.8125rem' }}>{prod.sku}</code>
                    </td>
                    <td>{prod.category}</td>
                    <td style={{ fontWeight: 700, color: isLowStock ? 'var(--danger)' : 'var(--text-main)' }}>
                      {prod.current_stock}
                    </td>
                    <td>{prod.minimum_stock}</td>
                    <td>
                      <StatusBadge status={statusText} />
                    </td>
                    <td>{prod.warehouse_location}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/products/${prod.id}`)}
                          title="View Details & Movement History"
                        >
                          <Eye size={14} /> History
                        </Button>

                        {permissions.canAdjustStock(user) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setAdjustingProduct(prod)}
                          >
                            <Sliders size={14} /> Adjust Stock
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <StockAdjustmentModal
        isOpen={!!adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onSubmit={handleAdjustStock}
      />
    </div>
  );
};
