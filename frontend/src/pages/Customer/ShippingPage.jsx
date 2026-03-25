import React from 'react';
import ContentSection from '../../components/Customer/ContentSection';

const ShippingPage = () => {
  return (
    <div>
      <h1
        className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8"
        style={{ color: 'var(--main-100)' }}
      >
        Shipping Policy
      </h1>
      <ContentSection section="SHIPPING" />
    </div>
  );
};

export default ShippingPage;
