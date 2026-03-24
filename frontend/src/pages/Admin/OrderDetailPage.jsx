import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import Button from '../../components/Global/Button';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getOrderStatusBadgeClass = (styles, status) => {
  if (!status) return styles.orderStatusUnknown;
  const key = `orderStatus${String(status).toUpperCase()}`;
  return styles[key] || styles.orderStatusUnknown;
};

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
        <div className={styles.orderMetaGrid}>
          <div>
            <p className={styles.orderMetaLabel}>Customer</p>
            <p>{order.customer?.fullName}</p>
            <p className={styles.orderMetaEmail}>{order.customer?.email}</p>
          </div>
          <div>
            <p className={styles.orderMetaLabel}>Date</p>
            <p>{formatDate(order.orderDate)}</p>
          </div>
          <div>
            <p className={styles.orderMetaLabel}>Total Amount</p>
            <p className={styles.orderTotalValue}>
              {formatCurrency(order.totalAmount, order.currency || 'EUR')}
            </p>
          </div>
          <div>
            <p className={styles.orderMetaLabel}>Status</p>
            <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className={styles.orderLineItemsPanel}>
          <p className={styles.orderLineItemsTitle}>Items in order</p>
          <table className={styles.orderLineItemsTable}>
            <caption className="srOnly">Line items for this order</caption>
            <thead>
              <tr className={styles.orderLineItemsHeadRow}>
                <th scope="col" className={styles.orderLineItemsTh}>Product</th>
                <th scope="col" className={styles.orderLineItemsTh}>SKU</th>
                <th scope="col" className={styles.orderLineItemsTh}>Qty</th>
                <th scope="col" className={styles.orderLineItemsTh}>Price Each</th>
                <th scope="col" className={styles.orderLineItemsTh}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} className={styles.orderLineItemsRow}>
                  <td className={styles.orderLineItemsTd}>
                    {item.variant?.product?.name}
                    <span className={styles.orderLineVariantMeta}>
                      ({item.variant?.size || 'N/A'})
                    </span>
                  </td>
                  <td className={`${styles.orderLineItemsTd} ${styles.orderLineSkuCell}`.trim()}>
                    {item.variant?.sku}
                  </td>
                  <td className={styles.orderLineItemsTd}>{item.quantity}</td>
                  <td className={styles.orderLineItemsTd}>
                    {formatCurrency(item.priceAtPurchase, order.currency || 'EUR')}
                  </td>
                  <td className={`${styles.orderLineItemsTd} ${styles.orderLineSubtotalCell}`.trim()}>
                    {formatCurrency(item.priceAtPurchase * item.quantity, order.currency || 'EUR')}
                  </td>
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
