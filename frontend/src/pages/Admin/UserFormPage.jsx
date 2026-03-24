import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/user';
import { orderApi } from '../../api/order';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import Input from '../../components/Global/Input';
import Form from '../../components/Global/Form';
import FormRow from '../../components/Global/FormRow';
import FormActions from '../../components/Global/FormActions';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import CustomerOrderHistory from '../../components/Admin/CustomerOrderHistory';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import { canEditUser, canManageUsers, getRoleDisplayName } from '../../utils/userUtils';

const normalizeRole = (role) => String(role || '').replace(/^ROLE_/i, '');

const UserFormPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'CUSTOMER',
    password: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setForbidden(false);
        const userData = await userApi.getById(id);
        const forPerm = { ...userData, role: normalizeRole(userData.role) };
        if (!canEditUser(forPerm)) {
          setForbidden(true);
          return;
        }
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          role: normalizeRole(userData.role),
          password: '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || ''
        });
        if (getRoleDisplayName(userData.role) === 'CUSTOMER') {
          const orderData = await orderApi.getByCustomer(userData.id);
          setOrders(orderData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await userApi.update(id, payload);
      navigate(`/admin/users/${id}`);
    } catch (err) {
      alert('Failed to save user: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/${id}`);
  };

  const handleDelete = async () => {
    if (!canManageUsers()) return;
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await userApi.delete(id);
        navigate('/admin/users');
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <Loading message="Loading user..." />;
  if (forbidden) {
    return <Error message="You do not have permission to edit this user." />;
  }
  if (error) return <Error message={error} />;
  if (!user) return <Error message="User not found" />;

  const isSavedCustomer = getRoleDisplayName(user.role) === 'CUSTOMER';
  const isSuperAdminCustomerForm =
    canManageUsers() && normalizeRole(formData.role) === 'CUSTOMER';

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={`Edit User: ${user.fullName || 'User'}`}
        subtitle={`System ID: ${id}`}
        actions={
          <div className={styles.pageHeaderActions}>
            <Button onClick={() => navigate(`/admin/users/${id}`)}>← Back to profile</Button>
            <Button onClick={() => navigate('/admin/users')}>← Back to Users</Button>
          </div>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title="Edit user information" fullWidth>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              {canManageUsers() && (
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              )}
            </FormRow>

            {canManageUsers() && (
              <FormRow>
                <Input
                  label="Role"
                  name="role"
                  type="select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                  <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="CUSTOMER">Customer</option>
                </Input>
                <Input
                  label="New Password (Optional)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </FormRow>
            )}

            {isSuperAdminCustomerForm && (
              <FormRow>
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <Input
                  label="Address"
                  name="address"
                  type="textarea"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={3}
                />
              </FormRow>
            )}

            {!canManageUsers() && (
              <FormRow>
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </FormRow>
            )}

            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
              {canManageUsers() && (
                <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting}>
                  Delete User
                </Button>
              )}
            </FormActions>
          </Form>
        </ItemDetailCard>

        {isSavedCustomer && (
          <CustomerOrderHistory orders={orders} styles={styles} />
        )}
      </div>
    </div>
  );
};

export default UserFormPage;
