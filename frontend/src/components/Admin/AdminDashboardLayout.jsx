import { useState, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminDashboardLayout = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const isMobileNav = useMediaQuery('(max-width: 768px)');

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <a href="#main-content" className={styles.adminSkipLink}>
        Skip to main content
      </a>
      <AdminHeader
        isMobileNav={isMobileNav}
        sidebarOpen={sidebarOpen}
        onOpenSidebar={handleOpenSidebar}
        menuButtonRef={menuButtonRef}
      />
      <div className={styles.dashboardBody}>
        <div
          className={sidebarOpen ? styles.sidebarBackdropVisible : styles.sidebarBackdrop}
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          isMobileDrawer={isMobileNav}
        />
        <main
          className={styles.dashboardMain}
          id="main-content"
          tabIndex={-1}
          aria-hidden={isMobileNav && sidebarOpen ? 'true' : undefined}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
