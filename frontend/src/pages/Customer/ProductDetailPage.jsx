import { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { productMarkdownRemarkPlugins } from '../../utils/markdownGfm';
import { useApi } from '../../hooks/useApi';
import { productApi } from '../../api/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import VariantSelector from '../../components/Customer/VariantSelector/VariantSelector';
import styles from '../../styles/themes/customer.module.css';

const PRODUCT_MD_COMPONENTS = { h1: 'h3', h2: 'h3', h3: 'h4', h4: 'h4' };

const CATEGORY_MAP = { 1: 'Music', 2: 'Apparel', 3: 'Accessories' };

const EMPTY_VARIANTS = [];


const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

function getAllImages(product, selectedVariant) {
  const imgs = [];
  const seen = new Set();

  if (selectedVariant?.images?.length) {
    for (const img of selectedVariant.images) {
      const url = typeof img === 'string' ? img : img.imageUrl || img.url || '';
      if (url && !seen.has(url)) { seen.add(url); imgs.push(url); }
    }
  }

  if (product?.images?.length) {
    for (const img of product.images) {
      const url = typeof img === 'string' ? img : img.imageUrl || img.url || '';
      if (url && !seen.has(url)) { seen.add(url); imgs.push(url); }
    }
  }

  if (product?.variants?.length) {
    for (const v of product.variants) {
      if (v.images?.length) {
        for (const img of v.images) {
          const url = typeof img === 'string' ? img : img.imageUrl || img.url || '';
          if (url && !seen.has(url)) { seen.add(url); imgs.push(url); }
        }
      }
    }
  }

  if (imgs.length === 0 && product?.imageUrl) imgs.push(product.imageUrl);
  return imgs;
}

function getVariantPrice(variant) {
  if (!variant?.prices?.length) return 0;
  const eur = variant.prices.find((p) => p.currencyCode === 'EUR');
  return eur ? eur.amount : variant.prices[0]?.amount ?? 0;
}

function getPriceDisplay(product, selectedVariant) {
  if (selectedVariant) {
    const p = getVariantPrice(selectedVariant);
    return p > 0 ? fmt(p) : null;
  }
  if (!product?.variants?.length) return null;
  const amounts = product.variants.flatMap((v) =>
    (v.prices || []).filter((p) => p.currencyCode === 'EUR').map((p) => p.amount)
  );
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  return min === max ? fmt(min) : `${fmt(min)}\u2013${fmt(max)}`;
}

function fmt(n) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}

const CheckIcon = () => (
  <svg className={styles.detailConfirmIcon} aria-hidden="true" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

/* ── Image Gallery ──────────────────────────────────────────────────── */

const ImageGallery = ({ images, productName }) => {
  const [idx, setIdx] = useState(0);
  const current = idx < images.length ? idx : 0;

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  };

  if (images.length === 0) {
    return (
      <div className={styles.pdpGallery}>
        <div className={styles.pdpGalleryMain}>
          <img src="https://placehold.co/600x600/2F253A/FFFFFF?text=No+Image" alt={productName} className={styles.pdpGalleryImg} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pdpGallery}>
      <div className={styles.pdpGalleryMain} onKeyDown={handleKeyDown} tabIndex={0}
        role="region" aria-label="Product image gallery" aria-roledescription="carousel">
        <img src={images[current]} alt={`${productName} — image ${current + 1} of ${images.length}`}
          className={styles.pdpGalleryImg} />
        {images.length > 1 && (
          <>
            <button type="button" className={styles.pdpGalleryArrow + ' ' + styles.pdpGalleryArrowLeft}
              onClick={prev} aria-label="Previous image">
              <span aria-hidden="true">&#8249;</span>
            </button>
            <button type="button" className={styles.pdpGalleryArrow + ' ' + styles.pdpGalleryArrowRight}
              onClick={next} aria-label="Next image">
              <span aria-hidden="true">&#8250;</span>
            </button>
            <div className={styles.pdpGalleryCounter} aria-hidden="true">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.pdpThumbnails} role="list" aria-label="Image thumbnails">
          {images.map((url, i) => (
            <button key={i} type="button" role="listitem"
              className={`${styles.pdpThumb} ${i === current ? styles.pdpThumbActive : ''}`}
              onClick={() => setIdx(i)} aria-label={`View image ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}>
              <img src={url} alt="" className={styles.pdpThumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Product Detail Page ────────────────────────────────────────────── */

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, loading, error } = useApi(() => productApi.getById(id), [id]);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedVariantCode, setSelectedVariantCode] = useState(null);
  const [pickedVariant, setPickedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const confirmRef = useRef(null);

  const handlePickedVariant = useCallback((variant) => {
    setPickedVariant(variant);
  }, []);

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
        <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Back to Store</Link>
      </div>
    );
  }

  const variants = product.variants ?? EMPTY_VARIANTS;
  const hasVariants = variants.length > 0;

  const variantCodes = [...new Set(variants.map((v) => v.variantCode).filter(Boolean))];
  const hasMultipleVariantCodes = variantCodes.length > 1;

  const activeVariantCode = selectedVariantCode || (hasMultipleVariantCodes ? null : variantCodes[0] || null);

  const filteredByCode = activeVariantCode
    ? variants.filter((v) => v.variantCode === activeVariantCode)
    : variants;

  const skuIdsKey = filteredByCode.map((v) => v.id).join(',');

  const resolvedPickedVariant =
    pickedVariant &&
    filteredByCode.some((v) => String(v.id) === String(pickedVariant.id))
      ? pickedVariant
      : null;

  const optionSizesSorted = (() => {
    const raw = [...new Set(filteredByCode.map((v) => v.size).filter(Boolean))];
    raw.sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a);
      const bi = SIZE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return raw;
  })();

  const optionColoursDistinct = [...new Set(
    filteredByCode.map((v) => v.variantCode ?? v.color).filter(Boolean),
  )];

  const multiSizedPick = optionSizesSorted.length > 1;
  const multiColourPick = optionColoursDistinct.length > 1;

  const needsVariantChoice = hasMultipleVariantCodes && !selectedVariantCode;
  const needsProductOptionPick =
    hasVariants && !needsVariantChoice && filteredByCode.length >= 1 && resolvedPickedVariant === null;

  const canAddToCart =
    !hasVariants || (!needsVariantChoice && resolvedPickedVariant !== null);

  const images = getAllImages(product, resolvedPickedVariant);
  const categoryName = product.category?.name || CATEGORY_MAP[product.categoryId] || 'Store';

  let ctaLabel = 'Add to Cart';
  if (needsVariantChoice) {
    ctaLabel = 'Select a Variant';
  } else if (needsProductOptionPick) {
    if (multiSizedPick && multiColourPick) ctaLabel = 'Select size and colour';
    else if (multiSizedPick) ctaLabel = 'Select a Size';
    else if (multiColourPick) ctaLabel = 'Select a Colour';
    else ctaLabel = 'Make a selection';
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    const imgUrl = images[0] || '';
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: resolvedPickedVariant ? resolvedPickedVariant.id : `product-${product.id}`,
      size: resolvedPickedVariant?.size ?? null,
      color: resolvedPickedVariant?.variantCode ?? null,
      price: resolvedPickedVariant ? getVariantPrice(resolvedPickedVariant) : 0,
      imageUrl: imgUrl,
      quantity: 1,
    });
    setAddedToCart(true);
  };

  return (
    <div className={styles.detailPage}>
      <nav className={styles.pdpBreadcrumbs} aria-label="Breadcrumb">
        <ol className={styles.pdpBreadcrumbList}>
          <li className={styles.pdpBreadcrumbItem}><Link to="/">Home</Link></li>
          <li className={styles.pdpBreadcrumbSep} aria-hidden="true">/</li>
          <li className={styles.pdpBreadcrumbItem}><Link to="/store">Store</Link></li>
          <li className={styles.pdpBreadcrumbSep} aria-hidden="true">/</li>
          <li className={styles.pdpBreadcrumbItem}><Link to={`/store?category=${categoryName}`}>{categoryName}</Link></li>
          <li className={styles.pdpBreadcrumbSep} aria-hidden="true">/</li>
          <li className={styles.pdpBreadcrumbItem} aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className={styles.detailContainer}>
        <ImageGallery images={images} productName={product.name} />

        <div className={styles.pdpInfo}>
          <h1 className={styles.detailTitle}>{product.name}</h1>
          <p className={styles.detailPrice}>{getPriceDisplay(product, resolvedPickedVariant) ?? '\u2014'}</p>

          {hasMultipleVariantCodes && (
            <fieldset className={styles.pdpVariantFieldset}>
              <legend className={styles.pdpFieldsetLegend}>
                Colour/Variant{activeVariantCode ? `: ${activeVariantCode}` : ''}
              </legend>
              <div className={styles.pdpVariantSwatches}>
                {variantCodes.map((code) => (
                  <button key={code} type="button"
                    className={`${styles.pdpVariantSwatch} ${activeVariantCode === code ? styles.pdpVariantSwatchActive : ''}`}
                    onClick={() => {
                      setPickedVariant(null);
                      setSelectedVariantCode(code);
                    }}
                    aria-label={`Variant ${code}`}
                    aria-pressed={activeVariantCode === code}>
                    <span className={styles.pdpSwatchLabel}>{code}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {!needsVariantChoice && filteredByCode.length > 0 && (
            <VariantSelector
              key={`${activeVariantCode ?? 'all'}:${skuIdsKey}`}
              variants={filteredByCode}
              onVariantChange={handlePickedVariant}
              sizeRank={SIZE_ORDER}
              sizeLegend="Size"
              colorLegend="Colour"
            />
          )}

          <div role="status" aria-live="polite" aria-atomic="true" ref={confirmRef}
            tabIndex={-1} className={styles.detailConfirmation}
            style={{ display: addedToCart ? 'flex' : 'none' }}>
            <CheckIcon />
            <span><strong>{product.name}</strong> added to cart.</span>
            <Link to="/cart" className={styles.detailConfirmLink}>View cart</Link>
          </div>

          <div className={styles.detailButtonRow}>
            <button type="button" onClick={handleAddToCart}
              disabled={!canAddToCart} aria-disabled={!canAddToCart}
              className={`${styles.detailAddToCartButton} ${canAddToCart ? styles.pdpCtaReady : ''}`}>
              {ctaLabel}
            </button>
            <button type="button" className={styles.detailWishlistButton}
              aria-pressed={product ? isInWishlist(product.id) : false}
              aria-label={product && isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => {
                if (!product) return;
                if (isInWishlist(product.id)) { removeFromWishlist(product.id); }
                else { addToWishlist({ id: product.id, name: product.name, imageUrl: images[0] || '', price: resolvedPickedVariant ? getVariantPrice(resolvedPickedVariant) : 0 }); }
              }}>
              {product && isInWishlist(product.id) ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          {product.description && String(product.description).trim() !== '' && (
            <section className={styles.detailSection} aria-labelledby="product-desc-heading">
              <h2 id="product-desc-heading" className={styles.detailSectionTitle}>Description</h2>
              <div className={styles.detailMarkdown}>
                <ReactMarkdown remarkPlugins={productMarkdownRemarkPlugins} components={PRODUCT_MD_COMPONENTS}>
                  {product.description}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {product.materialsSpecs && String(product.materialsSpecs).trim() !== '' && (
            <section className={styles.detailSection} aria-labelledby="product-materials-heading">
              <h2 id="product-materials-heading" className={styles.detailSectionTitle}>Materials &amp; Specifications</h2>
              <div className={styles.detailMarkdown}>
                <ReactMarkdown remarkPlugins={productMarkdownRemarkPlugins} components={PRODUCT_MD_COMPONENTS}>
                  {product.materialsSpecs}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {product.shippingInfo && String(product.shippingInfo).trim() !== '' && (
            <section className={styles.detailSection} aria-labelledby="product-ship-heading">
              <h2 id="product-ship-heading" className={styles.detailSectionTitle}>Shipping</h2>
              <div className={styles.detailMarkdown}>
                <ReactMarkdown remarkPlugins={productMarkdownRemarkPlugins} components={PRODUCT_MD_COMPONENTS}>
                  {product.shippingInfo}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
