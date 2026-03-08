import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { orderApi } from '../../api/order';
import { userApi } from '../../api/user';
import { validatePassword, getPasswordChecklist, PASSWORD_MIN_LENGTH } from '../../utils/passwordValidation';
import styles from '../../styles/themes/customer.module.css';

const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const TABS = [
  { id: 'personal', label: 'My Info', icon: '👤' },
  { id: 'orders', label: 'My Backstage Pass', icon: '🎫' },
  { id: 'wishlist', label: 'Wishlist', icon: '♡' },
  { id: 'vault', label: 'The Vault', icon: '🔐' },
];

const VAULT_DATA = {
  't.barnes@greendale.edu': [
    { id: 1, type: 'VISA', last4: '5309', full: '4111 1111 1111 5309', holder: 'TROY BARNES', expiry: '11/28', cvv: '867' },
  ],
  'd.wilkerson@luckyaid.com': [
    { id: 1, type: 'MASTERCARD', last4: '0001', full: '5500 0000 0000 0001', holder: 'DEWEY WILKERSON', expiry: '06/29', cvv: '123' },
    { id: 2, type: 'VISA', last4: '7777', full: '4222 2222 2222 7777', holder: 'DEWEY WILKERSON', expiry: '01/30', cvv: '456' },
  ],
  'b.howard@abbott.edu': [
    { id: 1, type: 'AMEX',       last4: '1004', full: '3782 822463 11004',   holder: 'BARBARA HOWARD', expiry: '08/28', cvv: '7813' },
    { id: 2, type: 'VISA',       last4: '4242', full: '4000 0566 5566 4242', holder: 'BARBARA HOWARD', expiry: '12/27', cvv: '999' },
    { id: 3, type: 'MASTERCARD', last4: '8210', full: '5105 1051 0510 8210', holder: 'BARBARA HOWARD', expiry: '03/29', cvv: '321' },
  ],
};

const ErrorIcon = () => (
  <svg
    className={styles.authErrorIcon}
    aria-hidden="true"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V5a1 1 0 112 0v4a1 1 0 11-2 0zm1 4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 13z"
      clipRule="evenodd"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
  </svg>
);

const StatusIcon = ({ status }) => {
  const s = (status || '').toUpperCase();
  if (s === 'DELIVERED') return <span aria-hidden="true" className={styles.orderStatusDot}>✓</span>;
  if (s === 'CANCELLED') return <span aria-hidden="true" className={styles.orderStatusDot}>✕</span>;
  if (s === 'SHIPPED') return <span aria-hidden="true" className={styles.orderStatusDot}>→</span>;
  return <span aria-hidden="true" className={styles.orderStatusDot}>⏳</span>;
};

/* ── Inline-editable field ───────────────────────────────────────────── */

const EditableField = ({ label, value, placeholder, onSave, inputType = 'text', autoComplete, submittingGlobal }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok !== false) setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
  };

  return (
    <div className={styles.profileFieldRow}>
      <dt className={styles.profileFieldLabel}>{label}</dt>
      {!editing ? (
        <dd className={styles.profileFieldValueRow}>
          <span className={styles.profileFieldValue}>{value || placeholder || 'Not provided'}</span>
          <button type="button" className={styles.profileFieldEditBtn} onClick={() => { setDraft(value || ''); setEditing(true); }}
            aria-label={`Edit ${label}`}>
            Edit
          </button>
        </dd>
      ) : (
        <dd className={styles.profileFieldValueRow}>
          <input ref={inputRef} type={inputType} autoComplete={autoComplete} value={draft}
            onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown}
            className={styles.profileFieldInlineInput} aria-label={label} />
          <button type="button" className={styles.profileFieldSaveBtn} disabled={saving || submittingGlobal}
            onClick={handleSave}>
            {saving ? '…' : 'Save'}
          </button>
          <button type="button" className={styles.profileFieldCancelBtn}
            onClick={() => { setDraft(value || ''); setEditing(false); }}>
            Cancel
          </button>
        </dd>
      )}
    </div>
  );
};

/* ── Personal Info Tab ──────────────────────────────────────────────── */

const PersonalInfoTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    userApi.getMe()
      .then((me) => { if (mounted) { setProfile(me); setLoading(false); } })
      .catch(() => { if (mounted) { setError('Could not load profile.'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const saveField = useCallback(async (fieldName, value) => {
    setFeedback(null);
    try {
      const updated = await userApi.updateProfile({ [fieldName]: value });
      setProfile(updated);
      setFeedback({ type: 'success', message: 'Saved.' });
      return true;
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Could not save.' });
      return false;
    }
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setFeedback({ type: 'error', message: 'Current password and new password are required.' });
      return;
    }
    const pwError = validatePassword(passwordData.newPassword);
    if (pwError) { setFeedback({ type: 'error', message: pwError }); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    setPwSubmitting(true);
    try {
      await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'Password updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Could not update password.' });
    } finally {
      setPwSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.profileTabContent}>
        <div className="loading-container">
          <div className="loading-spinner" role="status" aria-label="Loading profile" />
          <p className="loading-message" aria-live="polite">Loading your info…</p>
        </div>
      </div>
    );
  }
  if (error) return <div className={styles.profileTabContent}><p className={styles.profileError}>{error}</p></div>;

  return (
    <div className={styles.profileTabContent}>
      {feedback && (
        <div role="alert" className={feedback.type === 'success' ? styles.profileFeedbackSuccess : styles.profileFeedbackError}>
          {feedback.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.profileInfoCard}>
        <div className={styles.profileInfoCardHeader}>
          <h2 className={styles.profileInfoCardTitle}>My Info</h2>
        </div>

        <dl className={styles.profileFieldList}>
          <EditableField label="Full Name" value={profile.fullName} autoComplete="name"
            onSave={(v) => saveField('fullName', v)} />
          <EditableField label="Email" value={profile.email} inputType="email"
            autoComplete="email" onSave={(v) => saveField('email', v)} />
          <EditableField label="Phone" value={profile.phoneNumber} placeholder="Not provided"
            inputType="tel" autoComplete="tel" onSave={(v) => saveField('phoneNumber', v)} />
          <EditableField label="Address" value={profile.address} placeholder="Not provided"
            autoComplete="street-address" onSave={(v) => saveField('address', v)} />
          <div className={styles.profileFieldRow}>
            <dt className={styles.profileFieldLabel}>Member Since</dt>
            <dd className={styles.profileFieldValue}>{formatDate(profile.createdAt)}</dd>
          </div>

          <div className={styles.profileFieldRow}>
            <dt className={styles.profileFieldLabel}>Password</dt>
            {!changingPassword ? (
              <dd className={styles.profileFieldValueRow}>
                <span className={styles.profileFieldValue}>••••••••••••</span>
                <button type="button" className={styles.profileFieldEditBtn}
                  onClick={() => setChangingPassword(true)} aria-label="Change password">
                  Change
                </button>
              </dd>
            ) : (
              <dd className={styles.profileFieldValueRow}>
                <form onSubmit={handlePasswordSubmit} noValidate className={styles.profilePwForm}>
                  <div className={styles.authField}>
                    <label htmlFor="pw-current" className={styles.authLabel}>Current Password</label>
                    <input id="pw-current" name="currentPassword" type="password" autoComplete="current-password" required
                      value={passwordData.currentPassword} onChange={handlePasswordChange}
                      className={styles.authInput} />
                  </div>
                  <div className={styles.authField}>
                    <label htmlFor="pw-new" className={styles.authLabel}>New Password</label>
                    <p id="pw-new-hint" className={styles.authHint}>
                      At least {PASSWORD_MIN_LENGTH} characters with uppercase, lowercase, numbers, and special characters.
                    </p>
                    <input id="pw-new" name="newPassword" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN_LENGTH}
                      aria-describedby="pw-new-hint" value={passwordData.newPassword} onChange={handlePasswordChange}
                      className={styles.authInput} />
                    {passwordData.newPassword.length > 0 && (
                      <ul className={styles.pwChecklist} aria-label="Password requirements">
                        {getPasswordChecklist(passwordData.newPassword).map((c) => (
                          <li key={c.key} className={c.passed ? styles.pwCheckPassed : styles.pwCheckFailing}>
                            <span aria-hidden="true" className={styles.pwCheckIcon}>{c.passed ? '✓' : '✕'}</span>
                            <span>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className={styles.authField}>
                    <label htmlFor="pw-confirm" className={styles.authLabel}>Confirm New Password</label>
                    <input id="pw-confirm" name="confirmPassword" type="password" autoComplete="new-password" required
                      value={passwordData.confirmPassword} onChange={handlePasswordChange}
                      className={styles.authInput} />
                  </div>
                  <div className={styles.profileEditActions}>
                    <button type="submit" disabled={pwSubmitting} className={styles.authSubmitButton}>
                      {pwSubmitting ? 'Updating…' : 'Update Password'}
                    </button>
                    <button type="button" className={styles.profileCancelBtn}
                      onClick={() => { setChangingPassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </dd>
            )}
          </div>
        </dl>
      </div>
    </div>
  );
};

/* ── Order History Tab ──────────────────────────────────────────────── */

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;
    userApi.getMe()
      .then((me) => { if (mounted) setUserId(me.id); })
      .catch(() => { if (mounted) { setError('Could not load profile.'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      try {
        const data = await orderApi.getByCustomer(userId);
        if (!cancelled) {
          setOrders(data || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setLoading(false);
          setError('Could not load orders.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.profileTabContent}>
        <div className="loading-container">
          <div className="loading-spinner" role="status" aria-label="Loading orders" />
          <p className="loading-message" aria-live="polite">Loading your backstage pass…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profileTabContent}>
        <p className={styles.profileError}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.profileTabContent}>
        <div className={styles.backstageEmpty}>
          <div className={styles.backstageEmptyIcon} aria-hidden="true">🎫</div>
          <h2 className={styles.backstageEmptyTitle}>No Backstage Passes Yet</h2>
          <p className={styles.backstageEmptyBody}>
            Your order history is empty — time to hit the merch table and grab your first pass!
          </p>
          <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Browse the Store</Link>
        </div>
      </div>
    );
  }

  const totalSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const delivered = orders.filter((o) => (o.status || '').toUpperCase() === 'DELIVERED').length;
  const cancelled = orders.filter((o) => (o.status || '').toUpperCase() === 'CANCELLED').length;

  return (
    <div className={styles.profileTabContent}>
      <div className={styles.backstageStats}>
        <div className={styles.backstageStat}>
          <span className={styles.backstageStatValue}>{orders.length}</span>
          <span className={styles.backstageStatLabel}>Orders</span>
        </div>
        <div className={styles.backstageStat}>
          <span className={styles.backstageStatValue}>{formatPrice(totalSpend)}</span>
          <span className={styles.backstageStatLabel}>Total Spent</span>
        </div>
        <div className={styles.backstageStat}>
          <span className={styles.backstageStatValue}>{delivered}</span>
          <span className={styles.backstageStatLabel}>Delivered</span>
        </div>
        {cancelled > 0 && (
          <div className={styles.backstageStat}>
            <span className={styles.backstageStatValue}>{cancelled}</span>
            <span className={styles.backstageStatLabel}>Cancelled</span>
          </div>
        )}
      </div>

      <div className={styles.orderList} role="list" aria-label="Order history">
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard} role="listitem">
            <div className={styles.orderCardHeader}>
              <StatusIcon status={order.status} />
              <span className={styles.orderCardId}>#{order.orderSlug || order.id}</span>
              <span className={styles.orderCardDate}>{formatDate(order.orderDate || order.createdAt)}</span>
              <span className={`${styles.orderCardStatus} ${styles[`orderStatus${(order.status || '').replace(/\s/g, '')}`] || ''}`}>
                {order.status}
              </span>
            </div>
            {(order.items || order.orderItems) && (order.items || order.orderItems).length > 0 && (
              <ul className={styles.orderCardItems} role="list">
                {(order.items || order.orderItems).slice(0, 4).map((item, idx) => (
                  <li key={idx} className={styles.orderCardItem}>
                    <span className={styles.orderCardItemName}>
                      {item.variant?.product?.name || item.productName || `Product #${item.variant?.product?.id || '?'}`}
                    </span>
                    <span className={styles.orderCardItemQty}>× {item.quantity}</span>
                    <span className={styles.orderCardItemPrice}>{formatPrice(item.priceAtPurchase || item.unitPrice || 0)}</span>
                  </li>
                ))}
                {(order.items || order.orderItems).length > 4 && (
                  <li className={styles.orderCardMore}>
                    +{(order.items || order.orderItems).length - 4} more item{(order.items || order.orderItems).length - 4 > 1 ? 's' : ''}
                  </li>
                )}
              </ul>
            )}
            <div className={styles.orderCardFooter}>
              <span className={styles.orderCardTotal}>
                Total: {formatPrice(order.totalAmount || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Wishlist Tab ────────────────────────────────────────────────────── */

const WishlistTab = () => {
  const { items, removeFromWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className={styles.profileTabContent}>
        <div className={styles.backstageEmpty}>
          <div className={styles.backstageEmptyIcon} aria-hidden="true">♡</div>
          <h2 className={styles.backstageEmptyTitle}>Wishlist is Empty</h2>
          <p className={styles.backstageEmptyBody}>
            Start dreaming! Browse the store and heart the items you love.
          </p>
          <Link to="/store" className={`${styles.button} ${styles.buttonPrimary}`}>Browse the Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileTabContent}>
      <div className={styles.wishlistGrid} role="list" aria-label="Wishlist">
        {items.map((item) => (
          <div key={item.productId} className={styles.wishlistCard} role="listitem">
            <Link to={`/products/${item.productId}`} className={styles.wishlistCardLink}>
              <img
                src={item.imageUrl || 'https://placehold.co/200x200/2F253A/FFFFFF?text=Item'}
                alt=""
                className={styles.wishlistCardImg}
              />
              <div className={styles.wishlistCardInfo}>
                <h3 className={styles.wishlistCardName}>{item.name}</h3>
                {item.price > 0 && <p className={styles.wishlistCardPrice}>{formatPrice(item.price)}</p>}
              </div>
            </Link>
            <button
              type="button"
              className={styles.wishlistRemoveBtn}
              aria-label={`Remove ${item.name} from wishlist`}
              onClick={() => removeFromWishlist(item.productId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Vault Tab ──────────────────────────────────────────────────────── */

const VaultCard = ({ card }) => {
  const [revealed, setRevealed] = useState(false);

  const masked = `**** **** **** ${card.last4}`;

  return (
    <div className={styles.vaultCard} role="listitem">
      <div className={styles.vaultCardChip} aria-hidden="true">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <rect x="1" y="1" width="34" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
          <line x1="1" y1="10" x2="35" y2="10" stroke="currentColor" strokeWidth="1.5" />
          <line x1="1" y1="18" x2="35" y2="18" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="1" x2="12" y2="27" stroke="currentColor" strokeWidth="1.5" />
          <line x1="24" y1="1" x2="24" y2="27" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className={styles.vaultCardType}>{card.type}</div>

      <div className={styles.vaultCardNumber} aria-label={`Card ending in ${card.last4}`}>
        <span className={styles.vaultCardDigits}>
          {revealed ? card.full : masked}
        </span>
      </div>

      <button
        type="button"
        className={styles.vaultRevealBtn}
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide full card number' : 'Reveal full card number'}
        onClick={() => setRevealed((p) => !p)}
      >
        {revealed ? '🔒 Hide' : '👁 Reveal'}
      </button>

      {revealed && (
        <div className={styles.vaultRevealedExtra} aria-live="polite">
          <span className={styles.vaultRevealedLabel}>CVV</span>
          <span className={styles.vaultRevealedValue}>{card.cvv}</span>
        </div>
      )}

      <div className={styles.vaultCardFooter}>
        <span className={styles.vaultCardHolder}>{card.holder}</span>
        <span className={styles.vaultCardExpiry}>{card.expiry}</span>
      </div>
    </div>
  );
};

const VaultTab = () => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    userApi.getMe()
      .then((me) => { if (mounted) setUserProfile(me); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const holderName = userProfile?.fullName?.toUpperCase() || 'ACCOUNT HOLDER';
  const knownCards = userProfile?.email ? VAULT_DATA[userProfile.email] : null;

  const cards = knownCards || [
    { id: 1, type: 'VISA', last4: '0000', full: '4111 1111 1111 0000', holder: holderName, expiry: '12/28', cvv: '000' },
  ];

  return (
    <div className={styles.profileTabContent}>
      <div className={styles.vaultDisclaimer} role="note">
        <strong>Demo Vault</strong> — these are fictional cards for demo purposes. No real payment data is stored or processed.
      </div>
      <div className={styles.vaultGrid} role="list" aria-label="Saved payment methods">
        {cards.map((card) => (
          <VaultCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

/* ── Profile Page ───────────────────────────────────────────────────── */

const ProfilePage = () => {
  const { isAuthenticated, username, logout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const headingRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (panelRef.current) panelRef.current.focus({ preventScroll: true });
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'personal': return <PersonalInfoTab />;
      case 'orders': return <OrderHistory />;
      case 'wishlist': return <WishlistTab />;
      case 'vault': return <VaultTab />;
      default: return null;
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.profileHeading}>
          {username ? `Hey, ${username}` : 'My Profile'}
        </h1>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSmall}`}
          onClick={logout}
        >
          Sign Out
        </button>
      </div>

      <div className={styles.profileTabs} role="tablist" aria-label="Profile sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`${styles.profileTab} ${activeTab === tab.id ? styles.profileTabActive : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span aria-hidden="true" className={styles.profileTabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={panelRef}
        id={`panel-${activeTab}`}
        role="tabpanel"
        tabIndex={-1}
        aria-labelledby={`tab-${activeTab}`}
        className={styles.profilePanel}
      >
        {renderPanel()}
      </div>
    </div>
  );
};

export default ProfilePage;
