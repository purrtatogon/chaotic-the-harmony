import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from '../../styles/themes/customer.module.css';

const ErrorIcon = () => (
  <svg className={styles.authErrorIcon} aria-hidden="true" viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V5a1 1 0 112 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 13z"
      clipRule="evenodd" />
  </svg>
);

const FIELDS = [
  { id: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name', required: true },
  { id: 'address', label: 'Street Address', type: 'text', autoComplete: 'street-address', required: true },
  { id: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', required: true },
  { id: 'postalCode', label: 'Postal Code', type: 'text', autoComplete: 'postal-code', required: true },
  { id: 'country', label: 'Country', type: 'text', autoComplete: 'country-name', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', autoComplete: 'tel', required: false, hint: 'Optional — for delivery updates only.' },
];

const CheckoutShippingPage = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const headingRef = useRef(null);

  const [values, setValues] = useState({
    fullName: '', address: '', city: '', postalCode: '', country: '', phone: '',
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useLayoutEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);

  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.checkoutHeading}>Shipping</h1>
        <p className={styles.checkoutEmptyText}>Your cart is empty.</p>
        <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Browse the Store</Link>
      </div>
    );
  }

  const getError = (field) => {
    if (!field.required) return '';
    const show = submitted || touched[field.id];
    return show && !values[field.id].trim() ? `${field.label} is required.` : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const hasErrors = FIELDS.some((f) => f.required && !values[f.id].trim());
    if (hasErrors) return;
    sessionStorage.setItem('checkout_shipping', JSON.stringify(values));
    navigate('/checkout/payment');
  };

  return (
    <div className={styles.checkoutPage}>
      <nav aria-label="Checkout progress" className={styles.checkoutSteps}>
        <ol className={styles.checkoutStepList}>
          <li className={styles.checkoutStepDone}>Cart</li>
          <li aria-current="step" className={styles.checkoutStepActive}>Shipping</li>
          <li className={styles.checkoutStepPending}>Payment</li>
          <li className={styles.checkoutStepPending}>Confirmation</li>
        </ol>
      </nav>

      <h1 ref={headingRef} tabIndex={-1} className={styles.checkoutHeading}>Shipping Address</h1>

      <form onSubmit={handleSubmit} noValidate className={styles.checkoutForm} aria-label="Shipping address form">
        {FIELDS.map((field) => {
          const error = getError(field);
          return (
            <div key={field.id} className={styles.checkoutField}>
              <label htmlFor={`ship-${field.id}`} className={styles.checkoutLabel}>
                {field.label}
                {field.required && <span aria-hidden="true" className={styles.checkoutRequired}> *</span>}
              </label>
              {field.hint && (
                <p id={`ship-${field.id}-hint`} className={styles.checkoutHint}>{field.hint}</p>
              )}
              <input
                id={`ship-${field.id}`}
                type={field.type}
                autoComplete={field.autoComplete}
                required={field.required}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={[
                  error ? `ship-${field.id}-error` : null,
                  field.hint ? `ship-${field.id}-hint` : null,
                ].filter(Boolean).join(' ') || undefined}
                value={values[field.id]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                onBlur={() => setTouched((prev) => ({ ...prev, [field.id]: true }))}
                className={`${styles.checkoutInput} ${error ? styles.checkoutInputError : ''}`}
              />
              {error && (
                <p id={`ship-${field.id}-error`} className={styles.checkoutFieldError} role="alert">
                  <ErrorIcon />
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <div className={styles.checkoutActions}>
          <Link to="/cart" className={styles.checkoutBackLink}>← Back to Cart</Link>
          <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutShippingPage;
