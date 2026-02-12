import { useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import styles from '../../../styles/themes/customer.module.css';

function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
  }
  return product.imageUrl || '';
}

function getFirstEurPrice(product) {
  if (!product.variants || product.variants.length === 0) return null;
  for (const v of product.variants) {
    for (const p of (v.prices || [])) {
      if (p.currencyCode === 'EUR') return p.amount;
    }
  }
  return product.variants[0]?.prices?.[0]?.amount ?? null;
}

function getPriceDisplay(product) {
  if (!product.variants || product.variants.length === 0) return null;
  const amounts = product.variants.flatMap((v) =>
    (v.prices || []).filter((p) => p.currencyCode === 'EUR').map((p) => p.amount)
  );
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const fmt = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

function hasMultipleSizes(product) {
  if (!product.variants) return false;
  const sizes = new Set(product.variants.map((v) => v.size).filter(Boolean));
  return sizes.size > 1;
}

const HeartIcon = ({ filled }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const BagPlusIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="12" y1="10" x2="12" y2="18" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef(null);

  useLayoutEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const imageUrl = getProductImage(product);
  const wishlisted = isInWishlist(product.id);
  const needsSizeSelection = hasMultipleSizes(product);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        imageUrl: imageUrl || '',
        price: getFirstEurPrice(product) || 0,
      });
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (needsSizeSelection) return;

    const variant = product.variants?.[0];
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: variant ? variant.id : `product-${product.id}`,
      size: variant?.size ?? null,
      color: variant?.variantCode ?? null,
      price: getFirstEurPrice(product) || 0,
      imageUrl: imageUrl || '',
      quantity: 1,
    });

    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className={styles.productCard}>
      <Link to={`/products/${product.id}`} className={styles.productCardLink}>
        <div className={styles.productImageWrapper}>
          <img
            src={imageUrl || 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image'}
            alt={product.name || 'Product'}
            className={styles.productImage}
          />
          <div className={styles.productCardOverlay}>
            <button
              type="button"
              className={`${styles.productQuickWishlist} ${wishlisted ? styles.productQuickWishlisted : ''}`}
              onClick={handleWishlistClick}
              aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={wishlisted}
            >
              <HeartIcon filled={wishlisted} />
            </button>

            {needsSizeSelection ? (
              <Link
                to={`/products/${product.id}`}
                className={styles.productQuickAddBtn}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select size for ${product.name}`}
              >
                <BagPlusIcon />
                <span>Select Size</span>
              </Link>
            ) : (
              <button
                type="button"
                className={`${styles.productQuickAddBtn} ${justAdded ? styles.productQuickAddDone : ''}`}
                onClick={handleQuickAdd}
                aria-label={justAdded ? `${product.name} added to cart` : `Quick add ${product.name} to cart`}
              >
                <BagPlusIcon />
                <span>{justAdded ? 'Added!' : 'Quick Add'}</span>
              </button>
            )}
          </div>
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>{product.name}</h3>
          <p className={styles.productPrice}>{getPriceDisplay(product) ?? '—'}</p>
        </div>
      </Link>
    </div>
  );
};

const ProductGrid = ({ products = [] }) => {
  if (products.length === 0) {
    return <p className={styles.productEmpty}>No products yet. Check back soon!</p>;
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
