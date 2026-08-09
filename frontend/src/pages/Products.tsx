import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2 } from 'lucide-react';
import type { Product, CreateProductInput } from '../types/product.types';
import { productService } from '../services/product.service';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { permissions } from '../utils/permissions';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { ProductFormModal } from '../components/products/ProductFormModal';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({
        search: search.trim() || undefined,
        lowStock: onlyLowStock ? true : undefined,
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
    fetchProducts();
  }, [page, onlyLowStock]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCreateOrUpdate = async (data: CreateProductInput) => {
    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, data);
    } else {
      await productService.createProduct(data);
    }
    fetchProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Product Catalog</h2>
          <p className="page-subtitle">Manage catalog items, pricing, SKU codes, and stock levels</p>
        </div>

        {permissions.canManageProducts(user) && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Product
          </Button>
        )}
      </div>

      <ErrorMessage message={error || ''} onRetry={fetchProducts} />

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
              placeholder="Search product name, SKU, category..."
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

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => {
              setOnlyLowStock(e.target.checked);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Show Low Stock Only</span>
        </label>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Loading catalog items..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search || onlyLowStock
              ? 'No products matched your search or low stock filter.'
              : 'Add your first product to start managing inventory.'
          }
          actionLabel={permissions.canManageProducts(user) ? 'Add Product' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Min. Stock</th>
                <th>Location</th>
                <th>Status</th>
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
                    <td>${Number(prod.unit_price).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: isLowStock ? 'var(--danger)' : 'var(--text-main)' }}>
                      {prod.current_stock}
                    </td>
                    <td>{prod.minimum_stock}</td>
                    <td>{prod.warehouse_location}</td>
                    <td>
                      <StatusBadge status={statusText} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/products/${prod.id}`)}
                          title="View Details"
                        >
                          <Eye size={14} /> View
                        </Button>
                        {permissions.canManageProducts(user) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(prod)}
                            title="Edit Product"
                          >
                            <Edit2 size={14} /> Edit
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

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProduct}
      />
    </div>
  );
};
