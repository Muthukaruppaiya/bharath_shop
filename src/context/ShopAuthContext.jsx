import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const ShopAuthContext = createContext();

export const useShopAuth = () => useContext(ShopAuthContext);

export const ShopAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shopToken');
    if (token) {
      fetchCustomer(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCustomer = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/online-auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomer(res.data);
    } catch (err) {
      localStorage.removeItem('shopToken');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/online-auth/login`, { email, password });
    localStorage.setItem('shopToken', res.data.token);
    setCustomer(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/api/online-auth/register`, userData);
    localStorage.setItem('shopToken', res.data.token);
    setCustomer(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('shopToken');
    setCustomer(null);
  };

  return (
    <ShopAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </ShopAuthContext.Provider>
  );
};
