export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-warning',
  };
  return colors[status] || 'badge-info';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImageUrl = (path) => {
  if (!path) return '/placeholder-tea.svg';
  if (path.startsWith('http')) return path;
  return path;
};
