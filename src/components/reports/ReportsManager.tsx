import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { BarChart3, Download, Printer, FileText, CheckCircle2 } from 'lucide-react';

export const ReportsManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();

  const [reportType, setReportType] = useState<'OCCUPANCY' | 'RESIDENTS' | 'FINANCE' | 'COMPLAINTS'>('OCCUPANCY');

  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);
  const hostelRooms = db.rooms.filter(r => r.hostelId === activeHostel.id);
  const hostelBeds = db.beds.filter(b => b.hostelId === activeHostel.id);
  const hostelPayments = db.payments.filter(p => p.hostelId === activeHostel.id);
  const hostelExpenses = db.expenses.filter(e => e.hostelId === activeHostel.id);
  const hostelComplaints = db.complaints.filter(c => c.hostelId === activeHostel.id);

  const totalBeds = hostelBeds.length;
  const occupiedBeds = hostelBeds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = hostelBeds.filter(b => b.status === 'AVAILABLE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRevenue = hostelPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = hostelExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalDues = hostelResidents.reduce((acc, r) => acc + (r.totalDue || 0), 0);

  // CSV Generator function
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `hostelsphere_${reportType.toLowerCase()}_report.csv`;

    if (reportType === 'OCCUPANCY') {
      headers = ['Room Number', 'Type', 'Floor', 'Capacity', 'Occupied Beds', 'Available Beds', 'Monthly Rent', 'Status'];
      rows = hostelRooms.map(r => {
        const rBeds = hostelBeds.filter(b => b.roomId === r.id);
        const occ = rBeds.filter(b => b.status === 'OCCUPIED').length;
        const avail = rBeds.filter(b => b.status === 'AVAILABLE').length;
        return [r.roomNumber, r.roomType, r.floorId, r.capacity, occ, avail, r.monthlyRent, r.status];
      });
    } else if (reportType === 'RESIDENTS') {
      headers = ['Student ID', 'Full Name', 'Institution', 'Department', 'Room', 'Bed', 'Phone', 'Total Due', 'Status'];
      rows = hostelResidents.map(r => [
        r.studentId,
        r.fullName,
        r.institution,
        r.department,
        r.roomId || 'None',
        r.bedId || 'None',
        r.phone,
        r.totalDue,
        r.status
      ]);
    } else if (reportType === 'FINANCE') {
      headers = ['Receipt Number', 'Transaction ID', 'Resident ID', 'Purpose', 'Method', 'Date', 'Amount', 'Status'];
      rows = hostelPayments.map(p => [
        p.receiptNumber,
        p.transactionId,
        p.residentId,
        p.purpose,
        p.paymentMethod,
        p.date,
        p.amount,
        p.status
      ]);
    } else if (reportType === 'COMPLAINTS') {
      headers = ['Ticket Number', 'Resident ID', 'Room', 'Category', 'Priority', 'Subject', 'Status', 'Date'];
      rows = hostelComplaints.map(c => [
        c.ticketNumber,
        c.residentId,
        c.roomId || 'General',
        c.category,
        c.priority,
        c.subject,
        c.status,
        c.createdAt.substring(0, 10)
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({ type: 'success', title: 'Export Generated', message: `Downloaded ${filename}` });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Operational Intelligence & Exportable Reports
          </h2>
          <p className="text-xs text-slate-500">
            Export official summaries for executive reviews, board meetings, tax accounting and audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Excel / CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report Sheet
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'OCCUPANCY', label: 'Occupancy & Bed Utilization' },
          { id: 'RESIDENTS', label: 'Resident Scholars Master Register' },
          { id: 'FINANCE', label: 'Financial Revenue & Disbursements' },
          { id: 'COMPLAINTS', label: 'Maintenance & Service Complaints' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id as any)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-colors ${
              reportType === r.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 text-xs shadow-xs">
        {/* Report Official Letterhead Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {activeHostel.name}
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Official Property Management Summary · {activeHostel.code}
            </p>
            <p className="text-slate-400 text-[10px]">
              Generated on: <span className="font-mono">{new Date().toLocaleString()}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
              {reportType} DOSSIER
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
              Status: Verified Clean
            </p>
          </div>
        </div>

        {/* Dynamic Content based on Report Type */}
        {reportType === 'OCCUPANCY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Capacity</span>
                <p className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-0.5">{totalBeds} Beds</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied Units</span>
                <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400 mt-0.5">{occupiedBeds}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Available Beds</span>
                <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">{availableBeds}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy Rate</span>
                <p className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-0.5">{occupancyRate}%</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Room No.</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold">Bed Allocation</th>
                  <th className="py-2 px-3 font-semibold">Rent/Mo</th>
                  <th className="py-2 px-3 font-semibold text-right">Room Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelRooms.map(rm => {
                  const bCount = hostelBeds.filter(b => b.roomId === rm.id);
                  const occCount = bCount.filter(b => b.status === 'OCCUPIED').length;
                  return (
                    <tr key={rm.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Room {rm.roomNumber}</td>
                      <td className="py-2.5 px-3 capitalize">{rm.roomType.replace('_', ' ').toLowerCase()}</td>
                      <td className="py-2.5 px-3 font-mono">{occCount} / {rm.capacity} beds occupied</td>
                      <td className="py-2.5 px-3 font-mono">{activeHostel.currency}{rm.monthlyRent}</td>
                      <td className="py-2.5 px-3 text-right capitalize font-semibold">{rm.status.toLowerCase()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'RESIDENTS' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">
                Total Enrolled Scholars: {hostelResidents.length}
              </span>
              <span className="font-mono text-slate-500">
                Total Outstanding Ledger: {activeHostel.currency}{totalDues.toFixed(2)}
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Scholar Name</th>
                  <th className="py-2 px-3 font-semibold">Student ID</th>
                  <th className="py-2 px-3 font-semibold">Room & Bed</th>
                  <th className="py-2 px-3 font-semibold">Institution & Dept</th>
                  <th className="py-2 px-3 font-semibold text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelResidents.map(res => (
                  <tr key={res.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{res.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{res.studentId}</td>
                    <td className="py-2.5 px-3 font-medium">Room {res.roomId?.replace('rm-', '') || 'Unassigned'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{res.institution} ({res.department})</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right font-bold text-slate-900 dark:text-white">
                      {activeHostel.currency}{res.totalDue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'FINANCE' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Revenue</span>
                <p className="font-mono font-bold text-lg text-emerald-600 mt-0.5">+{activeHostel.currency}{totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Disbursements</span>
                <p className="font-mono font-bold text-lg text-rose-600 mt-0.5">-{activeHostel.currency}{totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Operating Balance</span>
                <p className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                  {activeHostel.currency}{netProfit.toFixed(2)}
                </p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Receipt No.</th>
                  <th className="py-2 px-3 font-semibold">Purpose</th>
                  <th className="py-2 px-3 font-semibold">Method</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelPayments.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{p.receiptNumber}</td>
                    <td className="py-2.5 px-3 capitalize">{p.purpose.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="py-2.5 px-3 font-mono">{p.paymentMethod.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 font-mono">{p.date}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right font-bold text-emerald-600">
                      +{activeHostel.currency}{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'COMPLAINTS' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">
                Total Incident & Service Requests: {hostelComplaints.length}
              </span>
              <span className="font-mono text-emerald-600">
                Resolved: {hostelComplaints.filter(c => c.status === 'RESOLVED').length}
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Ticket</th>
                  <th className="py-2 px-3 font-semibold">Category</th>
                  <th className="py-2 px-3 font-semibold">Subject</th>
                  <th className="py-2 px-3 font-semibold">Priority</th>
                  <th className="py-2 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelComplaints.map(c => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{c.ticketNumber}</td>
                    <td className="py-2.5 px-3 capitalize">{c.category.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.subject}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{c.priority}</td>
                    <td className="py-2.5 px-3 text-right capitalize font-semibold">{c.status.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
