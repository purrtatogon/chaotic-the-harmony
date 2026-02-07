import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ItemDetailCard from '../../components/ItemDetailCard';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { formatCurrency } from '../../utils/formatters';

const WarehouseDetailPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const { zoneName } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchZoneInventory = async () => {
      try {
        setLoading(true);
        // Fetch all products
        const allProducts = await productApi.getAll();
        
        // Filter products that have variants in this zone
        const zoneProducts = allProducts
          .map(product => {
            // Filter variants that are in this zone
            const zoneVariants = product.variants?.filter(variant => 
              variant.inventory?.stockLocation === decodeURIComponent(zoneName)
            ) || [];
            
            if (zoneVariants.length === 0) return null;
            
            // Return product with only the variants in this zone
            return {
              ...product,
              variants: zoneVariants
            };
          })
          .filter(product => product !== null);
        
        setProducts(zoneProducts);
      } catch (err) {
        setError(err.message || 'Failed to load zone inventory');
      } finally {
        setLoading(false);
      }
    };

    if (zoneName) {
      fetchZoneInventory();
    }
  }, [zoneName]);

  if (loading) return <Loading message="Loading zone inventory..." />;
  if (error) return <Error message={error} />;

  const decodedZoneName = decodeURIComponent(zoneName || '');
  const totalStock = products.reduce((acc, product) => 
    acc + product.variants.reduce((sum, variant) => 
      sum + (variant.inventory?.stockQuantity || 0), 0), 0
  );

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title={`Zone: ${decodedZoneName}`}
        subtitle={`Central Warehouse - Helsinki Distribution Center`}
        actions={
          <Button onClick={() => navigate('/admin/warehouses')}>
            ← Back to Zones
          </Button>
        }
      />

      <div className={styles.statsGrid} style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className={styles.dashboardStatCard}>
          <span className={styles.dashboardStatTitle}>Total Products</span>
          <span className={styles.dashboardStatValue}>{products.length}</span>
        </div>
        <div className={styles.dashboardStatCard}>
          <span className={styles.dashboardStatTitle}>Total Variants</span>
          <span className={styles.dashboardStatValue}>
            {products.reduce((acc, p) => acc + p.variants.length, 0)}
          </span>
        </div>
        <div className={styles.dashboardStatCard}>
          <span className={styles.dashboardStatTitle}>Total Stock</span>
          <span className={styles.dashboardStatValue}>{totalStock} units</span>
        </div>
      </div>

      {products.length === 0 ? (
        <ItemDetailCard title="No Inventory" fullWidth>
          <p style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
            This zone currently has no products assigned.
          </p>
        </ItemDetailCard>
      ) : (
        products.map(product => {
          const productStock = product.variants.reduce((sum, v) => 
            sum + (v.inventory?.stockQuantity || 0), 0
          );
          
          return (
            <ItemDetailCard 
              key={product.id} 
              title={product.name}
              fullWidth
              actions={
                <Button 
                  size="small" 
                  variant="secondary"
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                >
                  View Product
                </Button>
              }
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div>
                    <span className={styles.textMuted}>Product ID:</span>{' '}
                    <span style={{ fontFamily: 'monospace' }}>#{product.id}</span>
                  </div>
                  <div>
                    <span className={styles.textMuted}>Category:</span>{' '}
                    <span className={styles.categoryBadge}>
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.textMuted}>Total Stock in Zone:</span>{' '}
                    <strong>{productStock} units</strong>
                  </div>
                </div>
                {product.themeCode && (
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <span className={styles.textMuted}>Theme:</span> {product.themeCode}
                    {product.designCode && (
                      <> | <span className={styles.textMuted}>Design:</span> {product.designCode}</>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.productTable}>
                  <thead>
                    <tr className={styles.productTableHeader}>
                      <th className={styles.productTableCell}>Image</th>
                      <th className={styles.productTableCell}>SKU</th>
                      <th className={styles.productTableCell}>Size</th>
                      <th className={styles.productTableCell}>Variant Code</th>
                      <th className={styles.productTableCell}>Price (EUR)</th>
                      <th className={styles.productTableCell}>Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map(variant => {
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
                          <td className={styles.productTableCell} style={{ fontFamily: 'monospace' }}>
                            {variant.sku}
                          </td>
                          <td className={styles.productTableCell}>
                            {variant.size || 'N/A'}
                          </td>
                          <td className={styles.productTableCell}>
                            {variant.variantCode || 'N/A'}
                          </td>
                          <td className={styles.productTableCell}>
                            {(() => {
                              const eurPrice = Array.from(variant.prices || [])
                                .find(p => p.currencyCode === 'EUR');
                              return eurPrice ? (
                                <strong>{formatCurrency(eurPrice.amount, 'EUR')}</strong>
                              ) : (
                                <span style={{ color: '#666' }}>N/A</span>
                              );
                            })()}
                          </td>
                          <td className={styles.productTableCell}>
                            {variant.inventory?.stockQuantity === 0 ? (
                              <span className={styles.textError}>Out of Stock</span>
                            ) : (
                              <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                {variant.inventory?.stockQuantity || 0} units
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ItemDetailCard>
          );
        })
      )}
    </div>
  );
};

export default WarehouseDetailPage;
