import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { getCurrentUserRole, getRoleBadgeClassName } from '../../utils/userUtils';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import Button from '../../components/Global/Button';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
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

const VALID_TRANSITIONS = {
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
};

const STATUS_UPDATE_ROLES = new Set(['ADMIN', 'MANAGER', 'SUPPORT', 'STAFF']);

const OrderDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { orderSlug } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const orderId = parseOrderSlug(orderSlug);
  const currentRole = getCurrentUserRole();
  const canChangeStatus = STATUS_UPDATE_ROLES.has(currentRole);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('Invalid order URL');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getById(orderId);
      setOrder(data);
      const transitions = VALID_TRANSITIONS[data.status] || [];
      setSelectedStatus(transitions[0] || '');
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || updating) return;
    try {
      setUpdating(true);
      setFeedback(null);
      const updated = await orderApi.updateStatus(order.id, selectedStatus);
      setOrder(updated);
      const nextTransitions = VALID_TRANSITIONS[updated.status] || [];
      setSelectedStatus(nextTransitions[0] || '');
      setFeedback({ type: 'success', message: `Status updated to ${updated.status}.` });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update status.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <AdminLoading styles={styles} message="Loading order details..." />;
  if (error) return <Error message={error} onRetry={fetchOrder} />;
  if (!order) return <Error message="Order not found" />;

  const availableTransitions = VALID_TRANSITIONS[order.status] || [];
  const isTerminal = availableTransitions.length === 0;

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={`Order #${order.id}`}
        subtitle={order.orderDate ? formatDate(order.orderDate) : ''}
        actions={
          <Link className={styles.actionLink} to="/admin/orders">
            ← Back to Orders
          </Link>
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
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
          <div>
            <p className={styles.orderMetaLabel}>Status</p>
            <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <section className={styles.orderAuditTrail} aria-label="Fulfillment and audit trail">
          <div>
            <p className={styles.orderAuditTrailLabel}>Shipped</p>
            <p className={styles.orderAuditTrailValue}>
              {order.shippedAt
                ? formatDate(order.shippedAt)
                : <span className={styles.orderAuditTrailMuted}>Not yet shipped</span>}
            </p>
          </div>
          <div>
            <p className={styles.orderAuditTrailLabel}>Delivered</p>
            <p className={styles.orderAuditTrailValue}>
              {order.deliveredAt
                ? formatDate(order.deliveredAt)
                : <span className={styles.orderAuditTrailMuted}>Not yet delivered</span>}
            </p>
          </div>
          <div>
            <p className={styles.orderAuditTrailLabel}>Last updated by</p>
            <p className={styles.orderAuditTrailValue}>
              {order.updatedBy ? (
                <>
                  {order.updatedBy.fullName}{' '}
                  <span className={getRoleBadgeClassName(styles, order.updatedBy.role)}>
                    {String(order.updatedBy.role).replace(/^ROLE_/i, '')}
                  </span>
                </>
              ) : (
                <span className={styles.orderAuditTrailMuted}>System</span>
              )}
            </p>
          </div>
        </section>

        {canChangeStatus && !isTerminal && (
          <div className={styles.orderStatusControl}>
            <label htmlFor="status-select" className={styles.orderStatusControlLabel}>
              Update status
            </label>
            <select
              id="status-select"
              className={styles.orderStatusSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={updating}
            >
              {availableTransitions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={updating || !selectedStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        )}

        {feedback && (
          <div
            className={`${styles.inlineFeedbackSuccess} ${feedback.type === 'error' ? styles.inlineFeedbackError : ''}`.trim()}
            role="status"
            aria-live="polite"
          >
            <span className={styles.inlineFeedbackIcon} aria-hidden="true">
              {feedback.type === 'success' ? '\u2713' : '\u2716'}
            </span>
            {feedback.message}
          </div>
        )}

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
                    {formatCurrency(item.priceAtPurchase)}
                  </td>
                  <td className={`${styles.orderLineItemsTd} ${styles.orderLineSubtotalCell}`.trim()}>
                    {formatCurrency(item.priceAtPurchase * item.quantity)}
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
