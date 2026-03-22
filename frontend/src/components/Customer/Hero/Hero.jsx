import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../../utils/sectionImage';
import styles from '../../../styles/themes/customer.module.css';

const Hero = ({
  headline,
  subheadline,
  ctaText = 'Shop Now',
  ctaLink = '/shop',
  secondaryCtaText,
  secondaryCtaLink,
}) => {
  const bgImage = getSectionImage('CHAOTIC THE HARMONY - BAND PHOTO', 1400, 800);
  const isAnchor = typeof ctaLink === 'string' && ctaLink.startsWith('#');
  const isSecondaryAnchor =
    typeof secondaryCtaLink === 'string' && secondaryCtaLink.startsWith('#');

  return (
    <section
      className={styles.hero}
      aria-label="Band hero banner"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeadline}>{headline}</h1>
        {subheadline && <p className={styles.heroSubheadline}>{subheadline}</p>}
        <div className={styles.heroCta}>
          {isAnchor ? (
            <a href={ctaLink} className={styles.heroCtaLink}>
              {ctaText}
            </a>
          ) : (
            <Link to={ctaLink} className={styles.heroCtaLink}>
              {ctaText}
            </Link>
          )}
          {secondaryCtaText && secondaryCtaLink && (
            isSecondaryAnchor ? (
              <a href={secondaryCtaLink} className={styles.heroCtaLinkSecondary}>
                {secondaryCtaText}
              </a>
            ) : (
              <Link to={secondaryCtaLink} className={styles.heroCtaLinkSecondary}>
                {secondaryCtaText}
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
