import { useEffect, useState } from 'react';

export function useHashState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
): [T, (value: T) => void] {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  // Initialize state from URL hash or default value
  const [state, setState] = useState<T>(() => {
    try {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      const params = new URLSearchParams(hash);
      const value = params.get(key);
      return value ? deserialize(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Update URL hash when state changes
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      params.set(key, serialize(state));
      window.location.hash = params.toString();
    } catch (error) {
      console.error('Failed to update URL hash:', error);
    }
  }, [state, key, serialize]);

  return [state, setState];
} 