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

const CloseIcon = () => (
  <svg aria-hidden="true" className={styles.clearIcon} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
  </svg>
);

const TypeFilterBar = ({ availableTypes, activeType, onTypeChange }) => {
  if (availableTypes.length === 0) return null;

  const groups = TYPE_GROUPS
    .map((g) => ({ ...g, present: g.codes.filter((c) => availableTypes.includes(c)) }))
    .filter((g) => g.present.length > 0);

  return (
    <nav aria-label="Filter products by type" className={styles.collPageTypeFilter}>
      <button type="button"
        className={`${styles.collPageTypePill} ${!activeType ? styles.collPageTypePillActive : ''}`}
        aria-pressed={!activeType} onClick={() => onTypeChange(null)}>
        All
      </button>
      {groups.map((group) => (
        <span key={group.label} className={styles.collPageTypeGroup}>
          <span className={styles.collPageTypeGroupLabel} aria-hidden="true">{group.label}</span>
          {group.present.map((code) => (
            <button key={code} type="button"
              className={`${styles.collPageTypePill} ${activeType === code ? styles.collPageTypePillActive : ''}`}
              aria-pressed={activeType === code}
              onClick={() => onTypeChange(activeType === code ? null : code)}>
              {PRODUCT_TYPE_LABELS[code] ?? code}
            </button>
          ))}
        </span>
      ))}
    </nav>
  );
};

const CollectionPage = () => {
  const { theme } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const productType = searchParams.get('productType') || null;
  const sortBy      = searchParams.get('sortBy')      || 'id';
  const sortDir     = searchParams.get('sortDir')     || 'asc';

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);

  const headingRef   = useRef(null);

  const collectionId = theme?.toUpperCase() ?? '';
  const collection   = COLLECTION_META[collectionId] ?? null;

  const availableTypes = useMemo(
    () => [...new Set(allProducts.map((p) => p.productType).filter(Boolean))].sort(),
    [allProducts]
  );

  const displayProducts = useMemo(() => {
    let list = allProducts;
    if (productType) list = list.filter((p) => p.productType === productType);
    return list;
  }, [allProducts, productType]);

  const collectionAnnouncement = useMemo(() => {
    if (loading) return '';
    const n = displayProducts.length;
    return n === 1 ? '1 product found.' : `${n} products found.`;
  }, [loading, displayProducts]);

  useLayoutEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [theme]);

  useEffect(() => {
    if (!theme) return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);

      const filters = { themeCode: theme.toUpperCase() };
      if (sortBy !== 'id')    filters.sortBy  = sortBy;
      if (sortDir !== 'asc')  filters.sortDir = sortDir;

      try {
        const data = await productApi.getAll(filters);
        if (!cancelled) {
          setAllProducts(data || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAllProducts([]);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [theme, sortBy, sortDir]);

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
      if (sb === 'id')  next.delete('sortBy');  else next.set('sortBy',  sb);
      if (sd === 'asc') next.delete('sortDir'); else next.set('sortDir', sd);
      return next;
    });
  };

  if (!collection) {
    return (
      <div className={styles.collPageNotFound}>
        <h1 className={styles.collPageNotFoundHeading}>Collection not found</h1>
        <p className={styles.collPageNotFoundBody}>
          We couldn&rsquo;t find a collection for <strong>&ldquo;{theme}&rdquo;</strong>.
        </p>
        <Link to="/store" className={styles.collPageNotFoundLink}>&larr; Back to Store</Link>
      </div>
    );
  }

  const typeLabel = productType ? (PRODUCT_TYPE_LABELS[productType] ?? productType) : null;

  return (
    <div className={styles.collPageWrapper}>
      <span role="status" aria-live="polite" aria-atomic="true" className="srOnly">
        {collectionAnnouncement}
      </span>

      {/* Hero */}
      <header className={`${styles.collPageHero} ${styles[`collPageHero${collectionId}`] ?? ''}`}>
        <nav aria-label="Breadcrumb" className={styles.collPageBreadcrumb}>
          <ol role="list" className={styles.collPageBreadcrumbList}>
            <li><Link to="/" className={styles.collPageBreadcrumbLink}>Home</Link></li>
            <li aria-hidden="true" className={styles.collPageBreadcrumbSep}>/</li>
            <li><Link to="/store" className={styles.collPageBreadcrumbLink}>Store</Link></li>
            <li aria-hidden="true" className={styles.collPageBreadcrumbSep}>/</li>
            <li><span aria-current="page" className={styles.collPageBreadcrumbCurrent}>{collection.name}</span></li>
          </ol>
        </nav>

        <div className={styles.collPageHeroInner}>
          <span className={styles.collPageHeroBadge}>{collection.tagline}</span>
          <h1 ref={headingRef} tabIndex={-1} className={styles.collPageHeroTitle}>
            {collection.name}
          </h1>
          <p className={styles.collPageHeroDesc}>{collection.description}</p>
        </div>
      </header>

      {/* Filter + Sort + Count Bar */}
      <div className={styles.collPageFilterRow}>
        <div className={styles.collPageFilterRowInner}>
          <TypeFilterBar
            availableTypes={availableTypes}
            activeType={productType}
            onTypeChange={handleTypeChange}
          />
          <div className={styles.collPageSortControls}>
            {typeLabel && (
              <button type="button" className={styles.collPageClearFilter}
                onClick={() => handleTypeChange(null)} aria-label={`Clear filter: ${typeLabel}`}>
                <CloseIcon /> {typeLabel}
              </button>
            )}
            <SortBar sortBy={sortBy} sortDir={sortDir} onSortChange={handleSortChange} />
          </div>
        </div>
      </div>

      {/* Product count */}
      {!loading && (
        <div className={styles.collPageCountBar}>
          <span className={styles.collPageCount}>
            {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
            {typeLabel ? ` in ${typeLabel}` : ''}
          </span>
        </div>
      )}

      {/* Products */}
      <div className={styles.collPageProductsSection}>
        <div className={styles.collPageProductsSectionInner}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" role="status" aria-label="Loading products" />
              <p className="loading-message" aria-live="polite">Loading products…</p>
            </div>
          ) : displayProducts.length === 0 ? (
            <p className={styles.collPageEmpty}>
              No products found for this filter.{' '}
              <button type="button" className={styles.collPageEmptyReset}
                onClick={() => handleTypeChange(null)}>
                Clear filter
              </button>
            </p>
          ) : (
            <ProductGrid products={displayProducts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
