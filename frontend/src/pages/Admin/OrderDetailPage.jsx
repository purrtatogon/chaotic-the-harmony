import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ItemDetailCard from '../../components/ItemDetailCard';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { formatCurrency, formatDate } from '../../utils/formatters';
const getOrderStatusBadgeClass = (styles, status) => {
  if (!status) return styles.orderStatusUnknown;
  const key = `orderStatus${String(status).toUpperCase()}`;
  return styles[key] || styles.orderStatusUnknown;
};

/**
 * Parse slug "2025ordernr1101" -> order id 1101
 */
const parseOrderSlug = (slug) => {
  if (!slug) return null;
  const match = slug.match(/ordernr(\d+)$/i);
  return match ? match[1] : null;
};

const OrderDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { orderSlug } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = parseOrderSlug(orderSlug);

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order URL');
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Loading message="Loading order details..." />;
  if (error) return <Error message={error} onRetry={() => window.location.reload()} />;
  if (!order) return <Error message="Order not found" />;

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={`Order #${order.id}`}
        subtitle={order.orderDate ? formatDate(order.orderDate) : ''}
        actions={
          <Button onClick={() => navigate('/admin/orders')}>
            ← Back to Orders
          </Button>
        }
      />

      <ItemDetailCard title="Order details" fullWidth>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Customer</p>
            <p>{order.customer?.fullName}</p>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>{order.customer?.email}</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Date</p>
            <p>{formatDate(order.orderDate)}</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Total Amount</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(order.totalAmount, order.currency || 'EUR')}</p>
          </div>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Status</p>
            <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div style={{ border: '3px solid black', padding: '16px', background: '#f5f5f5' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' }}>Items in Order</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid black' }}>
                <th style={{ padding: '8px' }}>Product</th>
                <th style={{ padding: '8px' }}>SKU</th>
                <th style={{ padding: '8px' }}>Qty</th>
                <th style={{ padding: '8px' }}>Price Each</th>
                <th style={{ padding: '8px' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>
                    {item.variant?.product?.name}
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>
                      ({item.variant?.size || 'N/A'})
                    </span>
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace' }}>{item.variant?.sku}</td>
                  <td style={{ padding: '8px' }}>{item.quantity}</td>
                  <td style={{ padding: '8px' }}>{formatCurrency(item.priceAtPurchase, order.currency || 'EUR')}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{formatCurrency(item.priceAtPurchase * item.quantity, order.currency || 'EUR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ItemDetailCard>
    </div>
  );
};

export default OrderDetailPage;
