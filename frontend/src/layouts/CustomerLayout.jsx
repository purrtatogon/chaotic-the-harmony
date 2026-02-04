import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SiteContentProvider } from '../contexts/SiteContentContext';
import MegaNav from '../components/Customer/MegaNav/MegaNav';
import Footer from '../components/Customer/Footer/Footer';
import styles from '../styles/themes/customer.module.css';

/** Customer storefront shell — `data-theme` + CMS provider + mega nav chrome. */
const CustomerLayout = () => {
  const { pathname } = useLocation();
  return (
    <ThemeProvider theme="customer">
      <SiteContentProvider>
        <div className={styles.layout}>
          <a href="#main-content" className={styles.skipLink}>
            Skip to main content
          </a>

          <header className={styles.layoutHeader}>
            <MegaNav key={pathname} />
          </header>

          <main id="main-content" tabIndex={-1} className={styles.layoutMain}>
            <Outlet />
          </main>

          <Footer />
        </div>
      </SiteContentProvider>
    </ThemeProvider>
  );
};

export default CustomerLayout;
