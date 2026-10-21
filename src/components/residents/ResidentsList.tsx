import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Resident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface ResidentsListProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction: (action: string) => void;
}

export const ResidentsList: React.FC<ResidentsListProps> = ({ onNavigate, onOpenQuickAction }) => {
  const { activeHostel, db } = useHostel();
  const { canAccess } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'BIO' | 'FINANCE' | 'COMPLAINTS' | 'LEAVES'>('BIO');

  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const hostelBeds = db.beds.filter(b => b.hostelId === activeHostel.id);

  const filteredResidents = hostelResidents.filter(res => {
    if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = res.fullName.toLowerCase().includes(q);
      const matchId = res.studentId.toLowerCase().includes(q);
      const matchInst = res.institution.toLowerCase().includes(q);
      const matchRoom = res.roomId?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchInst && !matchRoom) return false;
    }
    return true;
  });

  // Data for active resident in modal
  const residentPayments = selectedResident ? db.payments.filter(p => p.residentId === selectedResident.id) : [];
  const residentComplaints = selectedResident ? db.complaints.filter(c => c.residentId === selectedResident.id) : [];
  const residentLeaves = selectedResident ? db.leaves.filter(l => l.residentId === selectedResident.id) : [];
  const residentRoom = selectedResident?.roomId ? hostelRooms.find(r => r.id === selectedResident.roomId) : null;
  const residentBed = selectedResident?.bedId ? hostelBeds.find(b => b.id === selectedResident.bedId) : null;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Resident Scholars Directory
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive resident profiles, academic records, room allocations and balance ledgers.
          </p>
        </div>

        {canAccess('CHECK_IN_OUT') && (
          <button
            onClick={() => onOpenQuickAction('ADD_RESIDENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Check-In New Resident
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, student ID, department, room..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Residents ({hostelResidents.length})</option>
            <option value="ACTIVE">Active Scholars</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4 font-semibold">Scholar / Resident</th>
                <th className="py-3 px-4 font-semibold">Academic Details</th>
                <th className="py-3 px-4 font-semibold">Room & Bed</th>
                <th className="py-3 px-4 font-semibold">Balance Due</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResidents.length > 0 ? (
                filteredResidents.map(res => (
                  <tr
                    key={res.id}
                    onClick={() => setSelectedResident(res)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                          {res.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {res.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {res.studentId} · {res.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{res.institution}</p>
                      <p className="text-[11px] text-slate-500">{res.department}</p>
                    </td>

                    <td className="py-3 px-4">
                      {res.roomId ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Room {res.roomId.replace('rm-', '')}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {res.bedId ? res.bedId.split('-').pop()?.toUpperCase() : 'Bed'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Bed Assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`font-mono tabular-nums font-semibold ${
                        res.totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {activeHostel.currency}{res.totalDue.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={res.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResident(res);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 text-[11px] font-medium"
                      >
                        Inspect Profile <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No resident records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Resident Profile Modal */}
      <Modal
        isOpen={!!selectedResident}
        onClose={() => setSelectedResident(null)}
        title={selectedResident ? `${selectedResident.fullName} · Profile Dossier` : 'Profile'}
        subtitle={`Student ID: ${selectedResident?.studentId || ''}`}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {canAccess('CHECK_IN_OUT') && selectedResident?.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    setSelectedResident(null);
                    onNavigate('checkin');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-1" />
                  Initiate Checkout
                </button>
              )}
              {canAccess('MANAGE_ROOMS') && selectedResident?.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    setSelectedResident(null);
                    onNavigate('transfers');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1" />
                  Transfer Room
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedResident(null)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Close Dossier
            </button>
          </div>
        }
      >
        {selectedResident && (
          <div className="space-y-5 text-xs">
            {/* Top Bar with Status & Due */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Scholar Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedResident.status} />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Current Bed</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {residentRoom ? `Room ${residentRoom.roomNumber} (${residentBed?.bedNumber})` : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Current Dues</span>
                <span className="font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {activeHostel.currency}{selectedResident.totalDue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Paid</span>
                <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {activeHostel.currency}{selectedResident.totalPaid.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveProfileTab('BIO')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeProfileTab === 'BIO'
                    ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Bio & Guardian
              </button>
              <button
                onClick={() => setActiveProfileTab('FINANCE')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeProfileTab === 'FINANCE'
                    ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Payment Ledger ({residentPayments.length})
              </button>
              <button
                onClick={() => setActiveProfileTab('COMPLAINTS')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeProfileTab === 'COMPLAINTS'
                    ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tickets ({residentComplaints.length})
              </button>
              <button
                onClick={() => setActiveProfileTab('LEAVES')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeProfileTab === 'LEAVES'
                    ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Leaves ({residentLeaves.length})
              </button>
            </div>

            {/* Tab Contents */}
            {activeProfileTab === 'BIO' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Contact Information</span>
                    <p><span className="text-slate-500">Email:</span> {selectedResident.email}</p>
                    <p><span className="text-slate-500">Phone:</span> {selectedResident.phone}</p>
                    <p><span className="text-slate-500">Date of Birth:</span> {selectedResident.dateOfBirth}</p>
                    <p><span className="text-slate-500">Blood Group:</span> {selectedResident.bloodGroup}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Guardian & Emergency</span>
                    <p><span className="text-slate-500">Guardian Name:</span> {selectedResident.guardianName}</p>
                    <p><span className="text-slate-500">Guardian Contact:</span> {selectedResident.guardianPhone}</p>
                    <p><span className="text-slate-500">Emergency Line:</span> {selectedResident.emergencyContact}</p>
                    <p><span className="text-slate-500">Permanent Address:</span> {selectedResident.permanentAddress}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Academic Enrollment</span>
                  <p><span className="text-slate-500">University / College:</span> {selectedResident.institution}</p>
                  <p><span className="text-slate-500">Department:</span> {selectedResident.department}</p>
                  <p><span className="text-slate-500">Year / Semester:</span> {selectedResident.yearSemester}</p>
                  <p><span className="text-slate-500">National ID / Passport:</span> <span className="font-mono">{selectedResident.nationalIdOrPassport}</span></p>
                </div>
              </div>
            )}

            {activeProfileTab === 'FINANCE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Historical Payment Vouchers</span>
                  {canAccess('MANAGE_FINANCE') && (
                    <button
                      onClick={() => {
                        setSelectedResident(null);
                        onOpenQuickAction('RECORD_PAYMENT');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + Record Payment
                    </button>
                  )}
                </div>
                {residentPayments.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {residentPayments.map(p => (
                      <div key={p.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{p.purpose.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.receiptNumber} · {p.date} · {p.paymentMethod}
                          </p>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          +{activeHostel.currency}{p.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-4 text-center">No payment transactions found for this resident.</p>
                )}
              </div>
            )}

            {activeProfileTab === 'COMPLAINTS' && (
              <div className="space-y-3">
                {residentComplaints.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {residentComplaints.map(c => (
                      <div key={c.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{c.subject}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Ticket #{c.ticketNumber} · {c.category}</p>
                        </div>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-4 text-center">No complaints filed by this resident.</p>
                )}
              </div>
            )}

            {activeProfileTab === 'LEAVES' && (
              <div className="space-y-3">
                {residentLeaves.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {residentLeaves.map(l => (
                      <div key={l.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{l.destination}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {l.leavingDate} to {l.returnDate} · Reason: {l.reason}
                          </p>
                        </div>
                        <StatusBadge status={l.status} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-4 text-center">No leave requests recorded.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
