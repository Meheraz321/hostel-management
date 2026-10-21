import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { ArrowRightLeft, CheckCircle2, History, BedDouble, AlertCircle } from 'lucide-react';

interface RoomTransfersProps {
  onNavigate: (tab: string) => void;
}

export const RoomTransfers: React.FC<RoomTransfersProps> = ({ onNavigate }) => {
  const { activeHostel, db, addToast } = useHostel();
  const { user } = useAuth();

  const [residentId, setResidentId] = useState('');
  const [toRoomId, setToRoomId] = useState('');
  const [toBedId, setToBedId] = useState('');
  const [reason, setReason] = useState('Mutual room change requested for study schedule compatibility');

  const activeResidents = db.residents.filter(r => r.hostelId === activeHostel.id && r.status === 'ACTIVE' && r.bedId);
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const availableBeds = db.beds.filter(b => b.hostelId === activeHostel.id && b.status === 'AVAILABLE');

  const selectedResident = activeResidents.find(r => r.id === residentId);
  const currentBed = selectedResident ? db.beds.find(b => b.id === selectedResident.bedId) : null;
  const currentRoom = selectedResident?.roomId ? hostelRooms.find(r => r.id === selectedResident.roomId) : null;

  // Filter available beds for the target room
  const targetRoomBeds = toRoomId ? availableBeds.filter(b => b.roomId === toRoomId) : availableBeds;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId || !toRoomId || !toBedId) {
      addToast({ type: 'error', title: 'Selection Missing', message: 'Please select a resident and target bed' });
      return;
    }

    const res = storage.transferResident({
      residentId,
      toRoomId,
      toBedId,
      reason,
      actorName: user?.name || 'Administrator',
      actorRole: user?.role || 'HOSTEL_ADMIN'
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Transfer Completed', message: res.message });
      setResidentId('');
      setToRoomId('');
      setToBedId('');
      onNavigate('rooms');
    } else {
      addToast({ type: 'error', title: 'Transfer Failed', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Room & Bed Transfer System
        </h2>
        <p className="text-xs text-slate-500">
          Reallocate resident scholars to different rooms or beds while updating inventory and bed availability automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="md:col-span-2">
          <form onSubmit={handleTransfer} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 text-xs shadow-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Active Resident to Transfer *
              </label>
              <select
                required
                value={residentId}
                onChange={(e) => {
                  setResidentId(e.target.value);
                  setToRoomId('');
                  setToBedId('');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">-- Choose Resident Scholar --</option>
                {activeResidents.map(res => (
                  <option key={res.id} value={res.id}>
                    {res.fullName} ({res.studentId}) · Currently in Room {res.roomId}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Allocation Preview */}
            {selectedResident && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between text-xs border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Origin Allocation</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    Room {currentRoom?.roomNumber || 'Unknown'} · {currentBed?.bedNumber || 'Bed'}
                  </p>
                  <p className="text-[11px] text-slate-500">{currentRoom?.roomType.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Current Rent</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {activeHostel.currency}{currentBed?.monthlyRent}/mo
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Room *
                </label>
                <select
                  required
                  disabled={!residentId}
                  value={toRoomId}
                  onChange={(e) => {
                    setToRoomId(e.target.value);
                    setToBedId('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden disabled:opacity-50"
                >
                  <option value="">-- Choose Target Room --</option>
                  {hostelRooms
                    .filter(r => (r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED') && r.id !== selectedResident?.roomId)
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} ({room.roomType.replace('_', ' ')}) - {activeHostel.currency}{room.monthlyRent}/mo
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Available Bed *
                </label>
                <select
                  required
                  disabled={!toRoomId}
                  value={toBedId}
                  onChange={(e) => setToBedId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden disabled:opacity-50"
                >
                  <option value="">-- Choose Target Bed --</option>
                  {targetRoomBeds.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({activeHostel.currency}{b.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Transfer / Authorization Note *
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain academic or room compatibility reason"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!residentId || !toBedId}
                className="flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Execute Transfer & Update Matrices
              </button>
            </div>
          </form>
        </div>

        {/* Transfer History Sidebar */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Transfer Log</h3>
          </div>

          {db.transfers.length > 0 ? (
            <div className="space-y-3">
              {db.transfers.map(t => {
                const res = db.residents.find(r => r.id === t.residentId);
                return (
                  <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                    <p className="text-[11px] text-slate-500">
                      Room {t.fromRoomId.replace('rm-', '')} → Room {t.toRoomId.replace('rm-', '')}
                    </p>
                    <p className="text-[10px] text-slate-400 italic">"{t.reason}"</p>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>By: {t.approvedBy}</span>
                      <span>{t.transferDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-6">
              No recent room transfers recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
