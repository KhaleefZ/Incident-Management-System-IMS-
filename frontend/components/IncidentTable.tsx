'use client';
import { useState } from 'react';
import { api } from '../lib/api';
import RCAForm from './RCAForm';
import SignalLogs from './SignalLogs';

export default function IncidentTable({ incidents, onRefresh }: any) {
  const [showRCA, setShowRCA] = useState<string | null>(null);
  const [viewLogsId, setViewLogsId] = useState<string | null>(null);

  const handleAction = async (id: string, nextStatus: string) => {
    try {
      await api.updateStatus(id, nextStatus);
      onRefresh();
    } catch (err: any) {
      // Triggered by the Backend Guard if status=CLOSED and RCA is missing
      if (err.message?.includes('RCA')) {
        setShowRCA(id);
      } else {
        alert(err.message || 'An error occurred');
      }
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full text-left font-mono text-sm">
        <thead className="bg-zinc-800/50 text-zinc-500 uppercase text-[10px]">
          <tr>
            <th className="p-4">Component_ID</th>
            <th className="p-4">Severity</th>
            <th className="p-4">Status</th>
            <th className="p-4">MTTR (Min)</th>
            <th className="p-4 text-right">Operations</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc: any) => (
            <tr key={inc.id} className="border-t border-zinc-800 hover:bg-zinc-800/20">
              <td className="p-4 text-zinc-300 font-bold">{inc.componentId}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded ${inc.severity === 'P0' ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-orange-950 text-orange-500 border border-orange-900'}`}>
                  {inc.severity}
                </span>
              </td>
              <td className="p-4 text-zinc-400">{inc.status}</td>
              <td className="p-4 text-zinc-600">{inc.mttr ? `${inc.mttr.toFixed(2)}m` : '--'}</td>
              <td className="p-4 text-right space-x-3">
                {/* Audit Log Drill-down */}
                <button 
                  onClick={() => setViewLogsId(inc.id)}
                  className="text-zinc-500 hover:text-blue-400 text-[10px] font-bold tracking-tighter"
                >
                  [VIEW_LOGS]
                </button>

                {/* State Transition Action */}
                {inc.status !== 'CLOSED' && (
                  <button 
                    onClick={() => handleAction(inc.id, inc.status === 'OPEN' ? 'RESOLVED' : 'CLOSED')}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-1 text-xs font-bold rounded text-white transition-colors"
                  >
                    {inc.status === 'OPEN' ? 'RESOLVE' : 'CLOSE'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mandatory RCA Modal */}
      {showRCA && (
        <RCAForm 
          incidentId={showRCA} 
          onComplete={() => { setShowRCA(null); onRefresh(); }} 
          onCancel={() => setShowRCA(null)}
        />
      )}

      {/* Audit Log Sidebar/Modal */}
      {viewLogsId && (
        <SignalLogs 
          incidentId={viewLogsId} 
          onClose={() => setViewLogsId(null)} 
        />
      )}
    </div>
  );
}