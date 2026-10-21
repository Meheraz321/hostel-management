export type UserRole = 
  | 'SUPER_ADMIN'
  | 'HOSTEL_ADMIN'
  | 'MANAGER'
  | 'WARDEN'
  | 'ACCOUNTANT'
  | 'STAFF'
  | 'RESIDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  hostelId?: string;
  residentId?: string; // Links to resident record if role is RESIDENT
  staffCategory?: 'WARDEN' | 'MANAGER' | 'ACCOUNTANT' | 'SECURITY' | 'CLEANER' | 'COOK' | 'MAINTENANCE';
  createdAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  capacity: number;
  description: string;
  facilities: string[];
  rules: string[];
  emergencyContact: {
    police: string;
    ambulance: string;
    fireService: string;
    wardenPhone: string;
    managerPhone: string;
    securityDesk: string;
  };
  currency: string;
  monthlyLateFeePercentage: number;
}

export interface Building {
  id: string;
  hostelId: string;
  name: string;
  code: string;
  totalFloors: number;
  supervisorName: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  hostelId: string;
  floorNumber: number;
  name: string;
  supervisorName: string;
}

export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_BED' | 'VIP';
export type RoomStatus = 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'RESERVED' | 'INACTIVE';

export interface Room {
  id: string;
  hostelId: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  roomType: RoomType;
  capacity: number;
  monthlyRent: number;
  status: RoomStatus;
  facilities: string[];
  description?: string;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface Bed {
  id: string;
  roomId: string;
  floorId: string;
  buildingId: string;
  hostelId: string;
  bedNumber: string; // e.g. "Bed A", "Bed B"
  status: BedStatus;
  monthlyRent: number;
  depositAmount: number;
  assignedResidentId?: string;
  allocationDate?: string;
}

export type ResidentStatus = 'ACTIVE' | 'PENDING' | 'CHECKED_OUT' | 'SUSPENDED';

export interface Resident {
  id: string;
  hostelId: string;
  studentId: string;
  registrationNumber: string;
  fullName: string;
  avatar?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  institution: string;
  department: string;
  yearSemester: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  permanentAddress: string;
  currentAddress: string;
  nationalIdOrPassport: string;
  roomId?: string;
  bedId?: string;
  joiningDate: string;
  contractStartDate: string;
  contractEndDate: string;
  status: ResidentStatus;
  documents: Array<{
    id: string;
    title: string;
    type: 'NID' | 'PASSPORT' | 'STUDENT_ID' | 'ADMISSION_FORM' | 'AGREEMENT';
    url?: string;
    uploadedAt: string;
  }>;
  totalDue: number;
  totalPaid: number;
}

export interface RoomAllocation {
  id: string;
  residentId: string;
  hostelId: string;
  roomId: string;
  bedId: string;
  allocatedDate: string;
  checkInDate: string;
  monthlyRent: number;
  depositPaid: number;
  status: 'ACTIVE' | 'TRANSFERRED' | 'CHECKED_OUT';
}

export interface RoomTransfer {
  id: string;
  residentId: string;
  hostelId: string;
  fromRoomId: string;
  fromBedId: string;
  toRoomId: string;
  toBedId: string;
  transferDate: string;
  reason: string;
  approvedBy: string;
}

export interface CheckInRecord {
  id: string;
  residentId: string;
  hostelId: string;
  roomId: string;
  bedId: string;
  checkInDate: string;
  securityDeposit: number;
  initialRentPaid: number;
  notes: string;
  verifiedBy: string;
}

export interface CheckOutRecord {
  id: string;
  residentId: string;
  hostelId: string;
  roomId: string;
  bedId: string;
  checkOutDate: string;
  pendingRentDues: number;
  utilityDues: number;
  damageCharges: number;
  depositRefunded: number;
  finalSettlementAmount: number;
  clearanceNotes: string;
  processedBy: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'BKASH_MOBILE' | 'NAGAD_MOBILE' | 'CREDIT_CARD';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
export type PaymentPurpose = 'RENT' | 'SECURITY_DEPOSIT' | 'MESS_FEE' | 'UTILITY' | 'DAMAGE_FEE' | 'LATE_FEE' | 'OTHER';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  receiptNumber: string;
  hostelId: string;
  residentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  purpose: PaymentPurpose;
  referenceNotes?: string;
  status: 'COMPLETED' | 'REFUNDED';
  collectedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  hostelId: string;
  residentId: string;
  billingMonth: string; // e.g., "October 2026"
  issueDate: string;
  dueDate: string;
  rentAmount: number;
  messFee: number;
  utilityFee: number;
  otherCharges: number;
  discount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
}

export type ExpenseCategory = 
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'FOOD_MESS'
  | 'MAINTENANCE'
  | 'CLEANING'
  | 'SALARY'
  | 'SECURITY'
  | 'FURNITURE'
  | 'SUPPLIES'
  | 'EMERGENCY'
  | 'OTHER';

export interface ExpenseRecord {
  id: string;
  hostelId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor: string;
  description: string;
  receiptNumber?: string;
  addedBy: string;
}

export interface MessMenuDay {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialNotice?: string;
}

export interface MealAttendance {
  id: string;
  hostelId: string;
  residentId: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export type ComplaintCategory = 
  | 'ROOM'
  | 'ELECTRICITY'
  | 'WATER_PLUMBING'
  | 'INTERNET_WIFI'
  | 'FOOD_MESS'
  | 'CLEANING'
  | 'SECURITY'
  | 'NOISE'
  | 'STAFF'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus = 'SUBMITTED' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Complaint {
  id: string;
  ticketNumber: string;
  hostelId: string;
  residentId: string;
  roomId?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  subject: string;
  description: string;
  status: ComplaintStatus;
  assignedStaffId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface MaintenanceRequest {
  id: string;
  code: string;
  hostelId: string;
  roomId: string;
  requestedBy: string;
  issue: string;
  priority: ComplaintPriority;
  assignedStaffName: string;
  estimatedCost: number;
  actualCost: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requestedDate: string;
  completedDate?: string;
}

export interface InventoryItem {
  id: string;
  hostelId: string;
  name: string;
  category: 'FURNITURE' | 'ELECTRONICS' | 'KITCHEN' | 'CLEANING' | 'SECURITY' | 'SAFETY';
  quantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'NEEDS_REPAIR' | 'DAMAGED';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  assignedRoomId?: string;
  warrantyExpiry?: string;
}

export interface RoomInventoryItem {
  id: string;
  roomId: string;
  itemName: string;
  quantity: number;
  condition: 'GOOD' | 'FAIR' | 'DAMAGED' | 'MISSING';
}

export interface Visitor {
  id: string;
  hostelId: string;
  visitorName: string;
  phone: string;
  nationalId: string;
  residentId: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  vehicleNumber?: string;
  status: 'EXPECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'REJECTED';
  securityOfficer: string;
}

export interface LeaveRequest {
  id: string;
  hostelId: string;
  residentId: string;
  leavingDate: string;
  returnDate: string;
  destination: string;
  reason: string;
  emergencyPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  approvedBy?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  hostelId: string;
  residentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
  markedBy: string;
}

export interface StaffMember {
  id: string;
  hostelId: string;
  name: string;
  photo?: string;
  phone: string;
  email: string;
  role: 'WARDEN' | 'MANAGER' | 'ACCOUNTANT' | 'SECURITY' | 'CLEANER' | 'COOK' | 'MAINTENANCE';
  shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'GENERAL';
  joiningDate: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  emergencyContact: string;
}

export interface StaffAttendance {
  id: string;
  hostelId: string;
  staffId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE';
}

export interface Notice {
  id: string;
  hostelId: string;
  title: string;
  description: string;
  category: 'GENERAL' | 'EMERGENCY' | 'MAINTENANCE' | 'MESS' | 'PAYMENT' | 'HOLIDAY';
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  audience: 'ALL' | 'STUDENTS_ONLY' | 'STAFF_ONLY';
  publishedAt: string;
  expiryDate?: string;
  author: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // If specific to user, otherwise broadcast
  title: string;
  message: string;
  type: 'PAYMENT' | 'COMPLAINT' | 'MAINTENANCE' | 'LEAVE' | 'VISITOR' | 'NOTICE' | 'EMERGENCY' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface EmergencyIncident {
  id: string;
  hostelId: string;
  incidentType: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'ELECTRICAL' | 'WATER_LEAKAGE' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'REPORTED' | 'RESPONDING' | 'RESOLVED';
  resolutionNotes?: string;
}

export interface AuditLog {
  id: string;
  hostelId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
