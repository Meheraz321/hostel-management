import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Complaint, MaintenanceRequest, ComplaintCategory, ComplaintPriority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  Wrench,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const ComplaintsManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'COMPLAINTS' | 'MAINTENANCE'>('COMPLAINTS');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);

  // New Complaint Form state
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('ROOM');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('MEDIUM');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newResidentId, setNewResidentId] = useState('');

  // Complaint Resolution / Assignment Form state
  const [assignStaffId, setAssignStaffId] = useState('');
  const [newStatus, setNewStatus] = useState<Complaint['status']>('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // New Maintenance Workorder Form state
  const [mntRoomId, setMntRoomId] = useState('');
  const [mntIssue, setMntIssue] = useState('');
  const [mntPriority, setMntPriority] = useState<ComplaintPriority>('HIGH');
  const [mntStaffName, setMntStaffName] = useState('David Miller');
  const [mntEstCost, setMntEstCost] = useState(120);

  const hostelComplaints = db.complaints.filter(c => c.hostelId === activeHostel.id);
  const hostelMaintenance = db.maintenance.filter(m => m.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);
  const hostelStaff = db.staff.filter(s => s.hostelId === activeHostel.id);
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);

  const getResident = (rId: string) => hostelResidents.find(r => r.id === rId);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentId || !newSubject) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Resident and subject are required' });
      return;
    }

    const res = storage.submitComplaint({
      hostelId: activeHostel.id,
      residentId: newResidentId,
      roomId: getResident(newResidentId)?.roomId,
      category: newCategory,
      priority: newPriority,
      subject: newSubject,
      description: newDescription
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Ticket Registered', message: res.message });
      setIsNewComplaintOpen(false);
      setNewSubject('');
      setNewDescription('');
    }
  };

  const handleUpdateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const res = storage.updateComplaintStatus({
      complaintId: selectedComplaint.id,
      status: newStatus,
      assignedStaffId: assignStaffId || undefined,
      resolutionNotes: resolutionNotes || undefined,
      actorName: user?.name || 'Administrator',
      actorRole: user?.role || 'HOSTEL_ADMIN'
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Ticket Updated', message: res.message });
      setSelectedComplaint(null);
    }
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mntRoomId || !mntIssue) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Room and issue are required' });
      return;
    }

    const res = storage.addMaintenanceRequest(
      {
        hostelId: activeHostel.id,
        roomId: mntRoomId,
        requestedBy: user?.name || 'Operations Desk',
        issue: mntIssue,
        priority: mntPriority,
        assignedStaffName: mntStaffName,
        estimatedCost: Number(mntEstCost),
        actualCost: 0,
        status: 'PENDING',
        requestedDate: new Date().toISOString().split('T')[0]
      },
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Workorder Issued', message: res.message });
      setIsNewMaintenanceOpen(false);
      setMntIssue('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Complaints, Service Tickets & Maintenance
          </h2>
          <p className="text-xs text-slate-500">
            Track resident issues, assign engineering personnel, log estimated repair costs and verify completions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'COMPLAINTS' ? (
            <button
              onClick={() => setIsNewComplaintOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              File Service Ticket
            </button>
          ) : (
            <button
              onClick={() => setIsNewMaintenanceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Commission Workorder
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'COMPLAINTS'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Resident Complaints ({hostelComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'MAINTENANCE'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Room Maintenance Workorders ({hostelMaintenance.length})
        </button>
      </div>

      {/* Complaints List Table */}
      {activeTab === 'COMPLAINTS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Ticket No.</th>
                  <th className="py-2.5 px-4 font-semibold">Scholar & Room</th>
                  <th className="py-2.5 px-4 font-semibold">Issue Category</th>
                  <th className="py-2.5 px-4 font-semibold">Subject & Description</th>
                  <th className="py-2.5 px-4 font-semibold">Priority</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelComplaints.map(c => {
                  const res = getResident(c.residentId);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.status);
                        setAssignStaffId(c.assignedStaffId || '');
                        setResolutionNotes(c.resolutionNotes || '');
                      }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {c.ticketNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Room {c.roomId?.replace('rm-', '') || 'General'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{c.subject}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-[10px] font-bold ${
                          c.priority === 'URGENT' ? 'text-rose-600' : c.priority === 'HIGH' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          <ChevronRight className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance Workorders Table */}
      {activeTab === 'MAINTENANCE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Code</th>
                  <th className="py-2.5 px-4 font-semibold">Room Unit</th>
                  <th className="py-2.5 px-4 font-semibold">Maintenance Issue</th>
                  <th className="py-2.5 px-4 font-semibold">Assigned Technician</th>
                  <th className="py-2.5 px-4 font-semibold">Estimated Cost</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelMaintenance.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{m.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Room {m.roomId.replace('rm-', '')}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm">{m.issue}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{m.assignedStaffName}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-900 dark:text-white">
                      {activeHostel.currency}{m.estimatedCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{m.requestedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Management Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Service Ticket #${selectedComplaint?.ticketNumber}`}
        subtitle={`Resident: ${getResident(selectedComplaint?.residentId || '')?.fullName || 'Scholar'}`}
        maxWidth="md"
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdateComplaint} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Complaint Subject</span>
              <p className="font-semibold text-slate-900 dark:text-white">{selectedComplaint.subject}</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign Staff Technician
                </label>
                <select
                  value={assignStaffId}
                  onChange={(e) => setAssignStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="">-- Choose Staff --</option>
                  {hostelStaff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Resolution & Repair Notes
              </label>
              <textarea
                rows={3}
                placeholder="Log physical work completed or technician remarks"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
              >
                Save Ticket Status
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* New Complaint Modal */}
      <Modal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        title="File New Service Complaint"
        subtitle={`Hostel: ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Resident Scholar *
            </label>
            <select
              required
              value={newResidentId}
              onChange={(e) => setNewResidentId(e.target.value)}
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
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ROOM">Room Structure</option>
                <option value="ELECTRICITY">Electricity & Wiring</option>
                <option value="WATER_PLUMBING">Water & Plumbing</option>
                <option value="INTERNET_WIFI">Internet & WiFi</option>
                <option value="FOOD_MESS">Food & Dining</option>
                <option value="CLEANING">Cleaning & Housekeeping</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Immediate Response)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Ticket Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shower drain clogged in bathroom"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed explanation of the issue"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewComplaintOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* New Maintenance Workorder Modal */}
      <Modal
        isOpen={isNewMaintenanceOpen}
        onClose={() => setIsNewMaintenanceOpen(false)}
        title="Commission Maintenance Workorder"
        subtitle={`Engineering order in ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Room Location *
            </label>
            <select
              required
              value={mntRoomId}
              onChange={(e) => setMntRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">-- Choose Room --</option>
              {hostelRooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.roomType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Maintenance Task Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Balcony glass door sliding track repair"
              value={mntIssue}
              onChange={(e) => setMntIssue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assigned Technician
              </label>
              <input
                type="text"
                value={mntStaffName}
                onChange={(e) => setMntStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Estimated Cost ({activeHostel.currency})
              </label>
              <input
                type="number"
                min="0"
                value={mntEstCost}
                onChange={(e) => setMntEstCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewMaintenanceOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Issue Workorder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
