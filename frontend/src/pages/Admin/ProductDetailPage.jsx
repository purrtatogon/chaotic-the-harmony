import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
          images: productData.images || []
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

  const handleGalleryChange = (newImages) => {
    setFormData({ ...formData, images: newImages });
  };

  const handleUpdate = async (section) => {
    try {
      setSubmitting(true);
      
      // Prepare data for API call
      const updateData = { ...formData };
      
      // If updating gallery, send images in the correct format
      if (section === 'gallery' && updateData.images) {
        updateData.images = updateData.images.map(img => ({
          imageUrl: typeof img === 'string' ? img : (img.imageUrl || img.url || ''),
          altText: typeof img === 'string' ? '' : (img.altText || '')
        }));
      }
      
      const updated = await productApi.update(id, updateData);
      
      setProduct(updated);
      setFormData({
        ...updated,
        categoryId: updated.category?.id,
        images: updated.images || []
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
      images: product.images || []
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
        title={product.name}
        subtitle={`Product ID: ${product.id}`}
        actions={
          <div className={styles.flexRow}>
            <Button variant="secondary" onClick={() => navigate(`/admin/products/${id}/edit`)}>
              Edit Product
            </Button>
            <Button onClick={() => navigate('/admin/products')}>
              ← Back to Products
            </Button>
          </div>
        }
      />

      <div className={styles.itemDetail}>
        
        {/* GALLERY SECTION */}
        <ItemDetailCard 
          title={
            <div className={styles.cardHeaderFlex}>
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
            <div className={styles.galleryContainer}>
              <div className={styles.galleryMainImage}>
                <img 
                  src={displayImages[activeImageIndex]?.imageUrl} 
                  alt={displayImages[activeImageIndex]?.altText || product.name} 
                />
                {displayImages[activeImageIndex]?.altText && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '0.85rem', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    Alt text: {displayImages[activeImageIndex].altText}
                  </div>
                )}
              </div>
              <div className={styles.galleryThumbnails}>
                {displayImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img 
                      src={img.imageUrl} 
                      alt={img.altText || `Product image ${i + 1}`}
                      onClick={() => setActiveImageIndex(i)}
                      className={`${styles.galleryThumbnail} ${activeImageIndex === i ? styles.galleryThumbnailActive : ''}`}
                    />
                    {img.altText && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '2px 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={img.altText}>
                        {img.altText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ProductImageGallery 
                images={formData.images || []} 
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
            <div className={styles.cardHeaderFlex}>
              <span>General Information</span>
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
              <FormRow>
                <ItemDetailField label="Name" value={product.name || 'N/A'} />
                <ItemDetailField label="Category" value={product.category?.name || 'N/A'} />
              </FormRow>

              <hr className={styles.divider} />
              
              <FormRow>
                <ItemDetailField label="Product Type" value={product.productType || 'N/A'} />
                <ItemDetailField label="Theme Code" value={product.themeCode || 'N/A'} />
                <ItemDetailField label="Design Code" value={product.designCode || 'N/A'} />
              </FormRow>

              <hr className={styles.divider} />

              <ItemDetailField label="Description">
                <ReactMarkdown>{product.description || 'N/A'}</ReactMarkdown>
              </ItemDetailField>

              <hr className={styles.divider} />
              
              <ItemDetailField label="Materials + Specs">
                <ReactMarkdown>{product.materialsSpecs || 'N/A'}</ReactMarkdown>
              </ItemDetailField>
              
              <hr className={styles.divider} />
              
              <ItemDetailField label="Shipping Info">
                <ReactMarkdown>{product.shippingInfo || 'N/A'}</ReactMarkdown>
              </ItemDetailField>
            </div>
          ) : (
            /* EDIT MODE */
            <Form onSubmit={(e) => { e.preventDefault(); handleUpdate('info'); }}>
              <FormRow>
                <Input label="Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                <div style={{ flex: 1 }}>
                  <label className={styles.categorySelectLabel}>Category</label>
                  <select 
                    name="categoryId"
                    value={formData.categoryId || ''} 
                    onChange={handleChange}
                    className={styles.categorySelect}
                    required
                  >
                    <option value="">SELECT CATEGORY</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </FormRow>

              <hr className={styles.divider} />
              
              <FormRow>
                <Input label="Product Type" name="productType" value={formData.productType || ''} onChange={handleChange} />
                <Input label="Theme Code" name="themeCode" value={formData.themeCode || ''} onChange={handleChange} />
                <Input label="Design Code" name="designCode" value={formData.designCode || ''} onChange={handleChange} />
              </FormRow>

              <hr className={styles.divider} />
              
              <Input label="Description" name="description" type="textarea" value={formData.description || ''} onChange={handleChange} rows={4} />
              
              <hr className={styles.divider} />
              
              <Input label="Materials + Specs" name="materialsSpecs" type="textarea" value={formData.materialsSpecs || ''} onChange={handleChange} rows={3} />

              <hr className={styles.divider} />
              
              <Input label="Shipping Info" name="shippingInfo" type="textarea" value={formData.shippingInfo || ''} onChange={handleChange} rows={2} />

              <FormActions>
                <Button type="submit" variant="primary" disabled={submitting}>Save Details</Button>
                <Button type="button" onClick={() => handleCancel('info')} disabled={submitting}>Cancel</Button>
              </FormActions>
            </Form>
          )}
        </ItemDetailCard>

        {/* VARIANTS SECTION */}
        <ItemDetailCard title="Variants & Inventory">
          <div className={styles.tableContainer}>
            <table className={styles.productTable}>
              <thead>
                <tr className={styles.productTableHeader}>
                  <th className={styles.productTableCell}>Image</th>
                  <th className={styles.productTableCell}>SKU</th>
                  <th className={styles.productTableCell}>Size</th>
                  <th className={styles.productTableCell}>Variant Code</th>
                  <th className={styles.productTableCell}>Prices</th>
                  <th className={styles.productTableCell}>Stock</th>
                  <th className={styles.productTableCell}>Location</th>
                </tr>
              </thead>
              <tbody>
                {product.variants?.map(variant => {
                  const variantImages = variant.images && variant.images.length > 0 
                    ? variant.images 
                    : (product.images && product.images.length > 0 ? product.images : []);
                  const displayImage = variantImages.length > 0 ? variantImages[0] : null;
                  
                  return (
                    <tr key={variant.id} className={styles.productTableRow}>
                      <td className={styles.productTableCell}>
                        {displayImage ? (
                          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <img 
                              src={displayImage.imageUrl} 
                              alt={displayImage.altText || `${variant.sku} image`}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                              title={displayImage.altText || ''}
                            />
                            {variantImages.length > 1 && (
                              <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: '#007bff',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                              }}>
                                {variantImages.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '0.7rem'
                          }}>
                            No image
                          </div>
                        )}
                      </td>
                      <td className={styles.productTableCell} style={{ fontFamily: 'monospace' }}>{variant.sku}</td>
                      <td className={styles.productTableCell}>{variant.size || 'N/A'}</td>
                      <td className={styles.productTableCell}>{variant.variantCode || 'N/A'}</td>
                      <td className={styles.productTableCell}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {Array.from(variant.prices || [])
                            .filter(p => p.currencyCode === 'EUR')
                            .map((price, idx) => (
                              <span key={idx} style={{ fontSize: '0.85rem' }}>
                                <strong>{formatCurrency(price.amount, 'EUR')}</strong>
                              </span>
                            ))}
                          {Array.from(variant.prices || []).filter(p => p.currencyCode === 'EUR').length === 0 && (
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>N/A</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.productTableCell}>
                        {variant.inventory?.stockQuantity === 0 ? (
                          <span className={styles.textError}>Out of Stock</span>
                        ) : (
                          <span>{variant.inventory?.stockQuantity || 0} units</span>
                        )}
                      </td>
                      <td className={styles.productTableCell}>{variant.inventory?.stockLocation || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ItemDetailCard>

        {/* ADMINISTRATIVE ACTIONS */}
        <ItemDetailCard title="Administrative Actions">
          <p className={styles.warningText}>
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
