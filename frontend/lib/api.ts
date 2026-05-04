const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // GET: Real-time Live Feed
  getIncidents: () => fetch(`${API_BASE}/incidents`).then(res => res.json()),
  
  // PATCH: State Transitions
  updateStatus: (id: string, status: string) => 
    fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(async res => {
      if (!res.ok) throw await res.json();
      return res.json();
    }),

  // GET: MongoDB Audit Signals
  getIncidentSignals: (id: string) =>
    fetch(`${API_BASE}/incidents/${id}/signals`).then(res => res.json()),

  // POST: Mandatory RCA Submission
  submitRCA: (id: string, data: any) =>
    fetch(`${API_BASE}/incidents/${id}/rca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
};