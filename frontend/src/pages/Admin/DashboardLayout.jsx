import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Sidebar from '../../components/Sidebar';

const DashboardLayout = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.dashboardMain}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
