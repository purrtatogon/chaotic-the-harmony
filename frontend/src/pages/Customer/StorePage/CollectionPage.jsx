import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductGrid from '../../../components/Customer/ProductGrid/ProductGrid';
import SortBar     from '../../../components/Customer/SortBar/SortBar';
import { productApi } from '../../../api/product';
import {
  COLLECTION_META,
  PRODUCT_TYPE_LABELS,
  TYPE_GROUPS,
} from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

/* ── Helpers ─────────────────────────────────────────────────────────── */

const CloseIcon = () => (
  <svg aria-hidden="true" className={styles.clearIcon} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
  </svg>
);

/* ── Type filter bar component ───────────────────────────────────────── */

const TypeFilterBar = ({ availableTypes, activeType, onTypeChange }) => {
  if (availableTypes.length === 0) return null;

  /* Group available types to render logical clusters */
  const groups = TYPE_GROUPS
    .map((g) => ({
      ...g,
      present: g.codes.filter((c) => availableTypes.includes(c)),
    }))
    .filter((g) => g.present.length > 0);

  return (
    <nav aria-label="Filter products by type" className={styles.typeFilter}>
      <button
        type="button"
        className={`${styles.typePill} ${!activeType ? styles.typePillActive : ''}`}
        aria-pressed={!activeType}
        onClick={() => onTypeChange(null)}
      >
        All
      </button>

      {groups.map((group) => (
        <span key={group.label} className={styles.typeGroup}>
          <span className={styles.typeGroupLabel} aria-hidden="true">
            {group.label}
          </span>
          {group.present.map((code) => (
            <button
              key={code}
              type="button"
              className={`${styles.typePill} ${activeType === code ? styles.typePillActive : ''}`}
              aria-pressed={activeType === code}
              onClick={() => onTypeChange(activeType === code ? null : code)}
            >
              {PRODUCT_TYPE_LABELS[code] ?? code}
            </button>
          ))}
        </span>
      ))}
    </nav>
  );
};

/* ── Main page ───────────────────────────────────────────────────────── */

const CollectionPage = () => {
  const { theme }                       = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const productType = searchParams.get('productType') || null;
  const sortBy      = searchParams.get('sortBy')      || 'id';
  const sortDir     = searchParams.get('sortDir')     || 'asc';

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [announcement, setAnnouncement] = useState('');

  const headingRef   = useRef(null);
  const announcerRef = useRef(null);

  /* Resolve collection metadata from the config object keyed by theme code */
  const collectionId = theme?.toUpperCase() ?? '';
  const collection   = COLLECTION_META[collectionId] ?? null;

  /* Derive types present in the current product set for the filter chips */
  const availableTypes = useMemo(
    () => [...new Set(products.map((p) => p.productType).filter(Boolean))].sort(),
    [products]
  );

  /* Move focus to the page heading on initial render (Deque SPA navigation) */
  useLayoutEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [theme]);

  /* Announce result count after every filter/load cycle */
  useLayoutEffect(() => {
    if (!loading) {
      const n = products.length;
      setAnnouncement(n === 1 ? '1 product found.' : `${n} products found.`);
    }
  }, [products, loading]);

  /* Fetch products whenever theme or filter params change */
  useEffect(() => {
    if (!theme) return;
    let mounted = true;
    setLoading(true);

    const filters = { themeCode: theme.toUpperCase() };
    if (productType)        filters.productType = productType;
    if (sortBy !== 'id')    filters.sortBy      = sortBy;
    if (sortDir !== 'asc')  filters.sortDir     = sortDir;

    productApi.getAll(filters)
      .then((data) => { if (mounted) { setProducts(data || []); setLoading(false); } })
      .catch(()    => { if (mounted) { setProducts([]);          setLoading(false); } });

    return () => { mounted = false; };
  }, [theme, productType, sortBy, sortDir]);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleTypeChange = (code) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (code) next.set('productType', code); else next.delete('productType');
      return next;
    });
  };

  const handleSortChange = ({ sortBy: sb, sortDir: sd }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sb === 'id')    next.delete('sortBy');  else next.set('sortBy',  sb);
      if (sd === 'asc')   next.delete('sortDir'); else next.set('sortDir', sd);
      return next;
    });
  };

  /* ── Unknown collection ────────────────────────────────────────────── */

  if (!collection) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundHeading}>Collection not found</h1>
        <p className={styles.notFoundBody}>
          We couldn't find a collection for <strong>"{theme}"</strong>.
        </p>
        <Link to="/store" className={styles.notFoundLink}>← Back to Store</Link>
      </div>
    );
  }

  const typeLabel = productType ? (PRODUCT_TYPE_LABELS[productType] ?? productType) : null;

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div className={styles.collPageWrapper}>

      {/* Screen-reader live region for result count */}
      <span
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="srOnly"
      >
        {announcement}
      </span>

      {/* ── Collection hero ──────────────────────────────────────────── */}
      <header
        className={`${styles.hero} ${styles[`collPageHero${collectionId}`] ?? ''}`}
      >
        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol role="list" className={styles.breadcrumbList}>
            <li>
              <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            </li>
            <li aria-hidden="true" className={styles.breadcrumbSep}>›</li>
            <li>
              <Link to="/store" className={styles.breadcrumbLink}>Store</Link>
            </li>
            <li aria-hidden="true" className={styles.breadcrumbSep}>›</li>
            <li>
              <span aria-current="page" className={styles.breadcrumbCurrent}>
                {collection.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>{collection.tagline}</span>

          {/* tabIndex={-1} enables programmatic focus (Deque SPA nav pattern) */}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={styles.heroTitle}
          >
            {collection.name}
          </h1>

          <p className={styles.heroDesc}>{collection.description}</p>
        </div>
      </header>

      {/* ── Filter + sort bar ────────────────────────────────────────── */}
      <div className={styles.filterRow}>
        <div className={styles.filterRowInner}>
          <TypeFilterBar
            availableTypes={availableTypes}
            activeType={productType}
            onTypeChange={handleTypeChange}
          />

          <div className={styles.sortControls}>
            {typeLabel && (
              <button
                type="button"
                className={styles.clearFilter}
                onClick={() => handleTypeChange(null)}
                aria-label={`Clear filter: ${typeLabel}`}
              >
                <CloseIcon />
                {typeLabel}
              </button>
            )}
            <SortBar sortBy={sortBy} sortDir={sortDir} onSortChange={handleSortChange} />
          </div>
        </div>
      </div>

      {/* ── Products ─────────────────────────────────────────────────── */}
      <div className={styles.productsSection}>
        <div className={styles.productsSectionInner}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" role="status" aria-label="Loading products" />
              <p className="loading-message" aria-live="polite">Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <p className={styles.collPageEmpty}>
              No products found for this filter.{' '}
              <button
                type="button"
                className={styles.emptyReset}
                onClick={() => handleTypeChange(null)}
              >
                Clear filter
              </button>
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
