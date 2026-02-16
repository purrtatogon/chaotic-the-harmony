import React from 'react';
import Hero from '../../components/Customer/Hero/Hero';
import TourAlbum from '../../components/Customer/TourAlbum/TourAlbum';
import MerchSection from '../../components/Customer/MerchSection/MerchSection';
import NewsletterBand from '../../components/Customer/NewsletterBand/NewsletterBand';
import { useSiteContentContext } from '../../contexts/SiteContentContext';

const HomePage = () => {
  const { blocksBySection, loading: contentLoading } = useSiteContentContext();

  const homeBlocks = blocksBySection('HOME');
  const heroHeadline = homeBlocks.find((b) => b.key === 'hero_headline');

  const headline =
    heroHeadline?.title ?? 'Music for the Burned Out. Merch for the Birds.';
  const subheadline =
    heroHeadline?.content ??
    "From the 'Spark' that started it all to the 'Whelmed' era of 2025. Corporate-approved? Absolutely not.";

  if (contentLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" role="status" aria-label="Loading content" />
        <p className="loading-message" aria-live="polite">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <>
      <Hero
        headline={headline}
        subheadline={subheadline}
        ctaText="Get Tour Tickets"
        ctaLink="#tour-album"
        secondaryCtaText="Shop Merch"
        secondaryCtaLink="#merch"
      />

      <TourAlbum />

      <MerchSection />

      <NewsletterBand />
    </>
  );
};

export default HomePage;
