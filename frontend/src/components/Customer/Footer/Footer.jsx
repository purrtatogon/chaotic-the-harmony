import { Link } from 'react-router-dom';
import styles from '../../../styles/themes/customer.module.css';

const ABOUT_LINKS = [
  { label: 'Our Story', to: '/about' },
  { label: 'Mission & Values', to: '/about#mission' },
  { label: 'Tour Dates', to: '/tour' },
  { label: 'Latest News', to: '/news' },
];

const SHOP_LINKS = [
  { label: 'New Arrivals', to: '/store?view=new-arrivals' },
  { label: 'All Products', to: '/store' },
  { label: 'Music', to: '/store?productType=CD' },
  { label: 'Apparel', to: '/store?productType=TEE' },
  { label: 'Accessories', to: '/store?productType=MUG' },
];

const COLLECTIONS_LINKS = [
  { label: 'The Spark Collection', to: '/store/collection/SPRK' },
  { label: 'Feed My Birds', to: '/store/collection/BIRD' },
  { label: 'Sweater Weather', to: '/store/collection/SWTR' },
  { label: 'H.Y.T.T.?', to: '/store/collection/THNK' },
  { label: 'H.Y.P.E.', to: '/store/collection/HYPE' },
  { label: 'Whelmed', to: '/store/collection/WHLM' },
];

const SUPPORT_LINKS = [
  { label: 'Shipping', to: '/shipping' },
  { label: 'Inclusivity', to: '/about#inclusivity' },
  { label: 'Sustainability', to: '/about#sustainability' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Careers', to: '/about#careers' },
  { label: 'Contact Us', to: '/about#contact' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerTop}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.footerLogo} aria-label="Chaotic the Harmony — home">
              Chaotic the Harmony
            </Link>
            <p className={styles.footerTagline}>
              Music for the Burned Out. Merch for the Birds.
            </p>
          </div>

          <nav aria-label="Footer navigation" className={styles.footerColumns}>
            <div className={styles.footerCol}>
              <h2 className={styles.footerColHeading}>About</h2>
              <ul role="list" className={styles.footerColList}>
                {ABOUT_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h2 className={styles.footerColHeading}>Shop</h2>
              <ul role="list" className={styles.footerColList}>
                {SHOP_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h2 className={styles.footerColHeading}>Collections</h2>
              <ul role="list" className={styles.footerColList}>
                {COLLECTIONS_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h2 className={styles.footerColHeading}>Customer Care</h2>
              <ul role="list" className={styles.footerColList}>
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>
            Copyright &copy; {year}, Chaotic the Harmony.
          </p>
          <p className={styles.footerPowered}>
            <del className={styles.footerStrikethrough} aria-label="Harmoniously, crossed out">Harmoniously</del>{' '}
            Chaotically Powered by Java Spring Boot, React, and many caf&eacute;s au lait.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
