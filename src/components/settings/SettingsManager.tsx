import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import {
  Settings,
  Shield,
  FileText,
  RotateCcw,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { activeHostel, db, addToast } = useHostel();
  const { user, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RULES' | 'BACKUP'>('AUDIT');
  const [importJson, setImportJson] = useState('');

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to completely erase all data (hostels, rooms, residents, payments)? This cannot be undone.')) {
      storage.clearAllData();
      addToast({ type: 'warning', title: 'Data Cleared', message: 'All system data has been wiped clean.' });
    }
  };

  const handleExportBackup = () => {
    const dataStr = storage.exportBackup();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hostelsphere_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Backup Exported', message: 'Full database snapshot downloaded' });
  };

  const handleImportBackup = () => {
    if (!importJson.trim()) return;
    const ok = storage.importBackup(importJson);
    if (ok) {
      addToast({ type: 'success', title: 'Backup Restored', message: 'Database state updated' });
      setImportJson('');
    } else {
      addToast({ type: 'error', title: 'Invalid JSON', message: 'Could not restore backup format' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          System Configuration, Rules & Audit Records
        </h2>
        <p className="text-xs text-slate-500">
          Inspect immutable security event logs, manage residential conduct guidelines, and manage data backups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'AUDIT'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Audit Trail Records ({db.auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'RULES'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Hostel Code of Conduct
        </button>
        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`px-4 py-2.5 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'BACKUP'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Backup & Data Maintenance
        </button>
      </div>

      {/* Tab: Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs text-xs">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              System Audit Event Ledger
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Immutable Real-Time Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-4 font-semibold">User & Role</th>
                  <th className="py-2.5 px-4 font-semibold">Module</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {db.auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{log.userName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.userRole}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {log.module}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Hostel Rules */}
      {activeTab === 'RULES' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Residential Rules & Disciplinary Policies
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Enforced across all dormitories in {activeHostel.name}.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {activeHostel.rules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-start gap-3">
                <span className="font-mono font-bold text-slate-400 text-xs mt-0.5">0{idx + 1}.</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Backup & Maintenance */}
      {activeTab === 'BACKUP' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 text-xs shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Database Maintenance & State Persistence
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              All resident, room, allocation, payment and audit state is saved persistently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-500" />
                Export Full Backup
              </h4>
              <p className="text-slate-500 text-[11px]">
                Download complete relational database JSON snapshot with all records.
              </p>
              <button
                onClick={handleExportBackup}
                className="mt-2 py-2 px-4 font-semibold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90"
              >
                Export Database JSON
              </button>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl space-y-2 border border-rose-200 dark:border-rose-900/40">
              <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                Wipe All System Data (সম্পূর্ণ ডাটা মুছুন)
              </h4>
              <p className="text-slate-500 text-[11px]">
                Permanently erase all registered hostels, rooms, residents, invoices and operational records.
              </p>
              <button
                onClick={handleClearData}
                className="mt-2 py-2 px-4 font-semibold text-xs text-white bg-rose-600 dark:bg-rose-700 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Erase All Database Records
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Restore from JSON Backup
            </label>
            <textarea
              rows={3}
              placeholder="Paste JSON string here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-[11px] focus:outline-hidden"
            />
            <button
              onClick={handleImportBackup}
              disabled={!importJson.trim()}
              className="py-1.5 px-4 font-semibold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg disabled:opacity-50"
            >
              Apply Restore
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
