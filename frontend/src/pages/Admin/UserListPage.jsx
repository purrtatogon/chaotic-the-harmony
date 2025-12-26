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
import ImageUpload from '../../components/ImageUpload';

const UserListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { data: users, loading, error, refetch } = useApi(() => userApi.getAll());
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '',
    role: 'STAFF',
    password: '',
    profileImageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = (url) => {
    setFormData({ ...formData, profileImageUrl: url });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ fullName: '', email: '', role: 'STAFF', password: '', profileImageUrl: '' });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl || '',
        password: '' 
    });
    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!isCreating && !payload.password) delete payload.password;

      if (isCreating) {
        await userApi.create(payload);
      } else {
        await userApi.update(editingId, payload);
      }
      handleCancel();
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

  // Added Avatar
  const columns = ['Avatar', 'Full Name', 'Email', 'Role']; 

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Users" subtitle="Manage System Users" />

      <div className={styles.pageActions}>
        <Button variant="primary" onClick={handleCreate} disabled={submitting}>
          + Add New User
        </Button>
      </div>

      {(isCreating || editingId) && (
        <ItemDetailCard title={isCreating ? 'Create New User' : 'Edit User'} fullWidth>
          <Form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ddd' }}>
                    <img src={formData.profileImageUrl || '/default-avatar.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <ImageUpload onUploadSuccess={handleAvatarUpload} />
            </div>
            
            <FormRow>
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </FormRow>
            
            <FormRow>
              <Input label="Role" name="role" type="select" value={formData.role} onChange={handleChange} required>
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Input>
              <Input label={isCreating ? "Password" : "New Password (Optional)"} name="password" type="password" value={formData.password} onChange={handleChange} required={isCreating} />
            </FormRow>
            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>{isCreating ? 'Create User' : 'Save Changes'}</Button>
              <Button type="button" onClick={handleCancel}>Cancel</Button>
            </FormActions>
          </Form>
        </ItemDetailCard>
      )}

      <ListContainer title="All Users" count={users?.length || 0}>
        <Table
          columns={columns}
          data={users || []}
          renderRow={(user) => [
            // RENDER AVATAR CELL
            <td key="avatar" style={{ padding: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
                    <img src={user.profileImageUrl || '/default-avatar.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </td>,
            <td key="name">{user.fullName}</td>,
            <td key="email">{user.email}</td>,
            <td key="role">
                <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                    background: user.role === 'ADMIN' ? '#fee2e2' : '#e0f2fe',
                    color: user.role === 'ADMIN' ? '#991b1b' : '#075985'
                }}>{user.role}</span>
            </td>,
          ]}
          actions={(user) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={() => handleEdit(user)} size="small">Edit</Button>
              <Button variant="secondary" onClick={() => handleDelete(user.id)} size="small">Delete</Button>
            </div>
          )}
        />
      </ListContainer>
    </div>
  );
};

export default UserListPage;