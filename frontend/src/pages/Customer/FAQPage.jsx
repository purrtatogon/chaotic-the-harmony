import React from 'react';
import FAQSection from '../../components/Customer/FAQSection';

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
