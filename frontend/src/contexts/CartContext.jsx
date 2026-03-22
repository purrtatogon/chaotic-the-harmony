import { createContext, useContext, useReducer, useEffect } from 'react';

export const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.variantId === action.payload.variantId
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (action.payload.quantity || 1),
        };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.variantId !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.variantId !== variantId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        ),
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

function getInitialState() {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  /* Persist cart to localStorage on every change */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    items: state.items,
    itemCount,
    total,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (variantId) => dispatch({ type: 'REMOVE_ITEM', payload: variantId }),
    updateQuantity: (variantId, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
