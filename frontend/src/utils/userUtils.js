export const BACKLINE_FLOURISHES = Object.freeze({
  ADMIN: 'System Master. All levels balanced.',
  MANAGER: 'Stage Manager. Inventory is tuned.',
  SUPPORT: 'Crisis Control. Resolving the static.',
  STAFF: 'Roadie. Moving the merch.',
  AUDITOR: 'Tech Inspector. Watching the signal.',
});

export const getAvatarUrl = (name) => {
  if (!name) return 'https://ui-avatars.com/api/?name=User&background=random&color=fff';

  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};

export const getCurrentUserRole = () => {
  if (typeof localStorage === 'undefined') return '';
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const key = isAdmin ? 'admin_userRole' : 'customer_userRole';
  const raw = localStorage.getItem(key) || '';
  if (!raw) return '';
  return raw.replace(/^ROLE_/i, '');
};

export const canManageUsers = () => getCurrentUserRole() === 'ADMIN';

export const canEditSiteContent = () => {
  const r = getCurrentUserRole();
  return r === 'ADMIN' || r === 'MANAGER';
};

export const canEditCustomersOnly = () => getCurrentUserRole() === 'SUPPORT';

export const canEditUser = (targetUser) => {
  const role = getCurrentUserRole();
  if (role === 'ADMIN') return true;
  if (role === 'SUPPORT' && getRoleDisplayName(targetUser?.role) === 'CUSTOMER') return true;
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
    r === 'ADMIN' ? styles.roleBadgeAdmin :
    r === 'MANAGER' ? styles.roleBadgeManager :
    r === 'STAFF' ? styles.roleBadgeWarehouse :
    r === 'SUPPORT' ? styles.roleBadgeSupport :
    r === 'AUDITOR' ? styles.roleBadgeAuditor :
    r === 'CUSTOMER' ? styles.roleBadgeCustomer :
    styles.roleBadgeStaff;
  return `${base} ${variant}`.trim();
};
