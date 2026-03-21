import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.slug === action.payload.slug);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.slug === action.payload.slug
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload }],
      };
    }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.slug === action.payload.slug
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.slug !== action.payload.slug),
      };
    case "CLEAR_CART":
      return initialState;
    case "SET_CART":
      return {
        ...state,
        items: action.payload,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("scc_cart");
    if (saved) {
      dispatch({ type: "SET_CART", payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("scc_cart", JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      },
    });
  };

  const updateQuantity = (slug, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { slug, quantity } });
  };

  const removeItem = (slug) => {
    dispatch({ type: "REMOVE_ITEM", payload: { slug } });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 59;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [state.items]);

  const value = {
    items: state.items,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
