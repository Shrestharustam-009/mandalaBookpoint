'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          localStorage.removeItem('cart');
        }
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = (book, quantity = 1) => {
    const hasPrice = book.price != null && book.price > 0;
    const inStock = (book.stock ?? 0) > 0;
    if (!hasPrice || !inStock) return;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === book.id);
      const maxQty = existingItem ? (existingItem.quantity + quantity) : quantity;
      if (maxQty > (book.stock ?? 0)) return prev;

      if (existingItem) {
        return prev.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          discount: book.discount || 0,
          stock: book.stock,
          weight: book.weight ?? 0,
          coverImage: book.coverImage,
          quantity: quantity,
        }];
      }
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems(prev => prev.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id !== bookId) return item;
        const maxQty = item.stock != null ? Math.min(quantity, item.stock) : quantity;
        return { ...item, quantity: maxQty };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price ?? 0;
      if (price <= 0) return total;
      const itemPrice = item.discount > 0
        ? price * (1 - item.discount / 100)
        : price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
