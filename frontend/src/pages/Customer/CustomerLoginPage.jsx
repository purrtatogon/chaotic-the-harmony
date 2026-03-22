import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/themes/customer.module.css';

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

const CustomerLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverErrorRef = useRef(null);

  const emailMissing = emailTouched && !email.trim();
  const passwordMissing = passwordTouched && !password;

  useLayoutEffect(() => {
    if (serverError && serverErrorRef.current) {
      serverErrorRef.current.focus();
    }
  }, [serverError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!email.trim() || !password) return;

    setServerError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid email or password. Please check your details and try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.authHeading}>Sign in</h1>

        {serverError && (
          <div
            role="alert"
            ref={serverErrorRef}
            tabIndex={-1}
            className={styles.authErrorAlert}
          >
            <ErrorIcon />
            <p className={styles.authErrorText}>{serverError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className={styles.authForm}
          aria-label="Sign in form"
        >
          <div className={styles.authField}>
            <label htmlFor="email" className={styles.authLabel}>
              Email address
            </label>
            <p id="email-hint" className={styles.authHint}>
              Enter the email address you registered with.
            </p>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              aria-describedby={emailMissing ? 'email-error email-hint' : 'email-hint'}
              aria-invalid={emailMissing ? 'true' : 'false'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`${styles.authInput} ${emailMissing ? styles.authInputError : ''}`}
            />
            {emailMissing && (
              <p id="email-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />
                Email address is required.
              </p>
            )}
          </div>

          <div className={styles.authField}>
            <label htmlFor="password" className={styles.authLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              aria-describedby={passwordMissing ? 'password-error' : undefined}
              aria-invalid={passwordMissing ? 'true' : 'false'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className={`${styles.authInput} ${passwordMissing ? styles.authInputError : ''}`}
            />
            {passwordMissing && (
              <p id="password-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />
                Password is required.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className={styles.authSubmitButton}
          >
            {isSubmitting ? 'Signing in\u2026' : 'Sign in'}
          </button>
        </form>

        <p className={`${styles.authHint} ${styles.authSwitchLinkMargin}`}>
          New here?{' '}
          <Link to="/signup" className={styles.authSwitchLink}>Create a free account</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
