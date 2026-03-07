import { Link } from 'react-router-dom';
import { BROWSE_TYPE_META as BROWSE_TYPES } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

const MusicIcon = () => (
  <svg aria-hidden="true" className={styles.browseTypeIcon} viewBox="0 0 48 48" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="20" />
    <circle cx="24" cy="24" r="7" />
    <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
    <line x1="24" y1="4" x2="24" y2="17" strokeWidth="2.5" />
    <line x1="24" y1="31" x2="24" y2="44" strokeWidth="2.5" />
  </svg>
);

const ApparelIcon = () => (
  <svg aria-hidden="true" className={styles.browseTypeIcon} viewBox="0 0 48 48" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 4L6 14l5 3v23h26V17l5-3L31 4c0 0-2.5 6-7 6S17 4 17 4z" />
  </svg>
);

const AccessoriesIcon = () => (
  <svg aria-hidden="true" className={styles.browseTypeIcon} viewBox="0 0 48 48" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="14" width="32" height="26" rx="2" />
    <path d="M16 14V10a8 8 0 0116 0v4" />
  </svg>
);

const ICONS = { music: MusicIcon, apparel: ApparelIcon, accessories: AccessoriesIcon };

const BrowseByType = () => (
  <section aria-labelledby="browse-heading" className={styles.browseTypeSection}>
    <div className={styles.browseTypeInner}>
      <header className={styles.browseTypeHeader}>
        <h2 id="browse-heading" className={styles.browseTypeHeading}>Browse by Type</h2>
      </header>

      <ul role="list" className={styles.browseTypeGrid}>
        {BROWSE_TYPES.map((type) => {
          const IconComp = ICONS[type.id];
          return (
            <li key={type.id} className={styles.browseTypeItem}>
              <Link to={type.link} className={styles.browseTypeCard}>
                <span className={styles.browseTypeIconWrapper}>
                  <IconComp />
                </span>
                <div className={styles.browseTypeCardBody}>
                  <h3 className={styles.browseTypeCardName}>{type.name}</h3>
                  <p className={styles.browseTypeCardSubtitle}>{type.subtitle}</p>
                  <p className={styles.browseTypeCardDesc}>{type.description}</p>
                </div>
                <span className={styles.browseTypeArrow} aria-hidden="true">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default BrowseByType;
