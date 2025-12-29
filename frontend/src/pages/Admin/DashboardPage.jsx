import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import ItemDetailCard from '../../components/ItemDetailCard';

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
    <div style={{
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      padding: '1.5rem',
      borderRadius: '12px',
      border: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#000' }}>{value}</span>
      {subtext && <span style={{ fontSize: '0.8rem', color: color || '#666' }}>{subtext}</span>}
    </div>
  );

  return (
    <div className={styles.pageContent}>
      {/*███████ Welcome Header (uses local storage name) ███████*/}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome back, {username}! 👋
        </h1>
        <p style={{ color: '#888' }}>Here is what's happening with your store today.</p>
      </div>

      {/*███████ Key Metrics Grid ███████*/}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Activity */}
        <ItemDetailCard title="Recent Activity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.recentActivity && stats.recentActivity.map((activity) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                paddingBottom: '1rem',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: activity.type === 'ORDER' ? '#dbeafe' : activity.type === 'PRODUCT' ? '#fef3c7' : '#d1fae5',
                  color: activity.type === 'ORDER' ? '#1e40af' : activity.type === 'PRODUCT' ? '#92400e' : '#065f46',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                }}>
                  {activity.type ? activity.type.substring(0, 1) : '-'}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{activity.description}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </ItemDetailCard>

        {/* Top Selling (Mock Data) */}
        <ItemDetailCard title="Top Selling Products">
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', fontSize: '0.85rem' }}>
                <th style={{ paddingBottom: '0.5rem' }}>Product</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Sold</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
                <td style={{ padding: '0.75rem 0' }}>CTH Spark-Y Tee</td>
                <td style={{ textAlign: 'right' }}>42</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>1.048 €</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
                <td style={{ padding: '0.75rem 0' }}>Spark Vinyl</td>
                <td style={{ textAlign: 'right' }}>28</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>890 €</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0' }}>Logo Sticker Pack</td>
                <td style={{ textAlign: 'right' }}>150</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>450 €</td>
              </tr>
            </tbody>
          </table>
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default DashboardPage;