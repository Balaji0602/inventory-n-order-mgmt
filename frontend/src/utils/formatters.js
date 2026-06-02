/**
 * Formats a number or numeric string as standard US Currency ($0.00).
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(isNaN(num) ? 0 : num);
};

/**
 * Formats an ISO Date string into a human-readable local date format.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
