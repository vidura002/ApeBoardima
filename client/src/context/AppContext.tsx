import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, SearchFilters } from '../types';
import {
  auth as authApi, saved as savedApi,
  getStoredToken, setStoredToken, setStoredUser, getStoredUser, clearStoredSession,
} from '../services/api';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  savedListings: string[];
  filters: SearchFilters;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string, role: 'tenant' | 'landlord') => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'tenant' | 'landlord') => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<User>;
  toggleSave: (listingId: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  refreshSaved: () => Promise<void>;
}

const defaultFilters: SearchFilters = {
  query: '',
  area: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  gender: '',
  furnished: '',
  sortBy: 'newest',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<SearchFilters>(defaultFilters);
  const [authLoading, setAuthLoading] = useState(!!getStoredToken());

  // On mount: verify token and load saved IDs
  useEffect(() => {
    const token = getStoredToken();
    if (!token) { setAuthLoading(false); return; }

    authApi.me()
      .then(({ user }) => {
        setCurrentUser(user);
        setStoredUser(user);
        return savedApi.ids();
      })
      .then(({ data }) => setSavedListings(data))
      .catch(() => {
        clearStoredSession();
        setCurrentUser(null);
        setSavedListings([]);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { user, token } = await authApi.login({ email, password });
    setStoredToken(token);
    setStoredUser(user);
    setCurrentUser(user);
    try {
      const { data } = await savedApi.ids();
      setSavedListings(data);
    } catch {
      setSavedListings([]);
    }
    return true;
  }, []);

  const loginWithGoogle = useCallback(async (
    credential: string,
    role: 'tenant' | 'landlord',
  ): Promise<boolean> => {
    const { user, token } = await authApi.google({ credential, role });
    setStoredToken(token);
    setStoredUser(user);
    setCurrentUser(user);
    try {
      const { data } = await savedApi.ids();
      setSavedListings(data);
    } catch {
      setSavedListings([]);
    }
    return true;
  }, []);

  const signup = useCallback(async (
    name: string, email: string, password: string, role: 'tenant' | 'landlord',
  ): Promise<boolean> => {
    const { user, token } = await authApi.register({ name, email, password, role });
    setStoredToken(token);
    setStoredUser(user);
    setCurrentUser(user);
    setSavedListings([]);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setCurrentUser(null);
    setSavedListings([]);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }): Promise<User> => {
    const { user } = await authApi.updateMe(data);
    setStoredUser(user);
    setCurrentUser(user);
    return user;
  }, []);

  const toggleSave = useCallback(async (listingId: string) => {
    const isSaved = savedListings.includes(listingId);
    // Optimistic update
    setSavedListings(prev =>
      isSaved ? prev.filter(id => id !== listingId) : [...prev, listingId],
    );
    try {
      if (isSaved) {
        await savedApi.unsave(listingId);
      } else {
        await savedApi.save(listingId);
      }
    } catch {
      // Revert on failure
      setSavedListings(prev =>
        isSaved ? [...prev, listingId] : prev.filter(id => id !== listingId),
      );
    }
  }, [savedListings]);

  const refreshSaved = useCallback(async () => {
    try {
      const { data } = await savedApi.ids();
      setSavedListings(data);
    } catch {
      // ignore
    }
  }, []);

  const setFilters = useCallback((partial: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        savedListings,
        filters,
        authLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile,
        toggleSave,
        setFilters,
        resetFilters,
        refreshSaved,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
