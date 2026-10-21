import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { StatusBadge } from '../common/StatusBadge';
import { ReceiptModal } from '../common/ReceiptModal';
import { Modal } from '../common/Modal';
import {
  User,
  BedDouble,
  DollarSign,
  AlertCircle,
  CalendarCheck,
  Utensils,
  Plus,
  Clock,
  Printer,
  FileText,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ResidentPortal: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user } = useAuth();

  // Find linked resident
  const currentResident = user?.residentId
    ? db.residents.find(r => r.id === user.residentId)
    : db.residents[0];

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Quick complaint
  const [cmpCategory, setCmpCategory] = useState<any>('ROOM');
  const [cmpSubject, setCmpSubject] = useState('');
  const [cmpDescription, setCmpDescription] = useState('');

  // Quick leave
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [destination, setDestination] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  if (!currentResident) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Resident Profile Linked</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {user?.role === 'RESIDENT'
              ? 'Your student account is active. Once the hostel administration completes your room check-in, your bed details and invoices will appear here.'
              : 'There are no active resident scholars in this hostel yet. Admins can check in new residents using the Check-In & Check-Out module.'}
          </p>
        </div>
      </div>
    );
  }

  const residentRoom = db.rooms.find(r => r.id === currentResident.roomId);
  const residentBed = db.beds.find(b => b.id === currentResident.bedId);
  const residentPayments = db.payments.filter(p => p.residentId === currentResident.id);
  const residentComplaints = db.complaints.filter(c => c.residentId === currentResident.id);
  const residentLeaves = db.leaves.filter(l => l.residentId === currentResident.id);
  const currentMess = db.messMenu[0]; // Today's menu

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpSubject) return;

    const res = storage.submitComplaint({
      hostelId: activeHostel.id,
      residentId: currentResident.id,
      roomId: currentResident.roomId,
      category: cmpCategory,
      priority: 'MEDIUM',
      subject: cmpSubject,
      description: cmpDescription
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Ticket Lodged', message: 'Assigned to hostel warden desk' });
      setIsComplaintModalOpen(false);
      setCmpSubject('');
      setCmpDescription('');
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !destination) return;

    const res = storage.submitLeaveRequest({
      hostelId: activeHostel.id,
      residentId: currentResident.id,
      leavingDate: leaveStart,
      returnDate: leaveEnd,
      destination,
      reason: leaveReason || 'Personal departure',
      emergencyPhone: currentResident.guardianPhone || currentResident.phone
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Leave Applied', message: 'Awaiting warden verification' });
      setIsLeaveModalOpen(false);
      setDestination('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Resident Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xl text-white">
              {currentResident.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-indigo-300">
                  Student Scholar Portal
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Enrolled
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Welcome, {currentResident.fullName}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentResident.institution} · ID: <span className="font-mono">{currentResident.studentId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
              Lodge Complaint
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              Request Leave
            </button>
          </div>
        </div>
      </div>

      {/* Primary Resident Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Assigned Room & Bed</span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            Room {residentRoom?.roomNumber || '302'}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{residentBed?.bedNumber || 'Bed A'}</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Monthly Rent</span>
          <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {activeHostel.currency}{residentBed?.monthlyRent || 320}/mo
          </p>
          <p className="text-[11px] text-slate-500">Due by 10th each month</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Current Balance Due</span>
          <p className={`text-lg font-bold font-mono tabular-nums mt-1 ${
            currentResident.totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {activeHostel.currency}{currentResident.totalDue.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500">
            {currentResident.totalDue === 0 ? 'All dues cleared' : 'Payment pending'}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Attendance Record</span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            96%
          </p>
          <p className="text-[11px] text-emerald-600">Compliant with hostel rules</p>
        </div>
      </div>

      {/* Grid: Mess Today & Service Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Today's Dining Hall Menu */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Today's Dining Hall Menu</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">{currentMess?.day}</span>
          </div>

          <div className="space-y-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Breakfast</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{currentMess?.breakfast}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Lunch</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{currentMess?.lunch}</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Dinner</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{currentMess?.dinner}</p>
            </div>
          </div>
        </div>

        {/* My Open Complaints */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">My Maintenance & Service Tickets</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{residentComplaints.length} tickets</span>
          </div>

          {residentComplaints.length > 0 ? (
            <div className="space-y-2">
              {residentComplaints.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{c.subject}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Ticket #{c.ticketNumber} · {c.category}</p>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 py-6 text-center">No open service tickets.</p>
          )}
        </div>
      </div>

      {/* Payment Vouchers History */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">My Payment History & Official Vouchers</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{residentPayments.length} transactions</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {residentPayments.map(p => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{p.purpose.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Receipt #{p.receiptNumber} · {p.date} · {p.paymentMethod}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                  +{activeHostel.currency}{p.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => setSelectedReceipt(p)}
                  className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1 font-medium text-[11px]"
                >
                  <Printer className="w-3 h-3" /> View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Complaint Modal */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="Lodge Maintenance or Service Issue"
        subtitle={`Room ${currentResident.roomId} assistance`}
        maxWidth="md"
      >
        <form onSubmit={handleFileComplaint} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Issue Category
            </label>
            <select
              value={cmpCategory}
              onChange={(e) => setCmpCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ROOM">Room / Bed Structure</option>
              <option value="INTERNET_WIFI">Internet / WiFi Speed</option>
              <option value="WATER_PLUMBING">Bathroom Plumbing</option>
              <option value="ELECTRICITY">Lights & Outlets</option>
              <option value="FOOD_MESS">Mess / Food Quality</option>
              <option value="CLEANING">Corridor Housekeeping</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Brief Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Desk lamp loose socket"
              value={cmpSubject}
              onChange={(e) => setCmpSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide exact details for the maintenance team"
              value={cmpDescription}
              onChange={(e) => setCmpDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Overnight Absence / Leave"
        subtitle="Submitted directly to Head Warden"
        maxWidth="md"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Return Date *
              </label>
              <input
                type="date"
                required
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Destination City / Home Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Family home in Silver district"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Reason for Absence
            </label>
            <input
              type="text"
              placeholder="e.g. Academic conference in Chicago"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt}
          resident={currentResident}
        />
      )}
    </div>
  );
};
