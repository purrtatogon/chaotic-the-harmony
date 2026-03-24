import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ListContainer from '../../components/Admin/ListContainer';
import Table from '../../components/Global/Table';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/Global/Button';

const getOrderSlug = (order) => `${new Date(order.orderDate).getFullYear()}ordernr${order.id}`;

const getOrderStatusBadgeClass = (styles, status) => {
  if (!status) return styles.orderStatusUnknown;
  const key = `orderStatus${String(status).toUpperCase()}`;
  return styles[key] || styles.orderStatusUnknown;
};

const YEARS_START = 2018;
const DISPLAY_YEARS = Array.from({ length: 2026 - YEARS_START + 1 }, (_, i) => 2026 - i);
const COLD_STORAGE_YEAR_THRESHOLD = 2025;
const PAGE_SIZE_2025 = 25;

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
      {formatCurrency(order.totalAmount, order.currency || 'EUR')}
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
    <div className={styles.paginationBar}>
      <Button size="small" variant="secondary" onClick={onPrev} disabled={currentPage <= 1}>
        ← Previous
      </Button>
      <span className={styles.paginationStatus}>
        Page {currentPage} of {totalPages}
      </span>
      <Button size="small" variant="secondary" onClick={onNext} disabled={currentPage >= totalPages}>
        Next →
      </Button>
    </div>
  );
}

const OrderListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMonth2026, setFilterMonth2026] = useState('');
  const [filterMonth2025, setFilterMonth2025] = useState('');
  const [page2026, setPage2026] = useState(0);
  const [page2025, setPage2025] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getAll();
        setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

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

  if (loading && orders.length === 0) return <Loading message="Retrieving order history..." />;
  if (error) return <Error message={error} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Orders" subtitle="Manage Customer Transactions" />

      {DISPLAY_YEARS.map((year) => {
        const isColdStorage = year < COLD_STORAGE_YEAR_THRESHOLD;

        if (isColdStorage) {
          return (
            <ListContainer key={year} title={`Orders — ${year}`}>
              <div className={styles.coldStorageNotice}>
                <p className={styles.coldStorageNoticeText}>
                  Historical orders for this year have been moved to cold storage. Contact IT for a full historical
                  export or view legacy data in the Analytics Module.
                </p>
              </div>
            </ListContainer>
          );
        }

        const monthFilter = year === 2026 ? filterMonth2026 : year === 2025 ? filterMonth2025 : '';
        const filteredOrders = getOrdersForYearAndMonth(year, monthFilter);

        if (year === 2026) {
          const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE_2025));
          const safePage = Math.min(page2026, totalPages - 1);
          const start = safePage * PAGE_SIZE_2025;
          const pageOrders = filteredOrders.slice(start, start + PAGE_SIZE_2025);
          const currentPage = safePage + 1;

          return (
            <ListContainer
              key={year}
              title={`Orders — ${year}`}
              actions={
                <MonthFilterToolbar
                  styles={styles}
                  value={filterMonth2026}
                  onChange={(v) => {
                    setFilterMonth2026(v);
                    setPage2026(0);
                  }}
                  filteredCount={filteredOrders.length}
                />
              }
            >
              <Table
                caption={`${year} orders${monthFilter ? ' — month filter applied' : ''}`}
                columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
                data={pageOrders}
                renderRow={(order) => renderOrderRow(order, styles)}
                actions={(order) => (
                  <Button size="small" variant="secondary" onClick={() => navigate(`/admin/orders/${getOrderSlug(order)}`)}>
                    View Details
                  </Button>
                )}
              />
              {filteredOrders.length > PAGE_SIZE_2025 && (
                <PaginationFooter
                  styles={styles}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrev={() => setPage2026((p) => Math.max(0, p - 1))}
                  onNext={() => setPage2026((p) => Math.min(totalPages - 1, p + 1))}
                />
              )}
            </ListContainer>
          );
        }

        if (year === 2025) {
          const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE_2025));
          const safePage = Math.min(page2025, totalPages - 1);
          const start = safePage * PAGE_SIZE_2025;
          const pageOrders = filteredOrders.slice(start, start + PAGE_SIZE_2025);
          const currentPage = safePage + 1;

          return (
            <ListContainer
              key={year}
              title={`Orders — ${year}`}
              actions={
                <MonthFilterToolbar
                  styles={styles}
                  value={filterMonth2025}
                  onChange={(v) => {
                    setFilterMonth2025(v);
                    setPage2025(0);
                  }}
                  filteredCount={filteredOrders.length}
                />
              }
            >
              <Table
                caption={`${year} orders${monthFilter ? ' — month filter applied' : ''}`}
                columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
                data={pageOrders}
                renderRow={(order) => renderOrderRow(order, styles)}
                actions={(order) => (
                  <Button size="small" variant="secondary" onClick={() => navigate(`/admin/orders/${getOrderSlug(order)}`)}>
                    View Details
                  </Button>
                )}
              />
              {filteredOrders.length > PAGE_SIZE_2025 && (
                <PaginationFooter
                  styles={styles}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrev={() => setPage2025((p) => Math.max(0, p - 1))}
                  onNext={() => setPage2025((p) => Math.min(totalPages - 1, p + 1))}
                />
              )}
            </ListContainer>
          );
        }

        const yearOrders = getOrdersForYear(year);
        return (
          <ListContainer key={year} title={`Orders — ${year}`} count={yearOrders.length}>
            <Table
              caption={`All orders for ${year}`}
              columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
              data={yearOrders}
              renderRow={(order) => renderOrderRow(order, styles)}
              actions={(order) => (
                <Button size="small" variant="secondary" onClick={() => navigate(`/admin/orders/${getOrderSlug(order)}`)}>
                  View Details
                </Button>
              )}
            />
          </ListContainer>
        );
      })}
    </div>
  );
};

export default OrderListPage;
