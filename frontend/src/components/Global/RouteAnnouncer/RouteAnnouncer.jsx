import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// After each route change: scroll (or hash target), focus #main-content, announce page title for AT.
const ROUTE_NAMES = {
  '/': 'Home',
  '/store': 'Store',
  '/about': 'About',
  '/shipping': 'Shipping',
  '/faq': 'FAQ',
  '/login': 'Sign in',
  '/signup': 'Sign up',
  '/cart': 'Cart',
  '/music': 'Music',
  '/music/albums': 'Albums',
  '/music/eps': 'EPs',
  '/media': 'Media',
  '/media/videos': 'Videos',
  '/media/pics': 'Photos',
  '/tour': 'Tour Dates',
  '/news': 'Latest News',
  '/admin': 'Admin Dashboard',
  '/admin/login': 'Admin Sign in',
  '/admin/users': 'Users',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/warehouses': 'Warehouses',
};

function getPageName(pathname) {
  if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];
  if (pathname.startsWith('/store/collection/')) return 'Collection';
  if (pathname.startsWith('/products/')) return 'Product details';
  if (/\/admin\/users\/[^/]+\/edit$/.test(pathname)) return 'Edit user';
  if (pathname.startsWith('/admin/users/')) return 'User details';
  if (pathname.startsWith('/admin/products/')) return 'Product details';
  if (pathname.startsWith('/admin/orders/')) return 'Order details';
  if (pathname.startsWith('/admin/warehouses/')) return 'Warehouse details';
  return 'Page';
}

const RouteAnnouncer = () => {
  const { pathname, hash } = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useLayoutEffect(() => {
    if (hash) {
      /* Scroll to the hash element (e.g. #shop when coming from Store nav) */
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }

    /* Focus the main landmark — preventScroll preserves the hash-scroll position */
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });

    /* Clear then set so repeated navigation to the same route re-announces */
    setAnnouncement('');
    const raf = requestAnimationFrame(() => {
      setAnnouncement(`Navigated to ${getPageName(pathname)}`);
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return (
    <span
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="srOnly"
    >
      {announcement}
    </span>
  );
};

export default RouteAnnouncer;
