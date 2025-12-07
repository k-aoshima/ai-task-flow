import { useState, Dispatch, SetStateAction } from 'react';

/**
 * localStorageを管理するカスタムフック
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? (value as (prev: T) => T)(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === null || valueToStore === undefined || valueToStore === '') {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * 文字列用のlocalStorageフック（JSON.parseしない）
 */
export function useLocalStorageString(
  key: string,
  initialValue: string = ''
): [string, Dispatch<SetStateAction<string>>] {
  const [storedValue, setStoredValue] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item || initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<string>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? (value as (prev: string) => string)(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === null || valueToStore === undefined || valueToStore === '') {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

