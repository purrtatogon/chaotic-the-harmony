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
import ProductImageGallery from '../../components/ProductImageGallery';
import { formatCurrency } from '../../utils/formatters';

const ProductDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // --- GRANULAR EDIT STATES ---
  const [editGallery, setEditGallery] = useState(false);
  const [editInfo, setEditInfo] = useState(false);

  const [formData, setFormData] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productData, categoryData] = await Promise.all([
          productApi.getById(id),
          categoryApi.getAll()
        ]);
        setProduct(productData);
        setCategories(categoryData);
        
        setFormData({
          ...productData,
          categoryId: productData.category?.id || '',
          imageUrls: productData.images?.map(img => img.imageUrl) || []
        });
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

  const handleGalleryChange = (newUrls) => {
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const handleUpdate = async (section) => {
    try {
      setSubmitting(true);
      const updated = await productApi.update(id, formData);
      
      setProduct(updated);
      setFormData({
        ...updated,
        categoryId: updated.category?.id,
        imageUrls: updated.images?.map(img => img.imageUrl) || []
      });

      if (section === 'gallery') setEditGallery(false);
      if (section === 'info') setEditInfo(false);

      alert(`${section === 'gallery' ? 'Gallery' : 'Product details'} updated successfully!`);
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (section) => {
    setFormData({
      ...product,
      categoryId: product.category?.id,
      imageUrls: product.images?.map(img => img.imageUrl) || []
    });
    
    if (section === 'gallery') setEditGallery(false);
    if (section === 'info') setEditInfo(false);
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

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ imageUrl: '/placeholder.jpg' }];

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title="Details"
        subtitle={`SKU: ${product.sku || 'N/A'}`}
        actions={
          <Button onClick={() => navigate('/admin/products')}>
            ← Back to Products
          </Button>
        }
      />

      <div className={styles.itemDetail}>
        
        {/* GALLERY SECTION */}
        <ItemDetailCard 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Gallery</span>
              {!editGallery && (
                <Button size="small" variant="secondary" onClick={() => setEditGallery(true)}>
                  Edit
                </Button>
              )}
            </div>
          }
        >
          {!editGallery ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ 
                textAlign: 'center', 
                height: '400px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee'
              }}>
                <img 
                  src={displayImages[activeImageIndex]?.imageUrl} 
                  alt={product.title} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '10px' }}>
                {displayImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={img.imageUrl} 
                    onClick={() => setActiveImageIndex(i)}
                    style={{ 
                      width: '70px', height: '70px', cursor: 'pointer', borderRadius: '6px', objectFit: 'cover',
                      border: activeImageIndex === i ? '3px solid #3b82f6' : '1px solid #ddd',
                      opacity: activeImageIndex === i ? 1 : 0.6
                    }} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <ProductImageGallery 
                images={formData.imageUrls || []} 
                onImagesChange={handleGalleryChange}
                submitting={submitting}
              />
              <FormActions>
                <Button onClick={() => handleUpdate('gallery')} variant="primary" disabled={submitting}>Save Gallery</Button>
                <Button onClick={() => handleCancel('gallery')} disabled={submitting}>Cancel</Button>
              </FormActions>
            </>
          )}
        </ItemDetailCard>

        {/* DETAILS SECTION */}
        <ItemDetailCard 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Details</span>
              {!editInfo && (
                <Button size="small" variant="secondary" onClick={() => setEditInfo(true)}>
                  Edit
                </Button>
              )}
            </div>
          }
        >
          {!editInfo ? (
            /* VIEW MODE */
            <div>
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <ItemDetailField label="SKU" value={product.sku || 'N/A'} />

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <FormRow>
                <ItemDetailField label="Category" value={product.category?.name || 'N/A'} />
                <ItemDetailField label="Product Type" value={product.type?.name || 'N/A'} />
              </FormRow>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <ItemDetailField label="Title" value={product.title || 'N/A'} />

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <FormRow>
                <ItemDetailField label="Music Style" value={product.musicStyle || 'N/A'} />
                <ItemDetailField label="Color" value={product.color || 'N/A'} />
                <ItemDetailField label="Size" value={product.itemSize || 'N/A'} />
              </FormRow>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <FormRow>
                <ItemDetailField label="Price" value={formatCurrency(product.price)} />
                <ItemDetailField label="Stock Quantity" value={`${product.stockQuantity || 0} units`} />
              </FormRow>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <ItemDetailField label="Description" value={product.description || 'N/A'} />
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <ItemDetailField label="Materials + Specs" value={product.materialsSpecs || 'N/A'} />
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <ItemDetailField label="Shipping Info" value={product.shippingInfo || 'N/A'} />
            </div>
          ) : (
            /* EDIT MODE - UPDATED TO MATCH VIEW ORDER */
            <Form onSubmit={(e) => { e.preventDefault(); handleUpdate('info'); }}>
              
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <Input label="SKU" name="sku" value={formData.sku || ''} onChange={handleChange} required />
              
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              {/* Category Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Category</label>
                <select 
                  name="categoryId"
                  value={formData.categoryId || ''} 
                  onChange={handleChange}
                  style={{ 
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #ccc', background: theme === 'dark' ? '#222' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <Input label="Title" name="title" value={formData.title || ''} onChange={handleChange} required />
              
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <FormRow>
                <Input label="Music Style" name="musicStyle" value={formData.musicStyle || ''} onChange={handleChange} />
                <Input label="Color" name="color" value={formData.color || ''} onChange={handleChange} />
                <Input label="Size" name="itemSize" value={formData.itemSize || ''} onChange={handleChange} />
              </FormRow>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <FormRow>
                <Input label="Price (€)" name="price" type="number" step="0.01" value={formData.price || ''} onChange={handleChange} required />
                <Input label="Stock Quantity" name="stockQuantity" type="number" value={formData.stockQuantity || ''} onChange={handleChange} required />
              </FormRow>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <Input label="Description" name="description" type="textarea" value={formData.description || ''} onChange={handleChange} rows={4} />
              
              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <Input label="Materials + Specs" name="materialsSpecs" type="textarea" value={formData.materialsSpecs || ''} onChange={handleChange} rows={3} />

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
              <Input label="Shipping Info" name="shippingInfo" type="textarea" value={formData.shippingInfo || ''} onChange={handleChange} rows={2} />

              <FormActions>
                <Button type="submit" variant="primary" disabled={submitting}>Save Details</Button>
                <Button type="button" onClick={() => handleCancel('info')} disabled={submitting}>Cancel</Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

        {/* --- 3. DANGER ZONE --- */}
        <ItemDetailCard title="Administrative Actions">
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Warning: Deleting a product is permanent and cannot be undone.
          </p>
          <Button variant="danger" onClick={handleDelete} disabled={submitting}>
            Delete Product Permanently
          </Button>
        </ItemDetailCard>

      </div>
    </div>
  );
};

export default ProductDetailPage;