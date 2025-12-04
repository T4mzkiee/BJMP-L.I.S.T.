
import React, { useState } from 'react';
import { AuditLog } from '../types';
import { FileClock, Search, Trash2 } from 'lucide-react';

interface LogsViewerProps {
  logs: AuditLog[];
  onClear: () => void;
}

const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearClick = () => {
      if (window.confirm("Are you sure you want to clear all system audit logs? This action cannot be undone.")) {
          onClear();
      }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <FileClock className="text-blue-500" /> System Audit Logs
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                type="text" 
                placeholder="Search logs..." 
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <button 
                onClick={handleClearClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-md transition-colors text-sm font-medium"
                title="Clear all logs"
            >
                <Trash2 size={16} /> <span className="hidden md:inline">Clear Logs</span>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 z-10">
                <tr>
                    <th className="p-4 border-b border-slate-700">Timestamp</th>
                    <th className="p-4 border-b border-slate-700">Performed By</th>
                    <th className="p-4 border-b border-slate-700">Action</th>
                    <th className="p-4 border-b border-slate-700">Details</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-700/50">
                        <td className="p-4 font-mono text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-medium text-blue-400">
                            {log.performedBy}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                                log.action.includes('DELETE') ? 'bg-red-900/30 text-red-400 border border-red-900' :
                                log.action.includes('CREATE') || log.action.includes('ADD') ? 'bg-green-900/30 text-green-400 border border-green-900' :
                                log.action.includes('UPDATE') || log.action.includes('EDIT') ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' :
                                'bg-slate-700 text-slate-400'
                            }`}>
                                {log.action}
                            </span>
                        </td>
                        <td className="p-4 text-slate-300">
                            {log.details}
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No logs found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsViewer;
