import React from 'react';
import { Link } from 'react-router-dom';
import { getSectionImage } from '../../../utils/sectionImage';
import styles from '../../../styles/themes/customer.module.css';

const AboutSplit = ({ title, body, ctaText = 'Our Story', ctaLink = '/about' }) => {
  const imageUrl = getSectionImage('ABOUT US', 600, 500);

  return (
    <section className={styles.aboutContainer}>
      <div className={styles.aboutImageWrapper}>
        <img
          src={imageUrl}
          alt="About us"
          className={styles.aboutImage}
        />
      </div>
      <div className={styles.aboutTextSide}>
        <h2 className={styles.aboutHeader}>
          <span className={styles.aboutHeaderHighlight}>{title}</span>
        </h2>
        <p className={styles.aboutBody}>{body}</p>
        <Link
          to={ctaLink}
          className={`${styles.button} ${styles.buttonPrimary} ${styles.ctaLink}`}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
};

export default AboutSplit;
