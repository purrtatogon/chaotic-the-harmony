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

const SignUpPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    fullName: false, email: false, password: false, confirmPassword: false,
  });
  const [serverError,  setServerError]  = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverErrorRef = useRef(null);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = {
    fullName:        touched.fullName        && !fullName.trim()               ? 'Full name is required.'       : '',
    email:           touched.email           && !email.trim()                  ? 'Email address is required.'   : '',
    password:        touched.password        && password.length < 8            ? 'Password must be at least 8 characters.' : '',
    confirmPassword: touched.confirmPassword && confirmPassword !== password   ? 'Passwords do not match.'      : '',
  };

  const hasFieldErrors = Object.values(errors).some(Boolean);

  useLayoutEffect(() => {
    if (serverError && serverErrorRef.current) {
      serverErrorRef.current.focus();
    }
  }, [serverError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!fullName.trim() || !email.trim() || password.length < 8 || confirmPassword !== password) return;

    setServerError('');
    setIsSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'We could not create your account. Please check your details and try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.authHeading}>Create account</h1>

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

        <form onSubmit={handleSubmit} noValidate className={styles.authForm} aria-label="Create account form">

          <div className={styles.authField}>
            <label htmlFor="full-name" className={styles.authLabel}>Full name</label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={errors.fullName ? 'true' : 'false'}
              aria-describedby={errors.fullName ? 'full-name-error' : undefined}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => touch('fullName')}
              className={`${styles.authInput} ${errors.fullName ? styles.authInputError : ''}`}
            />
            {errors.fullName && (
              <p id="full-name-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />{errors.fullName}
              </p>
            )}
          </div>

          <div className={styles.authField}>
            <label htmlFor="signup-email" className={styles.authLabel}>Email address</label>
            <p id="signup-email-hint" className={styles.authHint}>
              You will use this address to sign in.
            </p>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              aria-describedby={errors.email ? 'signup-email-error signup-email-hint' : 'signup-email-hint'}
              aria-invalid={errors.email ? 'true' : 'false'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              className={`${styles.authInput} ${errors.email ? styles.authInputError : ''}`}
            />
            {errors.email && (
              <p id="signup-email-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />{errors.email}
              </p>
            )}
          </div>

          <div className={styles.authField}>
            <label htmlFor="signup-password" className={styles.authLabel}>Password</label>
            <p id="signup-password-hint" className={styles.authHint}>
              Must be at least 8 characters.
            </p>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby={errors.password ? 'signup-password-error signup-password-hint' : 'signup-password-hint'}
              aria-invalid={errors.password ? 'true' : 'false'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              className={`${styles.authInput} ${errors.password ? styles.authInputError : ''}`}
            />
            {errors.password && (
              <p id="signup-password-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />{errors.password}
              </p>
            )}
          </div>

          <div className={styles.authField}>
            <label htmlFor="confirm-password" className={styles.authLabel}>Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => touch('confirmPassword')}
              className={`${styles.authInput} ${errors.confirmPassword ? styles.authInputError : ''}`}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className={styles.authFieldError} role="alert">
                <ErrorIcon />{errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || hasFieldErrors}
            aria-disabled={isSubmitting || hasFieldErrors}
            className={styles.authSubmitButton}
          >
            {isSubmitting ? 'Creating account\u2026' : 'Create account'}
          </button>
        </form>

        <p className={`${styles.authHint} ${styles.authSwitchLinkMargin}`}>
          Already have an account?{' '}
          <Link to="/login" className={styles.authSwitchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
