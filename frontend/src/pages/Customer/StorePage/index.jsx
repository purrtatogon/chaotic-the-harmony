import { Link, useSearchParams } from 'react-router-dom';
import StoreHeroCarousel from './StoreHeroCarousel';
import CollectionGrid    from './CollectionGrid';
import BrowseByType      from './BrowseByType';
import BrowseSection     from './BrowseSection';
import SmallJoys         from './SmallJoys';
import CollabGallery     from './CollabGallery';
import styles            from '../../../styles/themes/customer.module.css';

const ComingSoonPage = ({ title, lead, detail }) => (
  <div className={styles.comingSoonPage}>
    <div className={styles.comingSoonInner}>
      <span className={styles.comingSoonBadge}>Coming Soon</span>
      <h1 className={styles.comingSoonTitle}>{title}</h1>
      <p className={styles.comingSoonLead}>{lead}</p>
      <p className={styles.comingSoonDetail}>{detail}</p>
      <Link to="/store" className={styles.comingSoonCta}>Browse the Store</Link>
    </div>
  </div>
);

const StorePage = () => {
  const [searchParams] = useSearchParams();

  const productType = searchParams.get('productType') || null;
  const sortDir     = searchParams.get('sortDir')     || null;
  const searchQuery = searchParams.get('q')           || null;
  const view        = searchParams.get('view')        || null;

  if (view === 'new-arrivals') {
    return (
      <ComingSoonPage
        title="New Arrivals"
        lead="We're getting the merch ready."
        detail="Fresh drops from the latest era are being unboxed, ironed, and argued over. Sign up for our newsletter so you're first to know when they land."
      />
    );
  }

  if (view === 'sale') {
    return (
      <ComingSoonPage
        title="Sale"
        lead="We're getting the merch ready."
        detail="Our buyers are fighting over what to mark down. Rare finds, last-run prints, and the occasional impulse restock — all at prices that don't hurt. Check back soon."
      />
    );
  }

  const isFiltered = Boolean(productType || sortDir || searchQuery);

  if (isFiltered) {
    const heading = searchQuery
      ? `Search results for "${searchQuery}"`
      : productType ? productType : 'All Products';

    return (
      <div>
        <h1 className="srOnly">
          Store — {heading} — Chaotic the Harmony
        </h1>
        <BrowseSection />
        <SmallJoys />
      </div>
    );
  }

  return (
    <div>
      <h1 className="srOnly">Store — Chaotic the Harmony</h1>
      <StoreHeroCarousel />
      <CollectionGrid />
      <BrowseByType />
      <SmallJoys />
      <CollabGallery />
    </div>
  );
};

export default StorePage;
