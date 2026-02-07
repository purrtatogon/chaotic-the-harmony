import { useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import Button from './Button';

import { getAvatarUrl, getRoleBadgeClassName, getRoleDisplayName } from '../utils/userUtils';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Sidebar = ({ isOpen = false, onClose }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const username = localStorage.getItem('username') || 'Admin';
  const userRole = localStorage.getItem('userRole') || 'User';

  useEffect(() => {
    if (isOpen && onClose) onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen || !onClose) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const el = sidebarRef.current;
      if (!el) return;
      const focusable = [...el.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (n) => n.tabIndex >= 0 && !n.hasAttribute('disabled')
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleLogout = () => {
    navigate('/admin/login');
    if (onClose) onClose();
  };

  const navItems = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users/me', label: 'My Profile' },
    { to: '/admin/users', label: 'Users', end: true },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/warehouses', label: 'Central Warehouse' },
  ];

  return (
    <aside
      id="admin-sidebar"
      ref={sidebarRef}
      className={`${styles.dashboardSidebar} ${isOpen ? styles.dashboardSidebarOpen : ''}`.trim()}
      role="dialog"
      aria-modal={isOpen ? 'true' : undefined}
      aria-label="Main navigation"
      aria-hidden={!isOpen}
    >
      {onClose && (
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.sidebarCloseButton}
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
      <div className={styles.dashboardSidebarHeader}>
        <h1 className={styles.dashboardSidebarTitle}>CTH Store</h1>
        <p className={styles.dashboardSidebarSubtitle}>Admin Inventory Management System</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--gray-100)', marginBottom: '16px' }}>
        <div className={styles.avatarSmall}>
          <img src={getAvatarUrl(username)} alt={username} />
        </div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <p style={{ fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</p>
          <span className={getRoleBadgeClassName(styles, userRole)} style={{ display: 'inline-block', marginTop: '4px' }}>
            {getRoleDisplayName(userRole) || 'User'}
          </span>
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
