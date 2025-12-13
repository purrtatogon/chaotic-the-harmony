import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import Input from '../../components/Global/Input';
import MarkdownFieldEditor from '../../components/Admin/MarkdownFieldEditor/MarkdownFieldEditor.jsx';
import Form from '../../components/Global/Form';
import FormRow from '../../components/Global/FormRow';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ItemDetailField from '../../components/Admin/ItemDetailField';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';

const FORM_ID = 'product-form-page-form';

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

  const [feedback, setFeedback] = useState(null);

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoryData, typeData] = await Promise.all([
        categoryApi.getAll(),
        productApi.getTypes()
      ]);
      setCategories(categoryData);
      setProductTypes(typeData);

      if (!isNew) {
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
  }, [id, isNew]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        document.getElementById(FORM_ID)?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name,
        description: formData.description || null,
        materialsSpecs: formData.materialsSpecs || null,
        shippingInfo: formData.shippingInfo || null,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        productType: formData.productType || null,
        themeCode: formData.themeCode || null,
        designCode: formData.designCode || null
      };

      if (isNew) {
        const created = await productApi.create(submitData);
        navigate(`/admin/products/${created.id}`);
      } else {
        await productApi.update(id, submitData);
        navigate(`/admin/products/${id}`);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: `Failed to ${isNew ? 'create' : 'update'} product: ` + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isNew && window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await productApi.delete(id);
        navigate('/admin/products');
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to delete product: ' + err.message });
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

  if (loading) return <AdminLoading styles={styles} message={isNew ? "Loading form..." : "Loading product..."} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className={`${styles.pageContent} ${styles.pageContentProductAaa}`.trim()}>
      <PageHeader
        title={isNew ? "Add new product" : `Edit product: ${product?.name || ''}`}
        subtitle={isNew ? "Create a new product" : `Product ID: ${id}`}
        sticky
        subtitleClassName={styles.subtitleAaa}
        actions={
          <div className={styles.flexRow}>
            <Link className={styles.actionLink} to="/admin/products">
              ← Back to products
            </Link>
            <Button
              type="submit"
              form={FORM_ID}
              variant="primary"
              disabled={submitting}
            >
              {submitting
                ? isNew
                  ? 'Creating…'
                  : 'Saving…'
                : isNew
                  ? 'Create product'
                  : 'Save'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            {!isNew && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting}>
                Delete
              </Button>
            )}
          </div>
        }
      />

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.inlineFeedbackSuccess : styles.inlineFeedbackError}
          role="alert"
        >
          <span className={styles.inlineFeedbackIcon} aria-hidden="true">
            {feedback.type === 'success' ? '✓' : '⚠'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.productEditPageWrap}>
        <Form id={FORM_ID} className={styles.productEditForm} onSubmit={handleSubmit}>
          <div className={styles.productEditLayout}>
            <div className={styles.productEditMain}>
              <ItemDetailCard title="Product content">
                <FormRow>
                  <div className={styles.formFullWidthField}>
                    <Input
                      label="Product name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>
                </FormRow>

                <MarkdownFieldEditor
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  disabled={submitting}
                />

                <MarkdownFieldEditor
                  label="Materials & specifications"
                  name="materialsSpecs"
                  value={formData.materialsSpecs}
                  onChange={handleChange}
                  rows={5}
                  disabled={submitting}
                />

                <MarkdownFieldEditor
                  label="Shipping information"
                  name="shippingInfo"
                  value={formData.shippingInfo}
                  onChange={handleChange}
                  rows={4}
                  disabled={submitting}
                />

                {isNew && (
                  <p className={styles.adminBrutalistNote}>
                    After you create this product, add and manage images from the product detail page (media section).
                  </p>
                )}
              </ItemDetailCard>
            </div>

            <div className={styles.productEditAside}>
              <ItemDetailCard title="Organization">
                <ItemDetailField label="Product status" value="Active" />
                <hr className={styles.divider} />
                <FormRow>
                  <div className={styles.formFullWidthField}>
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
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Input>
                  </div>
                </FormRow>

                <FormRow>
                  <div className={styles.formFullWidthField}>
                    <Input
                      label="Product type"
                      name="productType"
                      type="select"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select a product type</option>
                      {productTypes.map((type) => (
                        <option key={type.code} value={type.code}>
                          {type.name}
                        </option>
                      ))}
                    </Input>
                  </div>
                </FormRow>

                <FormRow>
                  <Input
                    label="Theme code"
                    name="themeCode"
                    type="text"
                    value={formData.themeCode}
                    onChange={handleChange}
                    placeholder="e.g., SPRK, BIRD"
                    disabled={submitting}
                  />
                  <Input
                    label="Design code"
                    name="designCode"
                    type="text"
                    value={formData.designCode}
                    onChange={handleChange}
                    placeholder="e.g., 001, 002"
                    disabled={submitting}
                  />
                </FormRow>
              </ItemDetailCard>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProductFormPage;
