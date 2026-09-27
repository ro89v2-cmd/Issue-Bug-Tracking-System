// ===== Scanner Type Definitions =====

import { Priority } from '@/models/enums';

export interface ScanFinding {
  id: string;
  category: 'header' | 'information_disclosure' | 'sensitive_file' | 'secret_leak' | 'code_vuln' | 'ssl_tls' | 'cors';
  title: string;
  description: string;
  severity: Priority;
  cvssScore: number;
  target: string;
  evidence?: string;
  remediation: string;
  cveOrType: string;
  autoLoggable: boolean;
}

export interface WebScanSummary {
  targetUrl: string;
  scannedAt: string;
  responseTimeMs: number;
  statusCode: number;
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0 - 100
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: ScanFinding[];
  serverInfo: {
    server?: string;
    poweredBy?: string;
    https: boolean;
  };
}

export interface CodeScanSummary {
  scannedAt: string;
  linesScanned: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: ScanFinding[];
}
