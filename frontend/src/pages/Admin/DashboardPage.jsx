import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import { BACKLINE_FLOURISHES, getCurrentUserRole, getRoleBadgeClassName, getRoleDisplayName } from '../../utils/userUtils';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

function activityIconClass(type, styles) {
  if (type === 'ORDER') return styles.activityIconOrder;
  if (type === 'PRODUCT') return styles.activityIconProduct;
  if (type === 'STAFF') return styles.activityIconStaff;
  if (type === 'USER') return styles.activityIconUser;
  return styles.activityIconDefault;
}

function activityIconLetter(type) {
  if (type === 'ORDER') return 'O';
  if (type === 'STAFF') return 'S';
  if (type === 'USER') return 'U';
  if (type === 'PRODUCT') return 'P';
  return '-';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DashboardPage = () => {
  const styles = getThemeStyles(useTheme());

  const username = localStorage.getItem('admin_username') || 'Admin';
  const role = getCurrentUserRole();
  const roleLabel = getRoleDisplayName(role) || '—';
  const statusFlourish = BACKLINE_FLOURISHES[role] || 'Standing by.';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    const MIN_DISPLAY_MS = 1200;
    try {
      setLoading(true);
      setError(null);
      const [data] = await Promise.all([
        dashboardApi.getStats(),
        new Promise((r) => setTimeout(r, MIN_DISPLAY_MS)),
      ]);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <AdminLoading styles={styles} message="Loading CTH data..." />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const DashboardStatCard = ({ title, value, subtext, subtextTone = 'neutral', variant }) => {
    const subClass =
      subtextTone === 'attention'
        ? styles.dashboardStatSubtextAttention
        : subtextTone === 'urgent'
          ? styles.dashboardStatSubtextUrgent
          : styles.dashboardStatSubtextNeutral;

    const variantMap = {
      orders: styles.dashboardStatCardOrders,
      inventoryAlert: styles.dashboardStatCardInventoryAlert,
      inventoryClear: styles.dashboardStatCardInventoryClear,
      outOfStock: styles.dashboardStatCardOutOfStock,
      popular: styles.dashboardStatCardPopular,
      pending: styles.dashboardStatCardPending,
      customers: styles.dashboardStatCardCustomers,
      revenue: styles.dashboardStatCardRevenue,
    };
    const variantClass = variantMap[variant] || '';

    return (
      <div className={`${styles.dashboardStatCard} ${variantClass}`.trim()}>
        <span className={styles.dashboardStatTitle}>{title}</span>
        <span className={styles.dashboardStatValue}>{value}</span>
        {subtext && (
          <span className={`${styles.dashboardStatSubtext} ${subClass}`.trim()}>{subtext}</span>
        )}
      </div>
    );
  };

  const now = new Date();
  const currentMonthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
      <div className={styles.pageContent}>
        {/* Tier 1: Welcome banner */}
        <div className={styles.dashboardWelcomeHeader}>
          <div className={styles.dashboardWelcomeRow}>
            <span className={styles.dashboardAuthBadge}>[ AUTHENTICATED ]</span>
            <h1 className={styles.dashboardWelcomeTitle}>
              Welcome back, {username}!
            </h1>
          </div>
          
          <p className={styles.dashboardWelcomeSubtitle}>
            <span className={styles.dashboardWelcomeMeta}>
              <span className={styles.dashboardRoleMetaLabel}>ROLE</span>
              <span
                className={`${getRoleBadgeClassName(styles, role)} ${styles.dashboardWelcomeRoleBadge}`.trim()}
              >
                {roleLabel}
              </span>
              <span className={styles.dashboardWelcomeMetaDelimiter} aria-hidden="true">
                //
              </span>
              <span className={styles.dashboardRoleMetaLabel}>STATUS</span>
              <span
                className={`${getRoleBadgeClassName(styles, role)} ${styles.dashboardWelcomeRoleBadge} ${styles.dashboardWelcomeStatusBadge}`.trim()}
              >
                {statusFlourish}
              </span>
            </span>
          </p>
        </div>

        {/* Tier 2: Orders + Revenue */}
        <div
          className={`${styles.dashboardStatusBar} ${styles.dashboardSectionGap}`.trim()}
          role="group"
          aria-label="Orders and revenue metrics"
        >
          <DashboardStatCard
            title="Orders today"
            value={stats.ordersToday}
            subtext={
              stats.pendingOrders > 0
                ? `${stats.pendingOrders} processing`
                : 'All fulfilled'
            }
            subtextTone={stats.pendingOrders > 0 ? 'attention' : 'neutral'}
            variant="orders"
          />
          <DashboardStatCard
            title="Pending orders"
            value={stats.pendingOrders}
            subtext={stats.pendingOrders > 0 ? 'Awaiting fulfillment' : 'Queue clear'}
            subtextTone={stats.pendingOrders > 0 ? 'attention' : 'neutral'}
            variant={stats.pendingOrders > 0 ? 'pending' : 'inventoryClear'}
          />
          <DashboardStatCard
            title="Revenue this month"
            value={formatCurrency(stats.revenueThisMonth)}
            subtext={currentMonthLabel}
            variant="revenue"
          />
          <DashboardStatCard
            title="Avg. order value"
            value={formatCurrency(stats.averageOrderValue)}
            subtext={`From ${stats.totalOrders} total orders`}
          />
        </div>

        {/* Tier 3: Growth + Inventory health */}
        <div className={styles.dashboardMetricsGrid}>
          <DashboardStatCard
            title="New customers"
            value={stats.newCustomersThisMonth}
            subtext={`${stats.totalCustomers} total customers`}
            variant="customers"
          />
          <DashboardStatCard
            title="Low stock alerts"
            value={stats.lowStockCount}
            subtext={
              stats.lowStockCount > 0
                ? 'SKUs below restock threshold'
                : 'No SKUs flagged low'
            }
            subtextTone={stats.lowStockCount > 0 ? 'attention' : 'neutral'}
            variant={stats.lowStockCount > 0 ? 'inventoryAlert' : 'inventoryClear'}
          />
          <DashboardStatCard
            title="Out of stock"
            value={stats.outOfStockCount}
            subtext="Items unavailable"
            subtextTone={stats.outOfStockCount > 0 ? 'urgent' : 'neutral'}
            variant={stats.outOfStockCount > 0 ? 'outOfStock' : 'inventoryClear'}
          />
        </div>

        {/* Tier 4: Detail panels — products (left) | activity (right) */}
        <div className={styles.dashboardDetailsGrid}>
          <ItemDetailCard title="CTH Catalog">
            <DashboardStatCard
              title="Total products"
              value={stats.totalProducts}
              subtext={
                stats.lowStockCount > 0
                  ? `${stats.lowStockCount} items low on stock`
                  : 'All items well stocked'
              }
              subtextTone={stats.lowStockCount > 0 ? 'attention' : 'neutral'}
            />

            <h3 className={styles.dashboardCatalogSubheading}>Popular Products</h3>
            <table className={styles.dashboardTable}>
              <caption className="srOnly">Popular products by unit price and units sold</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.dashboardTableHeader}>
                    Product
                  </th>
                  <th
                    scope="col"
                    className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`.trim()}
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`.trim()}
                  >
                    Units Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                  stats.topSellingProducts.map((product, idx) => (
                    <tr key={idx} className={styles.dashboardTableRow}>
                      <td className={styles.dashboardTableCell}>
                        <Link
                          to={`/admin/products/${product.productId}`}
                          className={styles.dashboardProductLink}
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className={`${styles.dashboardTableCell} ${styles.dashboardTableCellRight}`.trim()}>
                        {formatCurrency(product.unitPrice)}
                      </td>
                      <td className={`${styles.dashboardTableCellBold} ${styles.dashboardTableCellRight}`.trim()}>
                        {product.sold}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={styles.dashboardEmptyMessage}>
                      No sales data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ItemDetailCard>

          <ItemDetailCard title="Recent Activity">
            <div className={styles.activityList}>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, idx) => (
                  <div key={idx} className={styles.activityItem}>
                    <div
                      className={`${styles.activityIcon} ${activityIconClass(activity.type, styles)}`.trim()}
                      role="img"
                      aria-label={activity.type ? `${activity.type} activity` : 'Activity'}
                    >
                      <span aria-hidden="true">{activityIconLetter(activity.type)}</span>
                    </div>
                    <div className={styles.activityText}>
                      <div className={styles.activityDescription}>{activity.description}</div>
                      <div className={styles.activityTime}>
                        {activity.time ? formatDate(activity.time) : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.dashboardEmptyMessage}>No recent activity found.</p>
              )}
            </div>
          </ItemDetailCard>
        </div>
      </div>
  );
};

export default DashboardPage;
