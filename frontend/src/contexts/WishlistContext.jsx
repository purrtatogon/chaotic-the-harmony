import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../api/product';

/** Per-email localStorage + one-time seeded lists for demo accounts (polling catches login churn). */

const WishlistContext = createContext(null);

const DEMO_EMAILS = {
  TROY: 't.barnes@greendale.edu',
  DEWEY: 'd.wilkerson@luckyaid.com',
  BARBARA: 'b.howard@abbott.edu',
};

const SEEDED_FLAG_PREFIX = 'wishlist_seeded_';

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, items: action.payload };
    case 'ADD':
      if (state.items.some((i) => i.productId === action.payload.productId)) return state;
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.payload) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

function getStorageKey() {
  const email = localStorage.getItem('customer_email');
  return email ? `wishlist_${email}` : 'wishlist';
}

function getInitialState() {
  try {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function toWishlistItem(product) {
  return {
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl || '',
    price: product.basePrice || product.price || 0,
  };
}

async function buildDemoWishlist(email) {
  try {
    const products = await productApi.getAll({ status: 'ACTIVE' });
    if (!products || products.length === 0) return null;

    if (email === DEMO_EMAILS.TROY) {
      return products.map(toWishlistItem);
    }

    if (email === DEMO_EMAILS.DEWEY) {
      const count = Math.max(Math.floor(products.length * 0.75), Math.min(products.length, 10));
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).map(toWishlistItem);
    }

    if (email === DEMO_EMAILS.BARBARA) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).map(toWishlistItem);
    }

    return null;
  } catch {
    return null;
  }
}

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, getInitialState);
  const prevEmailRef = useRef(localStorage.getItem('customer_email'));

  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentEmail = localStorage.getItem('customer_email');
      if (currentEmail !== prevEmailRef.current) {
        prevEmailRef.current = currentEmail;

        if (!currentEmail) {
          dispatch({ type: 'SET', payload: [] });
          return;
        }

        const key = `wishlist_${currentEmail}`;
        try {
          const stored = localStorage.getItem(key);
          dispatch({ type: 'SET', payload: stored ? JSON.parse(stored).items || [] : [] });
        } catch {
          dispatch({ type: 'SET', payload: [] });
        }

        const seededKey = `${SEEDED_FLAG_PREFIX}${currentEmail}`;
        if (!localStorage.getItem(seededKey) && Object.values(DEMO_EMAILS).includes(currentEmail)) {
          buildDemoWishlist(currentEmail).then((items) => {
            if (items) {
              dispatch({ type: 'SET', payload: items });
              localStorage.setItem(seededKey, '1');
            }
          });
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('customer_email');
    if (!email) return;
    const seededKey = `${SEEDED_FLAG_PREFIX}${email}`;
    if (!localStorage.getItem(seededKey) && Object.values(DEMO_EMAILS).includes(email)) {
      buildDemoWishlist(email).then((items) => {
        if (items) {
          dispatch({ type: 'SET', payload: items });
          localStorage.setItem(seededKey, '1');
        }
      });
    }
  }, []);

  const addToWishlist = useCallback((product) => {
    dispatch({
      type: 'ADD',
      payload: {
        productId: product.id || product.productId,
        name: product.name || product.productName,
        imageUrl: product.imageUrl || '',
        price: product.price || 0,
      },
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    dispatch({ type: 'REMOVE', payload: productId });
  }, []);

  const isInWishlist = useCallback(
    (productId) => state.items.some((i) => i.productId === productId),
    [state.items]
  );

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    items: state.items,
    count: state.items.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
