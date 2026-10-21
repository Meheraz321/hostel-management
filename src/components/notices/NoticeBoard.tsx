import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Notice } from '../../types';
import { Modal } from '../common/Modal';
import { Bell, Plus, Calendar, AlertCircle, Megaphone, Tag, CheckCircle2 } from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // New Notice form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Notice['category']>('GENERAL');
  const [priority, setPriority] = useState<Notice['priority']>('NORMAL');
  const [audience, setAudience] = useState<Notice['audience']>('ALL');

  const hostelNotices = db.notices.filter(n => n.hostelId === activeHostel.id);

  const filteredNotices = hostelNotices.filter(n => {
    if (filterCategory !== 'ALL' && n.category !== filterCategory) return false;
    return true;
  });

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Title and description are required' });
      return;
    }

    const res = storage.publishNotice(
      {
        hostelId: activeHostel.id,
        title,
        description,
        category,
        priority,
        audience,
        author: `${user?.name || 'Admin'} (${user?.role.replace('_', ' ') || 'Staff'})`
      },
      user?.name || 'Administrator',
      user?.role || 'HOSTEL_ADMIN'
    );

    if (res.success) {
      addToast({ type: 'success', title: 'Notice Published', message: res.message });
      setIsAddNoticeOpen(false);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Official Notices & Campus Announcements
          </h2>
          <p className="text-xs text-slate-500">
            Broadcasting maintenance alerts, curfew reminders, fee payment deadlines and holidays.
          </p>
        </div>

        {canAccess('MANAGE_NOTICES') && (
          <button
            onClick={() => setIsAddNoticeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['ALL', 'GENERAL', 'MAINTENANCE', 'PAYMENT', 'MESS', 'EMERGENCY', 'HOLIDAY'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filteredNotices.map(notice => {
          let borderAccent = 'border-slate-200 dark:border-slate-800';
          if (notice.priority === 'CRITICAL') borderAccent = 'border-rose-400 dark:border-rose-800';
          else if (notice.priority === 'URGENT') borderAccent = 'border-amber-400 dark:border-amber-800';

          return (
            <div
              key={notice.id}
              className={`bg-white dark:bg-slate-900 border ${borderAccent} rounded-xl p-5 space-y-3 shadow-xs flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold">
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Audience: {notice.audience.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {notice.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>By: {notice.author}</span>
                <span>{notice.publishedAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isAddNoticeOpen}
        onClose={() => setIsAddNoticeOpen(false)}
        title="Post Official Notice Announcement"
        subtitle={`Publishing to ${activeHostel.name}`}
        maxWidth="md"
      >
        <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quiet Hours Enforcement During Mid-Terms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="GENERAL">General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="PAYMENT">Payment Reminder</option>
                <option value="MESS">Mess / Dining</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical Alert</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Residents & Staff</option>
                <option value="STUDENTS_ONLY">Scholars Only</option>
                <option value="STAFF_ONLY">Staff Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notice Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Clear details of the announcement, timelines, procedures"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddNoticeOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
            >
              Broadcast Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
