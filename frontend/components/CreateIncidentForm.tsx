'use client';
import { useState } from 'react';
import { api } from '../lib/api';

export default function CreateIncidentForm({ onIncidentCreated }: { onIncidentCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    componentId: '',
    severity: 'P2',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We reuse the signal ingestion endpoint as it's the standard way to trigger incidents
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signals/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: formData.componentId,
          severity: formData.severity,
          payload: {
            message: formData.message || 'Manual incident report',
            timestamp: new Date().toISOString(),
            source: 'Manual entry'
          }
        })
      });

      if (response.ok) {
        onIncidentCreated();
        setFormData({ componentId: '', severity: 'P2', message: '' });
      }
    } catch (err) {
      console.error('Failed to create incident', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Report New Incident</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Component ID</label>
          <input 
            value={formData.componentId}
            onChange={(e) => setFormData({...formData, componentId: e.target.value})}
            required 
            placeholder="e.g. PAYMENT_GATEWAY" 
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Severity</label>
          <select 
            value={formData.severity}
            onChange={(e) => setFormData({...formData, severity: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-white"
          >
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Standard)</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] text-zinc-500 uppercase mb-1">Initial Message</label>
          <input 
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required 
            placeholder="e.g. Service degradation detected" 
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-white"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 px-6 py-2 rounded text-sm font-bold transition-colors text-white h-[38px]"
        >
          {loading ? 'CREATING...' : 'CREATE_INCIDENT'}
        </button>
      </form>
    </div>
  );
}
