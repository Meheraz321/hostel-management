import {
  Hostel,
  Building,
  Floor,
  Room,
  Bed,
  Resident,
  User,
  PaymentRecord,
  Invoice,
  ExpenseRecord,
  Complaint,
  MaintenanceRequest,
  InventoryItem,
  RoomInventoryItem,
  Visitor,
  LeaveRequest,
  AttendanceRecord,
  StaffMember,
  StaffAttendance,
  Notice,
  EmergencyIncident,
  AuditLog,
  MessMenuDay,
  RoomTransfer,
  CheckInRecord,
  CheckOutRecord,
  UserRole
} from '../types';

const STORAGE_KEY = 'hostelsphere_prod_clean_v1';

export async function hashPassword(plainText: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    // Basic fallback if crypto.subtle is not supported
    let hash = 0;
    for (let i = 0; i < plainText.length; i++) {
      const char = plainText.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

export interface DatabaseState {
  hostels: Hostel[];
  users: User[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
  residents: Resident[];
  payments: PaymentRecord[];
  invoices: Invoice[];
  expenses: ExpenseRecord[];
  complaints: Complaint[];
  maintenance: MaintenanceRequest[];
  visitors: Visitor[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  staff: StaffMember[];
  staffAttendance: StaffAttendance[];
  messMenu: MessMenuDay[];
  inventory: InventoryItem[];
  roomInventory: RoomInventoryItem[];
  notices: Notice[];
  emergencyIncidents: EmergencyIncident[];
  auditLogs: AuditLog[];
  transfers: RoomTransfer[];
  checkIns: CheckInRecord[];
  checkOuts: CheckOutRecord[];
}

function getCleanInitialState(): DatabaseState {
  return {
    hostels: [],
    users: [],
    buildings: [],
    floors: [],
    rooms: [],
    beds: [],
    residents: [],
    payments: [],
    invoices: [],
    expenses: [],
    complaints: [],
    maintenance: [],
    visitors: [],
    leaves: [],
    attendance: [],
    staff: [],
    staffAttendance: [],
    messMenu: [],
    inventory: [],
    roomInventory: [],
    notices: [],
    emergencyIncidents: [],
    auditLogs: [],
    transfers: [],
    checkIns: [],
    checkOuts: []
  };
}

class StorageService {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Wipe previous versions to ensure no stale default data remains
    try {
      localStorage.removeItem('hostelsphere_pms_db_v1');
      localStorage.removeItem('hostelsphere_pms_db_v2');
      localStorage.removeItem('hostelsphere_clean_db_v3');
      localStorage.removeItem('hostelsphere_mock_db');
    } catch (e) {
      // ignore
    }
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.hostels)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage', e);
    }
    const initial = getCleanInitialState();
    this.save(initial);
    return initial;
  }

  public save(state: DatabaseState): void {
    this.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  public clearAllData(): void {
    const empty = getCleanInitialState();
    this.save(empty);
  }

  public exportBackup(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.users)) {
        this.save(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup format', e);
    }
    return false;
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- Real Authentication & User Registration ---
  public async registerUser(params: {
    name: string;
    email: string;
    passwordPlain: string;
    phone?: string;
    role: UserRole;
    hostelName?: string;
    hostelAddress?: string;
    hostelCity?: string;
    hostelPhone?: string;
    currency?: string;
    existingHostelId?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Check duplicate email
    const exists = this.state.users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, message: 'This email is already registered. Please sign in.' };
    }

    if (params.passwordPlain.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const passwordHash = await hashPassword(params.passwordPlain);
    let assignedHostelId = params.existingHostelId || '';
    let updatedHostels = [...this.state.hostels];
    let updatedBuildings = [...this.state.buildings];
    let updatedFloors = [...this.state.floors];

    // If registering an admin and hostel information is provided, create the hostel
    if (params.hostelName && params.hostelName.trim() !== '') {
      assignedHostelId = `hostel-${Date.now()}`;
      const newHostel: Hostel = {
        id: assignedHostelId,
        name: params.hostelName.trim(),
        code: (params.hostelName.substring(0, 3).toUpperCase() || 'HST') + '-01',
        address: params.hostelAddress || 'Hostel Campus',
        city: params.hostelCity || 'Campus City',
        phone: params.hostelPhone || params.phone || '+880 1700-000000',
        email: normalizedEmail,
        capacity: 100,
        description: 'Residential accommodation managed by HostelSphere PMS.',
        facilities: ['High-speed WiFi', '24/7 Security', 'Dining Hall', 'Study Lounge'],
        rules: [
          'Hostel gate closes at 10:30 PM. Late entries require approval.',
          'Visitors permitted only in lounge during daytime hours.',
          'Smoking and prohibited substances are strictly banned.',
          'Quiet study hours observed from 11:00 PM.'
        ],
        emergencyContact: {
          police: '999',
          ambulance: '999',
          fireService: '999',
          wardenPhone: params.phone || '+880 1700-000000',
          managerPhone: params.phone || '+880 1700-000000',
          securityDesk: '+880 1700-000001'
        },
        currency: params.currency || '৳',
        monthlyLateFeePercentage: 5
      };

      // Create default Building A and Floor 1 for convenience
      const bldId = `bld-${Date.now()}`;
      updatedBuildings.push({
        id: bldId,
        hostelId: assignedHostelId,
        name: 'Main Block A',
        code: 'BLK-A',
        totalFloors: 1,
        supervisorName: params.name
      });
      updatedFloors.push({
        id: `flr-${Date.now()}`,
        buildingId: bldId,
        hostelId: assignedHostelId,
        floorNumber: 1,
        name: 'Ground Floor',
        supervisorName: params.name
      });

      updatedHostels.push(newHostel);
    } else if (!assignedHostelId && this.state.hostels.length > 0) {
      assignedHostelId = this.state.hostels[0].id;
    }

    const newUserId = `usr-${Date.now()}`;
    let residentId: string | undefined = undefined;
    let updatedResidents = [...this.state.residents];

    if (params.role === 'RESIDENT') {
      residentId = `res-${Date.now()}`;
      const newResident: Resident = {
        id: residentId,
        hostelId: assignedHostelId,
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: params.name,
        email: normalizedEmail,
        phone: params.phone || '',
        dateOfBirth: '2004-01-01',
        gender: 'MALE',
        bloodGroup: 'O+',
        institution: 'University / Institute',
        department: 'General Studies',
        yearSemester: '1st Year',
        guardianName: 'Guardian',
        guardianPhone: params.phone || '',
        emergencyContact: params.phone || '',
        permanentAddress: '',
        currentAddress: '',
        nationalIdOrPassport: `NID-${Math.floor(10000000 + Math.random() * 90000000)}`,
        joiningDate: new Date().toISOString().split('T')[0],
        contractStartDate: new Date().toISOString().split('T')[0],
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
        documents: [],
        totalDue: 0,
        totalPaid: 0
      };
      updatedResidents.push(newResident);
    }

    const newUser: User = {
      id: newUserId,
      name: params.name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: params.phone,
      role: params.role,
      hostelId: assignedHostelId || undefined,
      residentId,
      createdAt: new Date().toISOString()
    };

    const updatedState: DatabaseState = {
      ...this.state,
      users: [...this.state.users, newUser],
      hostels: updatedHostels,
      buildings: updatedBuildings,
      floors: updatedFloors,
      residents: updatedResidents
    };

    this.save(updatedState);
    this.logAudit(newUser.name, newUser.role, 'USER_REGISTERED', 'Authentication', `New user registered with role ${newUser.role}`, assignedHostelId);

    return { success: true, message: 'Account registered successfully!', user: newUser };
  }

  public async loginUser(email: string, passwordPlain: string): Promise<{ success: boolean; message: string; user?: User }> {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = this.state.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return { success: false, message: 'No account registered with this email address.' };
    }

    if (foundUser.passwordHash) {
      const inputHash = await hashPassword(passwordPlain);
      if (inputHash !== foundUser.passwordHash) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
    }

    this.logAudit(foundUser.name, foundUser.role, 'USER_LOGIN', 'Authentication', 'User logged in successfully', foundUser.hostelId);
    return { success: true, message: 'Login successful!', user: foundUser };
  }

  // --- Audit Logging ---
  public logAudit(userName: string, userRole: any, action: string, module: string, details: string, hostelId = ''): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      hostelId: hostelId || (this.state.hostels[0]?.id || 'hostel-01'),
      userName: userName || 'User',
      userRole: userRole || 'HOSTEL_ADMIN',
      action,
      module,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const updated = {
      ...this.state,
      auditLogs: [newLog, ...this.state.auditLogs]
    };
    this.save(updated);
  }

  // --- Hostels ---
  public addHostel(hostel: Omit<Hostel, 'id'>, actorName: string, actorRole: any): { success: boolean; message: string; hostel?: Hostel } {
    const id = `hostel-${Date.now()}`;
    const newHostel: Hostel = {
      ...hostel,
      id
    };
    const bldId = `bld-${Date.now()}`;
    const newBuilding: Building = {
      id: bldId,
      hostelId: id,
      name: 'Main Wing',
      code: 'BLK-A',
      totalFloors: 1,
      supervisorName: actorName
    };
    const newFloor: Floor = {
      id: `flr-${Date.now()}`,
      buildingId: bldId,
      hostelId: id,
      floorNumber: 1,
      name: 'Ground Floor',
      supervisorName: actorName
    };

    const updatedState: DatabaseState = {
      ...this.state,
      hostels: [...this.state.hostels, newHostel],
      buildings: [...this.state.buildings, newBuilding],
      floors: [...this.state.floors, newFloor]
    };

    this.save(updatedState);
    this.logAudit(actorName, actorRole, 'HOSTEL_CREATED', 'Hostel Management', `Created new hostel: ${newHostel.name}`, id);
    return { success: true, message: 'Hostel registered successfully', hostel: newHostel };
  }

  // --- Rooms & Beds Relational Recalculation ---
  private refreshRoomStatus(roomId: string, beds: Bed[], rooms: Room[]): Room[] {
    const roomBeds = beds.filter(b => b.roomId === roomId);
    if (!roomBeds.length) return rooms;

    const occupiedCount = roomBeds.filter(b => b.status === 'OCCUPIED').length;
    const maintenanceCount = roomBeds.filter(b => b.status === 'MAINTENANCE').length;
    
    let newStatus: Room['status'] = 'AVAILABLE';
    if (maintenanceCount === roomBeds.length) {
      newStatus = 'MAINTENANCE';
    } else if (occupiedCount === roomBeds.length) {
      newStatus = 'FULL';
    } else if (occupiedCount > 0) {
      newStatus = 'PARTIALLY_OCCUPIED';
    } else {
      newStatus = 'AVAILABLE';
    }

    return rooms.map(r => (r.id === roomId ? { ...r, status: newStatus } : r));
  }

  // --- Check-In Workflow ---
  public checkInResident(params: {
    resident: Omit<Resident, 'id' | 'totalDue' | 'totalPaid' | 'status'>;
    roomId: string;
    bedId: string;
    securityDeposit: number;
    initialRentPaid: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    actorName: string;
    actorRole: any;
  }): { success: boolean; message: string; residentId?: string } {
    const targetBed = this.state.beds.find(b => b.id === params.bedId);
    if (!targetBed) return { success: false, message: 'Selected bed does not exist' };
    if (targetBed.status === 'OCCUPIED') return { success: false, message: 'Bed is already occupied by another resident' };
    if (targetBed.status === 'MAINTENANCE') return { success: false, message: 'Bed is currently under maintenance' };

    const newResidentId = `res-${Date.now()}`;
    const newResident: Resident = {
      ...params.resident,
      id: newResidentId,
      roomId: params.roomId,
      bedId: params.bedId,
      status: 'ACTIVE',
      totalDue: Math.max(0, targetBed.monthlyRent - params.initialRentPaid),
      totalPaid: params.initialRentPaid + params.securityDeposit
    };

    // Update Bed
    const updatedBeds = this.state.beds.map(b => 
      b.id === params.bedId 
        ? { ...b, status: 'OCCUPIED' as const, assignedResidentId: newResidentId, allocationDate: new Date().toISOString().split('T')[0] }
        : b
    );

    // Update Room
    const updatedRooms = this.refreshRoomStatus(params.roomId, updatedBeds, this.state.rooms);

    // Check-in Record
    const checkInRecord: CheckInRecord = {
      id: `cin-${Date.now()}`,
      residentId: newResidentId,
      hostelId: params.resident.hostelId,
      roomId: params.roomId,
      bedId: params.bedId,
      checkInDate: new Date().toISOString().split('T')[0],
      securityDeposit: params.securityDeposit,
      initialRentPaid: params.initialRentPaid,
      notes: 'Standard digital check-in completed',
      verifiedBy: params.actorName
    };

    // Initial Payment
    const totalPaidNow = params.initialRentPaid + params.securityDeposit;
    const newPayments = [...this.state.payments];
    if (totalPaidNow > 0) {
      newPayments.unshift({
        id: `pay-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        hostelId: params.resident.hostelId,
        residentId: newResidentId,
        amount: totalPaidNow,
        paymentMethod: params.paymentMethod,
        date: new Date().toISOString().split('T')[0],
        purpose: 'SECURITY_DEPOSIT',
        referenceNotes: `Check-in advance payment (Deposit: $${params.securityDeposit}, Rent: $${params.initialRentPaid})`,
        status: 'COMPLETED',
        collectedBy: params.actorName
      });
    }

    const updatedState: DatabaseState = {
      ...this.state,
      residents: [newResident, ...this.state.residents],
      beds: updatedBeds,
      rooms: updatedRooms,
      checkIns: [checkInRecord, ...this.state.checkIns],
      payments: newPayments
    };

    this.save(updatedState);
    this.logAudit(params.actorName, params.actorRole, 'RESIDENT_CHECKIN', 'Resident Lifecycle', `Checked in resident ${newResident.fullName} to Room ${targetBed.roomId} - ${targetBed.bedNumber}`, params.resident.hostelId);

    return { success: true, message: 'Resident successfully checked in!', residentId: newResidentId };
  }

  // --- Check-Out Workflow ---
  public checkOutResident(params: {
    residentId: string;
    damageCharges: number;
    clearanceNotes: string;
    actorName: string;
    actorRole: any;
  }): { success: boolean; message: string; settlement?: CheckOutRecord } {
    const resident = this.state.residents.find(r => r.id === params.residentId);
    if (!resident) return { success: false, message: 'Resident not found' };

    const bed = this.state.beds.find(b => b.id === resident.bedId);
    const deposit = bed?.depositAmount || 0;
    const pendingRent = resident.totalDue || 0;
    const netRefund = Math.max(0, deposit - (pendingRent + params.damageCharges));

    // Release Bed
    const updatedBeds = this.state.beds.map(b => 
      b.id === resident.bedId 
        ? { ...b, status: 'AVAILABLE' as const, assignedResidentId: undefined, allocationDate: undefined }
        : b
    );

    // Refresh Room Status
    const updatedRooms = resident.roomId ? this.refreshRoomStatus(resident.roomId, updatedBeds, this.state.rooms) : this.state.rooms;

    const checkOutRecord: CheckOutRecord = {
      id: `cout-${Date.now()}`,
      residentId: resident.id,
      hostelId: resident.hostelId,
      roomId: resident.roomId || '',
      bedId: resident.bedId || '',
      checkOutDate: new Date().toISOString().split('T')[0],
      pendingRentDues: pendingRent,
      utilityDues: 0,
      damageCharges: params.damageCharges,
      depositRefunded: netRefund,
      finalSettlementAmount: netRefund,
      clearanceNotes: params.clearanceNotes,
      processedBy: params.actorName
    };

    const updatedResidents = this.state.residents.map(r => 
      r.id === resident.id 
        ? { ...r, status: 'CHECKED_OUT' as const, roomId: undefined, bedId: undefined, totalDue: 0 }
        : r
    );

    const updatedState: DatabaseState = {
      ...this.state,
      residents: updatedResidents,
      beds: updatedBeds,
      rooms: updatedRooms,
      checkOuts: [checkOutRecord, ...this.state.checkOuts]
    };

    this.save(updatedState);
    this.logAudit(params.actorName, params.actorRole, 'RESIDENT_CHECKOUT', 'Resident Lifecycle', `Processed checkout for ${resident.fullName}. Net deposit refund: $${netRefund}`, resident.hostelId);

    return { success: true, message: 'Resident check-out clearance completed successfully', settlement: checkOutRecord };
  }

  // --- Room / Bed Transfer Workflow ---
  public transferResident(params: {
    residentId: string;
    toRoomId: string;
    toBedId: string;
    reason: string;
    actorName: string;
    actorRole: any;
  }): { success: boolean; message: string } {
    const resident = this.state.residents.find(r => r.id === params.residentId);
    if (!resident) return { success: false, message: 'Resident not found' };

    const targetBed = this.state.beds.find(b => b.id === params.toBedId);
    if (!targetBed) return { success: false, message: 'Target bed not found' };
    if (targetBed.status === 'OCCUPIED') return { success: false, message: 'Target bed is already occupied' };
    if (targetBed.status === 'MAINTENANCE') return { success: false, message: 'Target bed is undergoing maintenance' };

    const oldBedId = resident.bedId;
    const oldRoomId = resident.roomId;

    let updatedBeds = this.state.beds.map(b => {
      if (b.id === oldBedId) {
        return { ...b, status: 'AVAILABLE' as const, assignedResidentId: undefined, allocationDate: undefined };
      }
      if (b.id === params.toBedId) {
        return { ...b, status: 'OCCUPIED' as const, assignedResidentId: resident.id, allocationDate: new Date().toISOString().split('T')[0] };
      }
      return b;
    });

    let updatedRooms = this.state.rooms;
    if (oldRoomId) updatedRooms = this.refreshRoomStatus(oldRoomId, updatedBeds, updatedRooms);
    updatedRooms = this.refreshRoomStatus(params.toRoomId, updatedBeds, updatedRooms);

    const updatedResidents = this.state.residents.map(r => 
      r.id === resident.id 
        ? { ...r, roomId: params.toRoomId, bedId: params.toBedId }
        : r
    );

    const transferRecord: RoomTransfer = {
      id: `trf-${Date.now()}`,
      residentId: resident.id,
      hostelId: resident.hostelId,
      fromRoomId: oldRoomId || '',
      fromBedId: oldBedId || '',
      toRoomId: params.toRoomId,
      toBedId: params.toBedId,
      transferDate: new Date().toISOString().split('T')[0],
      reason: params.reason,
      approvedBy: params.actorName
    };

    const updatedState: DatabaseState = {
      ...this.state,
      residents: updatedResidents,
      beds: updatedBeds,
      rooms: updatedRooms,
      transfers: [transferRecord, ...this.state.transfers]
    };

    this.save(updatedState);
    this.logAudit(params.actorName, params.actorRole, 'ROOM_TRANSFER', 'Room Allocation', `Transferred ${resident.fullName} to Room ${targetBed.roomId} - ${targetBed.bedNumber}. Reason: ${params.reason}`, resident.hostelId);

    return { success: true, message: 'Room transfer executed successfully' };
  }

  // --- Payment Collection ---
  public recordPayment(params: {
    residentId: string;
    amount: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    purpose: PaymentRecord['purpose'];
    referenceNotes?: string;
    invoiceId?: string;
    actorName: string;
    actorRole: any;
    hostelId: string;
  }): { success: boolean; message: string; receipt?: PaymentRecord } {
    if (params.amount <= 0) return { success: false, message: 'Payment amount must be greater than zero' };

    const resident = this.state.residents.find(r => r.id === params.residentId);
    if (!resident) return { success: false, message: 'Resident not found' };

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${Date.now()}`,
      receiptNumber,
      hostelId: params.hostelId,
      residentId: params.residentId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      purpose: params.purpose,
      referenceNotes: params.referenceNotes,
      status: 'COMPLETED',
      collectedBy: params.actorName
    };

    const newTotalDue = Math.max(0, resident.totalDue - params.amount);
    const newTotalPaid = resident.totalPaid + params.amount;
    const updatedResidents = this.state.residents.map(r => 
      r.id === resident.id ? { ...r, totalDue: newTotalDue, totalPaid: newTotalPaid } : r
    );

    let updatedInvoices = this.state.invoices;
    if (params.invoiceId) {
      updatedInvoices = this.state.invoices.map(inv => {
        if (inv.id === params.invoiceId) {
          const newPaid = inv.paidAmount + params.amount;
          const newDue = Math.max(0, inv.totalAmount - newPaid);
          const status = newDue === 0 ? 'PAID' : 'PARTIAL';
          return { ...inv, paidAmount: newPaid, dueAmount: newDue, status };
        }
        return inv;
      });
    }

    const updatedState: DatabaseState = {
      ...this.state,
      residents: updatedResidents,
      payments: [newPayment, ...this.state.payments],
      invoices: updatedInvoices
    };

    this.save(updatedState);
    this.logAudit(params.actorName, params.actorRole, 'PAYMENT_RECORDED', 'Finance', `Recorded payment of $${params.amount.toFixed(2)} (${params.paymentMethod}) for ${resident.fullName} - ${receiptNumber}`, params.hostelId);

    return { success: true, message: 'Payment recorded successfully', receipt: newPayment };
  }

  // --- Expenses ---
  public addExpense(params: Omit<ExpenseRecord, 'id'>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const newExpense: ExpenseRecord = {
      ...params,
      id: `exp-${Date.now()}`
    };
    const updatedState: DatabaseState = {
      ...this.state,
      expenses: [newExpense, ...this.state.expenses]
    };
    this.save(updatedState);
    this.logAudit(actorName, actorRole, 'EXPENSE_ADDED', 'Finance', `Logged expense: ${params.title} ($${params.amount.toFixed(2)}) under ${params.category}`, params.hostelId);
    return { success: true, message: 'Expense logged successfully' };
  }

  // --- Complaints ---
  public submitComplaint(params: {
    hostelId: string;
    residentId: string;
    roomId?: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    subject: string;
    description: string;
  }): { success: boolean; message: string; complaintId?: string } {
    const ticketNumber = `CMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber,
      hostelId: params.hostelId,
      residentId: params.residentId,
      roomId: params.roomId,
      category: params.category,
      priority: params.priority,
      subject: params.subject,
      description: params.description,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };
    const updatedState: DatabaseState = {
      ...this.state,
      complaints: [newComplaint, ...this.state.complaints]
    };
    this.save(updatedState);
    return { success: true, message: 'Complaint registered successfully', complaintId: newComplaint.id };
  }

  public updateComplaintStatus(params: {
    complaintId: string;
    status: Complaint['status'];
    assignedStaffId?: string;
    resolutionNotes?: string;
    actorName: string;
    actorRole: any;
  }): { success: boolean; message: string } {
    const complaint = this.state.complaints.find(c => c.id === params.complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found' };

    const updatedComplaints = this.state.complaints.map(c => {
      if (c.id === params.complaintId) {
        return {
          ...c,
          status: params.status,
          assignedStaffId: params.assignedStaffId || c.assignedStaffId,
          resolutionNotes: params.resolutionNotes || c.resolutionNotes,
          resolvedAt: params.status === 'RESOLVED' || params.status === 'CLOSED' ? new Date().toISOString() : c.resolvedAt
        };
      }
      return c;
    });

    this.save({ ...this.state, complaints: updatedComplaints });
    this.logAudit(params.actorName, params.actorRole, 'COMPLAINT_UPDATE', 'Operations', `Updated ticket #${complaint.ticketNumber} status to ${params.status}`, complaint.hostelId);
    return { success: true, message: 'Complaint updated successfully' };
  }

  // --- Maintenance Requests ---
  public addMaintenanceRequest(params: Omit<MaintenanceRequest, 'id' | 'code'>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const code = `MNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest: MaintenanceRequest = {
      ...params,
      id: `mnt-${Date.now()}`,
      code
    };
    this.save({
      ...this.state,
      maintenance: [newRequest, ...this.state.maintenance]
    });
    this.logAudit(actorName, actorRole, 'MAINTENANCE_CREATED', 'Maintenance', `Created maintenance request #${code} for Room ${params.roomId}`, params.hostelId);
    return { success: true, message: 'Maintenance request created successfully' };
  }

  // --- Visitors ---
  public registerVisitor(params: Omit<Visitor, 'id' | 'entryTime' | 'status'>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const newVisitor: Visitor = {
      ...params,
      id: `vis-${Date.now()}`,
      entryTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'CHECKED_IN'
    };
    this.save({
      ...this.state,
      visitors: [newVisitor, ...this.state.visitors]
    });
    this.logAudit(actorName, actorRole, 'VISITOR_CHECKIN', 'Security', `Visitor ${params.visitorName} checked in to visit resident ${params.residentId}`, params.hostelId);
    return { success: true, message: 'Visitor checked in successfully' };
  }

  public checkOutVisitor(visitorId: string, actorName: string, actorRole: any): { success: boolean; message: string } {
    const visitor = this.state.visitors.find(v => v.id === visitorId);
    if (!visitor) return { success: false, message: 'Visitor record not found' };

    const updatedVisitors = this.state.visitors.map(v => 
      v.id === visitorId 
        ? { ...v, status: 'CHECKED_OUT' as const, exitTime: new Date().toISOString().replace('T', ' ').substring(0, 16) }
        : v
    );

    this.save({ ...this.state, visitors: updatedVisitors });
    this.logAudit(actorName, actorRole, 'VISITOR_CHECKOUT', 'Security', `Visitor ${visitor.visitorName} logged exit`, visitor.hostelId);
    return { success: true, message: 'Visitor marked as checked out' };
  }

  // --- Leaves ---
  public submitLeaveRequest(params: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): { success: boolean; message: string } {
    const newLeave: LeaveRequest = {
      ...params,
      id: `lev-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.save({ ...this.state, leaves: [newLeave, ...this.state.leaves] });
    return { success: true, message: 'Leave request submitted successfully' };
  }

  public updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED', approverName: string, approverRole: any): { success: boolean; message: string } {
    const leave = this.state.leaves.find(l => l.id === leaveId);
    if (!leave) return { success: false, message: 'Leave request not found' };

    const updatedLeaves = this.state.leaves.map(l => 
      l.id === leaveId ? { ...l, status, approvedBy: approverName } : l
    );

    this.save({ ...this.state, leaves: updatedLeaves });
    this.logAudit(approverName, approverRole, 'LEAVE_STATUS_UPDATE', 'Leave Management', `${status} leave request for resident ${leave.residentId}`, leave.hostelId);
    return { success: true, message: `Leave request ${status.toLowerCase()}` };
  }

  // --- Attendance ---
  public markAttendance(params: {
    hostelId: string;
    residentId: string;
    date: string;
    status: AttendanceRecord['status'];
    actorName: string;
  }): void {
    const existingIndex = this.state.attendance.findIndex(
      a => a.hostelId === params.hostelId && a.residentId === params.residentId && a.date === params.date
    );

    let updatedAttendance = [...this.state.attendance];
    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        status: params.status,
        markedBy: params.actorName
      };
    } else {
      updatedAttendance.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        hostelId: params.hostelId,
        residentId: params.residentId,
        date: params.date,
        status: params.status,
        markedBy: params.actorName
      });
    }

    this.save({ ...this.state, attendance: updatedAttendance });
  }

  // --- Mess Menu ---
  public updateMessMenuDay(day: MessMenuDay['day'], update: Partial<MessMenuDay>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const exists = this.state.messMenu.some(m => m.day === day);
    const updatedMenu = exists
      ? this.state.messMenu.map(m => m.day === day ? { ...m, ...update } : m)
      : [...this.state.messMenu, { day, breakfast: '', lunch: '', snacks: '', dinner: '', ...update }];

    this.save({ ...this.state, messMenu: updatedMenu });
    this.logAudit(actorName, actorRole, 'MESS_MENU_UPDATE', 'Mess Management', `Updated mess menu for ${day}`);
    return { success: true, message: 'Mess menu updated successfully' };
  }

  // --- Staff Management ---
  public addStaffMember(params: Omit<StaffMember, 'id' | 'status'>, actorName: string, actorRole: any): { success: boolean; message: string; staff?: StaffMember } {
    const id = `stf-${Date.now()}`;
    const newStaff: StaffMember = {
      ...params,
      id,
      status: 'ACTIVE'
    };
    this.save({
      ...this.state,
      staff: [newStaff, ...this.state.staff]
    });
    this.logAudit(actorName, actorRole, 'STAFF_HIRED', 'Staff Management', `Registered staff member ${params.name} (${params.role})`, params.hostelId);
    return { success: true, message: `Staff member ${params.name} registered successfully`, staff: newStaff };
  }

  // --- Notices ---
  public publishNotice(params: Omit<Notice, 'id' | 'publishedAt'>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const newNotice: Notice = {
      ...params,
      id: `not-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0]
    };
    this.save({ ...this.state, notices: [newNotice, ...this.state.notices] });
    this.logAudit(actorName, actorRole, 'NOTICE_PUBLISHED', 'Communication', `Published notice: "${params.title}"`, params.hostelId);
    return { success: true, message: 'Notice published successfully' };
  }

  // --- Emergency Incidents ---
  public reportEmergencyIncident(params: Omit<EmergencyIncident, 'id' | 'reportedAt' | 'status'>, actorName: string, actorRole: any): { success: boolean; message: string } {
    const newIncident: EmergencyIncident = {
      ...params,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'REPORTED'
    };
    this.save({ ...this.state, emergencyIncidents: [newIncident, ...this.state.emergencyIncidents] });
    this.logAudit(actorName, actorRole, 'EMERGENCY_REPORTED', 'Security & Safety', `Reported emergency incident (${params.incidentType} - ${params.severity}) at ${params.location}`, params.hostelId);
    return { success: true, message: 'Emergency alert dispatched to response team' };
  }

  // --- Room & Bed Management ---
  public addRoom(params: Omit<Room, 'id' | 'status'>, bedCount: number, actorName: string, actorRole: any): { success: boolean; message: string } {
    const newRoomId = `rm-${params.roomNumber}`;
    let buildingId = params.buildingId;
    let floorId = params.floorId;

    let updatedBuildings = [...this.state.buildings];
    let updatedFloors = [...this.state.floors];

    // Ensure building exists
    if (!buildingId || !updatedBuildings.some(b => b.id === buildingId)) {
      const existing = updatedBuildings.find(b => b.hostelId === params.hostelId);
      if (existing) {
        buildingId = existing.id;
      } else {
        buildingId = `bld-${Date.now()}`;
        updatedBuildings.push({
          id: buildingId,
          hostelId: params.hostelId,
          name: 'Main Block A',
          code: 'BLK-A',
          totalFloors: 1,
          supervisorName: actorName
        });
      }
    }

    // Ensure floor exists
    if (!floorId || !updatedFloors.some(f => f.id === floorId)) {
      const existing = updatedFloors.find(f => f.buildingId === buildingId);
      if (existing) {
        floorId = existing.id;
      } else {
        floorId = `flr-${Date.now()}`;
        updatedFloors.push({
          id: floorId,
          buildingId: buildingId,
          hostelId: params.hostelId,
          floorNumber: 1,
          name: '1st Floor',
          supervisorName: actorName
        });
      }
    }

    const newRoom: Room = {
      ...params,
      buildingId,
      floorId,
      id: newRoomId,
      status: 'AVAILABLE'
    };

    const newBeds: Bed[] = [];
    const bedLabels = ['Bed A', 'Bed B', 'Bed C', 'Bed D', 'Bed E', 'Bed F'];
    for (let i = 0; i < bedCount; i++) {
      newBeds.push({
        id: `bed-${params.roomNumber}-${i + 1}`,
        roomId: newRoomId,
        floorId: floorId,
        buildingId: buildingId,
        hostelId: params.hostelId,
        bedNumber: bedLabels[i] || `Bed ${i + 1}`,
        status: 'AVAILABLE',
        monthlyRent: params.monthlyRent,
        depositAmount: params.monthlyRent * 2
      });
    }

    this.save({
      ...this.state,
      buildings: updatedBuildings,
      floors: updatedFloors,
      rooms: [newRoom, ...this.state.rooms],
      beds: [...this.state.beds, ...newBeds]
    });

    this.logAudit(actorName, actorRole, 'ROOM_ADDED', 'Room Management', `Created Room ${params.roomNumber} with ${bedCount} beds`, params.hostelId);
    return { success: true, message: `Room ${params.roomNumber} with ${bedCount} beds registered successfully` };
  }

  public updateBedStatus(bedId: string, status: Bed['status'], actorName: string, actorRole: any): { success: boolean; message: string } {
    const bed = this.state.beds.find(b => b.id === bedId);
    if (!bed) return { success: false, message: 'Bed not found' };

    const updatedBeds = this.state.beds.map(b => b.id === bedId ? { ...b, status } : b);
    const updatedRooms = this.refreshRoomStatus(bed.roomId, updatedBeds, this.state.rooms);

    this.save({ ...this.state, beds: updatedBeds, rooms: updatedRooms });
    this.logAudit(actorName, actorRole, 'BED_STATUS_UPDATE', 'Room Management', `Updated Bed ${bed.bedNumber} status in Room ${bed.roomId} to ${status}`, bed.hostelId);
    return { success: true, message: `Bed status updated to ${status}` };
  }
}

export const storage = new StorageService();
