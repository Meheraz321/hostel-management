import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Visitor, EmergencyIncident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  ShieldAlert,
  Plus,
  Search,
  Phone,
  AlertTriangle,
  Clock,
  LogOut,
  CheckCircle2,
  Car,
  Flame,
  Zap,
  Ambulance,
  Shield
} from 'lucide-react';

export const VisitorsSecurity: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'VISITORS' | 'EMERGENCY'>('VISITORS');
  const [isRegisterVisitorOpen, setIsRegisterVisitorOpen] = useState(false);
  const [isReportIncidentOpen, setIsReportIncidentOpen] = useState(false);

  // Visitor Form
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [residentId, setResidentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Emergency Form
  const [incType, setIncType] = useState<EmergencyIncident['incidentType']>('ELECTRICAL');
  const [incSeverity, setIncSeverity] = useState<EmergencyIncident['severity']>('HIGH');
  const [incLocation, setIncLocation] = useState('');
  const [incDescription, setIncDescription] = useState('');

  const hostelVisitors = db.visitors.filter(v => v.hostelId === activeHostel.id);
  const hostelIncidents = db.emergencyIncidents.filter(i => i.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);

  const getResident = (rId: string) => hostelResidents.find(r => r.id === rId);

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !residentId) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Name and resident are required' });
      return;
    }

    const res = storage.registerVisitor(
      {
        hostelId: activeHostel.id,
        visitorName,
        phone: visitorPhone || '+1 (555) 000-0000',
        nationalId: nationalId || 'ID-TEMP',
        residentId,
        purpose: purpose || 'Social visit in designated lounge',
        vehicleNumber: vehicleNumber || undefined,
        securityOfficer: user?.name || 'Gate Officer'
      },
      user?.name || 'Gate Officer',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Visitor Registered', message: res.message });
      setIsRegisterVisitorOpen(false);
      setVisitorName('');
      setPurpose('');
      setVehicleNumber('');
    }
  };

  const handleCheckOutVisitor = (vId: string) => {
    const res = storage.checkOutVisitor(vId, user?.name || 'Gate Officer', user?.role || 'HOSTEL_ADMIN');
    if (res.success) {
      addToast({ type: 'success', title: 'Visitor Exit Recorded', message: res.message });
    }
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incLocation || !incDescription) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Location and description are required' });
      return;
    }

    const res = storage.reportEmergencyIncident(
      {
        hostelId: activeHostel.id,
        incidentType: incType,
        severity: incSeverity,
        location: incLocation,
        description: incDescription,
        reportedBy: user?.name || 'Resident / Staff'
      },
      user?.name || 'Reporter',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'warning', title: 'Emergency Dispatched', message: res.message });
      setIsReportIncidentOpen(false);
      setIncLocation('');
      setIncDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Visitor Registry & Campus Security Hub
          </h2>
          <p className="text-xs text-slate-500">
            Gate log entries, visitor pass authorization, emergency hotlines and rapid incident reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAccess('MANAGE_VISITORS') && (
            <button
              onClick={() => setIsRegisterVisitorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Visitor Entry
            </button>
          )}
          <button
            onClick={() => setIsReportIncidentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="p-4 bg-slate-900 text-white rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Security Command Desk</span>
          <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5">{activeHostel.emergencyContact.securityDesk}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Head Warden Hotline</span>
          <p className="font-mono font-bold text-sm text-white mt-0.5">{activeHostel.emergencyContact.wardenPhone}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Emergency Ambulance</span>
          <p className="font-mono font-bold text-sm text-amber-400 mt-0.5">{activeHostel.emergencyContact.ambulance}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fire Service & Rescue</span>
          <p className="font-mono font-bold text-sm text-rose-400 mt-0.5">{activeHostel.emergencyContact.fireService}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('VISITORS')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'VISITORS'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Visitor Entry Logs ({hostelVisitors.length})
        </button>
        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'EMERGENCY'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Security Incident Reports ({hostelIncidents.length})
        </button>
      </div>

      {/* Tab: Visitors Log */}
      {activeTab === 'VISITORS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Visitor Name</th>
                  <th className="py-2.5 px-4 font-semibold">Contact & ID</th>
                  <th className="py-2.5 px-4 font-semibold">Resident Visited</th>
                  <th className="py-2.5 px-4 font-semibold">Purpose & Vehicle</th>
                  <th className="py-2.5 px-4 font-semibold">Entry / Exit</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelVisitors.map(vis => {
                  const res = getResident(vis.residentId);
                  return (
                    <tr key={vis.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {vis.visitorName}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-700 dark:text-slate-300">{vis.phone}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{vis.nationalId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Room {res?.roomId}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 truncate">{vis.purpose}</p>
                        {vis.vehicleNumber && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3" /> {vis.vehicleNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 block">In: {vis.entryTime}</span>
                        {vis.exitTime ? (
                          <span className="text-slate-400 block">Out: {vis.exitTime}</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 block">Active On-Premises</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={vis.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {vis.status === 'CHECKED_IN' && canAccess('MANAGE_VISITORS') && (
                          <button
                            onClick={() => handleCheckOutVisitor(vis.id)}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                          >
                            <LogOut className="w-3 h-3 inline mr-1" />
                            Log Exit
                          </button>
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

      {/* Tab: Emergency Incidents */}
      {activeTab === 'EMERGENCY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Incident Type</th>
                  <th className="py-2.5 px-4 font-semibold">Severity</th>
                  <th className="py-2.5 px-4 font-semibold">Location</th>
                  <th className="py-2.5 px-4 font-semibold">Reported Details</th>
                  <th className="py-2.5 px-4 font-semibold">Reported By</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {inc.incidentType}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-[10px] font-bold ${
                        inc.severity === 'CRITICAL' ? 'text-rose-600' : inc.severity === 'HIGH' ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{inc.location}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-slate-700 dark:text-slate-300">{inc.description}</p>
                      {inc.resolutionNotes && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">Notes: {inc.resolutionNotes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {inc.reportedBy} · {inc.reportedAt}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Visitor Modal */}
      <Modal
        isOpen={isRegisterVisitorOpen}
        onClose={() => setIsRegisterVisitorOpen(false)}
        title="Register Visitor Entry Pass"
        subtitle={`Security Gate - ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRegisterVisitor} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Visitor Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Robert Vance"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                National ID / Passport No.
              </label>
              <input
                type="text"
                placeholder="ID proof number"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Resident to Visit *
            </label>
            <select
              required
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
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
                Purpose of Visit
              </label>
              <input
                type="text"
                placeholder="e.g. Academic project books"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Vehicle Plate (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. MET-9912"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterVisitorOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Check-In Visitor Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isReportIncidentOpen}
        onClose={() => setIsReportIncidentOpen(false)}
        title="Report Campus Security / Safety Incident"
        subtitle="Dispatches alert to hostel emergency wardens"
        maxWidth="md"
      >
        <form onSubmit={handleReportIncident} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Category *
              </label>
              <select
                value={incType}
                onChange={(e) => setIncType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ELECTRICAL">Electrical Hazard</option>
                <option value="WATER_LEAKAGE">Water Leakage / Pipe Burst</option>
                <option value="FIRE">Fire & Smoke Alarm</option>
                <option value="MEDICAL">Medical Emergency</option>
                <option value="SECURITY">Security / Trespassing</option>
                <option value="OTHER">Other Incident</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Severity Level *
              </label>
              <select
                value={incSeverity}
                onChange={(e) => setIncSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical (Immediate Evacuation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Exact Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Floor 2 East corridor next to Room 204"
              value={incLocation}
              onChange={(e) => setIncLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description of Emergency *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide exact facts, immediate danger, injuries or property affected"
              value={incDescription}
              onChange={(e) => setIncDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportIncidentOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Dispatch Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
