import { useLayoutEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/themes/customer.module.css';

const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

const CheckIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckoutSuccessPage = () => {
  const headingRef = useRef(null);

  const order = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('checkout_order') || 'null');
    } catch {
      return null;
    }
  }, []);

  useLayoutEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);

  if (!order) {
    return (
      <div className={styles.checkoutPage}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.checkoutHeading}>No Order Found</h1>
        <p className={styles.checkoutEmptyText}>It looks like you haven't completed a checkout.</p>
        <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Browse the Store</Link>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <nav aria-label="Checkout progress" className={styles.checkoutSteps}>
        <ol className={styles.checkoutStepList}>
          <li className={styles.checkoutStepDone}>Cart</li>
          <li className={styles.checkoutStepDone}>Shipping</li>
          <li className={styles.checkoutStepDone}>Payment</li>
          <li aria-current="step" className={styles.checkoutStepActive}>Confirmation</li>
        </ol>
      </nav>

      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckIcon />
        </div>

        <h1 ref={headingRef} tabIndex={-1} className={styles.successHeading}>
          Order Confirmed!
        </h1>

        <p className={styles.successOrderNumber}>
          Order <strong>{order.orderNumber}</strong>
        </p>

        <p className={styles.successBody}>
          Thank you for your purchase! This is a simulated order — no real charges were made.
        </p>

        {order.items && order.items.length > 0 && (
          <div className={styles.successItems}>
            <h2 className={styles.successItemsTitle}>Items Ordered</h2>
            <ul className={styles.successItemList} role="list">
              {order.items.map((item) => (
                <li key={item.variantId} className={styles.successItemRow}>
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.successTotal}>
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        {order.shipping && order.shipping.fullName && (
          <div className={styles.successShipping}>
            <h2 className={styles.successItemsTitle}>Ships To</h2>
            <address className={styles.successAddress}>
              {order.shipping.fullName}<br />
              {order.shipping.address}<br />
              {order.shipping.city}, {order.shipping.postalCode}<br />
              {order.shipping.country}
            </address>
          </div>
        )}

        <div className={styles.successActions}>
          <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>
            Continue Shopping
          </Link>
          <Link to="/profile" className={styles.button}>
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
