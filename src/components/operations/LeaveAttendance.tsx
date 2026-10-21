import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { LeaveRequest, AttendanceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

export const LeaveAttendance: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'LEAVES' | 'ATTENDANCE'>('LEAVES');
  const [isSubmitLeaveOpen, setIsSubmitLeaveOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Leave Form
  const [residentId, setResidentId] = useState('');
  const [leavingDate, setLeavingDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const hostelLeaves = db.leaves.filter(l => l.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id && r.status === 'ACTIVE');
  const hostelAttendance = db.attendance.filter(a => a.hostelId === activeHostel.id && a.date === attendanceDate);

  const getResident = (rId: string) => hostelResidents.find(r => r.id === rId);

  const handleApproveLeave = (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    const res = storage.updateLeaveStatus(
      leaveId,
      status,
      user?.name || 'Head Warden',
      user?.role || 'WARDEN'
    );
    if (res.success) {
      addToast({ type: 'success', title: `Leave ${status}`, message: res.message });
    }
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId || !leavingDate || !returnDate || !destination) {
      addToast({ type: 'error', title: 'Validation Error', message: 'All fields are required' });
      return;
    }

    const res = storage.submitLeaveRequest({
      hostelId: activeHostel.id,
      residentId,
      leavingDate,
      returnDate,
      destination,
      reason: reason || 'Home visit / Academic leave',
      emergencyPhone: emergencyPhone || '+1 (555) 000-0000'
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Leave Application Logged', message: res.message });
      setIsSubmitLeaveOpen(false);
      setDestination('');
      setReason('');
    }
  };

  const handleMarkAttendance = (resId: string, status: AttendanceRecord['status']) => {
    storage.markAttendance({
      hostelId: activeHostel.id,
      residentId: resId,
      date: attendanceDate,
      status,
      actorName: user?.name || 'Warden'
    });
    addToast({ type: 'info', title: 'Attendance Marked', message: `Marked as ${status}` });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Leave Approvals & Resident Attendance
          </h2>
          <p className="text-xs text-slate-500">
            Warden authorization for overnight student departures, travel itineraries and biometric roll-call ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'LEAVES' && (
            <button
              onClick={() => setIsSubmitLeaveOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply for Leave
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('LEAVES')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'LEAVES'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Leave Authorizations ({hostelLeaves.length})
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ATTENDANCE'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Daily Roll Call & Curfew Ledger
        </button>
      </div>

      {/* Tab: Leaves */}
      {activeTab === 'LEAVES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Resident Scholar</th>
                  <th className="py-2.5 px-4 font-semibold">Travel Itinerary</th>
                  <th className="py-2.5 px-4 font-semibold">Departure / Return Dates</th>
                  <th className="py-2.5 px-4 font-semibold">Reason</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Warden Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelLeaves.map(l => {
                  const res = getResident(l.residentId);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Room {res?.roomId} · {l.emergencyPhone}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {l.destination}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <span>{l.leavingDate}</span> → <span className="font-semibold text-slate-900 dark:text-white">{l.returnDate}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{l.reason}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={l.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {l.status === 'PENDING' && canAccess('MANAGE_LEAVES') ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveLeave(l.id, 'APPROVED')}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveLeave(l.id, 'REJECTED')}
                              className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {l.approvedBy ? `Decided by ${l.approvedBy}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Resident Roll-Call Ledger</h3>
              <p className="text-[11px] text-slate-500">Record physical presence or curfews</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Inspection Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Scholar</th>
                  <th className="py-2.5 px-4 font-semibold">Room & Bed</th>
                  <th className="py-2.5 px-4 font-semibold">Curfew Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Mark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelResidents.map(res => {
                  const record = hostelAttendance.find(a => a.residentId === res.id);
                  const currentStatus = record?.status || 'PRESENT';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {res.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        Room {res.roomId?.replace('rm-', '') || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={currentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleMarkAttendance(res.id, 'PRESENT')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(res.id, 'LATE')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(res.id, 'LEAVE')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              currentStatus === 'LEAVE'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            On Leave
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(res.id, 'ABSENT')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isSubmitLeaveOpen}
        onClose={() => setIsSubmitLeaveOpen(false)}
        title="Submit Resident Leave Application"
        subtitle={`Warden clearance in ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Resident Scholar *
            </label>
            <select
              required
              value={residentId}
              onChange={(e) => {
                const rId = e.target.value;
                setResidentId(rId);
                const r = getResident(rId);
                if (r) setEmergencyPhone(r.guardianPhone || r.emergencyContact);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">-- Choose Resident --</option>
              {hostelResidents.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.studentId}) · Room {r.roomId}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={leavingDate}
                onChange={(e) => setLeavingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Destination City / Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Greenfield Silver district family home"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Leave
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Sister wedding ceremony"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubmitLeaveOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
