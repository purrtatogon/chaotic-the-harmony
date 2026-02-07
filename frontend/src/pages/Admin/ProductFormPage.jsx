import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Form from '../../components/Form';
import FormRow from '../../components/FormRow';
import FormActions from '../../components/FormActions';
import ItemDetailCard from '../../components/ItemDetailCard';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const ProductFormPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isNew = id === 'new';
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    materialsSpecs: '',
    shippingInfo: '',
    categoryId: '',
    productType: '',
    themeCode: '',
    designCode: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoryData, typeData] = await Promise.all([
          categoryApi.getAll(),
          productApi.getTypes()
        ]);
        setCategories(categoryData);
        setProductTypes(typeData);
        
        if (!isNew) {
          // Load existing product for edit
          const productData = await productApi.getById(id);
          setProduct(productData);
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            materialsSpecs: productData.materialsSpecs || '',
            shippingInfo: productData.shippingInfo || '',
            categoryId: productData.category?.id || '',
            productType: productData.productType?.code || productData.productType || '',
            themeCode: productData.themeCode || '',
            designCode: productData.designCode || ''
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        materialsSpecs: formData.materialsSpecs || null,
        shippingInfo: formData.shippingInfo || null,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        productType: formData.productType || null, // Backend will convert string code to enum
        themeCode: formData.themeCode || null,
        designCode: formData.designCode || null
      };
      
      if (isNew) {
        // Create new product
        const created = await productApi.create(submitData);
        alert('Product created successfully!');
        navigate(`/admin/products/${created.id}`);
      } else {
        // Update existing product
        await productApi.update(id, submitData);
        alert('Product updated successfully!');
        navigate(`/admin/products/${id}`);
      }
    } catch (err) {
      alert(`Failed to ${isNew ? 'create' : 'update'} product: ` + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await productApi.delete(id);
        alert('Product deleted successfully!');
        navigate('/admin/products');
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/admin/products');
    } else {
      navigate(`/admin/products/${id}`);
    }
  };

  if (loading) return <Loading message={isNew ? "Loading form..." : "Loading product..."} />;
  if (error) return <Error message={error} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title={isNew ? "Add New Product" : `Edit Product: ${product?.name || ''}`}
        subtitle={isNew ? "Create a new product" : `Product ID: ${id}`}
        actions={
          <Button onClick={() => navigate('/admin/products')}>
            ← Back to Products
          </Button>
        }
      />

      <div className={styles.itemDetail}>
        <ItemDetailCard title={isNew ? "Product Information" : "Edit Product Information"} fullWidth>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                label="Product Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
                disabled={submitting}
              />
              <Input
                label="Category"
                name="categoryId"
                type="select"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Input>
            </FormRow>

            <FormRow>
              <Input
                label="Product Type"
                name="productType"
                type="select"
                value={formData.productType}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="">Select a product type</option>
                {productTypes.map(type => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </Input>
              <Input
                label="Theme Code"
                name="themeCode"
                type="text"
                value={formData.themeCode}
                onChange={handleChange}
                placeholder="e.g., SPRK, BIRD"
                disabled={submitting}
              />
            </FormRow>

            <FormRow>
              <Input
                label="Design Code"
                name="designCode"
                type="text"
                value={formData.designCode}
                onChange={handleChange}
                placeholder="e.g., 001, 002"
                disabled={submitting}
              />
            </FormRow>

            <FormRow>
              <Input
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description (supports Markdown)"
                disabled={submitting}
                rows={6}
              />
            </FormRow>

            <FormRow>
              <Input
                label="Materials & Specifications"
                name="materialsSpecs"
                type="textarea"
                value={formData.materialsSpecs}
                onChange={handleChange}
                placeholder="Enter materials and specifications (supports Markdown)"
                disabled={submitting}
                rows={4}
              />
            </FormRow>

            <FormRow>
              <Input
                label="Shipping Information"
                name="shippingInfo"
                type="textarea"
                value={formData.shippingInfo}
                onChange={handleChange}
                placeholder="Enter shipping information"
                disabled={submitting}
                rows={4}
              />
            </FormRow>

            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (isNew ? 'Creating...' : 'Saving...') : (isNew ? 'Create Product' : 'Save Changes')}
              </Button>
              <Button type="button" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
              {!isNew && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleDelete} 
                  disabled={submitting}
                  style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#991b1b' }}
                >
                  Delete Product
                </Button>
              )}
            </FormActions>
          </Form>
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default ProductFormPage;
