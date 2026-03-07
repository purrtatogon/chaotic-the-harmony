import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../../api/product';
import { COLLAB_ITEMS } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

const parseCollabName = (fullName) => {
  const xIdx = fullName.lastIndexOf(' x ');
  if (xIdx === -1) return { productTitle: fullName, collaborator: '' };
  return {
    productTitle: fullName.substring(0, xIdx).trim(),
    collaborator: `x ${fullName.substring(xIdx + 3).trim()}`,
  };
};

const parseFormat = (product) => {
  const type = product.productType ?? 'CD';
  const specs = product.materialsSpecs ?? '';
  const firstLine = specs
    .split('\n')
    .map((l) => l.replace(/^-\s*/, '').trim())
    .find((l) => l.length > 0);
  return firstLine ? `${type} — ${firstLine}` : type;
};

const getMinEurPrice = (product) => {
  const amounts = (product?.variants ?? []).flatMap((v) =>
    (v.prices ?? []).filter((p) => p.currencyCode === 'EUR').map((p) => Number(p.amount))
  );
  return amounts.length > 0 ? Math.min(...amounts) : null;
};

const getFirstImage = (product) => {
  const img = product?.images?.[0];
  if (!img) return 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image';
  return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
};

const LimitedBadge = ({ label }) => (
  <span className={styles.collabBadge}>
    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <polygon points="5,0 6.5,3.5 10,3.8 7.5,6.2 8.2,10 5,8 1.8,10 2.5,6.2 0,3.8 3.5,3.5" />
    </svg>
    {label}
  </span>
);

const CollabGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const ids = COLLAB_ITEMS.map((c) => c.id);
    Promise.all(ids.map((id) => productApi.getById(id).catch(() => null)))
      .then((results) => {
        setProducts(results.filter(Boolean));
        setLoading(false);
      });
  }, []);

  if (loading || products.length === 0) return null;

  const items = products.map((product) => {
    const config = COLLAB_ITEMS.find((c) => c.id === product.id) ?? {};
    const { productTitle, collaborator } = parseCollabName(product.name);
    const minPrice = getMinEurPrice(product);
    return {
      product,
      productTitle,
      collaborator,
      format:  parseFormat(product),
      edition: config.edition ?? 'Limited Edition',
      minPrice,
      imgUrl:  getFirstImage(product),
      link:    `/products/${product.id}`,
    };
  });

  return (
    <section aria-labelledby="collabs-heading" className={styles.collabSection}>
      <div className={styles.collabInner}>
        <header className={styles.collabHeader}>
          <p className={styles.collabOverline}>Rare &amp; Collected</p>
          <h2 id="collabs-heading" className={styles.collabHeading}>
            Collaborations &amp; Limited Editions
          </h2>
          <p className={styles.collabSubheading}>
            These exist in limited quantities. Once they&apos;re gone, they&apos;re gone.
          </p>
        </header>

        <ul role="list" className={styles.collabGrid}>
          {items.map(({ product, productTitle, collaborator, format, edition, minPrice, imgUrl, link }) => (
            <li key={product.id} className={styles.collabItem}>
              <div className={styles.collabArtwork}>
                <img
                  src={imgUrl}
                  alt={`${productTitle}${collaborator ? ` ${collaborator}` : ''}`}
                  className={styles.collabArtworkImage}
                  loading="lazy"
                />
                <LimitedBadge label={edition} />
              </div>

              <div className={styles.collabInfo}>
                {collaborator && (
                  <p className={styles.collabCollaborator}>{collaborator}</p>
                )}
                <h3 className={styles.collabProductName}>{productTitle}</h3>
                <p className={styles.collabFormat}>{format}</p>
                <p className={styles.collabDescription}>{product.description}</p>

                {minPrice != null && (
                  <p className={styles.collabPrice} aria-label={`Price: ${minPrice.toFixed(2)} euros`}>
                    €{minPrice.toFixed(2)} <abbr title="Euro">EUR</abbr>
                  </p>
                )}

                <Link
                  to={link}
                  className={styles.collabViewLink}
                  aria-label={`View ${productTitle}${collaborator ? ` ${collaborator}` : ''} — ${edition}`}
                >
                  View Product →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CollabGallery;
