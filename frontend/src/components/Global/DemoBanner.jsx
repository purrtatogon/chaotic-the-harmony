import React, { useState, useEffect } from 'react';
import styles from '../../styles/themes/DemoBanner.module.css';

function formatCountdownLabel() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(Math.ceil((now.getUTCHours() + 1) / 2) * 2, 0, 0, 0);

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

  useEffect(() => {
    const tick = () => setCountdownLabel(formatCountdownLabel());
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label="Demo environment notice"
    >
      <p className={styles.inner}>
        <strong className={styles.badge}>Demo mode</strong>
        <span className={styles.staticCopy}>
          {' '}
          — Sample data for System &quot;Harmony&quot; restores every two hours (UTC).{' '}
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
