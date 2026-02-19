import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { productApi } from '../../api/product';
import designStyles from '../../styles/designSystem.module.css';
import styles from './ProductDetailPage.module.css';

function getProductImage(product) {
  if (product?.images?.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
  }
  return product?.imageUrl || '';
}

function getPriceDisplay(product) {
  if (!product?.variants?.length) return null;
  const amounts = product.variants.flatMap((v) =>
    (v.prices || []).filter((p) => p.currencyCode === 'EUR').map((p) => p.amount)
  );
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, loading, error } = useApi(() => productApi.getById(id), [id]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '40vh' }}>
        <div className="loading-spinner" />
        <p className="loading-message">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.error}>
        <p>Product not found.</p>
        <Link to="/" className={`${designStyles.button} ${designStyles.buttonPrimary}`}>
          Back to Home
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>← Back to Shop</Link>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl || 'https://placehold.co/600x600/2F253A/FFFFFF?text=No+Image'}
            alt={product.name}
            className={styles.image}
          />
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{getPriceDisplay(product) ?? '—'}</p>
          {product.description && (
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
