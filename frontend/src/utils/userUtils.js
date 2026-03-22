export const getAvatarUrl = (name) => {
  if (!name) return 'https://ui-avatars.com/api/?name=User&background=random&color=fff';

  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};

export const getCurrentUserRole = () => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userRole') : '';
  if (!raw) return '';
  return raw.replace(/^ROLE_/i, '');
};

export const canManageUsers = () => getCurrentUserRole() === 'SUPER_ADMIN';

export const canEditCustomersOnly = () => getCurrentUserRole() === 'SUPPORT_AGENT';

export const canEditUser = (targetUser) => {
  const role = getCurrentUserRole();
  if (role === 'SUPER_ADMIN') return true;
  if (role === 'SUPPORT_AGENT' && getRoleDisplayName(targetUser?.role) === 'CUSTOMER') return true;
  return false;
};

export const getRoleDisplayName = (role) => {
  if (!role) return '';
  return String(role).replace(/^ROLE_/i, '');
};

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
