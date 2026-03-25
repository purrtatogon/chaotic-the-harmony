import React, { useState, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { productApi } from '../../api/product';
import { useCart } from '../../contexts/CartContext';
import VariantSelector from '../../components/Customer/VariantSelector/VariantSelector';
import styles from '../../styles/themes/customer.module.css';

function getProductImage(product) {
  if (product?.images?.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : img.imageUrl || img.url || '';
  }
  return product?.imageUrl || '';
}

function getVariantPrice(variant) {
  if (!variant?.prices?.length) return 0;
  const eur = variant.prices.find((p) => p.currencyCode === 'EUR');
  return eur ? eur.amount : variant.prices[0]?.amount ?? 0;
}

function getPriceDisplay(product) {
  if (!product?.variants?.length) return null;
  const amounts = product.variants.flatMap((v) =>
    (v.prices || []).filter((p) => p.currencyCode === 'EUR').map((p) => p.amount)
  );
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);
  return min === max ? fmt(min) : `${fmt(min)}\u2013${fmt(max)}`;
}

const CheckIcon = () => (
  <svg
    className={styles.detailConfirmIcon}
    aria-hidden="true"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, loading, error } = useApi(() => productApi.getById(id), [id]);
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const confirmRef = useRef(null);

  useLayoutEffect(() => {
    if (addedToCart && confirmRef.current) {
      confirmRef.current.focus();
      const timer = setTimeout(() => setAddedToCart(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" role="status" aria-label="Loading product" />
        <p className="loading-message" aria-live="polite">Loading…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.detailError}>
        <p>Product not found.</p>
        <Link to="/" className={`${styles.button} ${styles.buttonPrimary}`}>
          Back to Home
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const canAddToCart = !hasVariants || selectedVariant !== null;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant ? selectedVariant.id : `product-${product.id}`,
      size: selectedVariant?.size ?? null,
      color: selectedVariant?.color ?? null,
      price: selectedVariant ? getVariantPrice(selectedVariant) : 0,
      imageUrl: imageUrl || '',
      quantity: 1,
    });

    setAddedToCart(true);
  };

  return (
    <div className={styles.detailPage}>
      <Link to="/" className={styles.detailBackLink}>
        &#8592; Back to Shop
      </Link>

      <div className={styles.detailContainer}>
        <div className={styles.detailImageWrapper}>
          <img
            src={imageUrl || 'https://placehold.co/600x600/2F253A/FFFFFF?text=No+Image'}
            alt={product.name}
            className={styles.detailImage}
          />
        </div>

        <div>
          <h1 className={styles.detailTitle}>{product.name}</h1>
          <p className={styles.detailPrice}>{getPriceDisplay(product) ?? '\u2014'}</p>

          {product.description && (
            <div className={styles.detailDescription}>
              <p>{product.description}</p>
            </div>
          )}

          <div className={styles.detailVariantSection}>
            {hasVariants ? (
              <>
                <VariantSelector
                  variants={variants}
                  onVariantChange={setSelectedVariant}
                />
                {!selectedVariant && (
                  <p
                    id="variant-required-hint"
                    className={styles.detailNoVariantHint}
                    aria-live="polite"
                  >
                    Please select your options above before adding to cart.
                  </p>
                )}
              </>
            ) : null}
          </div>

          {/* Confirmation live region — Deque focus target after add */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            ref={confirmRef}
            tabIndex={-1}
            className={styles.detailConfirmation}
            style={{ display: addedToCart ? 'flex' : 'none' }}
          >
            <CheckIcon />
            <span>
              <strong>{product.name}</strong> added to cart.
            </span>
            <Link to="/cart" className={styles.detailConfirmLink}>
              View cart
            </Link>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            aria-disabled={!canAddToCart}
            aria-describedby={
              !canAddToCart && hasVariants ? 'variant-required-hint' : undefined
            }
            className={styles.detailAddToCartButton}
          >
            {canAddToCart ? 'Add to cart' : 'Select options above'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
