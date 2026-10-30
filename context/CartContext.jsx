import { createContext, useContext, useState, useMemo } from "react";
import { getMealPrice } from "../utils/price";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (meal, quantity = 1) => {
    if (!meal || !meal.id) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => String(item.id) === String(meal.id));
      const price = meal.price || getMealPrice(meal.id);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          id: String(meal.id),
          title: meal.title || meal.strMeal || "Delicious Dish",
          image: meal.image || meal.strMealThumb || "",
          category: meal.category || meal.strCategory || "Main",
          price: Number(price),
          quantity: Math.max(1, quantity),
        },
      ];
    });
  };

  const removeFromCart = (mealId) => {
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== String(mealId)));
  };

  const updateQuantity = (mealId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(mealId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.id) === String(mealId)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    const sum = cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
    return Number(sum.toFixed(2));
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= 50 ? 0 : 3.99;
  }, [cart, cartSubtotal]);

  const cartTotal = useMemo(() => {
    if (cart.length === 0) return 0;
    return Number((cartSubtotal + deliveryFee).toFixed(2));
  }, [cart, cartSubtotal, deliveryFee]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
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
