'use client';
import { useEffect, useState } from 'react';

export default function SignalLogs({ incidentId, onClose }: any) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${incidentId}/signals`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, [incidentId]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-[100]" onClick={onClose}>
      <div 
        className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 p-8 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-zinc-950 py-2 z-10">
          <div>
            <h2 className="text-2xl font-bold text-blue-400">AUDIT_LOG_STREAM</h2>
            <p className="text-xs text-zinc-500 font-mono">INCIDENT_REF: {incidentId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white font-mono bg-zinc-900 px-3 py-1 rounded border border-zinc-800 transition-colors"
          >
            [_CLOSE_]
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse text-zinc-700 font-mono">FETCHING_FROM_MONGODB...</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any, index) => (
              <div key={index} className="p-4 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px]">
                <div className="flex justify-between text-zinc-500 mb-2">
                  <span>{new Date(log.timestamp).toISOString()}</span>
                  <span className="text-blue-900">RAW_PAYLOAD</span>
                </div>
                <pre className="text-green-500 overflow-x-auto">
                  {JSON.stringify(log.rawPayload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}