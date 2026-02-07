import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/user';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ItemDetailCard from '../../components/ItemDetailCard';
import ItemDetailField from '../../components/ItemDetailField';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { getAvatarUrl, canEditUser } from '../../utils/userUtils';
import { formatCurrency, formatDate } from '../../utils/formatters';

const UserDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // If id exists, we are viewing another user (Admin mode)
        // If no id, we are viewing our own profile (My Profile mode)
        let userData;
        if (id) {
          userData = await userApi.getById(id);
        } else {
          userData = await userApi.getMe();
        }
        
        setUser(userData);

        // Only fetch order history for customers
        const role = (userData.role || '').replace(/^ROLE_/i, '');
        if (role === 'CUSTOMER') {
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
    };

    loadData();
  }, [id]);

  if (loading) return <Loading message="Retrieving user dossier..." />;
  if (error) return <Error message={error} />;
  if (!user) return <Error message="User not found" />;

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title={user.fullName} 
        subtitle={`System ID: ${user.id}`} 
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {canEditUser(user) && (
              <Button variant="primary" onClick={() => navigate('/admin/users', { state: { editUserId: user.id } })}>
                Edit User
              </Button>
            )}
            <Button onClick={() => navigate('/admin/users')}>
              ← Back to Users
            </Button>
          </div>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title="Account Overview" fullWidth>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div className={styles.userDetailAvatar} style={{ flexShrink: 0 }}>
              <img 
                src={user.profileImageUrl || getAvatarUrl(user.fullName)} 
                alt="Profile" 
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className={styles.userDetailGrid}>
                <ItemDetailField label="Full Name" value={user.fullName} />
                <ItemDetailField label="Email Address" value={user.email} />
                <ItemDetailField label="Account Role" value={
                  <span className={`${styles.roleBadge} ${
                    (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? styles.roleBadgeAdmin :
                    (user.role === 'STORE_MANAGER' || user.role === 'MANAGER') ? styles.roleBadgeManager :
                    (user.role === 'WAREHOUSE_STAFF' || user.role === 'WAREHOUSE') ? styles.roleBadgeWarehouse :
                    (user.role === 'SUPPORT_AGENT' || user.role === 'SUPPORT') ? styles.roleBadgeSupport :
                    user.role === 'AUDITOR' ? styles.roleBadgeAuditor :
                    user.role === 'CUSTOMER' ? styles.roleBadgeCustomer :
                    styles.roleBadgeStaff
                  }`}>
                    {user.role}
                  </span>
                } />
                <ItemDetailField label="Phone Number" value={user.phoneNumber || 'N/A'} />
                <ItemDetailField label="Address" value={user.address || 'N/A'} fullWidth />
              </div>
            </div>
          </div>
        </ItemDetailCard>

        {((user.role || '').replace(/^ROLE_/i, '') === 'CUSTOMER') && (
        <ItemDetailCard title={`Order History (${orders.length})`} fullWidth>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: '#666' }}>This customer hasn't placed any orders yet.</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.productTable}>
                <thead>
                  <tr className={styles.productTableHeader}>
                    <th className={styles.productTableCell}>Order ID</th>
                    <th className={styles.productTableCell}>Date</th>
                    <th className={styles.productTableCell}>Total</th>
                    <th className={styles.productTableCell}>Status</th>
                    <th className={styles.productTableCell}>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className={styles.productTableRow}>
                      <td className={styles.productTableCell} style={{ fontFamily: 'monospace' }}>#{order.id}</td>
                      <td className={styles.productTableCell}>{formatDate(order.orderDate)}</td>
                      <td className={styles.productTableCell} style={{ fontWeight: 'bold' }}>{formatCurrency(order.totalAmount, order.currency || 'EUR')}</td>
                      <td className={styles.productTableCell}>
                        <span className={`${styles.roleBadge} ${styles[`orderStatus${String(order.status || '').toUpperCase()}`] || styles.orderStatusUnknown}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.productTableCell}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {order.items?.map((item, idx) => (
                            <span key={idx} style={{ fontSize: '0.8rem' }}>
                              {item.quantity}x {item.variant?.product?.name} ({item.variant?.size})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ItemDetailCard>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;
