import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { ExpenseRecord, ExpenseCategory } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Search, Filter, DollarSign, Calendar, TrendingDown, Receipt, ShoppingCart } from 'lucide-react';

export const ExpensesManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD_MESS');
  const [amount, setAmount] = useState<number | ''>('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const hostelExpenses = db.expenses.filter(e => e.hostelId === activeHostel.id);
  const totalExpenseAmount = hostelExpenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = hostelExpenses.filter(e => {
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || Number(amount) <= 0) {
      addToast({ type: 'error', title: 'Invalid Expense', message: 'Please provide title and amount' });
      return;
    }

    const res = storage.addExpense(
      {
        hostelId: activeHostel.id,
        title,
        category,
        amount: Number(amount),
        date: new Date().toISOString().split('T')[0],
        vendor: vendor || 'Direct Purchase',
        description: description || title,
        receiptNumber: receiptNumber || `REC-${Math.floor(100 + Math.random() * 900)}`,
        addedBy: user?.name || 'Administrator'
      },
      user?.name || 'Administrator',
      user?.role || 'ACCOUNTANT'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Expense Added', message: res.message });
      setIsAddModalOpen(false);
      setTitle('');
      setAmount(100);
      setVendor('');
      setDescription('');
    }
  };

  const categories: ExpenseCategory[] = [
    'ELECTRICITY',
    'WATER',
    'INTERNET',
    'FOOD_MESS',
    'MAINTENANCE',
    'CLEANING',
    'SALARY',
    'SECURITY',
    'FURNITURE',
    'SUPPLIES',
    'EMERGENCY',
    'OTHER'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Hostel Operational Expenses Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Track utilities, bulk mess supplies, security contracts, maintenance repairs and overheads.
          </p>
        </div>

        {canAccess('MANAGE_FINANCE') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Operational Expense
          </button>
        )}
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs shadow-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Disbursements</span>
          <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1 block">
            {activeHostel.currency}{totalExpenseAmount.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded across {hostelExpenses.length} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Expense Title</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Vendor / Supplier</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Receipt No.</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{exp.title}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-sm">{exp.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exp.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{exp.vendor}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{exp.date}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{exp.receiptNumber || 'N/A'}</td>
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400 text-right">
                    -{activeHostel.currency}{exp.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Operational Disbursement"
        subtitle={`Charging against ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Title / Expense Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Kitchen Provisions Wholesale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount ({activeHostel.currency}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Vendor / Service Entity
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Supplies Ltd"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Voucher / Receipt Bill No.
              </label>
              <input
                type="text"
                placeholder="e.g. REC-9921"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description & Verification Notes
            </label>
            <textarea
              rows={2}
              placeholder="Itemized breakdown or procurement details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Log Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
