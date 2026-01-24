import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import Button from './Button';

import { getAvatarUrl } from '../utils/userUtils';

const Sidebar = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'Admin';
  const userRole = localStorage.getItem('userRole') || 'User';

  const handleLogout = () => {
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users/me', label: 'My Profile' },
    { to: '/admin/users', label: 'Users', end: true },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/warehouses', label: 'Warehouses' },
  ];

  return (
    <aside className={styles.dashboardSidebar}>
      <div className={styles.dashboardSidebarHeader}>
        <h1 className={styles.dashboardSidebarTitle}>CTH Store</h1>
        <p className={styles.dashboardSidebarSubtitle}>Admin Inventory Management System</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--gray-100)', marginBottom: '16px' }}>
        <div className={styles.avatarSmall}>
          <img src={getAvatarUrl(username)} alt={username} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</p>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{userRole}</p>
        </div>
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
