/**
 * Generates a ui-avatars.com URL for a given name.
 *
 * @param {string} name - The user's full name.
 * @returns {string} The avatar URL.
 */
export const getAvatarUrl = (name) => {
  if (!name) return 'https://ui-avatars.com/api/?name=User&background=random&color=fff';

  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};

/**
 * Normalized role string (backend may send "ROLE_SUPER_ADMIN" or "SUPER_ADMIN").
 * @returns {string} Role name without ROLE_ prefix, or empty string.
 */
export const getCurrentUserRole = () => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userRole') : '';
  if (!raw) return '';
  return raw.replace(/^ROLE_/i, '');
};

/** Can create/update/delete users (SUPER_ADMIN only). */
export const canManageUsers = () => getCurrentUserRole() === 'SUPER_ADMIN';

/** Can update customer profiles only (SUPPORT_AGENT). Edit button for customers. */
export const canEditCustomersOnly = () => getCurrentUserRole() === 'SUPPORT_AGENT';

/** Can edit this user: SUPER_ADMIN (any), or SUPPORT_AGENT (only if target is CUSTOMER). */
export const canEditUser = (targetUser) => {
  const role = getCurrentUserRole();
  if (role === 'SUPER_ADMIN') return true;
  if (role === 'SUPPORT_AGENT' && targetUser?.role === 'CUSTOMER') return true;
  return false;
};

/**
 * Normalize role for display (strip ROLE_ prefix).
 * @param {string} role - Raw role e.g. "ROLE_SUPER_ADMIN" or "SUPER_ADMIN"
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  if (!role) return '';
  return String(role).replace(/^ROLE_/i, '');
};

/**
 * Return the full className string for the role badge (roleBadge + roleBadge*).
 * Use with admin theme styles so SUPER_ADMIN etc. look the same on Users list, Sidebar, and Profile.
 * @param {object} styles - getThemeStyles(theme) from ThemeContext
 * @param {string} role - Raw role e.g. "ROLE_SUPER_ADMIN" or "SUPER_ADMIN"
 * @returns {string}
 */
export const getRoleBadgeClassName = (styles, role) => {
  if (!styles || !styles.roleBadge) return '';
  const r = getRoleDisplayName(role) || '';
  const base = styles.roleBadge;
  const variant =
    (r === 'SUPER_ADMIN' || r === 'ADMIN') ? styles.roleBadgeAdmin :
    (r === 'STORE_MANAGER' || r === 'MANAGER') ? styles.roleBadgeManager :
    (r === 'WAREHOUSE_STAFF' || r === 'WAREHOUSE') ? styles.roleBadgeWarehouse :
    (r === 'SUPPORT_AGENT' || r === 'SUPPORT') ? styles.roleBadgeSupport :
    r === 'AUDITOR' ? styles.roleBadgeAuditor :
    r === 'CUSTOMER' ? styles.roleBadgeCustomer :
    styles.roleBadgeStaff;
  return `${base} ${variant}`.trim();
};
