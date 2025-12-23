import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import ItemDetailCard from '../../components/ItemDetailCard';
import ItemDetailField from '../../components/ItemDetailField';
import Input from '../../components/Input';
import Form from '../../components/Form';
import FormActions from '../../components/FormActions';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const CategoryDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [categoryData, productsData] = await Promise.all([
          categoryApi.getById(id),
          categoryApi.getProducts(id),
        ]);
        setCategory(categoryData);
        setFormData(categoryData);
        setProducts(productsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const updated = await categoryApi.update(id, formData);
      setCategory(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(category);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setSubmitting(true);
        await categoryApi.delete(id);
        navigate('/admin/categories');
      } catch (err) {
        alert('Failed to delete category: ' + err.message);
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <Loading message="Loading category..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!category) {
    return <Error message="Category not found" />;
  }

  const productColumns = ['SKU', 'Product Name', 'Stock'];

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title="Category Details"
        subtitle={`ID: ${category.id}`}
        actions={
          <Button onClick={() => navigate('/admin/categories')}>
            ← Back to Categories
          </Button>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title="Category Information">
          {!isEditing ? (
            <div>
              <ItemDetailField label="Category Name" value={category.name || 'N/A'} />
              <ItemDetailField label="Description" value={category.description || 'N/A'} />
              <ItemDetailField label="Total Products" value={category.productCount ?? 0} />
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={submitting}>
                Edit Category
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Input
                label="Category Name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              <Input
                label="Description"
                name="description"
                type="textarea"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                required
                disabled={submitting}
              />
              <FormActions>
                <Button type="submit" variant="primary" disabled={submitting}>
                  Save Changes
                </Button>
                <Button type="button" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

        <ItemDetailCard title="Metadata">
          <ItemDetailField label="Created At" value={category.createdAt || 'N/A'} />
          <ItemDetailField label="Last Updated" value={category.updatedAt || 'N/A'} />
          <Button variant="secondary" onClick={handleDelete} disabled={submitting}>
            Delete Category
          </Button>
        </ItemDetailCard>

        <ItemDetailCard title={`Products in Category (${products.length})`} fullWidth>
          <Table
            columns={productColumns}
            data={products}
            renderRow={(product) => [
              <td key="sku">{product.sku || 'N/A'}</td>,
              <td key="name">{product.name || 'N/A'}</td>,
              <td key="stock">{product.stock ?? 0}</td>,
            ]}
            actions={(product) => (
              <Button
                onClick={() => navigate(`/admin/products/${product.id}`)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                View
              </Button>
            )}
          />
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
