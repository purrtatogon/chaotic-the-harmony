import { useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { canManageUsers } from '../../utils/userUtils';
import { CMS_GROUPS } from '../../constants/cmsGroups';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const AdminSidebar = ({ isOpen = false, onClose, isMobileDrawer = false }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const location = useLocation();
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const isModalBehavior = Boolean(isMobileDrawer && onClose);

  useEffect(() => {
    if (!isModalBehavior || !isOpen) return;
    onClose?.();
  }, [location.pathname, isModalBehavior, isOpen, onClose]);

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

  const usersDirectoryLabel = canManageUsers() ? 'Users' : 'Customers';

  const imsLinks = [
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/warehouses', label: 'Central Warehouse' },
    { to: '/admin/users', label: usersDirectoryLabel, end: true },
  ];

  const cmsLinks = CMS_GROUPS.map((g) => ({
    to: `/admin/site-content/${g.slug}`,
    label: g.label,
  }));

  const subNavClass = (isActive) =>
    `${styles.dashboardNavLink} ${styles.dashboardNavSubLink} ${
      isActive ? styles.dashboardNavLinkActive : ''
    }`.trim();

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

      <nav className={styles.dashboardNav} aria-label="Main admin sections">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `${styles.dashboardNavLink} ${styles.navOverviewLink} ${isActive ? styles.dashboardNavLinkActive : ''}`.trim()
          }
        >
          Overview
        </NavLink>

        <div
          className={styles.navSection}
          role="group"
          aria-labelledby="admin-nav-ims-label"
        >
          <p id="admin-nav-ims-label" className={styles.navSectionLabel}>
            [ IMS ]
          </p>
          <div className={styles.navSectionLinks}>
            {imsLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={Boolean(item.end)}
                className={({ isActive }) => subNavClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div
          className={styles.navSection}
          role="group"
          aria-labelledby="admin-nav-cms-label"
        >
          <p id="admin-nav-cms-label" className={styles.navSectionLabel}>
            [ CMS ]
          </p>
          <div className={styles.navSectionLinks}>
            {cmsLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => subNavClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
