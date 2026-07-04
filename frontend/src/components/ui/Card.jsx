import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  const hoverClass = hover ? 'hover:shadow-md hover:border-neutral-300 transition-all duration-200' : '';
  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-neutral-800 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-neutral-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
