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
import ImageUpload from '../../components/ImageUpload'; // 👈 Import our new component
import { formatCurrency } from '../../utils/formatters';

const ProductDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // 👈 For gallery control

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
    if (id) loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👈 New Handler: Adding an image from Cloudinary
  const handleAddImage = (url) => {
    const newImage = {
      imageUrl: url,
      displayOrder: (formData.images?.length || 0)
    };
    setFormData({
      ...formData,
      images: [...(formData.images || []), newImage]
    });
  };

  // 👈 New Handler: Removing an image
  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
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

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ imageUrl: '/placeholder.jpg' }];

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={isEditing ? "Edit Product" : "Product Details"}
        subtitle={`SKU: ${product.sku || 'N/A'}`}
        actions={
          <Button onClick={() => navigate('/admin/products')}>
            ← Back to Products
          </Button>
        }
      />

      <div className={styles.itemDetail}>
        {/* --- 1. GALLERY SECTION --- */}
        <ItemDetailCard title="Product Gallery">
          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={images[activeImageIndex].imageUrl} 
                  alt="" 
                  style={{ maxHeight: '300px', borderRadius: '8px' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <img 
                    key={i} src={img.imageUrl} 
                    onClick={() => setActiveImageIndex(i)}
                    style={{ 
                      width: '60px', height: '60px', cursor: 'pointer',
                      border: activeImageIndex === i ? '2px solid #3b82f6' : '1px solid #ddd' 
                    }} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                {formData.images?.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img.imageUrl} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none' }}
                    >X</button>
                  </div>
                ))}
              </div>
              <ImageUpload onUploadSuccess={handleAddImage} />
            </div>
          )}
        </ItemDetailCard>

        {/* --- 2. BASIC INFO --- */}
        <ItemDetailCard title="Basic Information">
          {!isEditing ? (
            <div>
              <ItemDetailField label="Product Name" value={product.title || 'N/A'} />
              <ItemDetailField label="SKU" value={product.sku || 'N/A'} />
              <ItemDetailField label="Category" value={product.category?.name || 'N/A'} />
              
              <FormRow>
                <ItemDetailField label="Price" value={formatCurrency(product.price)} />
                <ItemDetailField label="Stock Quantity" value={`${product.stockQuantity || 0} units`} />
              </FormRow>
              
              <ItemDetailField label="Description" value={product.description || 'N/A'} />
              
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={submitting}>
                Edit Information
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Input label="Title" name="title" value={formData.title || ''} onChange={handleChange} required />
              <Input label="SKU" name="sku" value={formData.sku || ''} onChange={handleChange} required />
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                <select 
                  name="categoryId"
                  value={formData.category?.id || ''} 
                  onChange={(e) => setFormData({...formData, category: { id: e.target.value }})}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Category</option>
                  {category.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <Input label="Description" name="description" type="textarea" value={formData.description || ''} onChange={handleChange} rows={3} />
              
              <FormRow>
                <Input label="Price" name="price" type="number" step="0.01" value={formData.price || ''} onChange={handleChange} />
                <Input label="Stock" name="stockQuantity" type="number" value={formData.stockQuantity || ''} onChange={handleChange} />
              </FormRow>

              <FormActions>
                <Button type="submit" variant="primary" disabled={submitting}>Save</Button>
                <Button type="button" onClick={handleCancel}>Cancel</Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

        {/* --- 3. SPECS (Using itemSize now) --- */}
        <ItemDetailCard title="Specifications">
          {!isEditing ? (
            <FormRow>
              <ItemDetailField label="Size" value={product.itemSize || 'N/A'} />
              <ItemDetailField label="Color" value={product.color || 'N/A'} />
              <ItemDetailField label="Style" value={product.musicStyle || 'N/A'} />
            </FormRow>
          ) : (
            <FormRow>
              <Input label="Size" name="itemSize" value={formData.itemSize || ''} onChange={handleChange} />
              <Input label="Color" name="color" value={formData.color || ''} onChange={handleChange} />
              <Input label="Music Style" name="musicStyle" value={formData.musicStyle || ''} onChange={handleChange} />
            </FormRow>
          )}
        </ItemDetailCard>

        {/* --- 4. DANGER ZONE --- */}
        {!isEditing && (
          <ItemDetailCard title="Administrative">
            <Button variant="secondary" onClick={handleDelete} disabled={submitting}>
              Delete Product Permanentely
            </Button>
          </ItemDetailCard>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;