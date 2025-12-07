import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { getAvatarUrl } from '../../utils/userUtils';
import { useAdminAuth } from '../../contexts/AuthContext';
import { AdminLoggingInAndOutAnimation } from './AdminLoggingInAndOutAnimation';
import {
  ADMIN_LOGGING_ANIMATION_HOLD_MS,
  BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY,
} from './adminLoggingInAndOutAnimation.model';

const AdminHeader = ({
  isMobileNav = false,
  sidebarOpen = false,
  onOpenSidebar,
  menuButtonRef,
}) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const { logout, username: authUsername } = useAdminAuth();

  const username = authUsername || 'Admin';

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutBrandReplayKey, setLogoutBrandReplayKey] = useState(0);
  const accountTriggerRef = useRef(null);
  const accountMenuRef = useRef(null);
  const logoutOverlayRef = useRef(null);
  // Tracks whether the most recent close was caused by Escape so we restore
  // focus to the trigger only in that case (Deque guidance).
  const restoreFocusRef = useRef(false);

  const closeAccountMenu = useCallback((restoreFocus = false) => {
    restoreFocusRef.current = restoreFocus;
    setAccountMenuOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (signingOut && logoutOverlayRef.current) {
      logoutOverlayRef.current.focus();
    }
  }, [signingOut]);

  // Move focus into the menu when it opens; restore focus on Esc-triggered close
  // (useLayoutEffect avoids a screen-reader "ghost" announcement of the trigger).
  useLayoutEffect(() => {
    if (accountMenuOpen) {
      const firstItem = accountMenuRef.current?.querySelector('[role="menuitem"]');
      firstItem?.focus();
      return;
    }
    if (restoreFocusRef.current) {
      accountTriggerRef.current?.focus();
      restoreFocusRef.current = false;
    }
  }, [accountMenuOpen]);

  // Close on Escape and on outside click while open.
  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAccountMenu(true);
        return;
      }
      if (e.key === 'Tab') {
        // Tabbing out closes the menu without stealing the user's focus target.
        const items = accountMenuRef.current?.querySelectorAll('[role="menuitem"]') || [];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          closeAccountMenu(false);
        } else if (!e.shiftKey && document.activeElement === last) {
          closeAccountMenu(false);
        }
      }
    };

    const handlePointerDown = (e) => {
      if (
        accountMenuRef.current?.contains(e.target) ||
        accountTriggerRef.current?.contains(e.target)
      ) {
        return;
      }
      closeAccountMenu(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [accountMenuOpen, closeAccountMenu]);

  const handleMenuItemKeyDown = (e) => {
    const items = Array.from(
      accountMenuRef.current?.querySelectorAll('[role="menuitem"]') || []
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(currentIndex + 1) % items.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const handleLogout = () => {
    if (signingOut) return;
    closeAccountMenu(false);
    setLogoutBrandReplayKey((n) => n + 1);
    setSigningOut(true);
    try {
      sessionStorage.setItem(BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY, '1');
    } catch {
      /* private / disabled storage */
    }
    window.setTimeout(() => {
      logout();
      navigate('/admin/login');
      setSigningOut(false);
    }, ADMIN_LOGGING_ANIMATION_HOLD_MS);
  };

  const handleMyProfileClick = () => {
    closeAccountMenu(false);
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setAccountMenuOpen(true);
    }
  };

  return (
    <>
      <AdminLoggingInAndOutAnimation.Overlay
        styles={styles}
        active={signingOut}
        overlayCardRef={logoutOverlayRef}
        brandReplayKey={logoutBrandReplayKey}
        visibleStatus="LOGGING YOU OUT..."
      />
    <header className={styles.adminHeader} role="banner" aria-label="Admin top bar">
      <div className={styles.adminHeaderLeft}>
        {isMobileNav && (
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.adminHeaderHamburger}
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-haspopup="dialog"
            aria-controls="admin-sidebar"
          >
            <span aria-hidden="true">☰</span>
          </button>
        )}
        <div className={styles.adminHeaderBrand}>
          <p className={styles.adminHeaderTitle}>[ CTH // BACKLINE ]</p>
          <p className={styles.adminHeaderSubtitle}>Our Unified Commerce Platform</p>
        </div>
      </div>

      <div className={styles.adminHeaderRight}>
        <span className={styles.backlineManifesto}>
          We are the backliners. We haul the chaos to find the harmony. No backline, no show.
        </span>
      </div>

      <div className={styles.adminHeaderAccountArea}>
        <div className={styles.adminHeaderAccount}>
          <button
            ref={accountTriggerRef}
            type="button"
            className={styles.adminHeaderAccountTrigger}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            aria-controls="admin-account-menu"
            onClick={() => setAccountMenuOpen((v) => !v)}
            onKeyDown={handleTriggerKeyDown}
          >
            <span className={styles.adminHeaderAvatar}>
              <img src={getAvatarUrl(username)} alt="" />
            </span>
            <span className={styles.adminHeaderUsername}>{username}</span>
            <span
              className={`${styles.adminHeaderCaret}${accountMenuOpen ? ` ${styles.adminHeaderCaretOpen}` : ''}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {accountMenuOpen && (
            <ul
              ref={accountMenuRef}
              id="admin-account-menu"
              role="menu"
              aria-label="Account menu"
              className={styles.adminHeaderAccountMenu}
              onKeyDown={handleMenuItemKeyDown}
            >
              <li role="none">
                <NavLink
                  to="/admin/users/me"
                  role="menuitem"
                  className={({ isActive }) =>
                    `${styles.adminHeaderAccountMenuItem} ${
                      isActive ? styles.adminHeaderAccountMenuItemActive : ''
                    }`.trim()
                  }
                  onClick={handleMyProfileClick}
                  end
                >
                  My profile
                </NavLink>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.adminHeaderAccountMenuItem} ${styles.adminHeaderAccountMenuItemDanger}`.trim()}
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default AdminHeader;
