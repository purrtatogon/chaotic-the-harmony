// src/pages/Admin/ProfilePage.jsx
import React from 'react';
import { useApi } from '../../hooks/useApi';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import ItemDetailCard from '../../components/ItemDetailCard';
import ItemDetailField from '../../components/ItemDetailField';
import Loading from '../../components/Loading';

const ProfilePage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  // Correct function: userApi.getMe()
  const { data: user, loading, error } = useApi(() => userApi.getMe());

  if (loading) return <Loading message="Fetching your profile..." />;
  
  // Better error handling
  if (error) {
    return (
        <div style={{ color: 'red', padding: '20px' }}>
            <h3>Error loading profile</h3>
            <p>{error}</p>
            <p style={{fontSize: '0.8rem'}}>Tip: Try logging out and logging back in to refresh your token.</p>
        </div>
    );
  }

  // Safety check: if API returns null but no error
  if (!user) return <div>User not found</div>;

  return (
    <div className={styles.pageContent}>
      <h1>My Profile</h1>
      <div className={styles.itemDetail}>
        <ItemDetailCard title="Account Details">
          <ItemDetailField label="Full Name" value={user?.fullName || 'N/A'} />
          <ItemDetailField label="Email Address" value={user?.email || 'N/A'} />
          <ItemDetailField label="Role" value={user?.role || 'N/A'} />
          <ItemDetailField label="User ID" value={user?.id || 'N/A'} />
        </ItemDetailCard>
        
        <ItemDetailCard title="Security">
          <p>Password: ••••••••••••</p>
        </ItemDetailCard>

        {/* Optional: Show address if it exists */}
         <ItemDetailCard title="Contact Info">
          <ItemDetailField label="Phone" value={user?.phoneNumber || 'Not provided'} />
          <ItemDetailField label="Address" value={user?.address || 'Not provided'} />
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default ProfilePage;