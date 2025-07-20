"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to store and retrieve data from localStorage, ensuring
 * compatibility with Next.js by tracking hydration status.
 *
 * @param key The key under which to store the value in localStorage.
 * @param initialValue The default value to use if nothing is in localStorage.
 * @returns An array containing the stateful value, a function to update it, a hydration status boolean, and a function to delete the value.
 */

function useLocalStorage<T>(
  key: string,
  initialValue: T
): {
  storedValue: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  isHydrated: boolean;
  deleteValue: () => void;
} {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const deleteValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error deleting from localStorage key "${key}":`, error);
    }
  }

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return { storedValue, setValue, isHydrated, deleteValue };
}

export default useLocalStorage;
