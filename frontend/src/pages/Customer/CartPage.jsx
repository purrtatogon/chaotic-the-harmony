import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from '../../styles/themes/customer.module.css';

const TrashIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

const CartPage = () => {
  const { items, itemCount, total, updateQuantity, removeItem, clear } = useCart();
  const headingRef = useRef(null);

  useLayoutEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);

  return (
    <div className={styles.cartPage}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.cartHeading}>
        Your Cart
        {itemCount > 0 && (
          <span className={styles.cartBadge} aria-label={`${itemCount} items`}>
            {itemCount}
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className={styles.cartEmpty}>
          <p className={styles.cartEmptyText}>Your cart is empty.</p>
          <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>
            Browse the Store
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartList} role="list" aria-label="Cart items">
            {items.map((item) => (
              <div key={item.variantId} className={styles.cartItem} role="listitem">
                <div className={styles.cartItemImage}>
                  <img
                    src={item.imageUrl || 'https://placehold.co/120x120/2F253A/FFFFFF?text=Item'}
                    alt=""
                    className={styles.cartItemImg}
                  />
                </div>

                <div className={styles.cartItemInfo}>
                  <h2 className={styles.cartItemName}>{item.productName}</h2>
                  {(item.size || item.color) && (
                    <p className={styles.cartItemVariant}>
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className={styles.cartItemPrice}>{formatPrice(item.price)}</p>
                </div>

                <div className={styles.cartItemActions}>
                  <label htmlFor={`qty-${item.variantId}`} className="srOnly">
                    Quantity for {item.productName}
                  </label>
                  <div className={styles.cartQtyGroup}>
                    <button
                      type="button"
                      className={styles.cartQtyBtn}
                      aria-label={`Decrease quantity of ${item.productName}`}
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      id={`qty-${item.variantId}`}
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) updateQuantity(item.variantId, val);
                      }}
                      className={styles.cartQtyInput}
                    />
                    <button
                      type="button"
                      className={styles.cartQtyBtn}
                      aria-label={`Increase quantity of ${item.productName}`}
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.cartRemoveBtn}
                    aria-label={`Remove ${item.productName} from cart`}
                    onClick={() => removeItem(item.variantId)}
                  >
                    <TrashIcon />
                    <span className={styles.cartRemoveLabel}>Remove</span>
                  </button>
                </div>

                <p className={styles.cartItemSubtotal}>
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.cartSummaryRow}>
              <span className={styles.cartSummaryLabel}>Subtotal</span>
              <span className={styles.cartSummaryValue}>{formatPrice(total)}</span>
            </div>
            <div className={styles.cartSummaryRow}>
              <span className={styles.cartSummaryLabel}>Shipping</span>
              <span className={styles.cartSummaryValue}>Calculated at checkout</span>
            </div>
            <div className={`${styles.cartSummaryRow} ${styles.cartSummaryTotal}`}>
              <span className={styles.cartSummaryLabel}>Total</span>
              <span className={styles.cartSummaryValue}>{formatPrice(total)}</span>
            </div>

            <div className={styles.cartActions}>
              <Link
                to="/checkout/shipping"
                className={`${styles.button} ${styles.buttonPrimary} ${styles.cartCheckoutBtn}`}
              >
                Proceed to Checkout
              </Link>
              <button
                type="button"
                className={`${styles.button} ${styles.cartClearBtn}`}
                onClick={clear}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
