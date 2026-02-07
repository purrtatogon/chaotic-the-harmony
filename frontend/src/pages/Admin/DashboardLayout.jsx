import { useState, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Sidebar from '../../components/Sidebar';

const DashboardLayout = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={sidebarOpen ? styles.sidebarBackdropVisible : styles.sidebarBackdrop}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      <header className={styles.mobileTopBar} aria-label="Mobile navigation">
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          aria-haspopup="true"
          aria-controls="admin-sidebar"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </header>
      <main
        className={styles.dashboardMain}
        id="main-content"
        aria-hidden={sidebarOpen}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
