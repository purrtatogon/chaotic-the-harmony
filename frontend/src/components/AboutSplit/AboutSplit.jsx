import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../utils/sectionImage';
import designStyles from '../../styles/designSystem.module.css';
import styles from './AboutSplit.module.css';

const AboutSplit = ({ title, body, ctaText = 'Our Story', ctaLink = '/about' }) => {
  const imageUrl = getSectionImage('ABOUT US', 600, 500);

  return (
    <section className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt="About us"
          className={styles.image}
        />
      </div>
      <div className={styles.textSide}>
        <h2 className={styles.header}>
          <span className={styles.headerHighlight}>{title}</span>
        </h2>
        <p className={styles.body}>{body}</p>
        <Link to={ctaLink} className={`${designStyles.button} ${designStyles.buttonPrimary}`} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
          {ctaText}
        </Link>
      </div>
    </section>
  );
};

export default AboutSplit;
