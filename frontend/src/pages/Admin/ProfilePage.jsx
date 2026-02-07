import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import ItemDetailCard from '../../components/ItemDetailCard';
import ItemDetailField from '../../components/ItemDetailField';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Form from '../../components/Form';
import FormActions from '../../components/FormActions';
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    try {
      setSubmitting(true);
      const updatedUser = await userApi.updateProfile(formData);
      setUser(updatedUser);
      if (type === 'info') setEditInfo(false);
      alert('Updated successfully!');
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // 1. If password fields are filled, update password
      if (passwordData.newPassword) {
          if (passwordData.newPassword !== passwordData.confirmPassword) {
              alert("New passwords do not match!");
              return;
          }
          await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      }

      // 2. Update Email if it changed
      if (formData.email !== user.email) {
          await userApi.updateProfile({ email: formData.email });
      }

      setEditSecurity(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchProfile();
      alert('Security details updated!');
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Fetching profile..." />;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

  return (
    <div className={styles.pageContent}>
      
      {/* SECTION 1: HEADER & PHOTO */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={styles.profileAvatar}>
             <img 
               src={formData.profileImageUrl || getAvatarUrl(user.fullName)} 
               alt="Avatar"
             />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.fullName}</h1>
            <span className={getRoleBadgeClassName(styles, user.role)} style={{ display: 'inline-block', marginTop: '4px' }}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.itemDetail}>
        
        {/* SECTION 2: PERSONAL INFO */}
        <ItemDetailCard 
          title={
            <div className={styles.cardHeaderFlex}>
              <span>PERSONAL INFORMATION</span>
              {!editInfo && <Button size="small" variant="secondary" onClick={() => setEditInfo(true)}>EDIT</Button>}
            </div>
          }
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
          title={
            <div className={styles.cardHeaderFlex}>
              <span>ACCOUNT SECURITY</span>
              {!editSecurity && <Button size="small" variant="secondary" onClick={() => setEditSecurity(true)}>EDIT</Button>}
            </div>
          }
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