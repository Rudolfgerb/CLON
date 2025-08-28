import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for managing form draft data
export function useFormDraft<T>(formId: string, initialData: T) {
  const [draftData, setDraftData] = useLocalStorage(`form-draft-${formId}`, initialData);

  const updateDraft = (updates: Partial<T>) => {
    setDraftData(prev => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    setDraftData(initialData);
  };

  const hasDraft = () => {
    return JSON.stringify(draftData) !== JSON.stringify(initialData);
  };

  return {
    draftData,
    updateDraft,
    clearDraft,
    hasDraft
  };
}

// Hook for managing user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    language: 'de',
    notifications: {
      email: true,
      push: true,
      jobAlerts: true,
      applicationUpdates: true
    },
    dashboard: {
      showStats: true,
      showRecentActivity: true,
      jobsPerPage: 10
    }
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedPreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  return {
    preferences,
    updatePreference,
    updateNestedPreference
  };
}