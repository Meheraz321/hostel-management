import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  signup: (params: {
    name: string;
    email: string;
    passwordPlain: string;
    phone?: string;
    role: UserRole;
    hostelName?: string;
    hostelAddress?: string;
    hostelCity?: string;
    hostelPhone?: string;
    currency?: string;
    existingHostelId?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  canAccess: (permission: Permission) => boolean;
}

export type Permission = 
  | 'MANAGE_HOSTELS'
  | 'MANAGE_ROOMS'
  | 'MANAGE_RESIDENTS'
  | 'CHECK_IN_OUT'
  | 'MANAGE_FINANCE'
  | 'VIEW_FINANCE'
  | 'MANAGE_COMPLAINTS'
  | 'MANAGE_MAINTENANCE'
  | 'MANAGE_LEAVES'
  | 'MANAGE_VISITORS'
  | 'MANAGE_STAFF'
  | 'MANAGE_MESS'
  | 'MANAGE_NOTICES'
  | 'VIEW_REPORTS'
  | 'MANAGE_SETTINGS'
  | 'RESIDENT_PORTAL';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'MANAGE_HOSTELS', 'MANAGE_ROOMS', 'MANAGE_RESIDENTS', 'CHECK_IN_OUT',
    'MANAGE_FINANCE', 'VIEW_FINANCE', 'MANAGE_COMPLAINTS', 'MANAGE_MAINTENANCE',
    'MANAGE_LEAVES', 'MANAGE_VISITORS', 'MANAGE_STAFF', 'MANAGE_MESS',
    'MANAGE_NOTICES', 'VIEW_REPORTS', 'MANAGE_SETTINGS'
  ],
  HOSTEL_ADMIN: [
    'MANAGE_ROOMS', 'MANAGE_RESIDENTS', 'CHECK_IN_OUT', 'MANAGE_FINANCE',
    'VIEW_FINANCE', 'MANAGE_COMPLAINTS', 'MANAGE_MAINTENANCE', 'MANAGE_LEAVES',
    'MANAGE_VISITORS', 'MANAGE_STAFF', 'MANAGE_MESS', 'MANAGE_NOTICES',
    'VIEW_REPORTS', 'MANAGE_SETTINGS'
  ],
  MANAGER: [
    'MANAGE_ROOMS', 'MANAGE_RESIDENTS', 'CHECK_IN_OUT', 'VIEW_FINANCE',
    'MANAGE_COMPLAINTS', 'MANAGE_MAINTENANCE', 'MANAGE_LEAVES', 'MANAGE_VISITORS',
    'MANAGE_STAFF', 'MANAGE_MESS', 'MANAGE_NOTICES', 'VIEW_REPORTS'
  ],
  WARDEN: [
    'MANAGE_RESIDENTS', 'MANAGE_LEAVES', 'MANAGE_VISITORS', 'MANAGE_COMPLAINTS',
    'MANAGE_NOTICES', 'VIEW_REPORTS'
  ],
  ACCOUNTANT: [
    'MANAGE_FINANCE', 'VIEW_FINANCE', 'VIEW_REPORTS'
  ],
  STAFF: [
    'MANAGE_COMPLAINTS', 'MANAGE_MAINTENANCE'
  ],
  RESIDENT: [
    'RESIDENT_PORTAL'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Only load if an actual active session exists in localStorage
    const saved = localStorage.getItem('hostelsphere_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.email) {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem('hostelsphere_active_user');
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('hostelsphere_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hostelsphere_active_user');
    }
  }, [user]);

  const login = async (email: string, passwordPlain: string): Promise<{ success: boolean; message: string }> => {
    const res = await storage.loginUser(email, passwordPlain);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const signup = async (params: {
    name: string;
    email: string;
    passwordPlain: string;
    phone?: string;
    role: UserRole;
    hostelName?: string;
    hostelAddress?: string;
    hostelCity?: string;
    hostelPhone?: string;
    currency?: string;
    existingHostelId?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const res = await storage.registerUser(params);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const logout = () => {
    if (user) {
      storage.logAudit(user.name, user.role, 'USER_LOGOUT', 'Authentication', 'User logged out', user.hostelId);
    }
    setUser(null);
    localStorage.removeItem('hostelsphere_active_user');
  };

  const canAccess = (permission: Permission): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
