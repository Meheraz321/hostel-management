import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { PaymentRecord, Invoice, Resident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CreditCard,
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt
} from 'lucide-react';

interface FinanceManagerProps {
  onOpenQuickAction: (action: string) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ onOpenQuickAction }) => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'INVOICES' | 'DUES'>('PAYMENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<{
    payment?: PaymentRecord | null;
    invoice?: Invoice | null;
    resident?: Resident | null;
  } | null>(null);

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [payResidentId, setPayResidentId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('BKASH_MOBILE');
  const [payPurpose, setPayPurpose] = useState<PaymentRecord['purpose']>('RENT');
  const [payNotes, setPayNotes] = useState('');

  const hostelPayments = db.payments.filter(p => p.hostelId === activeHostel.id);
  const hostelInvoices = db.invoices.filter(i => i.hostelId === activeHostel.id);
  const hostelResidents = db.residents.filter(r => r.hostelId === activeHostel.id);

  const totalCollected = hostelPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstandingDues = hostelResidents.reduce((acc, r) => acc + (r.totalDue || 0), 0);
  const overdueResidents = hostelResidents.filter(r => (r.totalDue || 0) > 0);

  const getResident = (residentId: string): Resident | undefined => {
    return hostelResidents.find(r => r.id === residentId);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payResidentId || Number(payAmount) <= 0) {
      addToast({ type: 'error', title: 'Invalid Payment', message: 'Select resident and specify positive amount' });
      return;
    }

    const res = storage.recordPayment({
      hostelId: activeHostel.id,
      residentId: payResidentId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      purpose: payPurpose,
      referenceNotes: payNotes,
      actorName: user?.name || 'Administrator',
      actorRole: user?.role || 'ACCOUNTANT'
    });

    if (res.success && res.receipt) {
      addToast({ type: 'success', title: 'Payment Recorded', message: res.message });
      setIsRecordModalOpen(false);
      // Auto open receipt for printing
      setSelectedReceipt({
        payment: res.receipt,
        resident: getResident(payResidentId)
      });
    } else {
      addToast({ type: 'error', title: 'Failed', message: res.message });
    }
  };

  const filteredPayments = hostelPayments.filter(p => {
    const res = getResident(p.residentId);
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.receiptNumber.toLowerCase().includes(q) ||
      p.transactionId.toLowerCase().includes(q) ||
      res?.fullName.toLowerCase().includes(q) ||
      res?.studentId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Finance & Billing Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time rent collection, formal student invoices, deposit tracking, and voucher receipts.
          </p>
        </div>

        {canAccess('MANAGE_FINANCE') && (
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Payment Voucher
          </button>
        )}
      </div>

      {/* Financial Metric Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Revenue Collected</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            {activeHostel.currency}{totalCollected.toLocaleString()}
          </span>
          <p className="text-[11px] text-emerald-600 mt-1">Verified across {hostelPayments.length} transactions</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Pending Outstanding Dues</span>
          <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1 block">
            {activeHostel.currency}{totalOutstandingDues.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{overdueResidents.length} residents currently past due</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Collection Efficiency</span>
          <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1 block">
            {Math.round((totalCollected / Math.max(1, totalCollected + totalOutstandingDues)) * 100)}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Target benchmark: ≥ 90%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'PAYMENTS'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment Transactions ({hostelPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'INVOICES'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Monthly Student Invoices ({hostelInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('DUES')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'DUES'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Outstanding Dues Registry ({overdueResidents.length})
        </button>
      </div>

      {/* Tab: Payments Transactions */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filter voucher or scholar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing {filteredPayments.length} vouchers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Receipt & Txn ID</th>
                  <th className="py-2.5 px-4 font-semibold">Scholar</th>
                  <th className="py-2.5 px-4 font-semibold">Purpose</th>
                  <th className="py-2.5 px-4 font-semibold">Method</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map(p => {
                  const res = getResident(p.residentId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{p.receiptNumber}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{p.transactionId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{res?.studentId || 'ID'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{p.purpose.replace(/_/g, ' ').toLowerCase()}</span>
                        {p.referenceNotes && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{p.referenceNotes}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {p.paymentMethod.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{p.date}</td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        +{activeHostel.currency}{p.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt({ payment: p, resident: res })}
                          className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Printer className="w-3 h-3" /> View Receipt
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

      {/* Tab: Monthly Invoices */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Invoice No.</th>
                  <th className="py-2.5 px-4 font-semibold">Resident</th>
                  <th className="py-2.5 px-4 font-semibold">Billing Period</th>
                  <th className="py-2.5 px-4 font-semibold">Total Amount</th>
                  <th className="py-2.5 px-4 font-semibold">Paid</th>
                  <th className="py-2.5 px-4 font-semibold">Due</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Invoice PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hostelInvoices.map(inv => {
                  const res = getResident(inv.residentId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{res?.fullName || 'Resident'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Room {res?.roomId}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {inv.billingMonth}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {activeHostel.currency}{inv.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                        {activeHostel.currency}{inv.paidAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                        {activeHostel.currency}{inv.dueAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt({ invoice: inv, resident: res })}
                          className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Printer className="w-3 h-3" /> Print Invoice
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

      {/* Tab: Dues Registry */}
      {activeTab === 'DUES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Scholar Name</th>
                  <th className="py-2.5 px-4 font-semibold">Room & Bed</th>
                  <th className="py-2.5 px-4 font-semibold">Contact / Phone</th>
                  <th className="py-2.5 px-4 font-semibold">Outstanding Due</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {overdueResidents.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{res.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{res.studentId}</p>
                    </td>
                    <td className="py-3 px-4">
                      Room {res.roomId?.replace('rm-', '') || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {res.phone}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                      {activeHostel.currency}{res.totalDue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setPayResidentId(res.id);
                          setPayAmount(res.totalDue);
                          setIsRecordModalOpen(true);
                        }}
                        className="px-3 py-1 font-semibold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
                      >
                        Settle Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Rent / Fee Payment"
        subtitle={`Collecting for ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Resident Scholar *
            </label>
            <select
              required
              value={payResidentId}
              onChange={(e) => {
                const rId = e.target.value;
                setPayResidentId(rId);
                const rObj = getResident(rId);
                if (rObj && rObj.totalDue > 0) {
                  setPayAmount(rObj.totalDue);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">-- Choose Resident --</option>
              {hostelResidents.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.studentId}) - Due: {activeHostel.currency}{r.totalDue.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Amount ({activeHostel.currency}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Channel *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="BKASH_MOBILE">bKash Mobile Banking</option>
                <option value="NAGAD_MOBILE">Nagad Mobile Banking</option>
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="CASH">Cash at Office</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fee Purpose
              </label>
              <select
                value={payPurpose}
                onChange={(e) => setPayPurpose(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="RENT">Monthly Room Rent</option>
                <option value="SECURITY_DEPOSIT">Security Deposit</option>
                <option value="MESS_FEE">Mess Dining Fee</option>
                <option value="UTILITY">Utilities & WiFi</option>
                <option value="DAMAGE_FEE">Damage Compensation</option>
                <option value="LATE_FEE">Late Payment Fee</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reference / Month
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. October 2026 Rent"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Generate Receipt Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt.payment}
          invoice={selectedReceipt.invoice}
          resident={selectedReceipt.resident}
        />
      )}
    </div>
  );
};
