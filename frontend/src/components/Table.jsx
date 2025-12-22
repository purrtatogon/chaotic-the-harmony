import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const Table = ({ columns, data, renderRow, actions }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);
  
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col}</th>
          ))}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {renderRow(row, rowIndex)}
            {actions && <td>{actions(row, rowIndex)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
