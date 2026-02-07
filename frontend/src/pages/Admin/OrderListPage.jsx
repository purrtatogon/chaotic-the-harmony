import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ListContainer from '../../components/ListContainer';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/Button';

/** Build order detail URL slug: e.g. 2025ordernr1101 */
const getOrderSlug = (order) => `${new Date(order.orderDate).getFullYear()}ordernr${order.id}`;

const getOrderStatusBadgeClass = (styles, status) => {
  if (!status) return styles.orderStatusUnknown;
  const key = `orderStatus${String(status).toUpperCase()}`;
  return styles[key] || styles.orderStatusUnknown;
};

const YEARS_START = 2018;
const currentYear = new Date().getFullYear();
/** Years shown as sections, newest first: 2026, 2025, …, 2018 */
const DISPLAY_YEARS = Array.from({ length: 2026 - YEARS_START + 1 }, (_, i) => 2026 - i);
const COLD_STORAGE_YEAR_THRESHOLD = 2025; // years < this show cold-storage note
const PAGE_SIZE_2025 = 25;

const MONTH_OPTIONS = [
  { value: '', label: 'All months' },
  ...Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const date = new Date(2000, m - 1, 1);
    return { value: String(m).padStart(2, '0'), label: date.toLocaleString('en-US', { month: 'long' }) };
  })
];

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
              <div style={{ padding: '20px 24px', color: 'var(--gray-100)', fontSize: '0.95rem', fontWeight: 600, borderTop: '1px solid var(--gray-100)' }}>
                <p style={{ margin: 0 }}>Historical orders for this year have been moved to cold storage. Contact IT for a full historical export or view legacy data in the Analytics Module.</p>
              </div>
            </ListContainer>
          );
        }

        const is2025 = year === 2025;
        const monthFilter = year === 2026 ? filterMonth2026 : year === 2025 ? filterMonth2025 : '';
        const setMonthFilter = year === 2026 ? setFilterMonth2026 : year === 2025 ? setFilterMonth2025 : () => {};
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <select
                    className={styles.filterInput}
                    value={monthFilter}
                    onChange={(e) => { setMonthFilter(e.target.value); setPage2026(0); }}
                    style={{ minWidth: '140px' }}
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value || 'all'} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <div
                    className={styles.filterInput}
                    style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
                  >
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
              }
            >
              <Table
                columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
                data={pageOrders}
                renderRow={(order) => [
                  <td key="id" style={{ fontFamily: 'monospace' }}>#{order.id}</td>,
                  <td key="customer">
                    <div>{order.customer?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.customer?.email}</div>
                  </td>,
                  <td key="date">{formatDate(order.orderDate)}</td>,
                  <td key="amount" style={{ fontWeight: 'bold' }}>{formatCurrency(order.totalAmount, order.currency || 'EUR')}</td>,
                  <td key="status">
                    <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                ]}
                actions={(order) => (
                  <Button size="small" variant="secondary" onClick={() => navigate(`/admin/orders/${getOrderSlug(order)}`)}>
                    View Details
                  </Button>
                )}
              />
              {filteredOrders.length > PAGE_SIZE_2025 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderTop: 'var(--border-width) solid var(--gray-100)' }}>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage2026((p) => Math.max(0, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    ← Previous
                  </Button>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage2026((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next →
                  </Button>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <select
                    className={styles.filterInput}
                    value={monthFilter}
                    onChange={(e) => { setMonthFilter(e.target.value); setPage2025(0); }}
                    style={{ minWidth: '140px' }}
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value || 'all'} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <div
                    className={styles.filterInput}
                    style={{ minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
                  >
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>
              }
            >
              <Table
                columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
                data={pageOrders}
                renderRow={(order) => [
                  <td key="id" style={{ fontFamily: 'monospace' }}>#{order.id}</td>,
                  <td key="customer">
                    <div>{order.customer?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.customer?.email}</div>
                  </td>,
                  <td key="date">{formatDate(order.orderDate)}</td>,
                  <td key="amount" style={{ fontWeight: 'bold' }}>{formatCurrency(order.totalAmount, order.currency || 'EUR')}</td>,
                  <td key="status">
                    <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                ]}
                actions={(order) => (
                  <Button size="small" variant="secondary" onClick={() => navigate(`/admin/orders/${getOrderSlug(order)}`)}>
                    View Details
                  </Button>
                )}
              />
              {filteredOrders.length > PAGE_SIZE_2025 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderTop: 'var(--border-width) solid var(--gray-100)' }}>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage2025((p) => Math.max(0, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    ← Previous
                  </Button>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage2025((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </ListContainer>
          );
        }

        const yearOrders = getOrdersForYear(year);
        return (
          <ListContainer key={year} title={`Orders — ${year}`} count={yearOrders.length}>
            <Table
              columns={['ID', 'Customer', 'Date', 'Amount', 'Status']}
              data={yearOrders}
              renderRow={(order) => [
                <td key="id" style={{ fontFamily: 'monospace' }}>#{order.id}</td>,
                <td key="customer">
                  <div>{order.customer?.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.customer?.email}</div>
                </td>,
                <td key="date">{formatDate(order.orderDate)}</td>,
                <td key="amount" style={{ fontWeight: 'bold' }}>{formatCurrency(order.totalAmount, order.currency || 'EUR')}</td>,
                <td key="status">
                  <span className={`${styles.roleBadge} ${getOrderStatusBadgeClass(styles, order.status)}`}>
                    {order.status}
                  </span>
                </td>
              ]}
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
