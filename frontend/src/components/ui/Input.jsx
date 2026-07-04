import React from 'react';

export default function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-neutral-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-colors py-2 px-3 disabled:bg-neutral-50 disabled:text-neutral-400 ${
          error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''
        }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger-600 font-medium leading-4 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
