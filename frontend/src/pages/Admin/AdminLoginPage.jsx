import { useState, useRef, useLayoutEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { useAdminAuth } from '../../contexts/AuthContext';
import Button from '../../components/Global/Button';
import { AdminLoggingInAndOutAnimation } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import {
  ADMIN_LOGGING_ANIMATION_HOLD_MS,
  BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY,
} from '../../components/Admin/adminLoggingInAndOutAnimation.model';

const DEMO_ACCOUNTS = [
  { role: 'ADMIN', name: 'Duke Silver', email: 'd.silver@cth-backline.com' },
  { role: 'MANAGER', name: 'Phoebe Buffay', email: 'p.buffay@cth-backline.com' },
  { role: 'SUPPORT', name: 'Cameron Tucker', email: 'c.tucker@cth-backline.com' },
  { role: 'STAFF', name: 'Jason Mendoza', email: 'j.mendoza@cth-backline.com' },
  { role: 'AUDITOR', name: 'Kevin Malone', email: 'k.malone@cth-backline.com' },
];

/** Supplementary examples only — visible labels and hints remain primary (WCAG). */
const LOGIN_EMAIL_PLACEHOLDER = 'username@domain.com';
const LOGIN_PASSWORD_PLACEHOLDER = '\u2022'.repeat(12);

function consumePostLogoutCelebrationFlag() {
  try {
    if (sessionStorage.getItem(BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY) === '1') {
      sessionStorage.removeItem(BACKLINE_SIGNING_POST_LOGOUT_SESSION_KEY);
      return true;
    }
  } catch {
    /* private / disabled storage */
  }
  return false;
}

const AdminLoginPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { login: adminLogin } = useAdminAuth();
  const formId = useId();
  const emailId = `${formId}-email`;
  const emailHintId = `${formId}-email-hint`;
  const emailErrorId = `${formId}-email-error`;
  const passwordId = `${formId}-password`;
  const passwordHintId = `${formId}-password-hint`;
  const passwordErrorId = `${formId}-password-error`;
  const errorSummaryId = `${formId}-error-summary`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingInBrandKey, setSigningInBrandKey] = useState(0);
  const [postLogoutBrandBeat, setPostLogoutBrandBeat] = useState(consumePostLogoutCelebrationFlag);
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState(null);

  const errorSummaryRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const signingInOverlayRef = useRef(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!postLogoutBrandBeat) return undefined;
    const timerId = window.setTimeout(
      () => setPostLogoutBrandBeat(false),
      ADMIN_LOGGING_ANIMATION_HOLD_MS,
    );
    return () => window.clearTimeout(timerId);
  }, [postLogoutBrandBeat]);

  useLayoutEffect(() => {
    if (signingIn && signingInOverlayRef.current) {
      signingInOverlayRef.current.focus();
    }
  }, [signingIn]);

  const emailTrimmed = email.trim();
  const emailError = submitAttempted && !emailTrimmed ? 'Enter your email address.' : null;
  const passwordError = submitAttempted && !password ? 'Enter your password.' : null;

  useLayoutEffect(() => {
    if (apiError && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
      return;
    }
    if (submitAttempted) {
      if (emailError && emailInputRef.current) {
        emailInputRef.current.focus();
        return;
      }
      if (passwordError && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }
  }, [apiError, submitAttempted, emailError, passwordError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiError(null);

    if (!emailTrimmed || !password) {
      return;
    }

    try {
      setLoading(true);
      await adminLogin(emailTrimmed, password);
      setLoading(false);
      setSigningInBrandKey((n) => n + 1);
      setSigningIn(true);
      window.setTimeout(() => {
        navigate('/admin');
      }, ADMIN_LOGGING_ANIMATION_HOLD_MS);
    } catch (err) {
      setLoading(false);
      setApiError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const emailDescribedBy = [emailHintId, emailError ? emailErrorId : null].filter(Boolean).join(' ') || undefined;
  const passwordDescribedBy = [passwordHintId, passwordError ? passwordErrorId : null].filter(Boolean).join(' ') || undefined;

  const showPostLogoutTitleGlyphs = postLogoutBrandBeat && !loading && !signingIn;
  const formDisabled = loading || signingIn;

  return (
    <div className={styles.adminLoginContainer}>
      <AdminLoggingInAndOutAnimation.Overlay
        styles={styles}
        active={signingIn}
        overlayCardRef={signingInOverlayRef}
        visibleStatus="LOGGING YOU IN..."
        brandReplayKey={signingInBrandKey}
      />

      <div
        className={styles.adminLoginCard}
        {...(formDisabled ? { 'aria-busy': true } : {})}
      >
        <h1 className={styles.adminLoginTitle}>
          {showPostLogoutTitleGlyphs ? (
            <AdminLoggingInAndOutAnimation.Brand
              key="signed-out-beat"
              styles={styles}
              active
            />
          ) : (
            <span className={styles.adminLoginTitleBrand}>[ CTH // BACKLINE ]</span>
          )}{' '}
          <span className={styles.adminLoginTitleLogin}>LOGIN</span>
        </h1>

        <AdminLoggingInAndOutAnimation.Announcement active={postLogoutBrandBeat}>
          Signed out. You can sign in again.
        </AdminLoggingInAndOutAnimation.Announcement>

        {apiError && (
          <div
            id={errorSummaryId}
            ref={errorSummaryRef}
            className={styles.adminLoginError}
            role="alert"
            aria-live="polite"
            tabIndex={-1}
          >
            <span className={styles.adminLoginErrorIcon} aria-hidden="true">
              !
            </span>
            <span>{apiError}</span>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className={styles.adminLoginForm}>
          <fieldset disabled={formDisabled} className={styles.adminLoginFieldsetReset}>
            <div className={styles.formGroup}>
              <label htmlFor={emailId} className={styles.formGroupLabel}>
                Email
              </label>
              <p id={emailHintId} className={styles.adminLoginFieldHint}>
                Enter the work email address your organization assigns for back-office access to this
                platform.
              </p>
              <input
                ref={emailInputRef}
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck="false"
                className={styles.input}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (apiError) setApiError(null);
                }}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailDescribedBy}
                aria-required="true"
                required
                placeholder={LOGIN_EMAIL_PLACEHOLDER}
              />
              {emailError && (
                <p id={emailErrorId} className={styles.adminLoginFieldError} role="status">
                  <span className={styles.adminLoginFieldErrorIcon} aria-hidden="true">
                    !
                  </span>
                  {emailError}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor={passwordId} className={styles.formGroupLabel}>
                Password
              </label>
              <p id={passwordHintId} className={styles.adminLoginFieldHint}>
                Characters are masked as you type for security. Passwords must include uppercase and lowercase letters, numbers, and symbols.
              </p>
              <div className={styles.adminLoginPasswordRow}>
                <div className={styles.adminLoginPasswordInputWrap}>
                  <input
                    ref={passwordInputRef}
                    id={passwordId}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (apiError) setApiError(null);
                    }}
                    aria-invalid={passwordError ? 'true' : 'false'}
                    aria-describedby={passwordDescribedBy}
                    aria-required="true"
                    required
                    placeholder={LOGIN_PASSWORD_PLACEHOLDER}
                  />
                </div>
                <button
                  type="button"
                  className={styles.adminLoginPasswordToggle}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordError && (
                <p id={passwordErrorId} className={styles.adminLoginFieldError} role="status">
                  <span className={styles.adminLoginFieldErrorIcon} aria-hidden="true">
                    !
                  </span>
                  {passwordError}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className={styles.fullWidthButton}>
              Login
            </Button>
          </fieldset>
        </form>
      </div>

      <aside className={styles.adminLoginInfoAside} aria-label="About this demo">
        <div className={styles.backlineExplainCard}>
          <h2 className={styles.adminLoginInfoCardHeading}>'Backline' Explained</h2>
          <p className={styles.backlineInfoText}>
            In live music, the <strong>backline</strong> is the heavy gear that stays
            behind the performers — amps, drum kits, and cables that make the show
            possible but never take a bow. This admin platform is CTH&#39;s digital
            backline: the foundation that keeps stock moving, orders shipping, and
            fans happy while the band plays on!
          </p>
        </div>

        <div className={styles.backlineCredentialsCard}>
          <header className={styles.backlineCredentialsCardHeading}>
            <h2 className={styles.adminLoginInfoCardHeading}>Demo Credentials</h2>
          </header>
          <table className={styles.backlineCredentialsTable} aria-label="Demo login credentials">
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col" className={styles.backlineCredentialsPasswordColHeader}>
                  Password for all accounts
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ACCOUNTS.map((account, index) => (
                <tr key={account.role}>
                  <td>{account.role}</td>
                  <td>{account.name}</td>
                  <td><code>{account.email}</code></td>
                  {index === 0 ? (
                    <td
                      rowSpan={DEMO_ACCOUNTS.length}
                      className={styles.backlineCredentialsPasswordCell}
                    >
                      <code className={styles.demoPasswordValue} translate="no">
                        CTH-backline!123
                      </code>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
};

export default AdminLoginPage;
