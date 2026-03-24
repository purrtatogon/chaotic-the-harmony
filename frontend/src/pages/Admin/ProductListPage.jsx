import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';
import { formatCurrency } from '../../utils/formatters';


const ProductListPage = () => {
  const styles = getThemeStyles(useTheme());
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // For category counts
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
    size: ''
  });

  // Expanded product rows (show variants)
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  const toggleExpanded = (productId) => {
    setExpandedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Fetch Dropdown Data (Categories AND Types) and All Products on Mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [cats, types, allProds] = await Promise.all([
          categoryApi.getAll(),
          productApi.getTypes(),
          productApi.getAll({}) // Fetch all products for category counts
        ]);
        setCategories(cats);
        setProductTypes(types);
        setAllProducts(allProds);
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

    if (value === 'name_asc') sortConfig = { sortBy: 'name', sortDir: 'asc' };
    if (value === 'name_desc') sortConfig = { sortBy: 'name', sortDir: 'desc' };
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
      size: ''
    });
  };

  const calculateStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((acc, v) => acc + (v.inventory?.stockQuantity || 0), 0);
  };

  const getPriceDisplay = (product) => {
    if (!product.variants || product.variants.length === 0) return 'N/A';
    
    // Filter to only EUR prices
    const eurPrices = product.variants.flatMap(v => 
      Array.from(v.prices || [])
        .filter(p => p.currencyCode === 'EUR')
        .map(p => p.amount)
    );
    
    if (eurPrices.length === 0) return 'N/A';
    
    const minPrice = Math.min(...eurPrices);
    const maxPrice = Math.max(...eurPrices);
    
    if (minPrice === maxPrice) return formatCurrency(minPrice, 'EUR');
    return `${formatCurrency(minPrice, 'EUR')} - ${formatCurrency(maxPrice, 'EUR')}`;
  };

  // Calculate product count per category (using all products, not filtered)
  const getCategoryCounts = () => {
    const counts = {};
    allProducts.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized';
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();


  if (loading && products.length === 0) return <Loading message="Loading inventory..." />;
  if (error) return <Error message={error} />;

  return (
    <div className={styles.pageContent}>
      <PageHeader 
        title="Products" 
        subtitle="Manage your inventory"
      />

      {/*███████ CATEGORY BANNER ███████*/}
      <div className={styles.categorySummaryBanner}>
        <div className={styles.categorySummaryInner}>
          <span className={styles.categorySummaryLabel}>Categories</span>
          {categories.length > 0 ? (
            categories.map(cat => {
              const count = categoryCounts[cat.name] || 0;
              // Determine badge class based on category name
              let badgeClass = styles.categoryBadge;
              if (cat.name === 'Music') {
                badgeClass = styles.categoryBadgeMusic;
              } else if (cat.name === 'Apparel') {
                badgeClass = styles.categoryBadgeApparel;
              } else if (cat.name === 'Accessories') {
                badgeClass = styles.categoryBadgeAccessories;
              }
              
              return (
                <span 
                  key={cat.id}
                  className={badgeClass}
                >
                  {cat.name} ({count})
                </span>
              );
            })
          ) : (
            <span className={styles.categorySummaryEmpty}>No categories available</span>
          )}
          {categoryCounts['Uncategorized'] > 0 && (
            <span 
              className={styles.categoryBadge}
            >
              Uncategorized ({categoryCounts['Uncategorized']})
            </span>
          )}
        </div>
      </div>

      {/*███████ ADD PRODUCT BUTTON ███████*/}
      <div className={styles.pageActionBar}>
        <Button variant="primary" onClick={() => navigate('/admin/products/new')}>
          + Add New Product
        </Button>
      </div>

      {/*███████ FILTER TOOLBAR ███████*/}
      <div className={styles.filterToolbar}>
        
        {/* Sorting */}
        <select className={styles.filterInput} onChange={handleSortChange} defaultValue="newest">
          <option value="newest">NEWEST FIRST</option>
          <option value="oldest">OLDEST FIRST</option>
          <option value="name_asc">NAME (A-Z)</option>
          <option value="name_desc">NAME (Z-A)</option>
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
            <option key={type.code} value={type.code}>
              {type.name.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Size Dropdown */}
        <select name="size" className={styles.filterInput} value={filters.size} onChange={handleFilterChange}>
          <option value="">ALL SIZES</option>
          <option value="XXS">XXS</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="2XL">2XL</option>
          <option value="3XL">3XL</option>
          <option value="4XL">4XL</option>
          <option value="5XL">5XL</option>
          <option value="SML">SML</option>
          <option value="MED">MED</option>
          <option value="LRG">LRG</option>
          <option value="OS">OS</option>
          <option value="STD">STD</option>
        </select>

        {/* Reset */}
        <Button size="small" variant="secondary" onClick={handleReset}>
            Reset
        </Button>
      </div>

      {/*███████ TABLE ███████*/}
      <div className={styles.tableContainer}>
        <table className={styles.productTable}>
          <caption className="srOnly">Product inventory with expandible variant rows</caption>
          <thead>
            <tr className={styles.productTableHeader}>
              <th scope="col" className={`${styles.productTableCell} ${styles.productTableColExpand}`.trim()} />
              <th scope="col" className={styles.productTableCell}>Image</th>
              <th scope="col" className={styles.productTableCell}>Name</th>
              <th scope="col" className={styles.productTableCell}>Codes</th>
              <th scope="col" className={styles.productTableCell}>Category</th>
              <th scope="col" className={styles.productTableCell}>Price</th>
              <th scope="col" className={styles.productTableCell}>Total Stock</th>
              <th scope="col" className={styles.productTableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const totalStock = calculateStock(product);
              const isExpanded = expandedProductIds.has(product.id);
              const variants = product.variants || [];
              const outOfStockVariants = variants.filter(v => (v.inventory?.stockQuantity || 0) === 0);
              return (
                <React.Fragment key={product.id}>
                <tr className={styles.productTableRow}>
                  <td className={`${styles.productTableCell} ${styles.productTableCellMiddle}`.trim()}>
                    {variants.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(product.id)}
                        className={`${styles.button} ${styles.expandRowToggle}`.trim()}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse variants' : 'Expand variants'}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </td>
                  <td className={styles.productTableCell}>
                    <div className={styles.productImageContainer}>
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0].imageUrl : '/placeholder.jpg'} 
                        alt={product.name}
                        className={styles.productImage}
                      />
                    </div>
                  </td>
                  
                  <td className={`${styles.productTableCell} ${styles.tableCellStrong}`.trim()}>{product.name}</td>
                  
                  <td className={styles.productTableCell}>
                    <div className={styles.productCodesStack}>
                      <span><span className={styles.textMuted}>Type:</span> {product.productType}</span>
                      <span><span className={styles.textMuted}>Theme:</span> {product.themeCode}</span>
                      <span><span className={styles.textMuted}>Design:</span> {product.designCode}</span>
                    </div>
                  </td>
                  
                  <td className={styles.productTableCell}>
                    {(() => {
                      const categoryName = product.category?.name || 'Uncategorized';
                      let badgeClass = styles.categoryBadge;
                      if (categoryName === 'Music') {
                        badgeClass = styles.categoryBadgeMusic;
                      } else if (categoryName === 'Apparel') {
                        badgeClass = styles.categoryBadgeApparel;
                      } else if (categoryName === 'Accessories') {
                        badgeClass = styles.categoryBadgeAccessories;
                      }
                      return (
                        <span className={badgeClass}>
                          {categoryName}
                        </span>
                      );
                    })()}
                  </td>

                  <td className={`${styles.productTableCell} ${styles.tableCellMono} ${styles.tableCellStrong}`.trim()}>
                    {getPriceDisplay(product)}
                  </td>
                  
                  <td className={styles.productTableCell}>
                    {totalStock === 0 ? (
                        <span className={styles.textError}>Out of Stock</span>
                    ) : (
                        <span>{totalStock} units</span>
                    )}
                  </td>
                  
                  <td className={styles.productTableCell}>
                    <div className={styles.flexRow}>
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
                {isExpanded && variants.length > 0 && (
                  <tr className={styles.productTableRow}>
                    <td colSpan={8} className={`${styles.productTableCell} ${styles.productNestedCell}`.trim()}>
                      <div className={styles.productNestedInner}>
                        <div className={styles.productNestedTitle}>Variants</div>
                        <table className={styles.productNestedTable}>
                          <caption className="srOnly">Variants for {product.name}</caption>
                          <thead>
                            <tr className={styles.productNestedTheadRow}>
                              <th scope="col" className={styles.productNestedTh}>SKU</th>
                              <th scope="col" className={styles.productNestedTh}>Size</th>
                              <th scope="col" className={styles.productNestedTh}>Variant Code</th>
                              <th scope="col" className={`${styles.productNestedTh} ${styles.productNestedThRight}`.trim()}>Stock</th>
                              <th scope="col" className={styles.productNestedTh}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v) => {
                              const qty = v.inventory?.stockQuantity ?? 0;
                              const isOut = qty === 0;
                              return (
                                <tr key={v.id} className={styles.productNestedBodyRow}>
                                  <td className={`${styles.productNestedTd} ${styles.productNestedTdMono}`.trim()}>{v.sku || '—'}</td>
                                  <td className={styles.productNestedTd}>{v.size || '—'}</td>
                                  <td className={styles.productNestedTd}>{v.variantCode || '—'}</td>
                                  <td className={`${styles.productNestedTd} ${styles.productNestedStockCell}`.trim()}>{qty} units</td>
                                  <td className={styles.productNestedTd}>
                                    {isOut ? (
                                      <span className={styles.textError}>Out of stock</span>
                                    ) : (
                                      <span className={styles.stockStatusOk}>In stock</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {outOfStockVariants.length > 0 && (
                          <div className={styles.productNestedFootnote}>
                            {outOfStockVariants.length} variant{outOfStockVariants.length !== 1 ? 's' : ''} out of stock
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
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
