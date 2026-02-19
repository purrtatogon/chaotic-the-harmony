import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SiteContentProvider } from '../contexts/SiteContentContext';
import { getThemeStyles } from '../utils/themeStyles';
import layoutStyles from './CustomerLayout.module.css';

/**
 * Customer storefront layout with neo-brutalist aesthetic.
 * Wraps content with ThemeProvider (customer theme) and provides nav.
 */
const CustomerLayout = () => {
  const themeStyles = getThemeStyles('customer');

  return (
    <ThemeProvider theme="customer">
      <SiteContentProvider>
        <div className={layoutStyles.layout}>
          <header className={layoutStyles.header}>
            <nav className={layoutStyles.nav}>
              <Link to="/" className={layoutStyles.brand}>
                Chaotic the Harmony
              </Link>
              <ul className={layoutStyles.navList}>
                <li>
                  <Link to="/" className={layoutStyles.navLink}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#shop" className={layoutStyles.navLink}>
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/about" className={layoutStyles.navLink}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className={layoutStyles.navLink}>
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className={layoutStyles.navLink}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/login" className={`${themeStyles.button} ${themeStyles.buttonPrimary}`}>
                    Login
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          <main className={layoutStyles.main}>
            <Outlet />
          </main>

          <footer className={layoutStyles.footer}>
            <div className={layoutStyles.footerInner}>
              <p className={layoutStyles.footerText}>
                © Chaotic the Harmony · Music for the Burned Out
              </p>
            </div>
          </footer>
        </div>
      </SiteContentProvider>
    </ThemeProvider>
  );
};

export default CustomerLayout;
