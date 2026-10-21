import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { StaffMember } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { storage } from '../../services/storage';
import { UserCheck, Phone, Mail, Clock, DollarSign, Plus, Shield } from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ROSTER'>('DIRECTORY');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Add staff form state
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'WARDEN' | 'MANAGER' | 'ACCOUNTANT' | 'CHEF' | 'CLEANER' | 'SECURITY' | 'MAINTENANCE'>('WARDEN');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffSalary, setStaffSalary] = useState<number | ''>('');
  const [staffShift, setStaffShift] = useState<'MORNING' | 'EVENING' | 'NIGHT' | 'ROTATING'>('MORNING');
  const [staffEmergency, setStaffEmergency] = useState('');

  const hostelStaff = db.staff.filter(s => s.hostelId === activeHostel.id);
  const hostelStaffAttendance = db.staffAttendance.filter(a => a.hostelId === activeHostel.id);

  const totalPayroll = hostelStaff.reduce((acc, s) => acc + s.salary, 0);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffPhone) {
      addToast({ type: 'error', title: 'Validation', message: 'Name and phone number are required' });
      return;
    }

    const res = storage.addStaffMember(
      {
        hostelId: activeHostel.id,
        name: staffName,
        role: staffRole,
        phone: staffPhone,
        email: staffEmail || `${staffName.toLowerCase().replace(/\s+/g, '')}@hostel.com`,
        address: 'Staff Quarters',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: Number(staffSalary) || 0,
        shift: staffShift,
        emergencyContact: staffEmergency || staffPhone
      },
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Staff Registered', message: res.message });
      setIsAddStaffOpen(false);
      setStaffName('');
      setStaffPhone('');
      setStaffEmail('');
      setStaffSalary('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Hostel Operations Staff & Duty Roster
          </h2>
          <p className="text-xs text-slate-500">
            Wardens, shift supervisors, maintenance technicians, kitchen chefs and 24/7 security personnel.
          </p>
        </div>

        {canAccess('MANAGE_STAFF') && (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Staff Member
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Personnel</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            {hostelStaff.length} Team Members
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 functional departments</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Monthly Payroll Obligation</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            {activeHostel.currency}{totalPayroll.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Disbursed on 1st of each calendar month</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Today Shift Coverage</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1 block">
            {hostelStaff.length > 0 ? '100% Manning' : '0 Members'}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Morning, evening & night rotations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'DIRECTORY'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Staff Directory ({hostelStaff.length})
        </button>
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ROSTER'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Daily Shift & Attendance Ledger
        </button>
      </div>

      {/* Directory Grid */}
      {activeTab === 'DIRECTORY' && (
        hostelStaff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {hostelStaff.map(s => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
                      {s.role} · {s.shift} Shift
                    </span>
                  </div>
                  <StatusBadge status={s.status} size="sm" />
                </div>

                <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {activeHostel.currency}{s.salary}/mo
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Joined {s.joiningDate}</span>
                  <span>Emerg: {s.emergencyContact}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 space-y-3">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No staff personnel registered yet</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              Register wardens, maintenance technicians, chefs or security guards for {activeHostel.name}.
            </p>
            {canAccess('MANAGE_STAFF') && (
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
              >
                + Register Staff Member
              </button>
            )}
          </div>
        )
      )}

      {/* Shift Attendance Table */}
      {activeTab === 'ROSTER' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Staff Member</th>
                  <th className="py-2.5 px-4 font-semibold">Assigned Role</th>
                  <th className="py-2.5 px-4 font-semibold">Clock-In Time</th>
                  <th className="py-2.5 px-4 font-semibold">Clock-Out Time</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelStaffAttendance.length > 0 ? (
                  hostelStaffAttendance.map(sa => {
                    const member = hostelStaff.find(s => s.id === sa.staffId);
                    return (
                      <tr key={sa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {member?.name || 'Staff Member'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {member?.role || 'OPERATIONS'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                          {sa.checkIn}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {sa.checkOut || 'On Active Duty'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={sa.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No shift records logged today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Register New Staff Member"
        subtitle={`Assign operational role to ${activeHostel.name}`}
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rafiqul Islam"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Designation / Role *
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-medium"
              >
                <option value="WARDEN">Head Warden</option>
                <option value="MANAGER">Hostel Manager</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="SECURITY">Security Guard</option>
                <option value="MAINTENANCE">Maintenance Technician</option>
                <option value="CHEF">Dining Chef</option>
                <option value="CLEANER">Housekeeping Cleaner</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Shift Schedule *
              </label>
              <select
                value={staffShift}
                onChange={(e) => setStaffShift(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="MORNING">Morning (06:00 - 14:00)</option>
                <option value="EVENING">Evening (14:00 - 22:00)</option>
                <option value="NIGHT">Night (22:00 - 06:00)</option>
                <option value="ROTATING">Rotating Duty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+880 1..."
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Monthly Salary ({activeHostel.currency})
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={staffSalary}
                onChange={(e) => setStaffSalary(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Save Staff Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
