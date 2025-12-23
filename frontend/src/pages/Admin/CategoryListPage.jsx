import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Form from '../../components/Form';
import FormActions from '../../components/FormActions';
import ItemDetailCard from '../../components/ItemDetailCard';
import ListContainer from '../../components/ListContainer';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const CategoryListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const { data: categories, loading, error, refetch } = useApi(() => categoryApi.getAll());
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description });
    setIsCreating(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setSubmitting(true);
        await categoryApi.delete(id);
        refetch();
      } catch (err) {
        alert('Failed to delete category: ' + err.message);
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
        await categoryApi.create(formData);
      } else {
        await categoryApi.update(editingId, formData);
      }
      setIsCreating(false);
      setEditingId(null);
      setFormData({ name: '', description: '' });
      refetch();
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return <Loading message="Loading categories..." />;
  }

  if (error) {
    return <Error message={error} onRetry={refetch} />;
  }

  const categoryList = categories || [];
  const columns = ['ID', 'Name', 'Description', 'Products'];

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Categories" subtitle="Product Categories" />

      <div className={styles.pageActions}>
        <Button variant="primary" onClick={handleCreate} disabled={submitting}>
          + Add New Category
        </Button>
      </div>

      {(isCreating || editingId) && (
        <ItemDetailCard
          title={isCreating ? 'Create New Category' : 'Edit Category'}
          fullWidth
        >
          <Form onSubmit={handleSubmit}>
            <Input
              label="Category Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Input
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={submitting}
            />
            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                {isCreating ? 'Create Category' : 'Save Changes'}
              </Button>
              <Button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
            </FormActions>
          </Form>
        </ItemDetailCard>
      )}

      <ListContainer title="All Categories" count={categoryList.length}>
        <Table
          columns={columns}
          data={categoryList}
          renderRow={(category) => [
            <td key="id">{category.id}</td>,
            <td key="name">{category.name}</td>,
            <td key="description">{category.description}</td>,
            <td key="products">{category.productCount ?? 0}</td>,
          ]}
          actions={(category) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => navigate(`/admin/categories/${category.id}`)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={submitting}
              >
                View
              </Button>
              <Button
                onClick={() => handleEdit(category)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={submitting}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(category.id)}
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

export default CategoryListPage;
