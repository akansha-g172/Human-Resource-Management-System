import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const cleanStatus = status.toLowerCase();

  const styles = {
    // Attendance
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    absent: 'bg-rose-50 text-rose-700 border-rose-200',
    'half-day': 'bg-amber-50 text-amber-700 border-amber-200',
    leave: 'bg-sky-50 text-sky-700 border-sky-200',
    
    // Leave status
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const labels = {
    present: 'Present',
    absent: 'Absent',
    'half-day': 'Half Day',
    leave: 'On Leave',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  const badgeStyle = styles[cleanStatus] || 'bg-neutral-50 text-neutral-600 border-neutral-200';
  const label = labels[cleanStatus] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
}
