import React from 'react';
import Hero from '../../components/Hero/Hero';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import AboutSplit from '../../components/AboutSplit/AboutSplit';
import { useSiteContentContext } from '../../contexts/SiteContentContext';
import { useApi } from '../../hooks/useApi';
import { productApi } from '../../api/product';
import styles from './HomePage.module.css';

/**
 * Home page - Hero, Shop (Product Grid), About Split.
 * Uses site_content.csv for static text, real products for the grid.
 */
const HomePage = () => {
  const { blocksBySection, loading: contentLoading } = useSiteContentContext();
  const { data: products, loading: productsLoading } = useApi(productApi.getAll, []);

  const homeBlocks = blocksBySection('HOME');
  const aboutBlocks = blocksBySection('ABOUT');

  const heroHeadline = homeBlocks.find((b) => b.key === 'hero_headline');
  const missionTeaser = homeBlocks.find((b) => b.key === 'mission_teaser');
  const ourStory = aboutBlocks.find((b) => b.key === 'our_story');

  const headline = heroHeadline?.title ?? 'Music for the Burned Out. Merch for the Birds.';
  const subheadline = heroHeadline?.content ?? "From the 'Spark' that started it all to the 'Whelmed' era of 2025. Corporate-approved? Absolutely not.";
  const aboutTitle = ourStory?.title ?? 'It Started With a Spark';
  const aboutBody = ourStory?.content ?? 'In 2018, the corporate world burned us out. We quit. We channeled that burnout into our debut album, Spark.';

  if (contentLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '40vh' }}>
        <div className="loading-spinner" />
        <p className="loading-message">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Hero
        headline={headline}
        subheadline={subheadline}
        ctaText="Shop Now"
        ctaLink="#shop"
      />

      <div className={styles.content}>
        <section id="shop" className={styles.section}>
          <h2 className={styles.sectionTitle}>Shop</h2>
          {productsLoading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}>
              <div className="loading-spinner" />
              <p className="loading-message">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={products || []} />
          )}
        </section>

        <section className={styles.section}>
          <AboutSplit
            title={aboutTitle}
            body={aboutBody}
            ctaText="Our Story"
            ctaLink="/about"
          />
        </section>
      </div>
    </>
  );
};

export default HomePage;
