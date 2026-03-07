import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../../utils/sectionImage';
import styles from '../../../styles/themes/customer.module.css';

const FEATURED_MERCH = [
  {
    id: 166,
    name: 'Red, Hot and Whelmed Tie-Dye Tee',
    price: '€24.32',
    badge: 'Charity Drop',
    imageLabel: 'WHELMED TIE-DYE TEE',
    description: '100% of profits to mental health charity. Hand tie-dyed and screen-printed.',
    href: '/products/166',
  },
  {
    id: 167,
    name: 'No Naps Tour Hoodie',
    price: '€51.49',
    badge: 'New Drop',
    imageLabel: 'NO NAPS HOODIE',
    description: 'Caffeine-fueled nights and frantic typography. Sleep is for the weak.',
    href: '/products/167',
  },
  {
    id: 191,
    name: 'Reply All Apocalypse Mug',
    price: '€16.65',
    badge: 'Collab',
    imageLabel: 'REPLY ALL MUG',
    description: 'Bottom reads: "Please remove me from this thread." We all need one.',
    href: '/products/191',
  },
  {
    id: 165,
    name: 'WHLM 4-Version Vinyl',
    price: '€26.99',
    badge: 'Exclusive',
    imageLabel: 'WHLM VINYL',
    description: 'Obsidian, Pearl, Rainbow, or Blurred — choose your direction.',
    href: '/products/165',
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
          Free shipping on orders over €75. No, we didn&rsquo;t expect that either.
        </p>
      </div>
    </div>
  </section>
);

export default MerchSection;
