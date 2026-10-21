import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { MessMenuDay } from '../../types';
import { Modal } from '../common/Modal';
import { Utensils, Calendar, Clock, Edit2, CheckCircle2, Coffee, Moon, Sun } from 'lucide-react';

export const MessManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [selectedDay, setSelectedDay] = useState<MessMenuDay['day']>('MONDAY');
  const [editingDay, setEditingDay] = useState<MessMenuDay | null>(null);

  // Edit Menu Form state
  const [editBreakfast, setEditBreakfast] = useState('');
  const [editLunch, setEditLunch] = useState('');
  const [editSnacks, setEditSnacks] = useState('');
  const [editDinner, setEditDinner] = useState('');
  const [editNotice, setEditNotice] = useState('');

  const days: MessMenuDay['day'][] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ];

  const currentDayMenu: MessMenuDay = db.messMenu.find(m => m.day === selectedDay) || {
    day: selectedDay,
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: '',
    specialNotice: ''
  };

  const handleOpenEdit = (menu: MessMenuDay) => {
    setEditingDay(menu);
    setEditBreakfast(menu.breakfast);
    setEditLunch(menu.lunch);
    setEditSnacks(menu.snacks);
    setEditDinner(menu.dinner);
    setEditNotice(menu.specialNotice || '');
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    const res = storage.updateMessMenuDay(
      editingDay.day,
      {
        breakfast: editBreakfast,
        lunch: editLunch,
        snacks: editSnacks,
        dinner: editDinner,
        specialNotice: editNotice || undefined
      },
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Menu Updated', message: res.message });
      setEditingDay(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Hostel Dining Hall & Mess Management
          </h2>
          <p className="text-xs text-slate-500">
            Weekly rotating nutritious meal schedules, dietary notices, and chef special dining menus.
          </p>
        </div>

        {canAccess('MANAGE_MESS') && (
          <button
            onClick={() => handleOpenEdit(currentDayMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit {selectedDay} Menu
          </button>
        )}
      </div>

      {/* Weekday Switcher Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedDay === d
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Selected Day Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Breakfast */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
              07:30 AM - 09:30 AM
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Morning Breakfast
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentDayMenu.breakfast}
          </p>
        </div>

        {/* Lunch */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              01:00 PM - 02:30 PM
            </span>
            <Utensils className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Nutritious Lunch
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentDayMenu.lunch}
          </p>
        </div>

        {/* Evening Snacks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-600 dark:text-orange-400">
              05:00 PM - 06:15 PM
            </span>
            <Coffee className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Evening Snacks & Tea
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentDayMenu.snacks}
          </p>
        </div>

        {/* Dinner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
              08:00 PM - 10:00 PM
            </span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Evening Dinner
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentDayMenu.dinner}
          </p>
        </div>
      </div>

      {/* Dietary Notice Banner */}
      {currentDayMenu.specialNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">
              Chef Notice & Special Accommodations
            </h4>
            <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
              {currentDayMenu.specialNotice}
            </p>
          </div>
        </div>
      )}

      {/* Weekly Menu Overview Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
          Complete Weekly Culinary Schedule
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Day</th>
                <th className="py-2.5 px-4 font-semibold">Breakfast</th>
                <th className="py-2.5 px-4 font-semibold">Lunch</th>
                <th className="py-2.5 px-4 font-semibold">Snacks</th>
                <th className="py-2.5 px-4 font-semibold">Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {db.messMenu.map(m => (
                <tr key={m.day} className={m.day === selectedDay ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {m.day}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{m.breakfast}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{m.lunch}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{m.snacks}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{m.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={!!editingDay}
        onClose={() => setEditingDay(null)}
        title={`Update Culinary Menu for ${editingDay?.day}`}
        subtitle="Manage meal items served in dining hall"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Breakfast Items
            </label>
            <input
              type="text"
              required
              value={editBreakfast}
              onChange={(e) => setEditBreakfast(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Lunch Items
            </label>
            <input
              type="text"
              required
              value={editLunch}
              onChange={(e) => setEditLunch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Evening Snacks & Refreshments
            </label>
            <input
              type="text"
              required
              value={editSnacks}
              onChange={(e) => setEditSnacks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dinner Items
            </label>
            <input
              type="text"
              required
              value={editDinner}
              onChange={(e) => setEditDinner(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dietary Special Notice (Optional)
            </label>
            <input
              type="text"
              value={editNotice}
              onChange={(e) => setEditNotice(e.target.value)}
              placeholder="e.g. Vegan or halal alternate options available"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingDay(null)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
