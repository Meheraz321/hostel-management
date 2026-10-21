import React from 'react';

type StatusType = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'RESERVED' 
  | 'MAINTENANCE' 
  | 'FULL' 
  | 'PARTIALLY_OCCUPIED'
  | 'ACTIVE' 
  | 'PENDING' 
  | 'CHECKED_OUT' 
  | 'SUSPENDED'
  | 'PAID' 
  | 'PARTIAL' 
  | 'OVERDUE'
  | 'SUBMITTED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHECKED_IN';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let colorClasses = 'text-slate-600 dark:text-slate-300';
  let dotColor = 'bg-slate-400';
  let label = status.replace(/_/g, ' ');

  switch (norm) {
    case 'AVAILABLE':
    case 'ACTIVE':
    case 'PAID':
    case 'RESOLVED':
    case 'APPROVED':
    case 'COMPLETED':
      colorClasses = 'text-emerald-700 dark:text-emerald-400 font-medium';
      dotColor = 'bg-emerald-500';
      break;

    case 'OCCUPIED':
    case 'CHECKED_IN':
    case 'FULL':
      colorClasses = 'text-blue-700 dark:text-blue-400 font-medium';
      dotColor = 'bg-blue-500';
      break;

    case 'PARTIALLY_OCCUPIED':
    case 'PARTIAL':
    case 'PENDING':
    case 'SUBMITTED':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'RESERVED':
      colorClasses = 'text-amber-700 dark:text-amber-400 font-medium';
      dotColor = 'bg-amber-500';
      break;

    case 'MAINTENANCE':
    case 'OVERDUE':
    case 'SUSPENDED':
    case 'REJECTED':
      colorClasses = 'text-rose-700 dark:text-rose-400 font-medium';
      dotColor = 'bg-rose-500';
      break;

    case 'CHECKED_OUT':
    case 'CLOSED':
      colorClasses = 'text-slate-500 dark:text-slate-400 font-medium';
      dotColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        size === 'sm' ? 'text-xs' : 'text-xs'
      } ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span className="capitalize">{label.toLowerCase()}</span>
    </span>
  );
};
