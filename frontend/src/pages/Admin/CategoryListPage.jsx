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
  
  // Fetch Data
  const { data: categories, loading, error, refetch } = useApi(() => categoryApi.getAll());
  
  // Local State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Form Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setIsCreating(false);
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Products in this category may become uncategorized.')) {
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
      // Reset State
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

  if (loading) return <Loading message="Loading categories..." />;
  if (error) return <Error message={error} onRetry={refetch} />;

  const categoryList = categories || [];
  const columns = ['ID', 'Name', 'Description', 'Products'];

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title="Category Manager" 
        subtitle="Create, edit, or remove product categories"
        actions={
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate('/admin/products')}>
              ← Back to Products
            </Button>
            {/* Hide "Add" button if we are already showing the form */}
            {!isCreating && !editingId && (
              <Button variant="primary" onClick={handleCreate} disabled={submitting}>
                + Add New Category
              </Button>
            )}
          </div>
        } 
      />

      {/*███████ Inline Form for Create / Edit ███████*/}
      {(isCreating || editingId) && (
        <div style={{ marginBottom: '2rem' }}>
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
                placeholder="e.g. Electric Guitars"
              />
              <Input
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={submitting}
                placeholder="Optional description..."
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
        </div>
      )}

      {/*███████ Category List ███████*/}
      <ListContainer title="All Categories" count={categoryList.length}>
        <Table
          columns={columns}
          data={categoryList}
          renderRow={(category) => [
            <td key="id" style={{ width: '50px', color: '#888' }}>{category.id}</td>,
            <td key="name" style={{ fontWeight: 'bold' }}>{category.name}</td>,
            <td key="desc" style={{ color: '#666', fontSize: '0.9rem' }}>{category.description || '-'}</td>,
            <td key="count">
                {/* Safely check for products list length or explicit count field */}
                {category.products?.length ?? category.productCount ?? 0}
            </td>,
          ]}
          actions={(category) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="small"
                onClick={() => handleEdit(category)}
                disabled={submitting || editingId === category.id}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="danger" // Changed from secondary to danger for clarity
                onClick={() => handleDelete(category.id)}
                disabled={submitting || editingId === category.id}
              >
                Delete
              </Button>
            </div>
          )}
        />
        
        {categoryList.length === 0 && (
           <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              No categories found. Click "Add New Category" to start.
           </div>
        )}
      </ListContainer>
    </div>
  );
};

export default CategoryListPage;