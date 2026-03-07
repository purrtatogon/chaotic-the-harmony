import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductGrid from '../../../components/Customer/ProductGrid/ProductGrid';
import SortBar     from '../../../components/Customer/SortBar/SortBar';
import { productApi } from '../../../api/product';
import { PRODUCT_TYPE_LABELS } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

const CloseIcon = () => (
  <svg aria-hidden="true" className={styles.clearIcon} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
  </svg>
);

const BrowseSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const productType  = searchParams.get('productType') || null;
  const sortBy       = searchParams.get('sortBy')      || 'id';
  const sortDir      = searchParams.get('sortDir')     || 'asc';
  const searchQuery  = searchParams.get('q')           || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const srProductCountAnnouncement = useMemo(() => {
    if (loading || error) return '';
    const n = products.length;
    return n === 1 ? '1 product found.' : `${n} products found.`;
  }, [products, loading, error]);

  const headingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(false);

      const doFetch = searchQuery
        ? productApi.search(searchQuery)
        : (() => {
            const filters = {};
            if (productType)       filters.productType = productType;
            if (sortBy !== 'id')   filters.sortBy      = sortBy;
            if (sortDir !== 'asc') filters.sortDir     = sortDir;
            return productApi.getAll(filters);
          })();

      try {
        const data = await doFetch;
        if (!cancelled) {
          setProducts(data || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
          setError(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [productType, sortBy, sortDir, searchQuery]);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleSortChange = ({ sortBy: sb, sortDir: sd }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sb === 'id')   next.delete('sortBy');  else next.set('sortBy',  sb);
      if (sd === 'asc')  next.delete('sortDir'); else next.set('sortDir', sd);
      return next;
    });
  };

  const clearFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('productType');
      next.delete('sortBy');
      next.delete('sortDir');
      next.delete('q');
      return next;
    });
  };

  const typeLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : productType ? (PRODUCT_TYPE_LABELS[productType] ?? productType) : 'New Arrivals';

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className={styles.browseFilterPage}>
      {/* Screen-reader live region */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="srOnly"
      >
        {srProductCountAnnouncement}
      </span>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol role="list" className={styles.breadcrumbList}>
              <li>
                <Link to="/store" className={styles.breadcrumbLink}>Store</Link>
              </li>
              <li aria-hidden="true" className={styles.breadcrumbSep}>›</li>
              <li>
                <span aria-current="page" className={styles.breadcrumbCurrent}>
                  {typeLabel}
                </span>
              </li>
            </ol>
          </nav>

          <h2
            ref={headingRef}
            id="browse-section-heading"
            className={styles.browseFilterHeading}
          >
            {typeLabel}
          </h2>

          {productType && !searchQuery && (
            <p className={styles.browseFilterSubheading}>
              All <strong>{typeLabel}</strong> across every era
            </p>
          )}
        </div>
      </div>

      {/* ── Filter + sort controls ───────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          {!searchQuery && (
            <SortBar sortBy={sortBy} sortDir={sortDir} onSortChange={handleSortChange} />
          )}

          {(productType || searchQuery) && (
            <button
              type="button"
              onClick={clearFilter}
              className={styles.clearButton}
              aria-label={searchQuery ? 'Clear search' : `Clear filter: ${typeLabel}`}
            >
              <CloseIcon />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Products ─────────────────────────────────────────────────── */}
      <div className={styles.products}>
        <div className={styles.productsInner}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" role="status" aria-label="Loading products" />
              <p className="loading-message" aria-live="polite">Loading products…</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p className={styles.browseFilterErrorText}>
                Could not load products. Please check your connection and try again.
              </p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => { setLoading(true); setError(false); }}
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : `No products found${productType ? ` for "${typeLabel}"` : ''}.`}
              </p>
              <Link to="/store" className={styles.emptyLink}>
                {searchQuery ? 'Browse all products' : 'View all store products'}
              </Link>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseSection;
