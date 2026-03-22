import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/themes/customer.module.css';

function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
  }
  return product.imageUrl || '';
}

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
    return <p className={styles.productEmpty}>No products yet. Check back soon!</p>;
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => {
        const imageUrl = getProductImage(product);
        return (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className={styles.productCard}
          >
            <div className={styles.productImageWrapper}>
              <img
                src={imageUrl || 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image'}
                alt={product.name || 'Product'}
                className={styles.productImage}
              />
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productTitle}>{product.name}</h3>
              <p className={styles.productPrice}>
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
