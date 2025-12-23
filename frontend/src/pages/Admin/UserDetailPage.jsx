import { useState, useEffect } from 'react';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ItemDetailCard from '../../components/ItemDetailCard';
import ItemDetailField from '../../components/ItemDetailField';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Form from '../../components/Form';
import FormActions from '../../components/FormActions';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const UserDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getMe();
        setUser(data);
        setFormData(data);
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const updated = await userApi.updateProfile(formData);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      setSubmitting(true);
      await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully');
    } catch (err) {
      alert('Failed to update password: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!user) {
    return <Error message="User not found" />;
  }

  return (
    <div className={styles.pageContent}>
      <PageHeader title="My Profile" subtitle="Manage Your Account" />

      <ItemDetailCard title="Personal Information" fullWidth>
        {!isEditing ? (
          <div>
            <ItemDetailField label="Name" value={user.name || 'N/A'} />
            <ItemDetailField label="Email" value={user.email || 'N/A'} />
            <ItemDetailField label="Role" value={user.role || 'N/A'} />
            <ItemDetailField label="Phone" value={user.phone || 'N/A'} />
            <ItemDetailField label="Department" value={user.department || 'N/A'} />
            <Button variant="primary" onClick={() => setIsEditing(true)} disabled={submitting}>
              Edit Profile
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Input
              label="Department"
              name="department"
              type="text"
              value={formData.department || ''}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                Save Changes
              </Button>
              <Button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
            </FormActions>
          </Form>
        )}
      </ItemDetailCard>

      <ItemDetailCard title="Change Password" fullWidth>
        <Form onSubmit={handlePasswordSubmit}>
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            disabled={submitting}
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            disabled={submitting}
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            disabled={submitting}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            Update Password
          </Button>
        </Form>
      </ItemDetailCard>
    </div>
  );
};

export default UserDetailPage;
