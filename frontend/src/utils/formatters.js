export const formatCurrency = (amount, currencyCode = 'EUR') => {
  if (amount === null || amount === undefined) {
    const symbol = currencyCode === 'EUR' ? '€' : currencyCode === 'USD' ? '$' : currencyCode;
    return `${symbol}0,00`;
  }
  
  // Use appropriate locale based on currency
  let locale = 'pt-PT'; // Default to Portuguese for EUR
  if (currencyCode === 'USD') {
    locale = 'en-US';
  } else if (currencyCode === 'GBP') {
    locale = 'en-GB';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString; // Return original string if parsing fails
  }
};