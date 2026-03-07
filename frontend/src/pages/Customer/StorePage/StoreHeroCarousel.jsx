import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../../api/product';
import { HERO_SLIDES } from './storeConfig';
import styles from '../../../styles/themes/customer.module.css';

// Carousel: pause control, no auto-advance when reduced motion is on, polite live region announces the current slide.

const useReducedMotion = () => {
  const [pref, setPref] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cb = (e) => setPref(e.matches);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, []);
  return pref;
};

const getMinEurPrice = (product) => {
  const amounts = (product?.variants ?? []).flatMap((v) =>
    (v.prices ?? []).filter((p) => p.currencyCode === 'EUR').map((p) => Number(p.amount))
  );
  if (amounts.length === 0) return null;
  return `from €${Math.min(...amounts).toFixed(2)}`;
};

const getFirstImage = (product) => {
  const img = product?.images?.[0];
  if (!img) return 'https://placehold.co/400x400/2F253A/FFFFFF?text=No+Image';
  return typeof img === 'string' ? img : (img.imageUrl || img.url || '');
};

const ArrowLeftIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const PauseIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const SLIDE_BG_CLASS = [styles.carouselSlideBg0, styles.carouselSlideBg1, styles.carouselSlideBg2];

const StoreHeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion();

  const [featuredProducts, setFeaturedProducts] = useState({});

  const announcerRef = useRef(null);
  const prevRef      = useRef(null);
  const nextRef      = useRef(null);

  const total = HERO_SLIDES.length;

  useEffect(() => {
    const allIds = [...new Set(HERO_SLIDES.flatMap((s) => s.featuredIds))];
    if (allIds.length === 0) return;

    Promise.all(allIds.map((id) => productApi.getById(id).catch(() => null)))
      .then((results) => {
        const map = {};
        results.forEach((p) => { if (p) map[p.id] = p; });
        setFeaturedProducts(map);
      });
  }, []);

  const goTo = (index) => setCurrent(((index % total) + total) % total);

  useEffect(() => {
    if (isPaused || prefersReduced) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 5000);
    return () => clearInterval(id);
  }, [isPaused, prefersReduced, total]);

  useLayoutEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent =
        `Slide ${current + 1} of ${total}: ${HERO_SLIDES[current].title}`;
    }
  }, [current, total]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); prevRef.current?.focus(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); nextRef.current?.focus(); }
  };

  return (
    <section
      aria-label="New arrivals — featured products"
      aria-roledescription="carousel"
      className={styles.carousel}
      onKeyDown={handleKeyDown}
    >
      <span
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="srOnly"
      />

      <div className={styles.carouselTrack}>
        {HERO_SLIDES.map((slide, i) => {
          const isActive = i === current;
          const featuredForSlide = slide.featuredIds.map((id) => featuredProducts[id]).filter(Boolean);

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!isActive}
              className={`${styles.carouselSlide} ${SLIDE_BG_CLASS[i]} ${isActive ? styles.carouselSlideActive : ''}`}
            >
              <div className={styles.carouselSlideOverlay} aria-hidden="true" />

              <div className={styles.carouselSlideContent}>
                <div className={styles.carouselSlideText}>
                  <span className={styles.carouselBadge}>{slide.badge}</span>
                  <h2 className={styles.carouselSlideTitle}>{slide.title}</h2>
                  <p className={styles.carouselSlideSubtitle}>{slide.subtitle}</p>

                  {featuredForSlide.length > 0 && (
                    <p className={styles.carouselSlideFeaturing} aria-label="Featuring">
                      {featuredForSlide.map((p, j) => (
                        <span key={p.id}>
                          {j > 0 && ' & '}
                          <em>{p.name}</em>
                        </span>
                      ))}
                    </p>
                  )}

                  <Link
                    to={slide.ctaLink}
                    className={styles.carouselCta}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {slide.ctaText}
                  </Link>
                </div>

                {featuredForSlide.length > 0 && (
                  <div className={styles.carouselSlideFeatured} aria-hidden="true">
                    {featuredForSlide.map((product) => (
                      <div key={product.id} className={styles.carouselFeaturedCard}>
                        <img
                          src={getFirstImage(product)}
                          alt=""
                          className={styles.carouselFeaturedImg}
                        />
                        <p className={styles.carouselFeaturedName}>{product.name}</p>
                        <p className={styles.carouselFeaturedPrice}>
                          {getMinEurPrice(product) ?? ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.carouselControls}>
        <button ref={prevRef} type="button" className={styles.carouselNavButton}
          aria-label="Previous slide" onClick={() => goTo(current - 1)}>
          <ArrowLeftIcon />
        </button>

        <div className={styles.carouselDots} role="group" aria-label="Slide indicators">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`${styles.carouselDot} ${i === current ? styles.carouselDotActive : ''}`}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.carouselPauseButton}
          aria-label={isPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
          onClick={() => setIsPaused((p) => !p)}
          aria-pressed={isPaused}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
          <span className="srOnly">{isPaused ? 'Paused' : 'Playing'}</span>
        </button>

        <button ref={nextRef} type="button" className={styles.carouselNavButton}
          aria-label="Next slide" onClick={() => goTo(current + 1)}>
          <ArrowRightIcon />
        </button>
      </div>
    </section>
  );
};

export default StoreHeroCarousel;
