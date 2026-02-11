import React from 'react';
import FAQSection from '../../components/FAQSection';

/**
 * FAQ page - renders FAQ section as accordion from site_content.csv.
 * Uses Customer Theme via CustomerLayout.
 */
const FAQPage = () => {
  return (
    <div>
      <h1
        className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8"
        style={{ color: 'var(--main-100)' }}
      >
        Frequently Asked Questions
      </h1>
      <FAQSection />
    </div>
  );
};

export default FAQPage;
