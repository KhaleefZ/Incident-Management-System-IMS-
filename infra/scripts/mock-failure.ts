import axios from 'axios';

const TARGET_URL = 'http://localhost:3000/signals'; // Backend signal ingestion point
const TOTAL_SIGNALS = 30000; // 10k signals/sec for 3 seconds to test backpressure

async function simulateBurst() {
  console.log("🚀 STARTING_BURST: 10,000 signals/second...");
  const startTime = Date.now();
  
  for (let i = 0; i < TOTAL_SIGNALS; i++) {
    // Fire and forget to simulate high load and test BullMQ queueing
    axios.post(TARGET_URL, {
      componentId: "RDBMS_CLUSTER_01",
      severity: "P0",
      rawPayload: { 
        error: "Connection Timeout", 
        latency: Math.random() * 500,
        iteration: i 
      }
    }).catch(() => {
      // In a real burst, some local network saturation might occur
    });
    
    if (i > 0 && i % 5000 === 0) {
      console.log(`[STRESS_TEST] Progress: Sent ${i} signals...`);
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ BURST_COMPLETE: Sent ${TOTAL_SIGNALS} signals in ${duration.toFixed(2)}s`);
  console.log("Check NestJS logs to verify BullMQ/Redis throughput metrics.");
}

simulateBurst();
