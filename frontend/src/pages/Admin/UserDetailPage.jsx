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
import ImageUpload from '../../components/ImageUpload';

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

  const handleAvatarUpload = (url) => {
    setFormData({
      ...formData,
      profileImageUrl: url, // Matches Java entity field
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

  if (loading) return <Loading message="Loading profile..." />;
  if (error) return <Error message={error} />;
  if (!user) return <Error message="User not found" />;

  return (
    <div className={styles.pageContent}>
      <PageHeader title="My Profile" subtitle="Manage Your Account" />

      <ItemDetailCard title="Personal Information" fullWidth>
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          marginBottom: '2rem', 
          alignItems: 'center',
          flexWrap: 'wrap' 
        }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            border: `3px solid ${theme === 'dark' ? '#3b82f6' : '#eee'}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <img 
              src={isEditing ? (formData.profileImageUrl || '/default-avatar.png') : (user.profileImageUrl || '/default-avatar.png')} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          {isEditing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#aaa' : '#666' }}>
                Update Profile Photo
              </span>
              <ImageUpload 
                onUploadSuccess={handleAvatarUpload} 
                preset="bandstore_user_preset" 
              />
            </div>
          )}
        </div>

        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <ItemDetailField label="Full Name" value={user.fullName || 'N/A'} />
            <ItemDetailField label="Email Address" value={user.email || 'N/A'} />
            <ItemDetailField label="Role" value={user.role || 'N/A'} />
            <ItemDetailField label="Phone Number" value={user.phoneNumber || 'N/A'} />
            <ItemDetailField label="Department" value={user.department || 'N/A'} />
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={submitting}>
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              {/* 1. FIXED: Matches 'fullName' in User.java */}
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                value={formData.fullName || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />

              {/* 2. FIXED: Matches 'phoneNumber' in User.java */}
              <Input
                label="Phone Number"
                name="phoneNumber" 
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                disabled={submitting}
              />

              <Input
                label="Department"
                name="department"
                type="text"
                value={formData.department || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
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

      <ItemDetailCard title="Security & Password" fullWidth>
        <Form onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Button type="submit" variant="primary" disabled={submitting}>
              Update Password
            </Button>
          </div>
        </Form>
      </ItemDetailCard>
    </div>
  );
};

export default UserDetailPage;