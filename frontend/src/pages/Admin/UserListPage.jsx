import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { userApi } from '../../api/user';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Form from '../../components/Form';
import FormRow from '../../components/FormRow';
import FormActions from '../../components/FormActions';
import ItemDetailCard from '../../components/ItemDetailCard';
import ListContainer from '../../components/ListContainer';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const UserListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { data: users, loading, error, refetch } = useApi(() => userApi.getAll());
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    status: 'Active',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ name: '', email: '', role: 'Staff', status: 'Active' });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData(user);
    setIsCreating(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setSubmitting(true);
        await userApi.delete(id);
        refetch();
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isCreating) {
        await userApi.create(formData);
      } else {
        await userApi.update(editingId, formData);
      }
      setIsCreating(false);
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'Staff', status: 'Active' });
      refetch();
    } catch (err) {
      alert('Failed to save user: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Staff', status: 'Active' });
  };

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  if (error) {
    return <Error message={error} onRetry={refetch} />;
  }

  const userList = users || [];
  const columns = ['ID', 'Name', 'Email', 'Role', 'Status'];

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Users" subtitle="Manage System Users" />

      <div className={styles.pageActions}>
        <Button variant="primary" onClick={handleCreate} disabled={submitting}>
          + Add New User
        </Button>
      </div>

      {(isCreating || editingId) && (
        <ItemDetailCard
          title={isCreating ? 'Create New User' : 'Edit User'}
          fullWidth
        >
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </FormRow>
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
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </Input>
              <Input
                label="Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Input>
            </FormRow>
            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                {isCreating ? 'Create User' : 'Save Changes'}
              </Button>
              <Button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
            </FormActions>
          </Form>
        </ItemDetailCard>
      )}

      <ListContainer title="All Users" count={userList.length}>
        <Table
          columns={columns}
          data={userList}
          renderRow={(user) => [
            <td key="id">{user.id}</td>,
            <td key="name">{user.name}</td>,
            <td key="email">{user.email}</td>,
            <td key="role">{user.role}</td>,
            <td key="status">{user.status}</td>,
          ]}
          actions={(user) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => handleEdit(user)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={submitting}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(user.id)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={submitting}
              >
                Delete
              </Button>
            </div>
          )}
        />
      </ListContainer>
    </div>
  );
};

export default UserListPage;
