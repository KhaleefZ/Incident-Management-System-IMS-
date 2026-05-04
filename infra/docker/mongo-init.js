db = db.getSiblingDB('incident_db');

// Create a capped collection for signal logs to prevent disk overflow
// This is critical for mission-critical stability under high throughput
db.createCollection('signals', {
  capped: true,
  size: 524288000, // 500MB
  max: 1000000     // 1 million documents
});

// Index for fast lookups by workItemId
db.signals.createIndex({ "workItemId": 1 });
db.signals.createIndex({ "timestamp": -1 });

console.log("✅ MongoDB Signal Audit Log initialized with capped collection.");
