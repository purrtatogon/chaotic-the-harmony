import styles from '../../../styles/themes/customer.module.css';

const CategoryNav = ({ categories = [], selectedCategoryId, onCategoryChange }) => {
  return (
    <nav aria-label="Filter by category" className={styles.nav}>
      <ul role="list" className={styles.list}>
        <li>
          <button
            type="button"
            className={`${styles.pill} ${!selectedCategoryId ? styles.pillActive : ''}`}
            aria-pressed={!selectedCategoryId}
            onClick={() => onCategoryChange(null)}
          >
            All
          </button>
        </li>
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === String(cat.id);
          return (
            <li key={cat.id}>
              <button
                type="button"
                className={`${styles.pill} ${isSelected ? styles.pillActive : ''}`}
                aria-pressed={isSelected}
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryNav;
