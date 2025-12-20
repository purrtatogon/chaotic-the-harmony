import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ItemDetailField from '../../components/Admin/ItemDetailField';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import Button from '../../components/Global/Button';
import Input from '../../components/Global/Input';
import Form from '../../components/Global/Form';
import FormActions from '../../components/Global/FormActions';
import { getAvatarUrl, getRoleBadgeClassName, getRoleDisplayName } from '../../utils/userUtils';

const ProfilePage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Granular editing states
  const [editInfo, setEditInfo] = useState(false);
  const [editSecurity, setEditSecurity] = useState(false);

  const [formData, setFormData] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getMe();
      setUser(data);
      setFormData(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (type) => {
    setFeedback(null);
    try {
      setSubmitting(true);
      const updatedUser = await userApi.updateProfile(formData);
      setUser(updatedUser);
      if (type === 'info') setEditInfo(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Update failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSubmitting(true);
      
      if (passwordData.newPassword) {
          if (passwordData.newPassword !== passwordData.confirmPassword) {
              setFeedback({ type: 'error', message: 'New passwords do not match.' });
              return;
          }
          await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      }

      if (formData.email !== user.email) {
          await userApi.updateProfile({ email: formData.email });
      }

      setEditSecurity(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchProfile();
      setFeedback({ type: 'success', message: 'Security details updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Security update failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminLoading styles={styles} message="Fetching profile..." />;
  if (error) return <Error message={error} onRetry={fetchProfile} />;

  return (
    <div className={styles.pageContent}>
      
      {/* SECTION 1: HEADER & PHOTO — neo-brutalist block aligned with sidebar account card */}
      <header className={styles.profileHeader}>
        <p className={styles.userProfileCardKicker}>My account</p>
        <div className={styles.profileHeaderContent}>
          <div className={styles.profileAvatar}>
            <img
              src={formData.profileImageUrl || getAvatarUrl(user.fullName)}
              alt=""
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.fullName}</h1>
            <span
              className={`${getRoleBadgeClassName(styles, user.role)} ${styles.roleBadgeSpacing}`.trim()}
            >
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>
      </header>

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.inlineFeedbackSuccess : styles.inlineFeedbackError}
          role="alert"
        >
          <span className={styles.inlineFeedbackIcon} aria-hidden="true">
            {feedback.type === 'success' ? '✓' : '⚠'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.itemDetail}>
        
        {/* SECTION 2: PERSONAL INFO */}
        <ItemDetailCard
          title="PERSONAL INFORMATION"
          actions={!editInfo ? <Button size="small" variant="secondary" onClick={() => setEditInfo(true)}>EDIT</Button> : undefined}
        >
          {!editInfo ? (
            <>
              <ItemDetailField label="FULL NAME" value={user.fullName || 'N/A'} />
              <ItemDetailField label="PHONE" value={user.phoneNumber || 'Not provided'} />
              <ItemDetailField label="ADDRESS" value={user.address || 'Not provided'} />
            </>
          ) : (
            <Form onSubmit={(e) => { e.preventDefault(); handleUpdate('info'); }}>
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
              <FormActions>
                <Button type="submit" size="small" disabled={submitting}>SAVE INFO</Button>
                <Button type="button" variant="secondary" size="small" onClick={() => { setEditInfo(false); setFormData(user); }}>CANCEL</Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

        {/* SECTION 3: ACCOUNT SECURITY */}
        <ItemDetailCard
          title="ACCOUNT SECURITY"
          actions={!editSecurity ? <Button size="small" variant="secondary" onClick={() => setEditSecurity(true)}>EDIT</Button> : undefined}
        >
          {!editSecurity ? (
            <>
              <ItemDetailField label="EMAIL ADDRESS" value={user.email} />
              <ItemDetailField label="PASSWORD" value="••••••••••••" />
              <ItemDetailField
                label="ACCOUNT ROLE"
                value={<span className={getRoleBadgeClassName(styles, user.role)}>{getRoleDisplayName(user.role)}</span>}
              />
            </>
          ) : (
            <Form onSubmit={handleSecuritySubmit}>
              <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} required />
              <div className={styles.passwordSection}>
                <p className={styles.passwordSectionTitle}>Change Password (optional)</p>
                <div className={styles.passwordSectionGrid}>
                  <Input label="Current Password" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                  <Input label="New Password" name="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                  <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                </div>
              </div>
              <FormActions>
                <Button type="submit" size="small" disabled={submitting}>UPDATE SECURITY</Button>
                <Button type="button" variant="secondary" size="small" onClick={() => { setEditSecurity(false); setPasswordData({currentPassword:'', newPassword:'', confirmPassword:''}); }}>CANCEL</Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

      </div>
    </div>
  );
};

export default ProfilePage;