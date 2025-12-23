export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '€0,00';
  
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};