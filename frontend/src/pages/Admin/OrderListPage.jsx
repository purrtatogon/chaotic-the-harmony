import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ListContainer from '../../components/Admin/ListContainer';
import Table from '../../components/Global/Table';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/Global/Button';

const getOrderSlug = (order) => `${new Date(order.orderDate).getFullYear()}ordernr${order.id}`;

const getOrderStatusBadgeClass = (styles, status) => {
  if (!status) return styles.orderStatusUnknown;
  const key = `orderStatus${String(status).toUpperCase()}`;
  return styles[key] || styles.orderStatusUnknown;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_START = 2018;
const DISPLAY_YEARS = Array.from({ length: CURRENT_YEAR - YEARS_START + 1 }, (_, i) => CURRENT_YEAR - i);
const COLD_STORAGE_YEAR_THRESHOLD = CURRENT_YEAR;
const PAGE_SIZE = 25;

const MONTH_OPTIONS = [
  { value: '', label: 'All months' },
  ...Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const date = new Date(2000, m - 1, 1);
    return { value: String(m).padStart(2, '0'), label: date.toLocaleString('en-US', { month: 'long' }) };
  }),
];

function renderOrderRow(order, styles) {
  return [
    <td key="id" className={styles.tableCellMono}>
      #{order.id}
    </td>,
    <td key="customer">
      <div>{order.customer?.fullName}</div>
      <div className={styles.tableSecondaryLine}>{order.customer?.email}</div>
    </td>,
    <td key="date">{formatDate(order.orderDate)}</td>,
    <td key="amount" className={styles.tableCellStrong}>
      {formatCurrency(order.totalAmount)}
    </td>,
    <td key="status">
      <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
        {order.status}
      </span>
    </td>,
  ];
}

function MonthFilterToolbar({ styles, value, onChange, filteredCount }) {
  return (
    <div className={styles.listToolbar}>
      <select
        className={`${styles.filterInput} ${styles.filterSelectMonth}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter orders by month"
      >
        {MONTH_OPTIONS.map((m) => (
          <option key={m.value || 'all'} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <div className={`${styles.filterInput} ${styles.filterSummaryBox}`.trim()} aria-live="polite">
        <span className={styles.filterSummaryText}>
          {filteredCount} {filteredCount === 1 ? 'order' : 'orders'}
        </span>
      </div>
    </div>
  );
}

function PaginationFooter({ styles, currentPage, totalPages, onPrev, onNext }) {
  return (
    <nav className={styles.paginationBar} aria-label="Order list pagination">
      <Button size="small" variant="secondary" onClick={onPrev} disabled={currentPage <= 1} aria-label="Previous page">
        ← Previous
      </Button>
      <span className={styles.paginationStatus} aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <Button size="small" variant="secondary" onClick={onNext} disabled={currentPage >= totalPages} aria-label="Next page">
        Next →
      </Button>
    </nav>
  );
}

const OrderListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [page, setPage] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll();
      setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrdersForYear = (year) =>
    orders.filter((order) => new Date(order.orderDate).getFullYear() === year);

  const getOrdersForYearAndMonth = (year, monthValue) => {
    const yearOrders = getOrdersForYear(year);
    if (!monthValue) return yearOrders;
    return yearOrders.filter((order) => {
      const m = String(new Date(order.orderDate).getMonth() + 1).padStart(2, '0');
      return m === monthValue;
    });
  };

  if (loading && orders.length === 0) return <AdminLoading styles={styles} message="Retrieving order history..." />;
  if (error) return <Error message={error} onRetry={fetchOrders} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Orders" subtitle="Manage Customer Transactions" />

      {DISPLAY_YEARS.map((year) => {
        const isColdStorage = year < COLD_STORAGE_YEAR_THRESHOLD;

        if (isColdStorage) {
          return (
            <ListContainer key={year} title={`Orders — ${year}`}>
              <div className={styles.coldStorageNotice} role="status">
                <p className={styles.coldStorageNoticeText}>
                  Historical orders for this year have been moved to cold storage. Contact IT for a full historical
                  export or view legacy data in the Analytics Module.
                </p>
              </div>
            </ListContainer>
          );
        }

        const filteredOrders = getOrdersForYearAndMonth(year, filterMonth);
        const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
        const safePage = Math.min(page, totalPages - 1);
        const start = safePage * PAGE_SIZE;
        const pageOrders = filteredOrders.slice(start, start + PAGE_SIZE);
        const currentPage = safePage + 1;

        return (
          <ListContainer
            key={year}
            title={`Orders — ${year}`}
            actions={
              <MonthFilterToolbar
                styles={styles}
                value={filterMonth}
                onChange={(v) => {
                  setFilterMonth(v);
                  setPage(0);
                }}
                filteredCount={filteredOrders.length}
              />
            }
          >
            <Table
              caption={`${year} orders${filterMonth ? ' — month filter applied' : ''}`}
              columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
              data={pageOrders}
              renderRow={(order) => renderOrderRow(order, styles)}
              actions={(order) => (
                <Link className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()} to={`/admin/orders/${getOrderSlug(order)}`}>
                  View Details
                </Link>
              )}
            />
            {filteredOrders.length > PAGE_SIZE && (
              <PaginationFooter
                styles={styles}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            )}
          </ListContainer>
        );
      })}
    </div>
  );
};

export default OrderListPage;
