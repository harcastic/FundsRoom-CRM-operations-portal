import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--danger-bg)',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius)',
        padding: '0.75rem 1rem',
        color: 'var(--danger)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{ marginLeft: '1rem' }}
        >
          Retry
        </button>
      )}
    </div>
  );
};
