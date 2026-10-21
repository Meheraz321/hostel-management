import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Room, Bed, Resident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { storage } from '../../services/storage';
import {
  BedDouble,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  DollarSign,
  ArrowRightLeft,
  Wrench,
  Sparkles,
  Info
} from 'lucide-react';

interface RoomsMatrixProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction: (action: string) => void;
}

export const RoomsMatrix: React.FC<RoomsMatrixProps> = ({ onNavigate, onOpenQuickAction }) => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [selectedFloorId, setSelectedFloorId] = useState<string>('ALL');
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<string>('ALL');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // New Room Form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<Room['roomType']>('DOUBLE');
  const [newRoomRent, setNewRoomRent] = useState(400);
  const [newRoomFloorId, setNewRoomFloorId] = useState('');
  const [newRoomBuildingId, setNewRoomBuildingId] = useState('');

  const hostelBuildings = db.buildings.filter(b => b.hostelId === activeHostel.id);
  const hostelFloors = db.floors.filter(f => f.hostelId === activeHostel.id);
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const hostelBeds = db.beds.filter(b => b.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);

  // Filtered rooms
  const filteredRooms = hostelRooms.filter(room => {
    if (selectedFloorId !== 'ALL' && room.floorId !== selectedFloorId) return false;
    if (selectedRoomStatus !== 'ALL' && room.status !== selectedRoomStatus) return false;
    return true;
  });

  const getBedResident = (residentId?: string): Resident | undefined => {
    if (!residentId) return undefined;
    return hostelResidents.find(r => r.id === residentId);
  };

  const handleBedStatusToggle = (newStatus: Bed['status']) => {
    if (!selectedBed) return;
    const res = storage.updateBedStatus(
      selectedBed.id,
      newStatus,
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );
    if (res.success) {
      addToast({ type: 'success', title: 'Bed Status Updated', message: res.message });
      setSelectedBed(prev => prev ? { ...prev, status: newStatus } : null);
    } else {
      addToast({ type: 'error', title: 'Action Failed', message: res.message });
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Room number is required' });
      return;
    }

    const bedCount = newRoomType === 'SINGLE' ? 1 : newRoomType === 'DOUBLE' ? 2 : newRoomType === 'TRIPLE' ? 3 : newRoomType === 'VIP' ? 1 : 4;

    const res = storage.addRoom(
      {
        hostelId: activeHostel.id,
        buildingId: newRoomBuildingId || hostelBuildings[0]?.id || '',
        floorId: newRoomFloorId || hostelFloors[0]?.id || '',
        roomNumber: newRoomNumber,
        roomType: newRoomType,
        capacity: bedCount,
        monthlyRent: Number(newRoomRent),
        facilities: ['Attached Bath', 'Air Conditioning', 'WiFi', 'Individual Desks'],
        description: `Newly commissioned ${newRoomType} residential suite.`
      },
      bedCount,
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Room Added', message: res.message });
      setIsAddRoomOpen(false);
      setNewRoomNumber('');
    }
  };

  const activeBedResident = selectedBed ? getBedResident(selectedBed.assignedResidentId) : null;
  const activeBedRoom = selectedBed ? hostelRooms.find(r => r.id === selectedBed.roomId) : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Visual Room & Bed Allocation Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Interactive physical layout of rooms and individual beds across buildings and floors.
          </p>
        </div>

        {canAccess('MANAGE_ROOMS') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New Room
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar & Legend */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filter Floor:</span>
          </div>
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Residential Floors</option>
            {hostelFloors.map(f => (
              <option key={f.id} value={f.id}>
                Floor {f.floorNumber} - {f.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRoomStatus}
            onChange={(e) => setSelectedRoomStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Room Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="PARTIALLY_OCCUPIED">Partially Occupied</option>
            <option value="FULL">Full</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        {/* Status Color Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => {
            const roomBeds = hostelBeds.filter(b => b.roomId === room.id);
            const occupiedCount = roomBeds.filter(b => b.status === 'OCCUPIED').length;
            const roomFloor = hostelFloors.find(f => f.id === room.floorId);

            return (
              <div
                key={room.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Room Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Room {room.roomNumber}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {room.roomType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {roomFloor?.name || `Floor ${room.floorId}`}
                      </p>
                    </div>
                    <StatusBadge status={room.status} size="sm" />
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Rent / Bed:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {activeHostel.currency}{room.monthlyRent}/mo
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Occupancy:</span>
                    <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {occupiedCount} / {room.capacity} beds filled
                    </span>
                  </div>

                  {/* Individual Beds Visualization */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Individual Beds
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {roomBeds.map(bed => {
                        const resident = getBedResident(bed.assignedResidentId);
                        let bedBg = 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
                        if (bed.status === 'OCCUPIED') {
                          bedBg = 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300';
                        } else if (bed.status === 'MAINTENANCE') {
                          bedBg = 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300';
                        } else if (bed.status === 'RESERVED') {
                          bedBg = 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300';
                        }

                        return (
                          <button
                            key={bed.id}
                            onClick={() => setSelectedBed(bed)}
                            className={`p-2 rounded-lg border text-left transition-all hover:scale-[1.02] cursor-pointer ${bedBg}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs">{bed.bedNumber}</span>
                              <span className="text-[9px] uppercase font-mono font-bold tracking-wider">
                                {bed.status.substring(0, 3)}
                              </span>
                            </div>
                            <p className="text-[10px] truncate mt-1">
                              {resident ? resident.fullName : 'Available'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Facilities tags */}
                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                  {room.facilities.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 space-y-3">
          <BedDouble className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No rooms registered yet</p>
          <p className="text-xs max-w-sm mx-auto text-slate-500">
            Register your first room and specify its capacity. Beds and status will be created automatically.
          </p>
          {canAccess('MANAGE_ROOMS') && (
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Register New Room
            </button>
          )}
        </div>
      )}

      {/* Bed Details & Control Drawer Modal */}
      <Modal
        isOpen={!!selectedBed}
        onClose={() => setSelectedBed(null)}
        title={`Bed Inspection: ${selectedBed?.bedNumber} (Room ${activeBedRoom?.roomNumber || ''})`}
        subtitle={`Hostel: ${activeHostel.name}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              {canAccess('MANAGE_ROOMS') && selectedBed?.status !== 'OCCUPIED' && (
                <button
                  onClick={() => handleBedStatusToggle(selectedBed?.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE')}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 inline mr-1" />
                  {selectedBed?.status === 'MAINTENANCE' ? 'Mark Available' : 'Set Maintenance'}
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedBed(null)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        }
      >
        {selectedBed && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedBed.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monthly Rent</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {activeHostel.currency}{selectedBed.monthlyRent}
                </span>
              </div>
            </div>

            {/* Resident Information if occupied */}
            {activeBedResident ? (
              <div className="p-4 border border-blue-100 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Allocated Resident Scholar
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBed(null);
                      onNavigate('residents');
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    View Bio →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{activeBedResident.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student ID</span>
                    <span className="font-mono">{activeBedResident.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Institution</span>
                    <span>{activeBedResident.institution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Allocation Date</span>
                    <span className="font-mono">{selectedBed.allocationDate || 'Aug 2026'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/50 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedBed(null);
                      onNavigate('transfers');
                    }}
                    className="flex-1 py-1 px-2 text-center text-xs font-medium text-blue-700 bg-white dark:bg-slate-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <ArrowRightLeft className="w-3 h-3 inline mr-1" />
                    Transfer Bed
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBed(null);
                      onNavigate('checkin');
                    }}
                    className="flex-1 py-1 px-2 text-center text-xs font-medium text-rose-700 bg-white dark:bg-slate-800 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Process Checkout
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-2">
                <p className="text-slate-500">
                  This bed is currently {selectedBed.status.toLowerCase()} and ready for student assignment.
                </p>
                {canAccess('CHECK_IN_OUT') && selectedBed.status === 'AVAILABLE' && (
                  <button
                    onClick={() => {
                      setSelectedBed(null);
                      onOpenQuickAction('ADD_RESIDENT');
                    }}
                    className="py-1.5 px-4 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
                  >
                    Check-In Resident to this Bed
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Register New Hostel Room"
        subtitle={`Commission room in ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Room Number / Identifier
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 402, 501"
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Room Type
              </label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="SINGLE">Single Studio (1 Bed)</option>
                <option value="DOUBLE">Double Sharing (2 Beds)</option>
                <option value="TRIPLE">Triple Sharing (3 Beds)</option>
                <option value="FOUR_BED">Quad Suite (4 Beds)</option>
                <option value="VIP">Executive VIP (1 Bed)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Monthly Rent Per Bed ({activeHostel.currency})
              </label>
              <input
                type="number"
                required
                min="50"
                value={newRoomRent}
                onChange={(e) => setNewRoomRent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Floor
              </label>
              <select
                value={newRoomFloorId}
                onChange={(e) => setNewRoomFloorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                {hostelFloors.map(f => (
                  <option key={f.id} value={f.id}>
                    Floor {f.floorNumber} - {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Building Wing
              </label>
              <select
                value={newRoomBuildingId}
                onChange={(e) => setNewRoomBuildingId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                {hostelBuildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddRoomOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Create Room & Beds
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
