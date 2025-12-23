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
  
  // FIX 1: Updated initial state to match Backend Entity (fullName instead of name)
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '',
    role: 'STAFF', // Uppercase to match Java Enum if strict, or handle in backend
    password: '', // Needed for creation
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
    // FIX 2: Clear form with correct fields
    setFormData({ fullName: '', email: '', role: 'STAFF', password: '' });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    // FIX 3: Map backend data to form data
    setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '' // Don't show hash, leave empty
    });
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
      
      // FIX 4: Handle Password logic
      // If creating, password is required. If editing, send only if changed.
      const payload = { ...formData };
      if (!isCreating && !payload.password) {
          delete payload.password; // Don't send empty string on edit
      }

      if (isCreating) {
        await userApi.create(payload);
      } else {
        await userApi.update(editingId, payload);
      }
      setIsCreating(false);
      setEditingId(null);
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
  };

  if (loading) return <Loading message="Loading users..." />;
  if (error) return <Error message={error} onRetry={refetch} />;

  const userList = users || [];
  // FIX 5: Remove 'Status', Change 'Name' to 'Full Name'
  const columns = ['ID', 'Full Name', 'Email', 'Role']; 

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
                label="Full Name" 
                name="fullName" 
                type="text"
                value={formData.fullName}
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
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Input>
              
              {/* Added Password Field for Creation */}
              <Input
                label={isCreating ? "Password" : "New Password (Optional)"}
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                required={isCreating} 
                disabled={submitting}
                placeholder={isCreating ? "" : "Leave blank to keep current"}
              />
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
            <td key="name">{user.fullName}</td>,
            <td key="email">{user.email}</td>,
            <td key="role">{user.role}</td>,
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