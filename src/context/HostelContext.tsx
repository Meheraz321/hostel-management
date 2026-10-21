import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hostel } from '../types';
import { storage, DatabaseState } from '../services/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface HostelContextType {
  activeHostel: Hostel;
  allHostels: Hostel[];
  setActiveHostelId: (id: string) => void;
  db: DatabaseState;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isCommandOpen: boolean;
  setIsCommandOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseState>(() => storage.getState());
  const [activeHostelId, setActiveHostelId] = useState<string>(() => {
    return localStorage.getItem('hostelsphere_active_hostel_id') || 'hostel-01';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hostelsphere_theme') === 'dark';
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setDb(storage.getState());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('hostelsphere_active_hostel_id', activeHostelId);
  }, [activeHostelId]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hostelsphere_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hostelsphere_theme', 'light');
    }
  }, [darkMode]);

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (db.hostels.length > 0 && (!activeHostelId || !db.hostels.some(h => h.id === activeHostelId))) {
      setActiveHostelId(db.hostels[0].id);
    }
  }, [db.hostels, activeHostelId]);

  const BLANK_HOSTEL: Hostel = {
    id: '',
    name: 'No Hostel Configured',
    code: 'NONE',
    address: 'Campus Address',
    city: '',
    phone: '',
    email: '',
    capacity: 0,
    description: 'No active hostel registered yet.',
    facilities: [],
    rules: [],
    emergencyContact: {
      police: '999',
      ambulance: '999',
      fireService: '999',
      wardenPhone: '',
      managerPhone: '',
      securityDesk: ''
    },
    currency: '৳',
    monthlyLateFeePercentage: 5
  };

  const activeHostel = db.hostels.find(h => h.id === activeHostelId) || db.hostels[0] || BLANK_HOSTEL;

  return (
    <HostelContext.Provider
      value={{
        activeHostel,
        allHostels: db.hostels,
        setActiveHostelId,
        db,
        darkMode,
        toggleDarkMode,
        isCommandOpen,
        setIsCommandOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (!context) throw new Error('useHostel must be used within a HostelProvider');
  return context;
};
