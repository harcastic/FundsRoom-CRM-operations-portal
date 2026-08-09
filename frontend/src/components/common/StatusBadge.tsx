import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const formattedStatus = status ? status.toUpperCase() : '';
  let badgeClass = 'badge-inactive';

  switch (formattedStatus) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'IN_STOCK':
    case 'IN STOCK':
      badgeClass = 'badge-active';
      break;

    case 'LEAD':
    case 'RETAIL':
      badgeClass = 'badge-lead';
      break;

    case 'DRAFT':
    case 'WHOLESALE':
      badgeClass = 'badge-draft';
      break;

    case 'LOW_STOCK':
    case 'LOW STOCK':
    case 'OUT_OF_STOCK':
    case 'OUT OF STOCK':
      badgeClass = 'badge-low_stock';
      break;

    case 'INACTIVE':
    case 'CANCELLED':
    case 'DISTRIBUTOR':
    default:
      badgeClass = 'badge-inactive';
      break;
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
