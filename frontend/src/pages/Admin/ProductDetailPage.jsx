import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { productMarkdownRemarkPlugins } from '../../utils/markdownGfm';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import { getCurrentUserRole } from '../../utils/userUtils';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ItemDetailField from '../../components/Admin/ItemDetailField';
import Input from '../../components/Global/Input';
import MarkdownFieldEditor from '../../components/Admin/MarkdownFieldEditor/MarkdownFieldEditor.jsx';
import Form from '../../components/Global/Form';
import FormRow from '../../components/Global/FormRow';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import ProductImageGallery from '../../components/Admin/ProductImageGallery';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STOCK_EDIT_ROLES = new Set(['ADMIN', 'MANAGER', 'STAFF']);

function buildViewGalleryItems(product) {
  const out = [];
  (product.images || []).forEach((img) => {
    out.push({ ...img, scopeKey: 'product', scopeLabel: 'Product' });
  });
  (product.variants || []).forEach((v) => {
    (v.images || []).forEach((img) => {
      out.push({
        ...img,
        scopeKey: 'variant',
        scopeLabel: v.sku ? `Variant · ${v.sku}` : 'Variant',
      });
    });
  });
  return out;
}

const CONTENT_FIELDS = ['name', 'description', 'materialsSpecs', 'shippingInfo'];

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: 'block' }}>
    <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

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

  const [editingFields, setEditingFields] = useState(new Set());
  const [formData, setFormData] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [editingStockVariantId, setEditingStockVariantId] = useState(null);
  const [stockEditValue, setStockEditValue] = useState('');
  const [stockUpdating, setStockUpdating] = useState(false);
  const canEditStock = STOCK_EDIT_ROLES.has(getCurrentUserRole());

  const isEditingAny = editingFields.size > 0;
  const isEditingMedia = editingFields.has('media');
  const isEditingOrg = editingFields.has('organization');

  const startEditing = useCallback((field) => {
    setEditingFields((prev) => new Set(prev).add(field));
  }, []);

  const stopEditing = useCallback((field) => {
    setEditingFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const startEditingAll = useCallback(() => {
    setEditingFields(new Set([...CONTENT_FIELDS, 'media', 'organization']));
  }, []);

  const cancelField = useCallback((field) => {
    if (!product) return;
    if (field === 'media') {
      setFormData((prev) => ({ ...prev, images: product.images || [] }));
    } else if (field === 'organization') {
      setFormData((prev) => ({
        ...prev,
        categoryId: product.category?.id || '',
        productType: product.productType || '',
        themeCode: product.themeCode || '',
        designCode: product.designCode || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: product[field] || '' }));
    }
    stopEditing(field);
  }, [product, stopEditing]);

  const cancelAll = useCallback(() => {
    if (!product) return;
    setFormData({
      ...product,
      categoryId: product.category?.id || '',
      images: product.images || [],
    });
    setEditingFields(new Set());
  }, [product]);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [productData, categoryData] = await Promise.all([
        productApi.getById(id),
        categoryApi.getAll(),
      ]);
      setProduct(productData);
      setCategories(categoryData);
      setFormData({
        ...productData,
        categoryId: productData.category?.id || '',
        images: productData.images || [],
      });
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGalleryChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const saveFields = useCallback(async (fieldsToSave) => {
    setFeedback(null);
    try {
      setSubmitting(true);
      const updateData = { ...formData };
      if (updateData.images) {
        updateData.images = updateData.images.map((img) => ({
          imageUrl: typeof img === 'string' ? img : (img.imageUrl || img.url || ''),
          altText: typeof img === 'string' ? '' : (img.altText || ''),
        }));
      }
      const updated = await productApi.update(id, updateData);
      setProduct(updated);
      setFormData({
        ...updated,
        categoryId: updated.category?.id,
        images: updated.images || [],
      });
      fieldsToSave.forEach((f) => stopEditing(f));
      setFeedback({ type: 'success', message: 'Product updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Update failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  }, [formData, id, stopEditing]);

  const handleSaveAll = async (e) => {
    e.preventDefault();
    await saveFields([...editingFields]);
  };

  const handleSaveField = useCallback(async (field) => {
    await saveFields([field]);
  }, [saveFields]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
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

  const handleStockSave = async (variantId) => {
    const qty = parseInt(stockEditValue, 10);
    if (isNaN(qty) || qty < 0) {
      setFeedback({ type: 'error', message: 'Stock quantity must be a non-negative number.' });
      return;
    }
    try {
      setStockUpdating(true);
      setFeedback(null);
      const updatedProduct = await productApi.updateStock(variantId, { stockQuantity: qty });
      setProduct(updatedProduct);
      setEditingStockVariantId(null);
      setFeedback({ type: 'success', message: 'Stock updated successfully.' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update stock.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setStockUpdating(false);
    }
  };

  useEffect(() => {
    if (!isEditingAny) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        document.getElementById('product-unified-form')?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditingAny]);

  const viewGalleryItems = useMemo(
    () => (product ? buildViewGalleryItems(product) : []),
    [product]
  );

  const displayViewImages =
    viewGalleryItems.length > 0 ? viewGalleryItems : [{ imageUrl: '/placeholder.jpg', scopeLabel: null }];

  useEffect(() => {
    if (activeImageIndex >= displayViewImages.length) {
      setActiveImageIndex(0);
    }
  }, [displayViewImages.length, activeImageIndex]);

  const productScopeLabels = useMemo(
    () => (formData.images || []).map(() => 'Product'),
    [formData.images]
  );

  const renderVariantReadOnlyRow = useCallback(() => {
    if (!product?.variants?.length) return null;
    const variantTiles = [];
    product.variants.forEach((v) => {
      (v.images || []).forEach((img, j) => {
        variantTiles.push(
          <div key={`v-${v.id}-${img.id ?? j}`} className={styles.galleryThumbCell}>
            <div className={styles.galleryVariantReadOnlyFrame}>
              <img
                src={img.imageUrl}
                alt={img.altText || `Variant ${v.sku} image`}
                className={styles.galleryThumbnail}
              />
              <span className={`${styles.mediaScopeBadge} ${styles.mediaScopeBadgeVariant}`.trim()}>
                {v.sku ? `Variant · ${v.sku}` : 'Variant'}
              </span>
            </div>
          </div>
        );
      });
    });
    if (variantTiles.length === 0) return null;
    return (
      <div className={`${styles.adminBrutalistNote} ${styles.variantMediaBlock}`.trim()} role="region" aria-label="Variant media read-only">
        <p className={`${styles.itemDetailLabel} ${styles.variantMediaLabel}`.trim()}>
          Variant media
        </p>
        <p className={`${styles.mutedP} ${styles.variantMediaHint}`.trim()}>
          Images attached to a variant SKU. Edit variant assets in inventory tools if added later.
        </p>
        <div className={styles.galleryThumbnails}>{variantTiles}</div>
      </div>
    );
  }, [product, styles]);

  if (loading) return <AdminLoading styles={styles} message="Loading product..." />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (!product) return <Error message="Product not found" />;

  const current = displayViewImages[activeImageIndex] || displayViewImages[0];
  const isVariantScope = current?.scopeKey === 'variant';

  const InlineEditBtn = ({ field, label }) => (
    <button
      type="button"
      className={styles.inlineEditTrigger}
      onClick={() => startEditing(field)}
      aria-label={`Edit ${label}`}
      title={`Edit ${label}`}
    >
      <PencilIcon />
    </button>
  );

  const FieldActions = ({ field, label }) => (
    <div className={styles.inlineFieldActions}>
      <Button type="button" variant="primary" onClick={() => handleSaveField(field)} disabled={submitting}>
        {submitting ? 'Saving…' : `Save ${label}`}
      </Button>
      <Button type="button" variant="secondary" onClick={() => cancelField(field)} disabled={submitting}>
        Cancel
      </Button>
    </div>
  );

  const renderNameField = () => {
    const editing = editingFields.has('name');
    if (editing) {
      return (
        <div className={styles.inlineEditBlock}>
          <FormRow>
            <div className={styles.formFullWidthField}>
              <Input
                label="Name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>
          </FormRow>
          <FieldActions field="name" label="Name" />
        </div>
      );
    }
    return (
      <div className={styles.inlineFieldRow}>
        <ItemDetailField label="Name" value={product.name || 'N/A'} />
        <InlineEditBtn field="name" label="Name" />
      </div>
    );
  };

  const renderMarkdownField = (field, label, rows = 5) => {
    const editing = editingFields.has(field);
    if (editing) {
      return (
        <div className={styles.inlineEditBlock}>
          <MarkdownFieldEditor
            label={label}
            name={field}
            value={formData[field] || ''}
            onChange={handleChange}
            rows={rows}
            disabled={submitting}
          />
          <FieldActions field={field} label={label} />
        </div>
      );
    }
    return (
      <div className={styles.inlineFieldRow}>
        <ItemDetailField label={label}>
          <ReactMarkdown remarkPlugins={productMarkdownRemarkPlugins}>
            {product[field] || 'N/A'}
          </ReactMarkdown>
        </ItemDetailField>
        <InlineEditBtn field={field} label={label} />
      </div>
    );
  };

  const renderMediaSection = () => {
    if (isEditingMedia) {
      return (
        <ItemDetailCard
          title="Media"
          actions={
            <div className={styles.flexRow}>
              <Button type="button" variant="primary" onClick={() => handleSaveField('media')} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Media'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => cancelField('media')} disabled={submitting}>
                Cancel
              </Button>
            </div>
          }
        >
          <ProductImageGallery
            images={formData.images || []}
            onImagesChange={handleGalleryChange}
            submitting={submitting}
            scopeLabels={productScopeLabels}
          />
          {renderVariantReadOnlyRow()}
        </ItemDetailCard>
      );
    }
    return (
      <ItemDetailCard
        title="Media"
        actions={
          <Button type="button" variant="secondary" onClick={() => startEditing('media')}>
            Edit Media
          </Button>
        }
      >
        <div className={styles.galleryContainer}>
          <div className={styles.galleryMainImage}>
            <img src={current?.imageUrl} alt={current?.altText || product.name} />
            {current?.scopeLabel && (
              <span
                className={
                  isVariantScope
                    ? `${styles.mediaScopeBadge} ${styles.mediaScopeBadgeVariant}`.trim()
                    : styles.mediaScopeBadge
                }
              >
                {current.scopeLabel}
              </span>
            )}
            {current?.altText && !String(current?.imageUrl || '').includes('placeholder') && (
              <div className={styles.galleryAltNote}>Alt text: {current.altText}</div>
            )}
          </div>
          <div className={styles.galleryThumbnails}>
            {displayViewImages.map((img, i) => (
              <div key={`${img.scopeKey || 'p'}-${i}`} className={styles.galleryThumbCell}>
                <button
                  type="button"
                  className={styles.galleryThumbButton}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`Show image ${i + 1} of ${displayViewImages.length}`}
                  aria-pressed={activeImageIndex === i}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `Image ${i + 1}`}
                    className={`${styles.galleryThumbnail} ${
                      activeImageIndex === i ? styles.galleryThumbnailActive : ''
                    }`.trim()}
                  />
                </button>
                {img.scopeLabel && (
                  <div className={styles.galleryThumbAltStrip} title={img.scopeLabel}>
                    {img.scopeLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ItemDetailCard>
    );
  };

  const renderVariantsTable = () => (
    <ItemDetailCard title="Variants &amp; Inventory">
      <div className={styles.tableContainer}>
        <table className={styles.productTable}>
          <caption className="srOnly">Product variants, pricing, and inventory</caption>
          <thead>
            <tr className={styles.productTableHeader}>
              <th scope="col" className={styles.productTableCell}>Image</th>
              <th scope="col" className={styles.productTableCell}>SKU</th>
              <th scope="col" className={styles.productTableCell}>Size</th>
              <th scope="col" className={styles.productTableCell}>Variant Code</th>
              <th scope="col" className={styles.productTableCell}>Prices</th>
              <th scope="col" className={styles.productTableCell}>Stock</th>
              <th scope="col" className={styles.productTableCell}>Location</th>
            </tr>
          </thead>
          <tbody>
            {product.variants?.map((variant) => {
              const variantImages =
                variant.images && variant.images.length > 0
                  ? variant.images
                  : product.images && product.images.length > 0
                    ? product.images
                    : [];
              const displayImage = variantImages.length > 0 ? variantImages[0] : null;
              return (
                <tr key={variant.id} className={styles.productTableRow}>
                  <td className={styles.productTableCell}>
                    {displayImage ? (
                      <div className={styles.variantImgWrap}>
                        <img
                          src={displayImage.imageUrl}
                          alt={displayImage.altText || `${variant.sku} image`}
                          className={styles.variantThumbImg}
                          title={displayImage.altText || ''}
                        />
                        {variantImages.length > 1 && (
                          <span className={styles.variantImgCountBadge} aria-label={`${variantImages.length} images`}>
                            {variantImages.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className={styles.variantNoImg}>No image</div>
                    )}
                  </td>
                  <td className={`${styles.productTableCell} ${styles.tableCellMono}`.trim()}>{variant.sku}</td>
                  <td className={styles.productTableCell}>{variant.size || 'N/A'}</td>
                  <td className={styles.productTableCell}>{variant.variantCode || 'N/A'}</td>
                  <td className={styles.productTableCell}>
                    <div className={styles.variantPriceCol}>
                      {Array.from(variant.prices || [])
                        .filter((p) => p.currencyCode === 'EUR')
                        .map((price, idx) => (
                          <span key={idx} className={styles.variantPriceLine}>
                            <strong>{formatCurrency(price.amount)}</strong>
                          </span>
                        ))}
                      {Array.from(variant.prices || []).filter((p) => p.currencyCode === 'EUR').length === 0 && (
                        <span className={styles.variantPriceMuted}>N/A</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.productTableCell}>
                    {editingStockVariantId === variant.id ? (
                      <div className={styles.stockEditCell}>
                        <input
                          type="number"
                          min="0"
                          className={styles.stockInput}
                          value={stockEditValue}
                          onChange={(e) => setStockEditValue(e.target.value)}
                          disabled={stockUpdating}
                          aria-label={`Stock quantity for ${variant.sku}`}
                        />
                        <button
                          type="button"
                          className={styles.stockEditButton}
                          onClick={() => handleStockSave(variant.id)}
                          disabled={stockUpdating}
                        >
                          {stockUpdating ? '...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className={styles.stockEditButton}
                          onClick={() => setEditingStockVariantId(null)}
                          disabled={stockUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {variant.inventory?.stockQuantity === 0 ? (
                          <span className={styles.textErrorWithIcon}>Out of Stock</span>
                        ) : (
                          <span>{variant.inventory?.stockQuantity || 0} units</span>
                        )}
                        {canEditStock && (
                          <button
                            type="button"
                            className={styles.stockEditButton}
                            onClick={() => {
                              setEditingStockVariantId(variant.id);
                              setStockEditValue(String(variant.inventory?.stockQuantity || 0));
                            }}
                            aria-label={`Edit stock for ${variant.sku}`}
                          >
                            Edit
                          </button>
                        )}
                        {variant.inventory?.updatedBy && (
                          <span className={styles.stockAuditInfo}>
                            Updated by {variant.inventory.updatedBy.fullName}
                            {variant.inventory.stockUpdatedAt && (
                              <> on {formatDate(variant.inventory.stockUpdatedAt)}</>
                            )}
                          </span>
                        )}
                      </>
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
  );

  const renderOrganizationSidebar = () => {
    if (isEditingOrg) {
      return (
        <ItemDetailCard title="Organization">
          <ItemDetailField label="Product status" value="Active" />
          <hr className={styles.divider} />
          <div className={styles.formGrow}>
            <label htmlFor="product-category-select" className={styles.categorySelectLabel}>
              Category
            </label>
            <select
              id="product-category-select"
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleChange}
              className={styles.categorySelect}
              required
              disabled={submitting}
            >
              <option value="">SELECT CATEGORY</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <FormRow>
            <Input label="Product type" name="productType" value={formData.productType || ''} onChange={handleChange} />
          </FormRow>
          <FormRow>
            <Input label="Theme code" name="themeCode" value={formData.themeCode || ''} onChange={handleChange} />
            <Input label="Design code" name="designCode" value={formData.designCode || ''} onChange={handleChange} />
          </FormRow>
          <div className={styles.inlineFieldActions}>
            <Button type="button" variant="primary" onClick={() => handleSaveField('organization')} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => cancelField('organization')} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </ItemDetailCard>
      );
    }
    return (
      <ItemDetailCard
        title="Organization"
        actions={
          <button
            type="button"
            className={styles.inlineEditTrigger}
            onClick={() => startEditing('organization')}
            aria-label="Edit organization"
            title="Edit organization"
          >
            <PencilIcon />
          </button>
        }
      >
        <ItemDetailField label="Product status" value="Active" />
        <ItemDetailField label="Category" value={product.category?.name || 'N/A'} />
        <ItemDetailField label="Product type" value={product.productType || 'N/A'} />
        <ItemDetailField label="Theme code" value={product.themeCode || 'N/A'} />
        <ItemDetailField label="Design code" value={product.designCode || 'N/A'} />
      </ItemDetailCard>
    );
  };

  return (
    <div className={`${styles.pageContent} ${styles.pageContentProductAaa}`.trim()}>
      <PageHeader
        title={editingFields.has('name') ? (formData.name || product.name) : product.name}
        subtitle={`Product ID: ${product.id}`}
        sticky
        subtitleClassName={styles.subtitleAaa}
        actions={
          <div className={styles.flexRow}>
            <Link className={styles.actionLink} to="/admin/products">
              ← Back to products
            </Link>
            {isEditingAny ? (
              <>
                <Button type="submit" form="product-unified-form" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save All'}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelAll} disabled={submitting}>
                  Cancel All
                </Button>
              </>
            ) : (
              <Button type="button" variant="primary" onClick={startEditingAll}>
                Edit All
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
        <Form id="product-unified-form" className={styles.productEditForm} onSubmit={handleSaveAll}>
          <div className={styles.productEditLayout}>
            <div className={styles.productEditMain}>
              <ItemDetailCard title="Product content">
                {renderNameField()}
                <hr className={styles.divider} />
                {renderMarkdownField('description', 'Description', 5)}
                <hr className={styles.divider} />
                {renderMarkdownField('materialsSpecs', 'Materials + Specs', 4)}
                <hr className={styles.divider} />
                {renderMarkdownField('shippingInfo', 'Shipping info', 3)}
              </ItemDetailCard>

              {renderMediaSection()}
              {renderVariantsTable()}
            </div>
            <div className={styles.productEditAside}>
              {renderOrganizationSidebar()}
            </div>
          </div>
        </Form>

        <div className={styles.productEditFull}>
          <ItemDetailCard title="Administrative actions">
            <p className={styles.warningText}>
              Warning: Deleting a product is permanent and cannot be undone.
            </p>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting || isEditingAny}>
              Delete product permanently
            </Button>
          </ItemDetailCard>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
