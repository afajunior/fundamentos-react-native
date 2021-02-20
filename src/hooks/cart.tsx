import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem("cartItems");
      if(data) setProducts(JSON.parse(data));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const item = products.find((item) => item.id===product.id)
    if(item) {
      item.quantity++;
      setProducts([...products]);
    } else {
      setProducts([...products, {...product, quantity: 1}]);
    }
    await AsyncStorage.setItem("cartItems", JSON.stringify(products));  
  }, [products]);

  const increment = useCallback(async id => {
    const product = products.find(el => el.id===id);
    if(product) {
      product.quantity++;
      await AsyncStorage.setItem("cartItems", JSON.stringify(products));
      setProducts([...products])
    }
  }, [products]);

  const decrement = useCallback(async id => {
    const product = products.find(el => el.id===id);
    if(product?.quantity) {
      product.quantity--;
      await AsyncStorage.setItem("cartItems", JSON.stringify(products));
      setProducts([...products])
    }
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
