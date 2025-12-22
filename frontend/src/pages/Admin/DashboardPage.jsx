import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { dashboardApi } from '../../api/dashboard';
import { useApi } from '../../hooks/useApi'; 
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListContainer from '../../components/ListContainer';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const DashboardPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  // Fetching data
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(() => dashboardApi.getStats());
  const { data: activityData, loading: activityLoading, error: activityError, refetch: refetchActivity } = useApi(() => dashboardApi.getRecentActivity());

  if (statsLoading || activityLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (statsError) {
    return <Error message={statsError} onRetry={refetchStats} />;
  }

  const stats = statsData || [];
  const recentActivity = activityData || [];
  const columns = ['Action', 'Item', 'User', 'Date'];

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Dashboard" subtitle="Inventory Overview" />

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} />
        ))}
      </div>

      {activityError ? (
        <Error message={activityError} onRetry={refetchActivity} />
      ) : (
        <ListContainer title="Recent Activity">
          <Table
            columns={columns}
            data={recentActivity}
            renderRow={(row) => [
              <td key="action">{row.action}</td>,
              <td key="item">{row.item}</td>,
              <td key="user">{row.user}</td>,
              <td key="date">{row.date}</td>,
            ]}
          />
        </ListContainer>
      )}
    </div>
  );
};

export default DashboardPage;