import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../../utils/sectionImage';
import styles from '../../../styles/themes/customer.module.css';

const FEATURED_MERCH = [
  {
    id: 1,
    name: 'Whelmed Era Hoodie',
    price: '$65.00',
    badge: 'New Drop',
    imageLabel: 'WHELMED HOODIE',
    description: 'Wear your existential crisis with pride.',
    href: '/store',
  },
  {
    id: 2,
    name: '"Reply All" Tour Tee',
    price: '$38.00',
    badge: 'Limited',
    imageLabel: 'REPLY ALL TEE',
    description: 'Because email is a horror genre.',
    href: '/store',
  },
  {
    id: 3,
    name: 'Seven Coffees Deep Mug',
    price: '$22.00',
    badge: 'Bestseller',
    imageLabel: 'COFFEE MUG',
    description: 'For the pre-show ritual and the 9 AM meeting.',
    href: '/store',
  },
  {
    id: 4,
    name: 'Burnout Anthem Vinyl',
    price: '$32.00',
    badge: 'Exclusive',
    imageLabel: 'VINYL RECORD',
    description: '180g yellow vinyl. Yes, yellow. It slaps.',
    href: '/store',
  },
];

const MerchSection = () => (
  <section id="merch" className={styles.merchSection} aria-labelledby="merch-heading">
    <div className={styles.merchInner}>
      <header className={styles.merchHeader}>
        <div>
          <p className={styles.merchOverline}>Just arrived in the warehouse</p>
          <h2 id="merch-heading" className={styles.merchHeading}>
            New Merch Dropped.<br />
            <span className={styles.merchHeadingHighlight}>Your Wallet Won&rsquo;t Know What Hit It.</span>
          </h2>
          <p className={styles.merchSubheading}>
            Designed by the band, distressed by circumstance. Every item is either
            extremely cool or slightly unhinged — sometimes both.
          </p>
        </div>
        <Link to="/store" className={styles.merchViewAllHeader} aria-label="View all merch in the store">
          View All Merch
          <span aria-hidden="true"> →</span>
        </Link>
      </header>

      <ul className={styles.merchGrid} aria-label="Featured merchandise">
        {FEATURED_MERCH.map((item) => (
          <li key={item.id} className={styles.merchItem}>
            <Link
              to={item.href}
              className={styles.merchCard}
              aria-label={`${item.name} — ${item.price}. ${item.description}`}
            >
              <div className={styles.merchCardImgWrapper}>
                <img
                  src={getSectionImage(item.imageLabel, 400, 400)}
                  alt={`${item.name} product photo`}
                  className={styles.merchCardImg}
                  width="400"
                  height="400"
                  loading="lazy"
                />
                <span className={styles.merchCardBadge} aria-label={`Tag: ${item.badge}`}>
                  {item.badge}
                </span>
              </div>
              <div className={styles.merchCardBody}>
                <h3 className={styles.merchCardName}>{item.name}</h3>
                <p className={styles.merchCardDesc}>{item.description}</p>
                <p className={styles.merchCardPrice}>{item.price}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.merchCta}>
        <Link to="/store" className={styles.merchShopAllBtn}>
          Shop Everything We Made
        </Link>
        <p className={styles.merchDisclaimer}>
          Free shipping on orders over $75. No, we didn&rsquo;t expect that either.
        </p>
      </div>
    </div>
  </section>
);

export default MerchSection;
