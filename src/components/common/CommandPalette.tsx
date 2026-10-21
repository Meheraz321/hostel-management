import React, { useState, useEffect } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Search, BedDouble, Users, CreditCard, AlertCircle, Utensils, ShieldAlert, FileText, Settings, UserCheck, X } from 'lucide-react';

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { isCommandOpen, setIsCommandOpen, db } = useHostel();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isCommandOpen) setQuery('');
  }, [isCommandOpen]);

  if (!isCommandOpen) return null;

  const filteredResidents = db.residents.filter(r => 
    r.fullName.toLowerCase().includes(query.toLowerCase()) ||
    r.studentId.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredRooms = db.rooms.filter(r => 
    r.roomNumber.includes(query) ||
    r.roomType.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const navigationItems = [
    { label: 'Admin Dashboard', tab: 'dashboard', icon: FileText, category: 'Navigation' },
    { label: 'Interactive Room & Bed Layout', tab: 'rooms', icon: BedDouble, category: 'Navigation' },
    { label: 'Resident Management & Directory', tab: 'residents', icon: Users, category: 'Navigation' },
    { label: 'Finance & Payments Management', tab: 'finance', icon: CreditCard, category: 'Navigation' },
    { label: 'Mess & Meal Management', tab: 'mess', icon: Utensils, category: 'Navigation' },
    { label: 'Complaints & Ticketing', tab: 'complaints', icon: AlertCircle, category: 'Navigation' },
    { label: 'Security & Visitors Hub', tab: 'security', icon: ShieldAlert, category: 'Navigation' },
    { label: 'Hostel Reports & Analytics', tab: 'reports', icon: FileText, category: 'Navigation' },
    { label: 'System & Hostel Settings', tab: 'settings', icon: Settings, category: 'Navigation' }
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search room number, or resident scholar..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
            autoFocus
          />
          <button
            onClick={() => setIsCommandOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Navigation Section */}
          {navigationItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                System Navigation
              </div>
              <div className="space-y-0.5">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        onNavigate(item.tab);
                        setIsCommandOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resident Matches */}
          {filteredResidents.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Resident Scholars
              </div>
              <div className="space-y-0.5">
                {filteredResidents.map(res => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onNavigate('residents');
                      setIsCommandOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                        {res.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{res.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{res.studentId} · Room {res.roomId || 'Unassigned'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">View Profile →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Matches */}
          {filteredRooms.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Rooms & Suites
              </div>
              <div className="space-y-0.5">
                {filteredRooms.map(rm => (
                  <button
                    key={rm.id}
                    onClick={() => {
                      onNavigate('rooms');
                      setIsCommandOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-slate-400" />
                      <span>Room {rm.roomNumber} ({rm.roomType.replace('_', ' ')})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{rm.status.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or arrow keys</span>
          <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
