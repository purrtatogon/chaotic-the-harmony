import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SiteContentProvider } from '../contexts/SiteContentContext';
import MegaNav from '../components/Customer/MegaNav/MegaNav';
import styles from '../styles/themes/customer.module.css';

const CustomerLayout = () => {
  return (
    <ThemeProvider theme="customer">
      <SiteContentProvider>
        <div className={styles.layout}>
          <a href="#main-content" className={styles.skipLink}>
            Skip to main content
          </a>

          <header className={styles.layoutHeader}>
            <MegaNav />
          </header>

          <main id="main-content" tabIndex={-1} className={styles.layoutMain}>
            <Outlet />
          </main>

          <footer className={styles.layoutFooter}>
            <div className={styles.layoutFooterInner}>
              <p className={styles.layoutFooterText}>
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
