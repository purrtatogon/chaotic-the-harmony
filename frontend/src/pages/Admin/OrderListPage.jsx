import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/PageHeader';
import ItemDetailCard from '../../components/ItemDetailCard';

const OrderListPage = () => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={styles.pageContent}>
      <PageHeader title="Orders" subtitle="Manage Customer Orders" />
      
      <ItemDetailCard fullWidth>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Maintenance in Progress</h2>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Sorry, we're currently doing some maintenance! Check back again in a few minutes.
          </p>
        </div>
      </ItemDetailCard>
    </div>
  );
};

export default OrderListPage;
