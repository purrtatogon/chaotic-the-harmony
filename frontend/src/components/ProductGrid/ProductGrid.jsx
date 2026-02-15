import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductGrid.module.css';

/**
 * Get primary image URL from product (images array or imageUrl)
 */
function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
  }
  return product.imageUrl || '';
}

/**
 * Get price display from product (variants -> prices)
 */
function getPriceDisplay(product) {
  if (!product.variants || product.variants.length === 0) return null;
  const amounts = product.variants.flatMap((v) =>
    (v.prices || []).filter((p) => p.currencyCode === 'EUR').map((p) => p.amount)
  );
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

const ProductGrid = ({ products = [] }) => {
  if (products.length === 0) {
    return (
      <p style={{ color: 'var(--gray-50)', textAlign: 'center', padding: '2rem' }}>
        No products yet. Check back soon!
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => {
        const imageUrl = getProductImage(product);
        return (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <img
                src={imageUrl || 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image'}
                alt={product.name || 'Product'}
                className={styles.image}
              />
            </div>
            <div className={styles.info}>
              <h3 className={styles.title}>{product.name}</h3>
              <p className={styles.price}>
                {getPriceDisplay(product) ?? '—'}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
