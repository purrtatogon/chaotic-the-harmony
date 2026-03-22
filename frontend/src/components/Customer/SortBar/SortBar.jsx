import styles from '../../../styles/themes/customer.module.css';

const SORT_OPTIONS = [
  { value: 'id', label: 'Latest' },
  { value: 'name', label: 'Name' },
];

const DIR_OPTIONS = [
  { value: 'asc', label: 'A\u2013Z / Oldest first' },
  { value: 'desc', label: 'Z\u2013A / Newest first' },
];

const SortBar = ({ sortBy, sortDir, onSortChange }) => {
  const handleSortByChange = (e) => {
    onSortChange({ sortBy: e.target.value, sortDir });
  };

  const handleSortDirChange = (e) => {
    onSortChange({ sortBy, sortDir: e.target.value });
  };

  return (
    <div role="group" aria-label="Sort products" className={styles.bar}>
      <div className={styles.control}>
        <label htmlFor="sort-by" className={styles.label}>
          Sort by
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortByChange}
          className={styles.select}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.control}>
        <label htmlFor="sort-dir" className={styles.label}>
          Direction
        </label>
        <select
          id="sort-dir"
          value={sortDir}
          onChange={handleSortDirChange}
          className={styles.select}
        >
          {DIR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortBar;
