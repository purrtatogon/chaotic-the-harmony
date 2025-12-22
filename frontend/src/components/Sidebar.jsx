import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import Button from './Button';

const Sidebar = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/user', label: 'My Profile' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/storage', label: 'Storage' },
  ];

  return (
    <aside className={styles.dashboardSidebar}>
      <div className={styles.dashboardSidebarHeader}>
        <h1 className={styles.dashboardSidebarTitle}>Admin</h1>
        <p className={styles.dashboardSidebarSubtitle}>Inventory Dashboard</p>
      </div>
      
      <nav className={styles.dashboardNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.dashboardNavLink} ${isActive ? styles.dashboardNavLinkActive : ''}`.trim()
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <Button variant="secondary" onClick={handleLogout} style={{ width: '100%' }}>
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
