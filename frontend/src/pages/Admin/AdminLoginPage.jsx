import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { authApi } from '../../api/auth';
import Input from '../../components/Input';
import Button from '../../components/Button';

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
          <div style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            backgroundColor: 'var(--secondary-05)', 
            border: 'var(--border-width) solid var(--secondary-100)',
            color: 'var(--secondary-100)',
            fontWeight: 700
          }}>
            {error}
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
          
          <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
