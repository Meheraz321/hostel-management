import React from 'react';
import { Modal } from './Modal';
import { PaymentRecord, Invoice, Resident } from '../../types';
import { useHostel } from '../../context/HostelContext';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: PaymentRecord | null;
  invoice?: Invoice | null;
  resident?: Resident | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  invoice,
  resident
}) => {
  const { activeHostel } = useHostel();

  if (!payment && !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = payment?.receiptNumber || invoice?.invoiceNumber || 'REC-DOC-001';
  const issueDate = payment?.date || invoice?.issueDate || new Date().toISOString().split('T')[0];
  const amountPaid = payment?.amount ?? (invoice?.paidAmount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Hostel Billing Voucher"
      subtitle={`Voucher #${receiptNo}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Voucher / PDF
          </button>
        </div>
      }
    >
      <div id="printable-receipt" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6">
        {/* Header with Hostel Brand */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {activeHostel.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {activeHostel.address}, {activeHostel.city}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tel: {activeHostel.phone} · Email: {activeHostel.email}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              {payment ? 'PAYMENT RECEIPT' : 'STUDENT INVOICE'}
            </span>
            <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
              {receiptNo}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Date: <span className="font-mono tabular-nums">{issueDate}</span>
            </p>
          </div>
        </div>

        {/* Resident / Room Snapshot */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-semibold">Billed To Resident</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {resident?.fullName || 'Registered Scholar'}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              ID: <span className="font-mono">{resident?.studentId || 'STU-RECORD'}</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400">{resident?.institution || 'Academic Institution'}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-semibold">Allocation Details</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
              Hostel Code: <span className="font-mono">{activeHostel.code}</span>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Room / Bed: <span className="font-semibold text-slate-900 dark:text-white">{resident?.roomId || 'Assigned'}</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Method: <span className="font-mono font-medium">{payment?.paymentMethod || 'BANK/ONLINE'}</span>
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount ({activeHostel.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice ? (
                <>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                      Standard Monthly Accommodation Rent ({invoice.billingMonth})
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium">
                      {invoice.rentAmount.toFixed(2)}
                    </td>
                  </tr>
                  {invoice.messFee > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">Dining & Meal Subscription</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium">
                        {invoice.messFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {invoice.utilityFee > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">Utilities, Power & Fiber Internet</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium">
                        {invoice.utilityFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {invoice.lateFee > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400">Late Payment Administrative Surcharge</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium text-rose-600">
                        +{invoice.lateFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    <p className="font-medium text-slate-900 dark:text-white">{payment?.purpose.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-500">{payment?.referenceNotes || 'Direct student payment'}</p>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900 dark:text-white">
                    {payment?.amount.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Amount Paid:</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                {activeHostel.currency}{amountPaid.toFixed(2)}
              </span>
            </div>
            {invoice && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Remaining Due:</span>
                <span className="font-mono tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                  {activeHostel.currency}{invoice.dueAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="font-mono tabular-nums">
                {activeHostel.currency}{(invoice ? invoice.totalAmount : payment?.amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Authority Signature */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Digitally Verified by HostelSphere PMS</span>
          </div>
          <div className="text-right">
            <p className="text-slate-600 dark:text-slate-300 font-medium">Authorized Accounts Officer</p>
            <p className="text-[10px] text-slate-400">Green Valley Residential Services</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
