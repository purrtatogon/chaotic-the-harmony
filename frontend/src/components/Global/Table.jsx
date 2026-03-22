import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const Table = ({ columns, data, renderRow, actions, caption }) => {
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <table className={styles.table}>
      {caption ? <caption className={styles.tableCaption}>{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} scope="col">
              {col}
            </th>
          ))}
          {actions && (
            <th scope="col">
              Actions
            </th>
          )}
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
