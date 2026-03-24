import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { authApi } from '../../api/auth';
import Input from '../../components/Global/Input';
import Button from '../../components/Global/Button';

const AdminLoginPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.adminLoginCard}>
        <h1 className={styles.adminLoginTitle}>Admin Portal</h1>
        <p className={styles.adminLoginSubtitle}>Staff Login</p>
        
        {error && (
          <div className={styles.adminLoginError} role="alert">
            <span className={styles.adminLoginErrorIcon} aria-hidden="true">
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.adminLoginForm}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            disabled={loading}
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={loading}
          />
          
          <Button type="submit" variant="primary" className={styles.fullWidthButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
