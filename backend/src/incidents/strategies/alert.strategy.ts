export interface AlertStrategy {
  sendAlert(componentId: string, severity: string): Promise<void>;
}

// Strategy for Critical Failures (P0/P1)
export class CriticalAlertStrategy implements AlertStrategy {
  async sendAlert(componentId: string, severity: string) {
    // In a real system, this would call PagerDuty, Twilio, or SMS APIs
    console.log(`\x1b[31m[CRITICAL ALERT]\x1b[0m Component: ${componentId} | Severity: ${severity} | Action: Immediate Page Sent.`);
  }
}

// Strategy for Standard Failures (P2)
export class StandardAlertStrategy implements AlertStrategy {
  async sendAlert(componentId: string, severity: string) {
    // In a real system, this would post to a Slack channel or SendGrid
    console.log(`\x1b[33m[STANDARD ALERT]\x1b[0m Component: ${componentId} | Severity: ${severity} | Action: Slack notification posted.`);
  }
}