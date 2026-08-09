import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group">
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          id={inputId}
          ref={ref}
          className={`${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
