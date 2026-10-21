import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenQuickAction: (action: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  activeTab,
  onNavigate,
  onOpenQuickAction
}) => {
  const { activeHostel, darkMode, toggleDarkMode, setIsCommandOpen, db } = useHostel();
  const { user, logout } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'rooms': return 'Rooms & Beds Visual Matrix';
      case 'residents': return 'Resident Scholars Directory';
      case 'checkin': return 'Digital Check-In & Check-Out Clearance';
      case 'transfers': return 'Room & Bed Transfers';
      case 'finance': return 'Payments, Rent & Invoices';
      case 'expenses': return 'Hostel Operational Expenses';
      case 'mess': return 'Weekly Mess Menu & Meal Tracker';
      case 'complaints': return 'Complaints & Maintenance Tickets';
      case 'visitors': return 'Visitor Registry & Security Logs';
      case 'leaves': return 'Resident Leaves & Daily Attendance';
      case 'staff': return 'Hostel Staff & Shift Roster';
      case 'notices': return 'Official Announcements Board';
      case 'reports': return 'Operational Analytics & Reports';
      case 'settings': return 'System Settings & Audit Logs';
      case 'resident-portal': return 'Resident Student Portal';
      default: return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none">
              {activeHostel.name}
            </span>
            <span>/</span>
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {getBreadcrumbTitle(activeTab)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Search, Role Switcher, Quick Actions, Dark Mode, Notifications */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Command Search Trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Search...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
            Ctrl K
          </kbd>
        </button>

        {/* Real User Profile & Sign Out */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {user?.role.replace('_', ' ')}
            </span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <button
            onClick={logout}
            title="Sign Out (লগআউট)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Button */}
        {user?.role !== 'RESIDENT' && (
          <div className="relative">
            <button
              onClick={() => {
                setShowActionMenu(!showActionMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Action</span>
            </button>

            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onOpenQuickAction('ADD_RESIDENT');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  + Add & Check-In Resident
                </button>
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onOpenQuickAction('RECORD_PAYMENT');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  + Record Rent Payment
                </button>
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onOpenQuickAction('REGISTER_VISITOR');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  + Register Visitor Entry
                </button>
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onOpenQuickAction('ADD_EXPENSE');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  + Log Hostel Expense
                </button>
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onOpenQuickAction('NEW_NOTICE');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  + Post Notice Announcement
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowActionMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {db.auditLogs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Recent Activity</span>
                <span className="text-[10px] text-slate-400 font-mono">Live Audit</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {db.auditLogs.length > 0 ? (
                  db.auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <p className="font-semibold text-slate-900 dark:text-white">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">{log.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No activity logs recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
