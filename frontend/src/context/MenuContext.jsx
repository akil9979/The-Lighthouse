import { createContext, useContext, useState, useCallback } from 'react';
import { getMenuItems } from '../api/menuApi';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMenuItems(params);
      setItems(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a single item in place (used after admin toggle)
  const updateItem = (updatedItem) => {
    setItems((prev) => prev.map((i) => (i._id === updatedItem._id ? updatedItem : i)));
  };

  return (
    <MenuContext.Provider value={{ items, loading, error, fetchMenu, updateItem, setItems }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
};
