// lib/utils.ts
export const formatPrice = (value: any): string => {
  if (value === null || value === undefined) return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return numValue.toFixed(2);
};

export const formatCurrency = (value: any, currency: string = '$'): string => {
  if (value === null || value === undefined) return `${currency}0.00`;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return `${currency}0.00`;
  return `${currency}${numValue.toFixed(2)}`;
};