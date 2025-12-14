import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../../api/user';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ItemDetailField from '../../components/Admin/ItemDetailField';
import CustomerOrderHistory from '../../components/Admin/CustomerOrderHistory';

import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import { getAvatarUrl, canEditUser, getRoleBadgeClassName, getRoleDisplayName } from '../../utils/userUtils';

const UserDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let userData;
      if (id) {
        userData = await userApi.getById(id);
      } else {
        userData = await userApi.getMe();
      }

      setUser(userData);

      if (getRoleDisplayName(userData.role) === 'CUSTOMER') {
        const orderData = await orderApi.getByCustomer(userData.id);
        setOrders(orderData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <AdminLoading styles={styles} message="Retrieving user dossier..." />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (!user) return <Error message="User not found" />;

  const roleLabel = getRoleDisplayName(user.role);

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={user.fullName}
        subtitle={`System ID: ${user.id}`}
        actions={
          <div className={styles.pageHeaderActions}>
            <Link className={styles.actionLink} to="/admin/users">
              ← Back to Users
            </Link>
            {canEditUser(user) && (
              <Link className={`${styles.actionLink} ${styles.buttonPrimary}`.trim()} to={`/admin/users/${user.id}/edit`}>
                Edit User
              </Link>
            )}
          </div>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title="Account Overview" fullWidth>
          <div className={styles.accountOverviewLayout}>
            <div className={`${styles.userDetailAvatar} ${styles.userDetailAvatarShrink}`.trim()}>
              <img
                src={user.profileImageUrl || getAvatarUrl(user.fullName)}
                alt=""
              />
            </div>

            <div className={styles.accountOverviewMain}>
              <div className={styles.userDetailGrid}>
                <ItemDetailField label="Full Name" value={user.fullName} />
                <ItemDetailField label="Email Address" value={user.email} />
                <ItemDetailField
                  label="Account Role"
                  value={
                    <span className={getRoleBadgeClassName(styles, user.role)}>
                      {roleLabel}
                    </span>
                  }
                />
                <ItemDetailField label="Phone Number" value={user.phoneNumber || 'N/A'} />
                <ItemDetailField label="Address" value={user.address || 'N/A'} fullWidth />
              </div>
            </div>
          </div>
        </ItemDetailCard>

        {roleLabel === 'CUSTOMER' && (
          <CustomerOrderHistory orders={orders} styles={styles} />
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;
