'use client';
import { useState } from 'react';

export default function ManualSignalForm({ onSignalSent }: { onSignalSent: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const signal = {
      componentId: formData.get('componentId'),
      severity: formData.get('severity'),
      rawPayload: {
        message: formData.get('message'),
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signals/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal)
      });

      if (response.ok) {
        onSignalSent();
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error('Failed to send signal', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Manual Signal Ingestion</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Component ID</label>
          <input 
            name="componentId" 
            required 
            placeholder="e.g. AUTH_SERVICE" 
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Severity</label>
          <select name="severity" className="bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none">
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Standard)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Error Message</label>
          <input 
            name="message" 
            required 
            placeholder="e.g. Connection Timeout" 
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 px-6 py-2 rounded text-sm font-bold transition-colors"
        >
          {loading ? 'SENDING...' : 'INGEST_SIGNAL'}
        </button>
      </form>
    </div>
  );
}
