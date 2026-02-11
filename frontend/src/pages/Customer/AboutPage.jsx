import React from 'react';
import ContentSection from '../../components/ContentSection';

/**
 * About page - renders content from site_content.csv (ABOUT section).
 * Uses Customer Theme via CustomerLayout.
 */
const AboutPage = () => {
  return (
    <div>
      <h1
        className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8"
        style={{ color: 'var(--main-100)' }}
      >
        About Us
      </h1>
      <ContentSection section="ABOUT" />
    </div>
  );
};

export default AboutPage;
