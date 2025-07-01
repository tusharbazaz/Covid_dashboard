import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {

  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  //
  const setValue = (value) => {
    try {
      // 
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      //
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Save state
      // Save state
      setStoredValue(valueToStore);
      
      //
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
};
