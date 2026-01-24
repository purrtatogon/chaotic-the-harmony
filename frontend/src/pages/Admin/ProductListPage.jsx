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
  const styles = getThemeStyles(useTheme());
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


  if (loading && products.length === 0) return <Loading message="Loading inventory..." />;
  if (error) return <Error message={error} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title="Products" 
        subtitle="Manage your inventory"
        actions={
          <div className={styles.flexRow}>
            <Button variant="primary" onClick={() => navigate('/admin/products/new')}>
              + Add New Product
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/categories')}>
              Manage Categories
            </Button>
          </div>
        }
      />

      {/*███████ FILTER TOOLBAR ███████*/}
      <div className={styles.filterToolbar}>
        
        {/* Sorting */}
        <select className={styles.filterInput} onChange={handleSortChange} defaultValue="newest">
          <option value="newest">NEWEST FIRST</option>
          <option value="oldest">OLDEST FIRST</option>
          <option value="price_asc">PRICE: LOW TO HIGH</option>
          <option value="price_desc">PRICE: HIGH TO LOW</option>
        </select>

        {/* Availability */}
        <select name="availability" className={styles.filterInput} value={filters.availability} onChange={handleFilterChange}>
          <option value="">ALL STOCK STATUS</option>
          <option value="in_stock">IN STOCK</option>
          <option value="out_of_stock">OUT OF STOCK</option>
        </select>

        {/* Category Dropdown */}
        <select name="categoryId" className={styles.filterInput} value={filters.categoryId} onChange={handleFilterChange}>
          <option value="">ALL CATEGORIES</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
          ))}
        </select>

        {/* Product Type Dropdown */}
        <select name="productType" className={styles.filterInput} value={filters.productType} onChange={handleFilterChange}>
          <option value="">ALL PRODUCT TYPES</option>
          {productTypes.map(type => (
            // using type.code ("TSH") for the value, and type.name ("Tee") for display
            <option key={type.code} value={type.code}>
                {type.name.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Size Input */}
        <input 
            type="text" 
            name="size" 
            placeholder="SIZE" 
            value={filters.size} 
            onChange={handleFilterChange} 
            className={`${styles.filterInput} ${styles.filterInputSmall}`}
        />

        {/* Color Input */}
        <input 
            type="text" 
            name="color" 
            placeholder="COLOR" 
            value={filters.color} 
            onChange={handleFilterChange} 
            className={`${styles.filterInput} ${styles.filterInputSmall}`}
        />
        
        {/* Reset */}
        <Button size="small" variant="secondary" onClick={handleReset}>
            Reset
        </Button>
      </div>

      {/*███████ TABLE ███████*/}
      <div className={styles.tableContainer}>
        <table className={styles.productTable}>
          <thead>
            <tr className={styles.productTableHeader}>
              <th className={styles.productTableCell}>Image</th>
              <th className={styles.productTableCell}>SKU</th>
              <th className={styles.productTableCell}>Title</th>
              <th className={styles.productTableCell}>Category</th>
              <th className={styles.productTableCell}>Price</th>
              <th className={styles.productTableCell}>Stock</th>
              <th className={styles.productTableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={styles.productTableRow}>
              {/* Photo Cell */}
              <td className={styles.productTableCell}>
                <div className={styles.productImageContainer}>
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0].imageUrl : '/placeholder.jpg'} 
                    alt={product.title}
                    className={styles.productImage}
                  />
                </div>
              </td>
              
              <td className={`${styles.productTableCell} ${styles.textMuted}`} style={{ fontSize: '0.9rem' }}>{product.sku}</td>
              <td className={styles.productTableCell} style={{ fontWeight: 'bold' }}>{product.title}</td>
              
              <td className={styles.productTableCell}>
                <span className={styles.categoryBadge}>
                    {product.category?.name || 'Uncategorized'}
                </span>
              </td>

              <td className={styles.productTableCell} style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{formatCurrency(product.price)}</td>
              <td className={styles.productTableCell}>
                {product.stockQuantity === 0 ? (
                    <span className={styles.textError}>Out of Stock</span>
                ) : (
                    <span>{product.stockQuantity}</span>
                )}
              </td>
              <td className={styles.productTableCell}>
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
            <div className={styles.emptyState}>
                <p>No products match your filters.</p>
                <div className={styles.emptyStateActions}>
                  <Button size="small" variant="secondary" onClick={handleReset}>
                      Clear Filters
                  </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;