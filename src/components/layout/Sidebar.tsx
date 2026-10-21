import React from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CreditCard,
  Utensils,
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Bell,
  BarChart3,
  Settings,
  ChevronDown,
  Building2,
  CalendarCheck,
  UserPlus,
  ArrowRightLeft,
  FileCheck2,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { activeHostel, allHostels, setActiveHostelId } = useHostel();
  const { user, logout, canAccess } = useAuth();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, permission: null },
        { id: 'rooms', label: 'Rooms & Beds Map', icon: BedDouble, permission: 'MANAGE_ROOMS' as const },
        { id: 'residents', label: 'Residents Directory', icon: Users, permission: 'MANAGE_RESIDENTS' as const },
        { id: 'checkin', label: 'Check-In & Check-Out', icon: UserPlus, permission: 'CHECK_IN_OUT' as const },
        { id: 'transfers', label: 'Room Transfers', icon: ArrowRightLeft, permission: 'MANAGE_ROOMS' as const }
      ]
    },
    {
      title: 'FINANCE & BILLING',
      items: [
        { id: 'finance', label: 'Payments & Invoices', icon: CreditCard, permission: 'VIEW_FINANCE' as const },
        { id: 'expenses', label: 'Hostel Expenses', icon: FileCheck2, permission: 'MANAGE_FINANCE' as const }
      ]
    },
    {
      title: 'CAMPUS OPERATIONS',
      items: [
        { id: 'mess', label: 'Mess & Meal System', icon: Utensils, permission: 'MANAGE_MESS' as const },
        { id: 'complaints', label: 'Complaints & Workorders', icon: AlertCircle, permission: 'MANAGE_COMPLAINTS' as const },
        { id: 'visitors', label: 'Visitors & Security', icon: ShieldAlert, permission: 'MANAGE_VISITORS' as const },
        { id: 'leaves', label: 'Leaves & Attendance', icon: CalendarCheck, permission: 'MANAGE_LEAVES' as const },
        { id: 'staff', label: 'Staff Management', icon: UserCheck, permission: 'MANAGE_STAFF' as const }
      ]
    },
    {
      title: 'INTELLIGENCE & SYSTEM',
      items: [
        { id: 'notices', label: 'Announcements Board', icon: Bell, permission: 'MANAGE_NOTICES' as const },
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3, permission: 'VIEW_REPORTS' as const },
        { id: 'settings', label: 'Settings & Audit Logs', icon: Settings, permission: 'MANAGE_SETTINGS' as const }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm tracking-tight shadow-xs">
              HP
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Hostel Management   
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                ENTERPRISE PMS
              </span>
            </div>
          </div>

          {/* Active Hostel Switcher */}
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Property
            </label>
            <div className="relative">
              <select
                value={activeHostel.id}
                onChange={(e) => setActiveHostelId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-800 dark:text-slate-200 focus:outline-hidden appearance-none cursor-pointer truncate"
              >
                {allHostels.length > 0 ? (
                  allHostels.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Hostel Configured</option>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Resident Quick Switch Alert if in Resident Portal */}
          {user?.role === 'RESIDENT' && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  Student Portal Mode
                </span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                Logged in as {user?.name || 'Resident'}.
              </p>
              <button
                onClick={() => handleTabClick('resident-portal')}
                className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-medium text-center transition-colors ${
                  activeTab === 'resident-portal'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Go to My Room & Portal
              </button>
            </div>
          )}

          {navSections.map(section => {
            const visibleItems = section.items.filter(
              item => !item.permission || canAccess(item.permission)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-inherit' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Quick link to resident view for admins */}
          {user?.role !== 'RESIDENT' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleTabClick('resident-portal')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'resident-portal'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">View Resident Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
