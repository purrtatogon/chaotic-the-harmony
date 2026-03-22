import ItemDetailCard from './ItemDetailCard';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerOrderHistory = ({ orders, styles }) => {
  const list = Array.isArray(orders) ? orders : [];

  return (
    <ItemDetailCard title={`Order History (${list.length})`} fullWidth>
      {list.length === 0 ? (
        <p className={styles.emptyStateText}>This customer hasn&apos;t placed any orders yet.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.productTable}>
            <caption className="srOnly">Customer order history</caption>
            <thead>
              <tr className={styles.productTableHeader}>
                <th scope="col" className={styles.productTableCell}>Order ID</th>
                <th scope="col" className={styles.productTableCell}>Date</th>
                <th scope="col" className={styles.productTableCell}>Total</th>
                <th scope="col" className={styles.productTableCell}>Status</th>
                <th scope="col" className={styles.productTableCell}>Items</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id} className={styles.productTableRow}>
                  <td className={`${styles.productTableCell} ${styles.tableCellMono}`.trim()}>
                    #{order.id}
                  </td>
                  <td className={styles.productTableCell}>{formatDate(order.orderDate)}</td>
                  <td className={`${styles.productTableCell} ${styles.tableCellStrong}`.trim()}>
                    {formatCurrency(order.totalAmount, order.currency || 'EUR')}
                  </td>
                  <td className={styles.productTableCell}>
                    <span
                      className={`${styles.roleBadge} ${
                        styles[`orderStatus${String(order.status || '').toUpperCase()}`] || styles.orderStatusUnknown
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className={styles.productTableCell}>
                    <div className={styles.orderHistoryItemStack}>
                      {order.items?.map((item, idx) => (
                        <span key={idx} className={styles.orderHistoryItemLine}>
                          {item.quantity}x {item.variant?.product?.name} ({item.variant?.size})
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ItemDetailCard>
  );
};

export default CustomerOrderHistory;
