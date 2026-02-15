import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../utils/sectionImage';
import designStyles from '../../styles/designSystem.module.css';
import styles from './Hero.module.css';

const Hero = ({ headline, subheadline, ctaText = 'Shop Now', ctaLink = '/shop' }) => {
  const bgImage = getSectionImage('HERO BANNER');
  const isAnchor = typeof ctaLink === 'string' && ctaLink.startsWith('#');

  const ctaEl = (
    <span className={`${designStyles.button} ${designStyles.buttonPrimary}`}>
      {ctaText}
    </span>
  );

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.headline}>{headline}</h1>
        {subheadline && <p className={styles.subheadline}>{subheadline}</p>}
        <div className={styles.cta}>
          {isAnchor ? (
            <a href={ctaLink}>{ctaEl}</a>
          ) : (
            <Link to={ctaLink}>{ctaEl}</Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
