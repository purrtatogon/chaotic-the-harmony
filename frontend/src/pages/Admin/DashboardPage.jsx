import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import { getAvatarUrl } from '../../utils/userUtils';
import { formatCurrency } from '../../utils/formatters';

function activityIconClass(type, styles) {
  if (type === 'ORDER') return styles.activityIconOrder;
  if (type === 'PRODUCT') return styles.activityIconProduct;
  return styles.activityIconDefault;
}

const DashboardPage = () => {
  const styles = getThemeStyles(useTheme());

  const username = localStorage.getItem('username') || 'Admin';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) return <Loading message="Loading overview..." />;
  if (error) return <Error message={error} />;

  const DashboardStatCard = ({ title, value, subtext, subtextTone = 'neutral' }) => {
    const subClass =
      subtextTone === 'attention'
        ? styles.dashboardStatSubtextAttention
        : subtextTone === 'urgent'
          ? styles.dashboardStatSubtextUrgent
          : styles.dashboardStatSubtextNeutral;
    return (
      <div className={styles.dashboardStatCard}>
        <span className={styles.dashboardStatTitle}>{title}</span>
        <span className={styles.dashboardStatValue}>{value}</span>
        {subtext && (
          <span className={`${styles.dashboardStatSubtext} ${subClass}`.trim()}>{subtext}</span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.dashboardWelcomeHeader}>
        <div className={styles.dashboardWelcomeRow}>
          <div className={`${styles.avatarSmall} ${styles.dashboardWelcomeAvatar}`.trim()}>
            <img src={getAvatarUrl(username)} alt="" />
          </div>
          <h1 className={styles.dashboardWelcomeTitle}>Welcome back, {username}!</h1>
        </div>
        <p className={styles.dashboardWelcomeSubtitle}>Here is what&apos;s happening with your store today.</p>
      </div>

      <div className={styles.dashboardMetricsGrid}>
        <DashboardStatCard
          title="Total Sales"
          value={`${formatCurrency(stats.totalSales)}`}
          subtext="Revenue from all cycles"
        />
        <DashboardStatCard
          title="Total Products"
          value={stats.totalProducts}
          subtext={`${stats.lowStockCount} items low on stock`}
          subtextTone={stats.lowStockCount > 0 ? 'attention' : 'neutral'}
        />
        <DashboardStatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtext={`Avg. Order: ${formatCurrency(stats.averageOrderValue)}`}
        />
        <DashboardStatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          subtext="Items unavailable"
          subtextTone={stats.outOfStockCount > 0 ? 'urgent' : 'neutral'}
        />
      </div>

      <div className={styles.dashboardDetailsGrid}>
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
                    <span aria-hidden="true">{activity.type ? activity.type.substring(0, 1) : '-'}</span>
                  </div>
                  <div className={styles.activityText}>
                    <div className={styles.activityDescription}>{activity.description}</div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.dashboardEmptyMessage}>No recent activity found.</p>
            )}
          </div>
        </ItemDetailCard>

        <ItemDetailCard title="Top Selling Products">
          <table className={styles.dashboardTable}>
            <caption className="srOnly">Top selling products by units sold and revenue</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.dashboardTableHeader}>
                  Product
                </th>
                <th
                  scope="col"
                  className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`.trim()}
                >
                  Sold
                </th>
                <th
                  scope="col"
                  className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`.trim()}
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                stats.topSellingProducts.map((product, idx) => (
                  <tr key={idx} className={styles.dashboardTableRow}>
                    <td className={styles.dashboardTableCell}>{product.name}</td>
                    <td className={`${styles.dashboardTableCell} ${styles.dashboardTableCellRight}`.trim()}>
                      {product.sold}
                    </td>
                    <td className={`${styles.dashboardTableCellBold} ${styles.dashboardTableCellRight}`.trim()}>
                      {formatCurrency(product.revenue)}
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
      </div>
    </div>
  );
};

export default DashboardPage;
