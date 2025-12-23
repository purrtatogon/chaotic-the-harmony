import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const ProductsListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch ALL products
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loading message="Loading inventory..." />;
  if (error) return <Error message={error} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title="Products" 
        subtitle="Manage your inventory"
        actions={
            <Button variant="primary" onClick={() => navigate('/admin/products/new')}>
              + Add Product
            </Button>
        }
      />

      {/* Simple Table Layout */}
      <div style={{ overflowX: 'auto', background: theme === 'dark' ? '#1e1e1e' : '#fff', borderRadius: '8px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme === 'dark' ? '#eee' : '#333' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
              <th style={{ padding: '1rem' }}>SKU</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
                <td style={{ padding: '1rem' }}>{product.sku}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.title}</td>
                
                {/* Fixed: access the .name property of the category object */}
                <td style={{ padding: '1rem' }}>
                  {product.category ? product.category.name : 'Uncategorized'}
                </td>

                <td style={{ padding: '1rem' }}>${product.price?.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>{product.stockQuantity}</td>
                <td style={{ padding: '1rem' }}>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                  >
                    View / Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                No products found.
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductsListPage;