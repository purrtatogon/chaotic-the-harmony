import { useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import Button from '../Global/Button';

import { getAvatarUrl, getRoleBadgeClassName, getRoleDisplayName } from '../../utils/userUtils';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Sidebar = ({ isOpen = false, onClose, isMobileDrawer = false }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const username = localStorage.getItem('username') || 'Admin';
  const userRole = localStorage.getItem('userRole') || 'User';

  const isModalBehavior = Boolean(isMobileDrawer && onClose);

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

  const sidebarHidden = isMobileDrawer ? !isOpen : false;

  return (
    <aside
      id="admin-sidebar"
      ref={sidebarRef}
      className={`${styles.dashboardSidebar} ${isOpen ? styles.dashboardSidebarOpen : ''}`.trim()}
      role={isModalBehavior ? 'dialog' : undefined}
      aria-modal={isModalBehavior && isOpen ? 'true' : undefined}
      aria-label="Admin application navigation"
      aria-hidden={sidebarHidden ? 'true' : undefined}
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
        <p className={styles.dashboardSidebarTitle}>CTH Store</p>
        <p className={styles.dashboardSidebarSubtitle}>Admin Inventory Management System</p>
      </div>

      <div className={styles.userProfileRow}>
        <div className={styles.avatarSmall}>
          <img src={getAvatarUrl(username)} alt="" />
        </div>
        <div className={styles.userProfileMeta}>
          <p className={styles.userProfileName}>{username}</p>
          <span className={getRoleBadgeClassName(styles, userRole)}>
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

      <div className={styles.sidebarLogoutWrap}>
        <Button variant="secondary" onClick={handleLogout} className={styles.sidebarLogoutButton}>
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
