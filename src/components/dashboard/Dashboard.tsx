import React from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  BedDouble,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  CreditCard,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQuickAction }) => {
  const { activeHostel, db } = useHostel();
  const { user } = useAuth();

  // Filter entities by active hostel
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const hostelBeds = db.beds.filter(b => b.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id && r.status === 'ACTIVE');
  const hostelPayments = db.payments.filter(p => p.hostelId === activeHostel.id);
  const hostelExpenses = db.expenses.filter(e => e.hostelId === activeHostel.id);
  const hostelComplaints = db.complaints.filter(c => c.hostelId === activeHostel.id && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const hostelVisitors = db.visitors.filter(v => v.hostelId === activeHostel.id);
  const hostelStaff = db.staff.filter(s => s.hostelId === activeHostel.id && s.status === 'ACTIVE');

  const totalBeds = hostelBeds.length;
  const occupiedBeds = hostelBeds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = hostelBeds.filter(b => b.status === 'AVAILABLE').length;
  const maintenanceBeds = hostelBeds.filter(b => b.status === 'MAINTENANCE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRevenue = hostelPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = hostelExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalOutstandingDues = hostelResidents.reduce((acc, r) => acc + (r.totalDue || 0), 0);
  const overdueResidentsCount = hostelResidents.filter(r => (r.totalDue || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Current Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
              Welcome back
            </span>
            <span className="text-xs px-2 py-0.5 rounded-sm bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              {activeHostel.code}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {activeHostel.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active residential status · {occupancyRate}% occupancy with {availableBeds} beds available for check-in
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenQuickAction('ADD_RESIDENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Check-In Resident
          </button>
          <button
            onClick={() => onOpenQuickAction('RECORD_PAYMENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Collect Rent
          </button>
        </div>
      </div>

      {/* Alert Banner for Overdue Balances */}
      {overdueResidentsCount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {overdueResidentsCount} Residents Have Outstanding Payment Dues
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Total outstanding balance: <span className="font-mono font-semibold">{activeHostel.currency}{totalOutstandingDues.toFixed(2)}</span>. Automated late fee triggers on overdue dates.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-semibold text-amber-900 dark:text-amber-300 underline hover:text-amber-700 shrink-0"
          >
            Review Dues →
          </button>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds} occupied / ${totalBeds} total beds`}
          icon={BedDouble}
          trend={{ value: `${availableBeds} beds available`, isPositive: true }}
          onClick={() => onNavigate('rooms')}
        />
        <StatCard
          title="Active Residents"
          value={hostelResidents.length}
          subtitle="Scholars currently residing"
          icon={Users}
          trend={{ value: '+2 this month', isPositive: true }}
          onClick={() => onNavigate('residents')}
        />
        <StatCard
          title="Monthly Collections"
          value={`${activeHostel.currency}${totalRevenue.toLocaleString()}`}
          subtitle={`Expenses: ${activeHostel.currency}${totalExpenses.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: `Net +${activeHostel.currency}${netProfit.toLocaleString()}`, isPositive: netProfit >= 0 }}
          onClick={() => onNavigate('finance')}
        />
        <StatCard
          title="Pending Tickets"
          value={hostelComplaints.length}
          subtitle="Complaints & workorders"
          icon={AlertCircle}
          trend={{ value: '1 urgent', isPositive: false }}
          onClick={() => onNavigate('complaints')}
        />
      </div>

      {/* Financial Breakdown & Room Status Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue vs Expense & Occupancy Bar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Velocity */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Financial Performance Ledger
                </h3>
                <p className="text-xs text-slate-500">Real-time collections vs operational disbursements</p>
              </div>
              <button
                onClick={() => onNavigate('finance')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Detailed Ledger →
              </button>
            </div>

            {/* Visual Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Total Income / Fees</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {activeHostel.currency}{totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Operational Expenses</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {activeHostel.currency}{totalExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalExpenses / Math.max(1, totalRevenue)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Outstanding Uncollected Dues</span>
                  <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                    {activeHostel.currency}{totalOutstandingDues.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((totalOutstandingDues / Math.max(1, totalRevenue)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Collection Rate</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {Math.round((totalRevenue / Math.max(1, totalRevenue + totalOutstandingDues)) * 100)}%
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Units</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {hostelRooms.length} Rooms
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Staff Deployed</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {hostelStaff.length} Members
                </span>
              </div>
            </div>
          </div>

          {/* Quick Room Snapshot */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Room & Bed Matrix
                </h3>
                <p className="text-xs text-slate-500">Live floor-by-floor allocation glance</p>
              </div>
              <button
                onClick={() => onNavigate('rooms')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Open Full Floor Map →
              </button>
            </div>

            {hostelRooms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hostelRooms.slice(0, 8).map(room => {
                  const roomBeds = hostelBeds.filter(b => b.roomId === room.id);
                  const occ = roomBeds.filter(b => b.status === 'OCCUPIED').length;
                  return (
                    <div
                      key={room.id}
                      onClick={() => onNavigate('rooms')}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Room {room.roomNumber}
                        </span>
                        <StatusBadge status={room.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 capitalize">{room.roomType.replace('_', ' ').toLowerCase()}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {roomBeds.map(b => (
                          <div
                            key={b.id}
                            title={`${b.bedNumber}: ${b.status}`}
                            className={`w-3.5 h-3.5 rounded-sm ${
                              b.status === 'OCCUPIED'
                                ? 'bg-blue-500'
                                : b.status === 'MAINTENANCE'
                                ? 'bg-rose-500'
                                : b.status === 'RESERVED'
                                ? 'bg-amber-500'
                                : 'bg-emerald-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 space-y-2">
                <p>No rooms registered yet.</p>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
                >
                  + Register First Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Recent Activity Timeline & Operations Glance */}
        <div className="space-y-6">
          {/* Live Activity Timeline */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Audit Timeline
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {db.auditLogs.length > 0 ? (
                db.auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="relative pl-5 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{log.userName}</span>
                      <span>·</span>
                      <span>{log.timestamp.substring(11, 16)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No activity logs recorded yet.
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('settings')}
              className="mt-4 w-full py-1.5 text-xs text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg transition-colors font-medium"
            >
              View Complete Audit Trail
            </button>
          </div>

          {/* Today's Daily Mess & Visitor Glance */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Operations Today
            </h3>

            {/* Mess Menu preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <span>Dining Hall Menu</span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">TODAY</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {db.messMenu[0]?.dinner ? `Dinner: ${db.messMenu[0].dinner}` : 'No menu entered yet.'}
              </p>
              <button
                onClick={() => onNavigate('mess')}
                className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Inspect Weekly Menu →
              </button>
            </div>

            {/* Active Visitors */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <span>Gate Security Logs</span>
                <span className="font-mono text-[10px] text-slate-500">24/7 DESK</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {hostelVisitors.filter(v => v.status === 'CHECKED_IN').length} external visitors logged in hostel lounge.
              </p>
              <button
                onClick={() => onNavigate('visitors')}
                className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Open Visitor Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
