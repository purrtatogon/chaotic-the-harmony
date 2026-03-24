import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import Button from '../../components/Global/Button';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
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

      <div className={`${styles.statsGrid} ${styles.warehouseDetailStats}`.trim()}>
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
          <p className={styles.emptyStateText}>
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
              <div className={styles.zoneProductBlock}>
                <div className={styles.zoneProductMetaRow}>
                  <div>
                    <span className={styles.textMuted}>Product ID:</span>{' '}
                    <span className={styles.tableCellMono}>#{product.id}</span>
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
                  <div className={styles.zoneProductThemeLine}>
                    <span className={styles.textMuted}>Theme:</span> {product.themeCode}
                    {product.designCode && (
                      <> | <span className={styles.textMuted}>Design:</span> {product.designCode}</>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.productTable}>
                  <caption className="srOnly">
                    Variants in zone {decodedZoneName} for {product.name}
                  </caption>
                  <thead>
                    <tr className={styles.productTableHeader}>
                      <th scope="col" className={styles.productTableCell}>Image</th>
                      <th scope="col" className={styles.productTableCell}>SKU</th>
                      <th scope="col" className={styles.productTableCell}>Size</th>
                      <th scope="col" className={styles.productTableCell}>Variant Code</th>
                      <th scope="col" className={styles.productTableCell}>Price (EUR)</th>
                      <th scope="col" className={styles.productTableCell}>Stock Quantity</th>
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
                              <div className={styles.variantImgWrap}>
                                <img 
                                  src={displayImage.imageUrl} 
                                  alt={displayImage.altText || `${variant.sku} image`}
                                  className={styles.variantThumbImg}
                                  title={displayImage.altText || ''}
                                />
                                {variantImages.length > 1 && (
                                  <span className={styles.variantImgCountBadge}>
                                    {variantImages.length}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className={styles.variantNoImg}>
                                No image
                              </div>
                            )}
                          </td>
                          <td className={`${styles.productTableCell} ${styles.tableCellMono}`.trim()}>
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
                                <span className={styles.variantPriceMuted}>N/A</span>
                              );
                            })()}
                          </td>
                          <td className={styles.productTableCell}>
                            {variant.inventory?.stockQuantity === 0 ? (
                              <span className={styles.textError}>Out of Stock</span>
                            ) : (
                              <span className={styles.stockQtyMono}>
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
