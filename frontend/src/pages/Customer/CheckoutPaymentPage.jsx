import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from '../../styles/themes/customer.module.css';
import { buildDemoOrderReference } from '../../utils/checkoutDemo';

const ErrorIcon = () => (
  <svg className={styles.authErrorIcon} aria-hidden="true" viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V5a1 1 0 112 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 13z"
      clipRule="evenodd" />
  </svg>
);

const CardChipIcon = () => (
  <svg aria-hidden="true" width="44" height="32" viewBox="0 0 44 32" fill="none" className={styles.stencilChip}>
    <rect x="1" y="1" width="42" height="30" rx="5" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="11" x2="43" y2="11" stroke="currentColor" strokeWidth="1.5" />
    <line x1="1" y1="21" x2="43" y2="21" stroke="currentColor" strokeWidth="1.5" />
    <line x1="15" y1="1" x2="15" y2="31" stroke="currentColor" strokeWidth="1.5" />
    <line x1="29" y1="1" x2="29" y2="31" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

const CheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const headingRef = useRef(null);

  const [values, setValues] = useState({
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);

  useLayoutEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);

  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.checkoutHeading}>Payment</h1>
        <p className={styles.checkoutEmptyText}>Your cart is empty.</p>
        <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Browse the Store</Link>
      </div>
    );
  }

  const fields = [
    { id: 'cardNumber', label: 'Card Number', type: 'text', autoComplete: 'cc-number', hint: 'Simulated — enter any 16 digits.', placeholder: '•••• •••• •••• ••••' },
    { id: 'cardName', label: 'Name on Card', type: 'text', autoComplete: 'cc-name', placeholder: 'CARDHOLDER NAME' },
    { id: 'expiry', label: 'Expiry (MM/YY)', type: 'text', autoComplete: 'cc-exp', hint: 'Any future date.', placeholder: 'MM / YY' },
    { id: 'cvv', label: 'CVV', type: 'text', autoComplete: 'cc-csc', hint: 'Any 3 digits.', placeholder: '•••' },
  ];

  const getError = (f) => {
    const show = submitted || touched[f.id];
    return show && !values[f.id].trim() ? `${f.label} is required.` : '';
  };

  const displayNumber = values.cardNumber
    ? values.cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'
    : '•••• •••• •••• ••••';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (fields.some((f) => !values[f.id].trim())) return;

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const orderNumber = buildDemoOrderReference();
    sessionStorage.setItem('checkout_order', JSON.stringify({
      orderNumber,
      items: [...items],
      total,
      shipping: JSON.parse(sessionStorage.getItem('checkout_shipping') || '{}'),
      date: new Date().toISOString(),
    }));

    clear();
    navigate('/checkout/success');
  };

  return (
    <div className={styles.checkoutPage}>
      <nav aria-label="Checkout progress" className={styles.checkoutSteps}>
        <ol className={styles.checkoutStepList}>
          <li className={styles.checkoutStepDone}>Cart</li>
          <li className={styles.checkoutStepDone}>Shipping</li>
          <li aria-current="step" className={styles.checkoutStepActive}>Payment</li>
          <li className={styles.checkoutStepPending}>Confirmation</li>
        </ol>
      </nav>

      <h1 ref={headingRef} tabIndex={-1} className={styles.checkoutHeading}>Payment</h1>

      <div className={styles.checkoutSplit}>
        <div>
          {/* Stenciled card preview */}
          <div className={styles.stencilCard} aria-hidden="true">
            <CardChipIcon />
            <div className={styles.stencilNumber}>{displayNumber}</div>
            <div className={styles.stencilBottom}>
              <span className={styles.stencilName}>
                {values.cardName || 'YOUR NAME'}
              </span>
              <span className={styles.stencilExpiry}>
                {values.expiry || 'MM/YY'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className={styles.checkoutForm} aria-label="Payment form">
            <p className={styles.checkoutNotice}>
              <strong>Demo mode</strong> — no real charges will be made.
            </p>

            <div className={styles.stencilFieldRow}>
              {fields.slice(0, 2).map((field) => {
                const error = getError(field);
                return (
                  <div key={field.id} className={styles.checkoutField}>
                    <label htmlFor={`pay-${field.id}`} className={styles.checkoutLabel}>
                      {field.label}
                      <span aria-hidden="true" className={styles.checkoutRequired}> *</span>
                    </label>
                    {field.hint && (
                      <p id={`pay-${field.id}-hint`} className={styles.checkoutHint}>{field.hint}</p>
                    )}
                    <input
                      id={`pay-${field.id}`}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required
                      placeholder={field.placeholder}
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={[
                        error ? `pay-${field.id}-error` : null,
                        field.hint ? `pay-${field.id}-hint` : null,
                      ].filter(Boolean).join(' ') || undefined}
                      value={values[field.id]}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      onBlur={() => setTouched((prev) => ({ ...prev, [field.id]: true }))}
                      className={`${styles.checkoutInput} ${styles.stencilInput} ${error ? styles.checkoutInputError : ''}`}
                    />
                    {error && (
                      <p id={`pay-${field.id}-error`} className={styles.checkoutFieldError} role="alert">
                        <ErrorIcon />
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.stencilFieldRow}>
              {fields.slice(2).map((field) => {
                const error = getError(field);
                return (
                  <div key={field.id} className={styles.checkoutField}>
                    <label htmlFor={`pay-${field.id}`} className={styles.checkoutLabel}>
                      {field.label}
                      <span aria-hidden="true" className={styles.checkoutRequired}> *</span>
                    </label>
                    {field.hint && (
                      <p id={`pay-${field.id}-hint`} className={styles.checkoutHint}>{field.hint}</p>
                    )}
                    <input
                      id={`pay-${field.id}`}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required
                      placeholder={field.placeholder}
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={[
                        error ? `pay-${field.id}-error` : null,
                        field.hint ? `pay-${field.id}-hint` : null,
                      ].filter(Boolean).join(' ') || undefined}
                      value={values[field.id]}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      onBlur={() => setTouched((prev) => ({ ...prev, [field.id]: true }))}
                      className={`${styles.checkoutInput} ${styles.stencilInput} ${error ? styles.checkoutInputError : ''}`}
                    />
                    {error && (
                      <p id={`pay-${field.id}-error`} className={styles.checkoutFieldError} role="alert">
                        <ErrorIcon />
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.checkoutActions}>
              <Link to="/checkout/shipping" className={styles.checkoutBackLink}>← Back to Shipping</Link>
              <button
                type="submit"
                disabled={processing}
                aria-disabled={processing}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {processing ? 'Processing…' : `Pay ${formatPrice(total)}`}
              </button>
            </div>
          </form>
        </div>

        <aside className={styles.checkoutOrderSummary} aria-label="Order summary">
          <h2 className={styles.checkoutSummaryTitle}>Order Summary</h2>
          <ul className={styles.checkoutSummaryList} role="list">
            {items.map((item) => (
              <li key={item.variantId} className={styles.checkoutSummaryItem}>
                <span>{item.productName} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.checkoutSummaryTotal}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPaymentPage;
