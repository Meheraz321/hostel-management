import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Bed, Room, Resident } from '../../types';
import { UserPlus, LogOut, CheckCircle2, DollarSign, BedDouble, AlertCircle, FileText } from 'lucide-react';

interface CheckInOutManagerProps {
  onNavigate: (tab: string) => void;
}

export const CheckInOutManager: React.FC<CheckInOutManagerProps> = ({ onNavigate }) => {
  const { activeHostel, db, addToast } = useHostel();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'CHECKIN' | 'CHECKOUT'>('CHECKIN');

  // Check-In Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [depositAmount, setDepositAmount] = useState(600);
  const [initialRentPaid, setInitialRentPaid] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'BKASH_MOBILE' | 'CREDIT_CARD'>('BKASH_MOBILE');

  // Check-Out Form State
  const [checkoutResidentId, setCheckoutResidentId] = useState('');
  const [damageCharges, setDamageCharges] = useState(0);
  const [clearanceNotes, setClearanceNotes] = useState('Room keys returned. Bed, mattress and study furniture inspected in good condition.');

  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const availableBeds = db.beds.filter(b => b.hostelId === activeHostel.id && b.status === 'AVAILABLE');
  const activeResidents = db.residents.filter(r => r.hostelId === activeHostel.id && r.status === 'ACTIVE');

  // Filter available beds for selected room
  const roomBeds = selectedRoomId ? availableBeds.filter(b => b.roomId === selectedRoomId) : availableBeds;

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId || !selectedRoomId) {
      addToast({ type: 'error', title: 'Bed Required', message: 'Please select an available room and bed' });
      return;
    }

    const res = storage.checkInResident({
      resident: {
        hostelId: activeHostel.id,
        studentId: studentId || `STU-${Date.now().toString().substring(7)}`,
        registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName,
        email,
        phone,
        dateOfBirth: '2004-01-01',
        gender,
        bloodGroup,
        institution,
        department,
        yearSemester: '1st Year',
        guardianName,
        guardianPhone,
        emergencyContact: emergencyContact || guardianPhone,
        permanentAddress,
        currentAddress: `Room ${selectedRoomId}, ${activeHostel.name}`,
        nationalIdOrPassport: `NID-${Math.floor(10000000 + Math.random() * 90000000)}`,
        joiningDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        documents: []
      },
      roomId: selectedRoomId,
      bedId: selectedBedId,
      securityDeposit: Number(depositAmount),
      initialRentPaid: Number(initialRentPaid),
      paymentMethod,
      actorName: user?.name || 'Administrator',
      actorRole: user?.role || 'HOSTEL_ADMIN'
    });

    if (res.success) {
      addToast({ type: 'success', title: 'Check-In Complete', message: res.message });
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setSelectedBedId('');
      onNavigate('residents');
    } else {
      addToast({ type: 'error', title: 'Check-In Failed', message: res.message });
    }
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutResidentId) {
      addToast({ type: 'error', title: 'Resident Required', message: 'Please choose a resident to check out' });
      return;
    }

    const res = storage.checkOutResident({
      residentId: checkoutResidentId,
      damageCharges: Number(damageCharges),
      clearanceNotes,
      actorName: user?.name || 'Administrator',
      actorRole: user?.role || 'HOSTEL_ADMIN'
    });

    if (res.success) {
      addToast({
        type: 'success',
        title: 'Check-Out Settled',
        message: `Settlement cleared. Net refund: ${activeHostel.currency}${res.settlement?.depositRefunded || 0}`
      });
      setCheckoutResidentId('');
      onNavigate('rooms');
    } else {
      addToast({ type: 'error', title: 'Check-Out Failed', message: res.message });
    }
  };

  const selectedResidentForCheckout = activeResidents.find(r => r.id === checkoutResidentId);
  const checkoutBed = selectedResidentForCheckout ? db.beds.find(b => b.id === selectedResidentForCheckout.bedId) : null;
  const depositPaid = checkoutBed?.depositAmount || 0;
  const pendingRent = selectedResidentForCheckout?.totalDue || 0;
  const netRefundCalculated = Math.max(0, depositPaid - (pendingRent + Number(damageCharges)));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Digital Resident Check-In & Check-Out Clearance
        </h2>
        <p className="text-xs text-slate-500">
          Execute digital intake contracts or finalize departure damage inspection & deposit settlement.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('CHECKIN')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'CHECKIN'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Digital Check-In Workflow
        </button>
        <button
          onClick={() => setActiveTab('CHECKOUT')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'CHECKOUT'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LogOut className="w-4 h-4" />
          Check-Out Clearance & Deposit Settlement
        </button>
      </div>

      {/* Check-In Tab Form */}
      {activeTab === 'CHECKIN' && (
        <form onSubmit={handleCheckInSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 1: Scholar Personal & Academic Details
            </h3>
            <p className="text-slate-500 text-[11px]">Identity information registered into university residency ledger</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zayan Farooq"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Student / Scholar ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STU-2026-9021"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Contact *
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                University / Institution
              </label>
              <input
                type="text"
                placeholder="Metropolis Institute of Technology"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Department & Major
              </label>
              <input
                type="text"
                placeholder="Computer Science & Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Guardian Full Name
              </label>
              <input
                type="text"
                placeholder="Guardian / Sponsor"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Guardian Phone / Emergency
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 999-0000"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 pt-4 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 2: Room & Individual Bed Allocation
            </h3>
            <p className="text-slate-500 text-[11px]">Select from active available beds in {activeHostel.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Room *
              </label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedBedId('');
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">-- Choose Room with Available Capacity --</option>
                {hostelRooms
                  .filter(r => r.status === 'AVAILABLE' || r.status === 'PARTIALLY_OCCUPIED')
                  .map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} ({room.roomType.replace('_', ' ')}) - {activeHostel.currency}{room.monthlyRent}/mo
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Available Bed *
              </label>
              <select
                required
                disabled={!selectedRoomId}
                value={selectedBedId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setSelectedBedId(bId);
                  const bObj = availableBeds.find(b => b.id === bId);
                  if (bObj) {
                    setDepositAmount(bObj.depositAmount);
                    setInitialRentPaid(bObj.monthlyRent);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden disabled:opacity-50"
              >
                <option value="">-- Choose Bed --</option>
                {roomBeds.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} (Rent: {activeHostel.currency}{b.monthlyRent}, Deposit: {activeHostel.currency}{b.depositAmount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 pt-4 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Step 3: Initial Security Deposit & Advance Rent
            </h3>
            <p className="text-slate-500 text-[11px]">Generates initial voucher and receipt record</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Security Deposit ({activeHostel.currency})
              </label>
              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Advance Rent Paid ({activeHostel.currency})
              </label>
              <input
                type="number"
                min="0"
                value={initialRentPaid}
                onChange={(e) => setInitialRentPaid(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="BKASH_MOBILE">bKash Mobile Wallet</option>
                <option value="BANK_TRANSFER">Direct Wire / Bank Transfer</option>
                <option value="CASH">Cash at Reception</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
            >
              Confirm Digital Check-In & Issue Receipt
            </button>
          </div>
        </form>
      )}

      {/* Check-Out Tab Form */}
      {activeTab === 'CHECKOUT' && (
        <form onSubmit={handleCheckOutSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Departure Clearance & Deposit Settlement
            </h3>
            <p className="text-slate-500 text-[11px]">
              Verifies room inventory, deducts damages or unpaid rent, and releases bed back to Available.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Departing Resident *
            </label>
            <select
              required
              value={checkoutResidentId}
              onChange={(e) => setCheckoutResidentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">-- Choose Resident Scholar --</option>
              {activeResidents.map(res => (
                <option key={res.id} value={res.id}>
                  {res.fullName} ({res.studentId}) · Room {res.roomId}
                </option>
              ))}
            </select>
          </div>

          {selectedResidentForCheckout && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Security Deposit Held</span>
                  <span className="font-mono tabular-nums font-bold text-sm text-slate-900 dark:text-white">
                    {activeHostel.currency}{depositPaid.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending Rent Due</span>
                  <span className="font-mono tabular-nums font-bold text-sm text-rose-600 dark:text-rose-400">
                    -{activeHostel.currency}{pendingRent.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Refund Amount</span>
                  <span className="font-mono tabular-nums font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {activeHostel.currency}{netRefundCalculated.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Damage Charges / Lost Item Fines ({activeHostel.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={damageCharges}
                  onChange={(e) => setDamageCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clearance Notes & Keys Handover Verification
                </label>
                <textarea
                  rows={3}
                  value={clearanceNotes}
                  onChange={(e) => setClearanceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={!selectedResidentForCheckout}
              className="px-6 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              Complete Settlement & Release Bed
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
