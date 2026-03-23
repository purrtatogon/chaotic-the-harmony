import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { productApi } from '../../../api/product';
import { SMALL_JOYS_IDS } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

const getCheapestEurVariant = (product) => {
  if (!product?.variants?.length) return null;
  return product.variants.reduce((best, variant) => {
    const price = variant.prices?.find((p) => p.currencyCode === 'EUR')?.amount ?? Infinity;
    const bestPrice = best?.prices?.find((p) => p.currencyCode === 'EUR')?.amount ?? Infinity;
    return price < bestPrice ? variant : best;
  }, null);
};

const getFirstImage = (product) => {
  const img = product?.images?.[0];
  if (!img) return 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image';
  return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
};

const CheckIcon = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
  </svg>
);

const SmallJoyCard = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const confirmRef = useRef(null);

  const cheapestVariant = useMemo(() => getCheapestEurVariant(product), [product]);
  const eurAmount = cheapestVariant?.prices?.find((p) => p.currencyCode === 'EUR')?.amount;
  const imgUrl    = getFirstImage(product);
  const productLink = `/products/${product.id}`;

  useLayoutEffect(() => {
    if (added && confirmRef.current) {
      confirmRef.current.focus();
      const id = setTimeout(() => setAdded(false), 3500);
      return () => clearTimeout(id);
    }
  }, [added]);

  const handleQuickAdd = () => {
    if (!cheapestVariant) return;
    addItem({
      productId:   product.id,
      productName: product.name,
      variantId:   cheapestVariant.id,
      size:        cheapestVariant.size  ?? null,
      color:       cheapestVariant.variantCode ?? null,
      price:       eurAmount ?? 0,
      imageUrl:    imgUrl,
      quantity:    1,
    });
    setAdded(true);
  };

  return (
    <li className={styles.joysCard}>
      <Link to={productLink} className={styles.joysImageLink} aria-label={`View ${product.name}`}>
        <div className={styles.joysImageWrapper}>
          <img src={imgUrl} alt={product.name} className={styles.joysImage} loading="lazy" />
        </div>
      </Link>

      <div className={styles.joysCardBody}>
        <Link to={productLink} className={styles.joysNameLink}>
          <h3 className={styles.joysName}>{product.name}</h3>
        </Link>

        {eurAmount != null && (
          <p className={styles.joysPrice}>
            <abbr title="Euros" className={styles.joysCurrency}>€</abbr>
            {Number(eurAmount).toFixed(2)}
            <span className="srOnly"> euros</span>
          </p>
        )}

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          ref={confirmRef}
          tabIndex={-1}
          className={`${styles.joysConfirm} ${added ? styles.joysConfirmVisible : ''}`}
        >
          {added && <><CheckIcon /> Added!</>}
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!cheapestVariant}
          aria-disabled={!cheapestVariant}
          className={styles.joysQuickAdd}
          aria-label={`Quick add ${product.name} to cart`}
        >
          Quick Add
        </button>
      </div>
    </li>
  );
};

const SkeletonCard = () => (
  <li className={`${styles.joysCard} ${styles.joysSkeleton}`} aria-hidden="true">
    <div className={styles.joysSkeletonImg} />
    <div className={styles.joysCardBody}>
      <div className={styles.joysSkeletonLine} />
      <div className={styles.joysSkeletonLineShort} />
    </div>
  </li>
);

const SmallJoys = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all(SMALL_JOYS_IDS.map((id) => productApi.getById(id).catch(() => null)))
      .then((results) => {
        setProducts(results.filter(Boolean));
        setLoading(false);
      });
  }, []);

  return (
    <section aria-labelledby="small-joys-heading" className={styles.joysSection}>
      <div className={styles.joysInner}>
        <header className={styles.joysHeader}>
          <div>
            <h2 id="small-joys-heading" className={styles.joysHeading}>Small Joys</h2>
            <p className={styles.joysSubheading}>Budget-friendly picks under $10</p>
          </div>
          <Link to="/store?productType=STK" className={styles.joysViewAll}>
            View all →
          </Link>
        </header>

        <div role="region" aria-label="Scrollable product list" className={styles.joysScrollOuter}>
          <ul role="list" className={styles.joysScrollTrack}>
            {loading
              ? SMALL_JOYS_IDS.map((id) => <SkeletonCard key={id} />)
              : products.map((p) => <SmallJoyCard key={p.id} product={p} />)
            }
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SmallJoys;
