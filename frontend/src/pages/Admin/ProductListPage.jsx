import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/product';
import { categoryApi } from '../../api/category';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import Button from '../../components/Global/Button';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import { formatCurrency } from '../../utils/formatters';


const ProductListPage = () => {
  const styles = getThemeStyles(useTheme());

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

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      if ((p.name || '').toLowerCase().includes(q)) return true;
      if ((p.productType || '').toLowerCase().includes(q)) return true;
      if ((p.themeCode || '').toLowerCase().includes(q)) return true;
      if ((p.designCode || '').toLowerCase().includes(q)) return true;
      return (p.variants || []).some((v) => (v.sku || '').toLowerCase().includes(q));
    });
  }, [products, searchQuery]);

  const sortSelectValue = useMemo(() => {
    if (filters.sortBy === 'name' && filters.sortDir === 'asc') return 'name_asc';
    if (filters.sortBy === 'name' && filters.sortDir === 'desc') return 'name_desc';
    if (filters.sortBy === 'id' && filters.sortDir === 'asc') return 'oldest';
    return 'newest';
  }, [filters.sortBy, filters.sortDir]);

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
    
    if (minPrice === maxPrice) return formatCurrency(minPrice);
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
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


  const retryFetch = () => {
    setError(null);
    setFilters((prev) => ({ ...prev }));
  };

  if (loading && products.length === 0) return <AdminLoading styles={styles} message="Loading inventory..." />;
  if (error) return <Error message={error} onRetry={retryFetch} />;

  const listSubtitle = searchQuery.trim()
    ? `${filteredProducts.length} of ${products.length} products match this search.`
    : `${products.length} product${products.length === 1 ? '' : 's'}`;

  return (
    <div className={`${styles.pageContent} ${styles.pageContentProductAaa}`.trim()}>
      <PageHeader
        className={styles.productsIndexPageHeader}
        title="Products"
        subtitle={listSubtitle}
        subtitleClassName={styles.subtitleAaa}
        actions={
          <Link className={`${styles.actionLink} ${styles.buttonPrimary}`.trim()} to="/admin/products/new">
            Add product
          </Link>
        }
      />

      <div className={styles.productsIndexPanel} role="search" aria-label="Filter and browse products">
        <div className={styles.productsIndexSearchBlock}>
          <label htmlFor="products-index-search" className={styles.productsIndexSearchLabel}>
            Search catalog
          </label>
          <p className={styles.productsIndexSearchHint} id="products-index-search-hint">
            Filter this list by product name, variant SKU, theme code, or design code. Matches are instant on the
            current result set.
          </p>
          <input
            id="products-index-search"
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.productsIndexSearchInput}
            placeholder="e.g. SKU, name, BIRD, 001"
            autoComplete="off"
            aria-describedby="products-index-search-hint"
          />
        </div>
        <div
          className={`${styles.filterToolbar} ${styles.productsIndexFilters}`.trim()}
        >

        {/* Sorting */}
        <select
          className={styles.filterInput}
          onChange={handleSortChange}
          value={sortSelectValue}
          aria-label="Sort order"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>

        {/* Availability */}
        <select
          name="availability"
          className={styles.filterInput}
          value={filters.availability}
          onChange={handleFilterChange}
          aria-label="Stock status"
        >
          <option value="">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>

        {/* Category Dropdown */}
        <select
          name="categoryId"
          className={styles.filterInput}
          value={filters.categoryId}
          onChange={handleFilterChange}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => {
            const count = categoryCounts[cat.name] ?? 0;
            return (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({count})
              </option>
            );
          })}
        </select>

        {/* Product Type Dropdown */}
        <select
          name="productType"
          className={styles.filterInput}
          value={filters.productType}
          onChange={handleFilterChange}
          aria-label="Product type"
        >
          <option value="">All types</option>
          {productTypes.map((type) => (
            <option key={type.code} value={type.code}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Size Dropdown */}
        <select
          name="size"
          className={styles.filterInput}
          value={filters.size}
          onChange={handleFilterChange}
          aria-label="Size"
        >
          <option value="">All sizes</option>
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

        <Button size="small" type="button" variant="secondary" onClick={handleReset}>
          Clear filters
        </Button>
        </div>

        <div className={styles.productsIndexTableShell}>
        <table className={styles.productTable}>
          <caption className="srOnly">Product inventory; use the first column to expand variant rows</caption>
          <thead>
            <tr className={styles.productTableHeader}>
              <th scope="col" className={`${styles.productTableCell} ${styles.productTableColExpand} ${styles.indexTableTh}`.trim()}>
                <span className="srOnly">Expand</span>
              </th>
              <th scope="col" className={`${styles.productTableCell} ${styles.indexTableTh}`.trim()}>Product</th>
              <th scope="col" className={`${styles.productTableCell} ${styles.indexTableTh} ${styles.indexTableThNarrow}`.trim()}>Status</th>
              <th scope="col" className={`${styles.productTableCell} ${styles.indexTableTh}`.trim()}>Category</th>
              <th scope="col" className={`${styles.productTableCell} ${styles.indexTableTh}`.trim()}>Inventory</th>
              <th scope="col" className={`${styles.productTableCell} ${styles.indexTableTh} ${styles.indexTableThRight}`.trim()}>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const totalStock = calculateStock(product);
              const isExpanded = expandedProductIds.has(product.id);
              const variants = product.variants || [];
              const outOfStockVariants = variants.filter(
                (v) => (v.inventory?.stockQuantity || 0) === 0
              );
              return (
                <React.Fragment key={product.id}>
                <tr
                  className={`${styles.productTableRow} ${styles.productIndexRow}`.trim()}
                >
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
                    <div className={styles.indexProductCell}>
                      <div className={styles.indexProductThumbBox}>
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0].imageUrl
                              : '/placeholder.jpg'
                          }
                          alt=""
                          className={styles.indexProductThumb}
                        />
                      </div>
                      <div className={styles.indexProductText}>
                        <Link
                          className={styles.indexProductTitleLink}
                          to={`/admin/products/${product.id}`}
                        >
                          {product.name}
                        </Link>
                        <p className={styles.indexProductMeta}>
                          <span>{product.productType || '—'}</span>
                          {product.themeCode ? <span> · Theme {product.themeCode}</span> : null}
                          {product.designCode ? <span> · Design {product.designCode}</span> : null}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className={styles.productTableCell}>
                    <span className={styles.indexStatusPill}>Active</span>
                  </td>

                  <td className={styles.productTableCell}>
                    <span className={styles.indexCategoryText}>
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>

                  <td className={styles.productTableCell}>
                    <div className={styles.indexInventoryBlock}>
                      {totalStock === 0 ? (
                        <span className={styles.textErrorWithIcon}>Out of stock</span>
                      ) : (
                        <span className={styles.indexInventoryPrimary}>
                          {totalStock} in stock
                        </span>
                      )}
                      {variants.length > 0 && (
                        <span className={styles.indexInventorySub}>
                          {variants.length} variant{variants.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    className={`${styles.productTableCell} ${styles.tableCellMono} ${styles.tableCellStrong} ${styles.indexTableCellNum}`.trim()}
                  >
                    {getPriceDisplay(product)}
                  </td>

                </tr>
                {isExpanded && variants.length > 0 && (
                  <tr className={styles.productTableRow}>
                    <td colSpan={6} className={`${styles.productTableCell} ${styles.productNestedCell}`.trim()}>
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
                                      <span className={styles.textErrorWithIcon}>Out of stock</span>
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
                  <Button size="small" type="button" variant="secondary" onClick={handleReset}>
                      Clear filters
                  </Button>
                </div>
            </div>
        )}
        {filteredProducts.length === 0 && products.length > 0 && !loading && (
            <div className={styles.emptyState}>
                <p>No products match this search. Try a different name, SKU, or code.</p>
                <div className={styles.emptyStateActions}>
                  <Button size="small" type="button" variant="secondary" onClick={() => setSearchQuery('')}>
                      Clear search
                  </Button>
                </div>
            </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
