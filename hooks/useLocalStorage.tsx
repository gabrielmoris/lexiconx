"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to store and retrieve data from localStorage.
 * It provides a stateful value that persists across sessions.
 *
 * @param key The key under which to store the value in localStorage.
 * @param initialValue The initial value to use if nothing is found in localStorage.
 * @returns A tuple containing the stored value and a function to update it.
 */

const NOT_LOADED = Symbol("NOT_LOADED");

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T | typeof NOT_LOADED>(initialValue);

  // This runs only once on the client after the component has mounted.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;
      setStoredValue(parsedItem);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? (storedValue === NOT_LOADED ? initialValue : value(storedValue as T)) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, initialValue]
  );

  // Listener for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined" || storedValue === NOT_LOADED) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, storedValue]); // Depend on mounted to ensure it only runs client-side

  return [storedValue === NOT_LOADED ? initialValue : (storedValue as T), setValue];
}

export default useLocalStorage;
