import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import Input from '../../components/Global/Input';
import Form from '../../components/Global/Form';
import FormRow from '../../components/Global/FormRow';
import FormActions from '../../components/Global/FormActions';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ListContainer from '../../components/Admin/ListContainer';
import Table from '../../components/Global/Table';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import StatCard from '../../components/Admin/StatCard';
import { getAvatarUrl, canManageUsers, canEditUser } from '../../utils/userUtils';

const UserListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const { data: users, loading, error, refetch } = useApi(() => userApi.getAll());
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'CUSTOMER',
    password: '',
    phoneNumber: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: 'ALL', label: 'All Users' },
    { id: 'SUPER_ADMIN', label: 'Super Admins' },
    { id: 'STORE_MANAGER', label: 'Store Managers' },
    { id: 'WAREHOUSE_STAFF', label: 'Warehouse Staff' },
    { id: 'SUPPORT_AGENT', label: 'Support Agents' },
    { id: 'AUDITOR', label: 'Auditors' },
    { id: 'CUSTOMER', label: 'Customers' },
  ];

  const filteredUsers = users?.filter(user => {
    if (activeTab === 'ALL') return true;
    const role = user.role?.toUpperCase() || '';
    
    // Exact matches with fallbacks for safety
    if (activeTab === 'SUPER_ADMIN') return role === 'SUPER_ADMIN' || role === 'ADMIN';
    if (activeTab === 'STORE_MANAGER') return role === 'STORE_MANAGER' || role === 'MANAGER';
    if (activeTab === 'WAREHOUSE_STAFF') return role === 'WAREHOUSE_STAFF' || role === 'WAREHOUSE';
    if (activeTab === 'SUPPORT_AGENT') return role === 'SUPPORT_AGENT' || role === 'SUPPORT';
    
    return role === activeTab;
  }) || [];

  const stats = {
    admins: users?.filter(u => u.role !== 'CUSTOMER').length || 0,
    customers: users?.filter(u => u.role === 'CUSTOMER').length || 0,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ 
      fullName: '', 
      email: '', 
      role: activeTab === 'ALL' ? 'CUSTOMER' : activeTab, 
      password: '' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };

      if (isCreating) {
        await userApi.create(payload);
        handleCancel();
        refetch();
      }
    } catch (err) {
      alert('Failed to save user: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleDelete = async (id) => {
    // 1. Ask for confirmation so users don't delete by accident
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        // 2. Call the API
        await userApi.delete(id);
        // 3. Refresh the list to show the user is gone
        refetch();
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <Loading message="Loading users..." />;
  if (error) return <Error message={error} onRetry={refetch} />;

  // Column definition
  const columns = ['', 'Full Name', 'Email', 'Role']; 

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Users" subtitle="Manage System Users" />

      <div className={styles.statsGrid}>
        <StatCard value={stats.admins} label="Administrative Users" />
        <StatCard value={stats.customers} label="Total Customers" />
      </div>

      <div className={styles.tabsContainer}>
        {roles.map((role) => (
          <button
            key={role.id}
            className={`${styles.tab} ${activeTab === role.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(role.id)}
          >
            {role.label}
          </button>
        ))}
      </div>

      {canManageUsers() && (
        <div className={styles.pageActions}>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            + Add New {activeTab === 'ALL' ? 'User' : roles.find(r => r.id === activeTab).label.slice(0, -1)}
          </Button>
        </div>
      )}

      {isCreating && canManageUsers() && (
        <ItemDetailCard title="Create New User" fullWidth>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </FormRow>

            <FormRow>
              <Input label="Role" name="role" type="select" value={formData.role} onChange={handleChange} required>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="STORE_MANAGER">Store Manager</option>
                <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                <option value="SUPPORT_AGENT">Support Agent</option>
                <option value="AUDITOR">Auditor</option>
                <option value="CUSTOMER">Customer</option>
              </Input>
              <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </FormRow>

            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>Create User</Button>
              <Button type="button" onClick={handleCancel}>Cancel</Button>
            </FormActions>
          </Form>
        </ItemDetailCard>
      )}

      <ListContainer title={`${roles.find(r => r.id === activeTab).label}`} count={filteredUsers.length}>
        <Table
          caption={`${roles.find((r) => r.id === activeTab)?.label ?? 'User'} accounts`}
          columns={columns}
          data={filteredUsers}
          renderRow={(user) => [
            <td key="avatar">
              <div className={styles.avatarSmall}>
                <img src={user.profileImageUrl || getAvatarUrl(user.fullName)} alt={user.fullName} />
              </div>
            </td>,
            <td key="name">{user.fullName}</td>,
            <td key="email">{user.email}</td>,
            <td key="role">
                <span className={`
                  ${styles.roleBadge} 
                  ${(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? styles.roleBadgeAdmin : 
                    (user.role === 'STORE_MANAGER' || user.role === 'MANAGER') ? styles.roleBadgeManager :
                    (user.role === 'WAREHOUSE_STAFF' || user.role === 'WAREHOUSE') ? styles.roleBadgeWarehouse :
                    (user.role === 'SUPPORT_AGENT' || user.role === 'SUPPORT') ? styles.roleBadgeSupport :
                    user.role === 'AUDITOR' ? styles.roleBadgeAuditor :
                    user.role === 'CUSTOMER' ? styles.roleBadgeCustomer :
                    styles.roleBadgeStaff}
                `}>
                  {user.role}
                </span>
            </td>,
          ]}
          actions={(user) => (
            <div className={styles.flexRow}>
              <Button onClick={() => navigate(`/admin/users/${user.id}`)} size="small" variant="secondary">View</Button>
              {canEditUser(user) && (
                <Button onClick={() => navigate(`/admin/users/${user.id}/edit`)} size="small">
                  Edit
                </Button>
              )}
              {canManageUsers() && <Button variant="secondary" onClick={() => handleDelete(user.id)} size="small">Delete</Button>}
            </div>
          )}
        />
      </ListContainer>
    </div>
  );
};

export default UserListPage;