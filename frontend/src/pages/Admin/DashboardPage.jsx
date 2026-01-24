import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import ItemDetailCard from '../../components/ItemDetailCard';
import { getAvatarUrl } from '../../utils/userUtils';

const DashboardPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  // Get the username from local storage (fallback to 'Admin')
  const username = localStorage.getItem('username') || 'Admin';
  
  // State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetching data
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

  const DashboardStatCard = ({ title, value, subtext, color }) => (
    <div className={styles.dashboardStatCard}>
      <span className={styles.dashboardStatTitle}>{title}</span>
      <span className={styles.dashboardStatValue}>{value}</span>
      {subtext && <span className={styles.dashboardStatSubtext} style={{ color: color || '#666' }}>{subtext}</span>}
    </div>
  );

  return (
    <div className={styles.pageContent}>
      {/*███████ Welcome Header (uses local storage name) ███████*/}
      <div className={styles.dashboardWelcomeHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <div className={styles.avatarSmall} style={{ width: '60px', height: '60px' }}>
            <img src={getAvatarUrl(username)} alt={username} />
          </div>
          <h1 className={styles.dashboardWelcomeTitle} style={{ marginBottom: 0 }}>
            Welcome back, {username}!
          </h1>
        </div>
        <p className={styles.dashboardWelcomeSubtitle}>Here is what's happening with your store today.</p>
      </div>

      {/*███████ Key Metrics Grid ███████*/}
      <div className={styles.dashboardMetricsGrid}>
        <DashboardStatCard 
          title="Total Sales" 
          value={`${stats.totalSales} €`} 
          subtext="+12% from last month" 
          color="#10b981" 
        />
        <DashboardStatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          subtext={`${stats.lowStockCount} items low on stock`} 
          color={stats.lowStockCount > 0 ? '#f59e0b' : '#666'}
        />
        <DashboardStatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          subtext={`Avg. Order: ${stats.averageOrderValue} €`} 
        />
        <DashboardStatCard 
            title="Out of Stock"
            value={stats.outOfStockCount}
            subtext="Items unavailable"
            color="#ef4444"
        />
      </div>

      {/*███████ Details Grid ███████*/}
      <div className={styles.dashboardDetailsGrid}>
        
        {/* Recent Activity */}
        <ItemDetailCard title="Recent Activity">
          <div className={styles.activityList}>
            {stats.recentActivity && stats.recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div 
                  className={styles.activityIcon}
                  style={{
                    backgroundColor: activity.type === 'ORDER' ? '#dbeafe' : activity.type === 'PRODUCT' ? '#fef3c7' : '#d1fae5',
                    color: activity.type === 'ORDER' ? '#1e40af' : activity.type === 'PRODUCT' ? '#92400e' : '#065f46'
                  }}
                >
                  {activity.type ? activity.type.substring(0, 1) : '-'}
                </div>
                <div className={styles.activityText}>
                  <div className={styles.activityDescription}>{activity.description}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </ItemDetailCard>

        {/* Top Selling (Mock Data) */}
        <ItemDetailCard title="Top Selling Products">
          <table className={styles.dashboardTable}>
            <thead className={styles.dashboardTableHeader}>
              <tr>
                <th className={styles.dashboardTableHeader}>Product</th>
                <th className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`}>Sold</th>
                <th className={`${styles.dashboardTableHeader} ${styles.dashboardTableCellRight}`}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.dashboardTableRow}>
                <td className={styles.dashboardTableCell}>CTH Spark-Y Tee</td>
                <td className={`${styles.dashboardTableCell} ${styles.dashboardTableCellRight}`}>42</td>
                <td className={styles.dashboardTableCellBold}>1.048 €</td>
              </tr>
              <tr className={styles.dashboardTableRow}>
                <td className={styles.dashboardTableCell}>Spark Vinyl</td>
                <td className={`${styles.dashboardTableCell} ${styles.dashboardTableCellRight}`}>28</td>
                <td className={styles.dashboardTableCellBold}>890 €</td>
              </tr>
              <tr>
                <td className={styles.dashboardTableCell}>Logo Sticker Pack</td>
                <td className={`${styles.dashboardTableCell} ${styles.dashboardTableCellRight}`}>150</td>
                <td className={styles.dashboardTableCellBold}>450 €</td>
              </tr>
            </tbody>
          </table>
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default DashboardPage;