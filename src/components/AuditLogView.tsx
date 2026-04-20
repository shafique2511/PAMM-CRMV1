import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';
import { Shield, Search, Filter, ArrowUpDown, Clock, User, Activity, Trash2, Check, X, Server } from 'lucide-react';

type SortKey = keyof AuditLog;

export function AuditLogView({ logs, onClearLogs }: { logs: AuditLog[], onClearLogs: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>({ key: 'timestamp', direction: 'desc' });
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter(log => {
      const matchesFilter = filterType === 'all' || log.type === filterType;
      const matchesSearch = 
        (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [logs, filterType, searchTerm, sortConfig]);

  const SortHeader = ({ label, sortKey }: { label: string, sortKey: SortKey }) => (
    <th 
      className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={`w-4 h-4 ${sortConfig?.key === sortKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Audit Logs</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">System activity, security events, and administrative tracking.</p>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="flex items-center gap-2">
            {showConfirmClear ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-2xl border border-red-100 dark:border-red-900/30">
                <span className="text-sm font-bold text-red-600 dark:text-red-400 pl-3">Purge all logs?</span>
                <button 
                  onClick={() => {
                    onClearLogs();
                    setShowConfirmClear(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                  title="Confirm Clear All"
                >
                  <Check className="w-4 h-4" /> Yes
                </button>
                <button 
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                  title="Cancel"
                >
                  <X className="w-4 h-4" /> No
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
                Clear System Logs
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search activities, users, or details..." 
            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium placeholder-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
             <Filter className="w-5 h-5 text-slate-400" />
          </div>
          <select 
            className="flex-1 md:w-56 pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium appearance-none"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="auth">Authentication</option>
            <option value="investor">Investor Management</option>
            <option value="transaction">Transactions</option>
            <option value="trade">Trading Engine</option>
            <option value="system">System / Settings</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Access & Modification History</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <SortHeader label="Timestamp" sortKey="timestamp" />
                  <SortHeader label="Identity" sortKey="userName" />
                  <SortHeader label="Module" sortKey="type" />
                  <SortHeader label="Action" sortKey="action" />
                  <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">Technical Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {filteredAndSortedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                           <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {log.userName || 'System Auto'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase border
                        ${log.type === 'auth' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' : 
                          log.type === 'investor' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 
                          log.type === 'transaction' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' : 
                          log.type === 'trade' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50' : 
                          'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
                {filteredAndSortedLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                         <div className="w-16 h-16 mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                           <Server className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                         </div>
                         <p className="font-bold text-lg text-slate-900 dark:text-white mb-2">No Records Found</p>
                         <p className="font-medium max-w-sm">No log entries match your current search and filter criteria. Try adjusting the query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
