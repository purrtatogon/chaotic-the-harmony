import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { formatCurrency } from '../../utils/formatters';


const ProductListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    sortBy: 'id',
    sortDir: 'desc',
    categoryId: '',
    availability: '',
    productType: '',
    size: '',
    color: '',
    search: ''
  });

  // Fetch Dropdown Data (Categories AND Types) on Mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // Run both requests in parallel for speed
        const [cats, types] = await Promise.all([
          categoryApi.getAll(),
          productApi.getTypes()
        ]);
        setCategories(cats);
        setProductTypes(types);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadDropdownData();
  }, []);

  // Fetch Products whenever Filters Change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getAll(filters);
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [filters]);


  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    let sortConfig = { sortBy: 'id', sortDir: 'desc' };

    if (value === 'price_asc') sortConfig = { sortBy: 'price', sortDir: 'asc' };
    if (value === 'price_desc') sortConfig = { sortBy: 'price', sortDir: 'desc' };
    if (value === 'newest') sortConfig = { sortBy: 'id', sortDir: 'desc' };
    if (value === 'oldest') sortConfig = { sortBy: 'id', sortDir: 'asc' };

    setFilters(prev => ({ ...prev, ...sortConfig }));
  };

  const handleReset = () => {
    setFilters({
      sortBy: 'id',
      sortDir: 'desc',
      categoryId: '',
      availability: '',
      productType: '',
      size: '',
      color: '',
      search: ''
    });
  };

  const inputStyle = {
    padding: '0.6rem',
    borderRadius: '6px',
    border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    fontSize: '0.9rem',
    minWidth: '140px'
  };

  if (loading && products.length === 0) return <Loading message="Loading inventory..." />;
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

      {/*███████ FILTER TOOLBAR ███████*/}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff', 
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        border: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
      }}>
        
        {/* Sorting */}
        <select style={inputStyle} onChange={handleSortChange} defaultValue="newest">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        {/* Availability */}
        <select name="availability" style={inputStyle} value={filters.availability} onChange={handleFilterChange}>
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Category Dropdown */}
        <select name="categoryId" style={inputStyle} value={filters.categoryId} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Product Type Dropdown */}
        <select name="productType" style={inputStyle} value={filters.productType} onChange={handleFilterChange}>
          <option value="">All Product Types</option>
          {productTypes.map(type => (
            // using type.code ("TSH") for the value, and type.name ("Tee") for display
            <option key={type.code} value={type.code}>
                {type.name}
            </option>
          ))}
        </select>

        {/* Size Input */}
        <input 
            type="text" 
            name="size" 
            placeholder="Size" 
            value={filters.size} 
            onChange={handleFilterChange} 
            style={{ ...inputStyle, minWidth: '80px', width: '100px' }} 
        />

        {/* Color Input */}
        <input 
            type="text" 
            name="color" 
            placeholder="Color" 
            value={filters.color} 
            onChange={handleFilterChange} 
            style={{ ...inputStyle, minWidth: '80px', width: '100px' }} 
        />
        
        {/* Reset */}
        <Button size="small" variant="secondary" onClick={handleReset}>
            Reset
        </Button>
      </div>

      {/*███████ TABLE ███████*/}
      <div style={{ overflowX: 'auto', background: theme === 'dark' ? '#1e1e1e' : '#fff', borderRadius: '8px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme === 'dark' ? '#eee' : '#333' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>SKU</th>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
              {/* Photo Cell */}
              <td style={{ padding: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '4px', 
                  overflow: 'hidden', 
                  border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                  backgroundColor: '#f9f9f9'
                }}>
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0].imageUrl : '/placeholder.jpg'} 
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </td>
              
              <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>{product.sku}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.title}</td>
              
              <td style={{ padding: '1rem' }}>
                <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: theme === 'dark' ? '#333' : '#f0f0f0' 
                }}>
                    {product.category?.name || 'Uncategorized'}
                </span>
              </td>

              <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{formatCurrency(product.price)}</td>
              <td style={{ padding: '1rem' }}>
                {product.stockQuantity === 0 ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>Out of Stock</span>
                ) : (
                    <span>{product.stockQuantity}</span>
                )}
              </td>
              <td style={{ padding: '1rem' }}>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                >
                  Edit
                </Button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && !loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                <p>No products match your filters.</p>
                <Button size="small" variant="secondary" onClick={handleReset} style={{ marginTop: '1rem' }}>
                    Clear Filters
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;