import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from '../../styles/themes/DemoBanner.module.css';

function formatCountdownLabel() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(3, 0, 0, 0);
  if (nextReset <= now) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }

  const diffMs = Math.max(0, nextReset - now);
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes <= 0) {
    return 'Resetting soon.';
  }

  const hourPart =
    hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'}` : '';
  const minutePart = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const duration =
    hours > 0 ? `${hourPart} and ${minutePart}` : minutePart;

  return `Next reset in ${duration}.`;
}

const DemoBanner = () => {
  const [countdownLabel, setCountdownLabel] = useState(formatCountdownLabel);
  const bannerRef = useRef(null);

  useEffect(() => {
    const tick = () => setCountdownLabel(formatCountdownLabel());
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);

  // Publish the banner's measured height as a CSS variable on :root so any
  // sticky chrome below it (e.g. the admin top bar) can offset itself by the
  // exact pixel value. The banner can wrap to multiple lines on narrow
  // viewports, so we observe size changes instead of hard-coding a number.
  useLayoutEffect(() => {
    const el = bannerRef.current;
    if (!el || typeof document === 'undefined') return undefined;

    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty('--demo-banner-height', `${el.offsetHeight}px`);
    };
    apply();

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(apply);
      observer.observe(el);
    } else {
      window.addEventListener('resize', apply);
    }

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', apply);
      root.style.removeProperty('--demo-banner-height');
    };
  }, []);

  return (
    <div
      ref={bannerRef}
      className={styles.banner}
      role="region"
      aria-label="Demo environment notice"
    >
      <p className={styles.inner}>
        <strong className={styles.badge}>Demo Mode:</strong>
        <span className={styles.staticCopy}>
          {' '}
          Database resets every 24 hours at 03:00 UTC.{' '}
        </span>
        <span
          className={styles.countdown}
          aria-live="polite"
          aria-atomic="true"
        >
          {countdownLabel}
        </span>
      </p>
    </div>
  );
};

export default DemoBanner;
