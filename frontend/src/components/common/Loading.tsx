import React from 'react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-between gap-2" style={{ padding: '2rem' }}>
      <div
        style={{
          width: '2rem',
          height: '2rem',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
        {message}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
