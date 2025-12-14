import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import StatCard from '../../components/Admin/StatCard';
import { getAvatarUrl, canManageUsers, canEditUser } from '../../utils/userUtils';

const STAFF_USER_TABS = [
  { id: 'ALL', label: 'All Users' },
  { id: 'ADMIN', label: 'Admins' },
  { id: 'MANAGER', label: 'Managers' },
  { id: 'STAFF', label: 'Staff' },
  { id: 'SUPPORT', label: 'Support' },
  { id: 'AUDITOR', label: 'Auditors' },
  { id: 'CUSTOMER', label: 'Customers' },
];

const CUSTOMER_ONLY_TABS = [
  { id: 'ALL', label: 'All customers' },
  { id: 'CUSTOMER', label: 'Customers' },
];

const UserListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { data: users, loading, error, refetch } = useApi(() => userApi.getAll());
  
  const [activeTab, setActiveTab] = useState('ALL');
  const roleTabs = canManageUsers() ? STAFF_USER_TABS : CUSTOMER_ONLY_TABS;
  const activeTabResolved = roleTabs.some((t) => t.id === activeTab) ? activeTab : 'ALL';

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
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const filteredUsers = users?.filter((user) => {
    if (activeTabResolved === 'ALL') return true;
    const role = user.role?.toUpperCase() || '';
    return role === activeTabResolved;
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
      role: activeTabResolved === 'ALL' ? 'CUSTOMER' : activeTabResolved,
      password: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSubmitting(true);
      const payload = { ...formData };

      if (isCreating) {
        await userApi.create(payload);
        handleCancel();
        refetch();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to save user: ' + err.message });
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
        setFeedback({ type: 'error', message: 'Failed to delete user: ' + err.message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <AdminLoading styles={styles} message="Loading users..." />;
  if (error) return <Error message={error} onRetry={refetch} />;

  // Column definition
  const columns = ['', 'Full Name', 'Email', 'Role']; 

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={canManageUsers() ? 'Users' : 'Customers'}
        subtitle={
          canManageUsers() ? 'Manage system users' : 'View and edit customer accounts'
        }
      />

      <div className={styles.statsGrid}>
        {canManageUsers() && (
          <StatCard value={stats.admins} label="Administrative users" />
        )}
        <StatCard value={stats.customers} label="Total customers" />
      </div>

      <div className={styles.tabsContainer} role="tablist" aria-label="Filter users by role">
        {roleTabs.map((role) => (
          <button
            key={role.id}
            type="button"
            role="tab"
            aria-selected={activeTabResolved === role.id}
            className={`${styles.tab} ${activeTabResolved === role.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(role.id)}
          >
            {role.label}
          </button>
        ))}
      </div>

      {canManageUsers() && (
        <div className={styles.pageActions}>
          <Button variant="primary" onClick={handleCreate} disabled={submitting}>
            + Add new{' '}
            {activeTabResolved === 'ALL'
              ? 'user'
              : (roleTabs.find((r) => r.id === activeTabResolved)?.label || 'user').slice(0, -1)}
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
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
                <option value="SUPPORT">Support</option>
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

      <ListContainer
        title={roleTabs.find((r) => r.id === activeTabResolved)?.label ?? 'Accounts'}
        count={filteredUsers.length}
      >
        <Table
          caption={`${
            roleTabs.find((r) => r.id === activeTabResolved)?.label ?? 'User'
          } accounts`}
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
                  ${user.role === 'ADMIN' ? styles.roleBadgeAdmin : 
                    user.role === 'MANAGER' ? styles.roleBadgeManager :
                    user.role === 'STAFF' ? styles.roleBadgeWarehouse :
                    user.role === 'SUPPORT' ? styles.roleBadgeSupport :
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
              <Link className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()} to={`/admin/users/${user.id}`}>View</Link>
              {canEditUser(user) && (
                <Link className={styles.actionLink} to={`/admin/users/${user.id}/edit`}>
                  Edit
                </Link>
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