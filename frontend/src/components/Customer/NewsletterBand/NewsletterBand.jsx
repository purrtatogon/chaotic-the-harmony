import React, { useState, useRef, useId } from 'react';
import styles from '../../../styles/themes/customer.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const AlertIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const NewsletterBand = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);
  const statusRef = useRef(null);

  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const statusId = useId();

  const emailError =
    touched && email.trim() === ''
      ? 'Email address is required.'
      : touched && !EMAIL_RE.test(email)
      ? 'Please enter a valid email address (e.g. chaos@harmony.com).'
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!EMAIL_RE.test(email)) return;

    setSubmitting(true);
    /* Simulate async submission */
    setTimeout(() => {
      setSubmitting(false);
      setStatus('success');
      setEmail('');
      setTouched(false);
    }, 900);
  };

  return (
    <section className={styles.newsletterSection} aria-labelledby="newsletter-heading">
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterContent}>
          <p className={styles.newsletterOverline}>Don&rsquo;t miss a single chaotic moment</p>
          <h2 id="newsletter-heading" className={styles.newsletterHeading}>
            Join the Legion.<br />
            <span className={styles.newsletterHeadingHighlight}>
              We Promise to Be Rad.
            </span>
          </h2>
          <p className={styles.newsletterBody}>
            Get tour announcements, exclusive merch drops, and the occasional
            existential crisis right to your inbox. We email you like a band that
            actually likes you &mdash; not a corporation trying to sell you a mattress.
          </p>
          <ul className={styles.newsletterPerks} aria-label="Newsletter benefits">
            <li className={styles.newsletterPerk}>
              <CheckIcon />
              Early access to tour tickets
            </li>
            <li className={styles.newsletterPerk}>
              <CheckIcon />
              Secret merch drops before they go live
            </li>
            <li className={styles.newsletterPerk}>
              <CheckIcon />
              Behind-the-scenes chaos from the road
            </li>
          </ul>
        </div>

        <div className={styles.newsletterFormWrapper}>
          {status === 'success' ? (
            <div
              className={styles.newsletterSuccessCard}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className={styles.newsletterSuccessIcon} aria-hidden="true">
                <CheckIcon />
              </span>
              <h3 className={styles.newsletterSuccessTitle}>You&rsquo;re in the Legion!</h3>
              <p className={styles.newsletterSuccessBody}>
                Check your inbox for a confirmation — and maybe a cryptic message
                from the drummer. That&rsquo;s just how he is.
              </p>
            </div>
          ) : (
            <form
              className={styles.newsletterForm}
              onSubmit={handleSubmit}
              aria-label="Newsletter sign-up form"
              noValidate
            >
              <div className={styles.newsletterField}>
                <label htmlFor={inputId} className={styles.newsletterLabel}>
                  Email Address
                  <span className={styles.newsletterRequired} aria-hidden="true"> *</span>
                </label>
                <p id={hintId} className={styles.newsletterHint}>
                  Use your real email so tour alerts actually reach you.
                </p>
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className={`${styles.newsletterInput}${emailError ? ` ${styles.newsletterInputError}` : ''}`}
                  aria-describedby={`${hintId}${emailError ? ` ${errorId}` : ''}${status === 'error' ? ` ${statusId}` : ''}`}
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-required="true"
                  placeholder="chaos@harmony.com"
                  disabled={submitting}
                />
                {emailError && (
                  <p
                    id={errorId}
                    className={styles.newsletterFieldError}
                    role="alert"
                  >
                    <AlertIcon />
                    {emailError}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <p
                  id={statusId}
                  className={styles.newsletterStatusError}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertIcon />
                  Something went sideways. Try again or send a carrier pigeon.
                </p>
              )}

              <button
                type="submit"
                className={styles.newsletterSubmit}
                disabled={submitting}
                aria-disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Sign Me Up for the Chaos'}
              </button>

              <p className={styles.newsletterDisclaimer}>
                No spam. No selling your data. Just band stuff.
                Unsubscribe whenever — we&rsquo;ll be sad but we&rsquo;ll understand.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterBand;
