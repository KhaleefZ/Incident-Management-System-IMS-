'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import IncidentTable from '../components/IncidentTable';
import CreateIncidentForm from '../components/CreateIncidentForm';

export default function Home() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* HUD Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/20" />
            <h1 className="text-sm font-black tracking-widest uppercase">
              Incident <span className="text-zinc-500">Command Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-mono text-zinc-500 text-right">
              SYSTEM_STATUS: <span className="text-green-500 uppercase">Operational</span><br />
              REFRESH_RATE: 5000ms
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Active Incidents</h2>
            <p className="text-zinc-500 text-sm">Real-time surveillance of system health and performance anomalies.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Total Active</span>
              <span className="text-xl font-bold">
                {incidents.filter((inc: any) => inc.status !== 'CLOSED').length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <CreateIncidentForm onIncidentCreated={fetchIncidents} />
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <IncidentTable incidents={incidents} onRefresh={fetchIncidents} />
        )}
      </main>
    </div>
  );
}
