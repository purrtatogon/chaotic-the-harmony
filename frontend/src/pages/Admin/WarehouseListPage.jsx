import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/product';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ListContainer from '../../components/Admin/ListContainer';
import Table from '../../components/Global/Table';
import StatCard from '../../components/Admin/StatCard';
import Button from '../../components/Global/Button';
import Loading from '../../components/Global/Loading';
import Error from '../../components/Global/Error';

const WarehouseListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // We'll fetch all products and extract inventory info from variants
        const products = await productApi.getAll();
        const zones = {};

        products.forEach(product => {
          product.variants?.forEach(variant => {
            const loc = variant.inventory?.stockLocation || 'Unassigned';
            if (!zones[loc]) {
              zones[loc] = {
                zone: loc,
                totalItems: 0,
                uniqueProducts: new Set(),
                stockCount: 0
              };
            }
            zones[loc].totalItems += 1;
            zones[loc].uniqueProducts.add(product.id);
            zones[loc].stockCount += (variant.inventory?.stockQuantity || 0);
          });
        });

        setInventory(Object.values(zones).sort((a, b) => a.zone.localeCompare(b.zone)));
      } catch (err) {
        setError(err.message || 'Failed to load warehouse data');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) return <Loading message="Accessing Central Warehouse records..." />;
  if (error) return <Error message={error} />;

  const totalStock = inventory.reduce((acc, curr) => acc + curr.stockCount, 0);
  const activeZones = inventory.length;

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Central Warehouse" subtitle="Helsinki Distribution Center" />

      <div className={styles.statsGrid}>
        <StatCard value={totalStock} label="Total Units in Hub" />
        <StatCard value={activeZones} label="Active Storage Zones" />
      </div>

      <ListContainer title="Storage Zones" count={activeZones}>
        <Table
          caption="Warehouse zones and stock summary"
          columns={['Zone ID', 'Unique Products', 'Total Variants', 'Available Stock', 'Actions']}
          data={inventory}
          renderRow={(item) => [
            <td key="zone" className={styles.tableCellStrong}>{item.zone}</td>,
            <td key="products">{item.uniqueProducts.size} Products</td>,
            <td key="variants">{item.totalItems} Variants</td>,
            <td key="stock" className={styles.tableCellMono}>{item.stockCount} units</td>,
            <td key="actions">
              <Button 
                size="small" 
                variant="secondary"
                onClick={() => navigate(`/admin/warehouses/${encodeURIComponent(item.zone)}`)}
              >
                View Details
              </Button>
            </td>
          ]}
        />
      </ListContainer>

      <div className={styles.pageSectionSpaced}>
        <ItemDetailCard title="Warehouse Map Overview">
          <p className={styles.warehouseInfoText}>
            All operations are centralized in our Helsinki hub. Stock is organized into alphanumeric zones (e.g., Zone-C-01 for CD/Music media).
          </p>
        </ItemDetailCard>
      </div>
    </div>
  );
};

export default WarehouseListPage;
