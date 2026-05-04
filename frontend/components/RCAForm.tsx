'use client';
import { api } from '../lib/api';

export default function RCAForm({ incidentId, onComplete }: any) {
  const submit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.submitRCA(incidentId, Object.fromEntries(fd));
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-lg space-y-6">
        <h2 className="text-2xl font-bold text-red-500">MANDATORY_RCA_SUBMISSION</h2>
        <div className="space-y-4">
          <select name="rootCauseCategory" className="w-full bg-zinc-800 p-3 rounded">
            <option value="DATABASE_TIMEOUT">Database Timeout</option>
            <option value="INFRASTRUCTURE_FAILURE">Infra Failure</option>
            <option value="CACHE_STORM">Cache Miss Storm</option>
          </select>
          <textarea name="fixApplied" placeholder="Fix Applied..." className="w-full bg-zinc-800 p-3 rounded h-24" required />
          <textarea name="preventionSteps" placeholder="Prevention Steps..." className="w-full bg-zinc-800 p-3 rounded h-24" required />
        </div>
        <button type="submit" className="w-full bg-red-600 py-3 font-black rounded uppercase">Authorize Closure</button>
      </form>
    </div>
  );
}