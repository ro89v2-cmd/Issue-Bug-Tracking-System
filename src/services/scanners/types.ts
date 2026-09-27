// ===== Scanner Type Definitions =====

import { Priority } from '@/models/enums';

export interface ScanFinding {
  id: string;
  category: 'header' | 'information_disclosure' | 'sensitive_file' | 'secret_leak' | 'code_vuln' | 'ssl_tls' | 'cors' | 'cookie';
  title: string;
  description: string;
  simpleExplanation: string; // คำอธิบายภาษาไทยแบบเข้าใจง่าย
  riskImpact: string;         // อันตรายอย่างไร / สิ่งที่อาจเกิดขึ้นหากไม่แก้
  howToFixEasy: string;       // วิธีแก้ไขอย่างง่าย เป็นขั้นตอน
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
