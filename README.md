# 🏢 HostelSphere Pro — Enterprise Hostel & Student Residence PMS

A premium, full-stack, production-ready Hostel Management SaaS built for universities, student residences, residential halls, and dormitory businesses.

![HostelSphere Pro Preview](src/assets/images/hostel_residence_building_1792048795073.jpg)

---

## 🌟 Key Functional Highlights

1. **Multi-Property Architecture**:
   - Manage multiple hostels (e.g., *Green Valley Hall* & *The Grand Apex Tower*) with instantaneous property switching and isolated accounts.
2. **Visual Room & Bed Allocation Matrix**:
   - Hierarchy: Hostel ➔ Building Wing ➔ Floor ➔ Room ➔ Bed ➔ Resident Scholar.
   - Interactive physical map with live bed statuses: `Available`, `Occupied`, `Reserved`, `Maintenance`.
3. **End-to-End Resident Lifecycle**:
   - Complete Scholar Dossier (Personal, Academic, Guardian, Blood Group, Identification).
   - Digital Check-In intake workflow with automatic initial deposit, rent calculation, and voucher generation.
   - Departure Clearance Check-Out with damage fee settlement and automated bed release.
   - Mutual and administrative Room & Bed transfers with validation and audit history.
4. **Finance, Rent & Invoices**:
   - Automated overdue balance detection, late fee computation, and status indicators.
   - Multi-channel collection: bKash, Nagad, Wire Transfer, Credit Card, and Cash.
   - Formal itemized student invoices and print-ready vouchers with digital verification stamps.
   - Operational expense management across 12 categories with vendor ledgers.
5. **Campus Operations**:
   - **Weekly Rotating Mess Menu**: Breakfast, Lunch, Snacks, and Dinner for Monday through Sunday with dietary accommodations.
   - **Complaints & Maintenance Tickets**: Ticket dispatch, staff technician assignment, and repair notes.
   - **Visitor Registration & Security**: Gate check-in logs, visitor pass time tracking, vehicle numbers, and emergency incident dispatch.
   - **Leave Requests & Attendance**: Warden leave authorization workflows and daily roll call curfew tracking.
   - **Staff Management**: Team directory and shift duty roster.
6. **Executive Intelligence & Reporting**:
   - One-click CSV/Excel downloads and clean print views for Occupancy, Residents, Payments, and Complaints.
7. **System & Security**:
   - Immutable audit trail recording user, action, module, and timestamp.
   - Full JSON database export, import, and one-click demo data reset.
   - Global Command Palette (`Ctrl + K` or `Cmd + K`).
   - Dark Mode / Light Mode with seamless state persistence.

---

## 👥 Demo User Accounts & Roles (1-Click Switchable)

The top navigation bar and login screen feature a **1-Click Persona Switcher** allowing instant testing of all roles:

| Role | Demo User Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Evelyn Vance | `superadmin@hostelsphere.io` | Full system control, all hostels, settings & audit logs |
| **Hostel Admin** | Marcus Sterling | `admin@greenvalley.com` | Complete property management, allocations, finance |
| **Operations Manager** | Sophia Patel | `manager@greenvalley.com` | Allocations, mess, inventory, staff |
| **Head Warden** | Capt. Richard Hayes | `warden@greenvalley.com` | Attendance, leave approvals, visitor control, discipline |
| **Senior Accountant** | Claire Beauchamp | `accountant@greenvalley.com` | Rent, payments, invoices, expenses, financial reports |
| **Maintenance Staff** | David Miller | `staff@greenvalley.com` | Service tickets, room workorders, repair tasks |
| **Resident Scholar** | Rahim Ahmed | `rahim.ahmed@student.edu` | Dedicated student portal (Room 302 Bed A) |

*Default password for all demo accounts: `password123` (or simply use the 1-click persona switch buttons)*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
VITE_APP_NAME="HostelSphere Pro"
# Optional PostgreSQL Connection string when linking to external DB
DATABASE_URL="postgresql://hosteladmin:secret@localhost:5432/hostelsphere_pms?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Architecture**: Modular domain components, Context API state management
- **Persistence**: Relational in-memory storage engine backed by persistent `localStorage` and JSON backup/restore
- **Design Constitution**: Zero-pill discipline, WCAG AA contrast, tabular numerals (`JetBrains Mono`), responsive desktop/tablet/mobile layouts
