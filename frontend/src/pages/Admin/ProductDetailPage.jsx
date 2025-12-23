import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
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
import FormRow from '../../components/FormRow';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { formatCurrency } from '../../utils/formatters';

const ProductDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState([]); // STATE FOR CATEGORIES
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // FETCH BOTH PRODUCT AND CATEGORIES
        const [productData, categoryData] = await Promise.all([
          productApi.getById(id),
          categoryApi.getAll()
        ]);

        setProduct(productData);
        setCategory(categoryData);
        setFormData(productData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
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
      const updated = await productApi.update(id, formData);
      setProduct(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(product);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setSubmitting(true);
        await productApi.delete(id);
        navigate('/admin/products');
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
        setSubmitting(false);
      }
    }
  };

  if (loading) return <Loading message="Loading product..." />;
  if (error) return <Error message={error} />;
  if (!product) return <Error message="Product not found" />;

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title="Product Details"
        subtitle={`SKU: ${product.sku || 'N/A'}`}
        actions={
          <Button onClick={() => navigate('/admin/products')}>
            ← Back to Products
          </Button>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title="Basic Information">
          {!isEditing ? (
            <div>
              <ItemDetailField label="Product Name" value={product.title || product.name || 'N/A'} />
              <ItemDetailField label="SKU" value={product.sku || 'N/A'} />
              {/* Handle Object Display Safely */}
              <ItemDetailField label="Category" value={product.category?.name || 'N/A'} />
              <ItemDetailField label="Description" value={product.description || 'N/A'} />
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={submitting}>
                Edit Product
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Input
                label="Product Name"
                name="title"
                type="text"
                value={formData.title || formData.name || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              <Input
                label="SKU"
                name="sku"
                type="text"
                value={formData.sku || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />

              {/* NEW DROPDOWN CODE GOES HERE */}
              <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme === 'dark' ? '#aaa' : '#666' }}>Category</label>
                  <select 
                    name="categoryId"
                    // if formData.category is an object, use its ID.
                    value={formData.category?.id || ''} 
                    onChange={(e) => {
                       const selectedId = e.target.value;
                       // I reconstruct the object for the backend
                       setFormData({
                          ...formData,
                          category: { id: selectedId } 
                       });
                    }}
                    style={{ width: '100%', padding: '0.5rem' }}
                    disabled={submitting}
                  >
                    <option value="">Select Category</option>
                    {category.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
              </div>

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

        <ItemDetailCard title="Inventory & Pricing">
          <ItemDetailField label="Stock Quantity" value={`${product.stockQuantity ?? 0} units`} />
          <ItemDetailField label="Price" value={formatCurrency(product.price)} />
        </ItemDetailCard>

        <ItemDetailCard title="Metadata" fullWidth>
          <FormRow>
            <ItemDetailField label="Created At" value={product.createdAt || 'N/A'} />
            <ItemDetailField label="Last Updated" value={product.updatedAt || 'N/A'} />
          </FormRow>
          <Button variant="secondary" onClick={handleDelete} disabled={submitting}>
            Delete Product
          </Button>
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default ProductDetailPage;