import { Link } from 'react-router-dom';
import { COLLECTION_META } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

/* Derive ordered array from the config object at module load — stable reference */
const COLLECTIONS = Object.entries(COLLECTION_META)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([id, meta]) => ({ id, link: `/store/collection/${id}`, ...meta }));

const CollectionGrid = () => (
  <section aria-labelledby="collections-heading" className={styles.collGridSection}>
    <div className={styles.collGridInner}>
      <header className={styles.collGridHeader}>
        <h2 id="collections-heading" className={styles.collGridHeading}>
          Shop by Collection
        </h2>
        <p className={styles.collGridSubheading}>Six eras. One band. Infinite burnout.</p>
      </header>

      <ul role="list" className={styles.collGridList}>
        {COLLECTIONS.map((col) => (
          <li key={col.id}>
            <Link
              to={col.link}
              className={`${styles.collGridCard} ${styles[`cardBg${col.id}`] ?? ''}`}
            >
              {/* Dark gradient overlay */}
              <div className={styles.collGridCardOverlay} aria-hidden="true" />

              {/* Text content */}
              <div className={styles.collGridCardContent}>
                <span className={styles.collGridCardEra}>{col.tagline}</span>
                <h3 className={styles.collGridCardTitle}>{col.name}</h3>
                <p className={styles.collGridCardDesc}>{col.description}</p>
                <span className={styles.collGridCardCta} aria-hidden="true">
                  Explore →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default CollectionGrid;
