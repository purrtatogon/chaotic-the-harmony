import Card from '../Global/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const StatCard = ({ value, label }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  return (
    <Card className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </Card>
  );
};

export default StatCard;
