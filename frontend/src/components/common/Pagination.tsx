import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1 && total === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        Showing page <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{page}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{Math.max(1, totalPages)}</span>{' '}
        ({total} total records)
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} /> Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
