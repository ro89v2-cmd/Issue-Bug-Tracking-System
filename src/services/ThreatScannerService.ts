// ===== Threat Scanner Service =====
// OOP Concepts:
// - Facade Pattern: ให้ interface กลางในการเรียกใช้งาน Web และ Code scanners
// - Singleton: ควบคุมการ instantiate scanner engine
// - Integration: เชื่อมต่อผลลัพธ์ของ Scanner เข้ากับ IssueService (Auto-incident logging)

import { WebSecurityScanner } from './scanners/WebSecurityScanner';
import { CodeVulnerabilityScanner } from './scanners/CodeVulnerabilityScanner';
import { ScanFinding, WebScanSummary, CodeScanSummary } from './scanners/types';
import { IssueService } from './IssueService';
import { IssueType, Priority } from '@/models/enums';
import { Issue } from '@/models/Issue';

export class ThreatScannerService {
  private static _instance: ThreatScannerService | null = null;
  private _webScanner: WebSecurityScanner;
  private _codeScanner: CodeVulnerabilityScanner;
  private _issueService: IssueService;

  private constructor() {
    this._webScanner = new WebSecurityScanner();
    this._codeScanner = new CodeVulnerabilityScanner();
    this._issueService = new IssueService();
  }

  static getInstance(): ThreatScannerService {
    if (!ThreatScannerService._instance) {
      ThreatScannerService._instance = new ThreatScannerService();
    }
    return ThreatScannerService._instance;
  }

  // Scan Web Target
  async scanWeb(url: string): Promise<WebScanSummary> {
    return this._webScanner.inspectEndpoint(url);
  }

  // Scan Code / Log Text
  scanCode(sourceCode: string): CodeScanSummary {
    return this._codeScanner.inspectCode(sourceCode);
  }

  // Auto-generate Incident from Scan Finding into the database
  async autoLogIncident(finding: ScanFinding, reporter: string = 'SOC Automated Scanner'): Promise<Issue> {
    const isCodeBug = finding.cveOrType.includes('Defect') || finding.category === 'code_vuln';

    if (isCodeBug) {
      // Create as Bug
      return this._issueService.createIssue({
        title: `[DEFECT] ${finding.title}`,
        description: `${finding.description}\n\nTarget / Location: ${finding.target}\nRemediation: ${finding.remediation}`,
        type: IssueType.BUG,
        priority: finding.severity,
        reporter,
        projectId: 'proj-1',
        environment: 'Automated Detection Radar',
        stepsToReproduce: `Auto-detected via static code analysis pattern: ${finding.cveOrType}`,
        expectedBehavior: 'Code should adhere to security standards without vulnerable patterns.',
        actualBehavior: finding.evidence || 'Vulnerable code construct discovered.',
      });
    } else {
      // Create as Threat
      return this._issueService.createIssue({
        title: `[THREAT] ${finding.title}`,
        description: `${finding.description}\n\nCVE/Type: ${finding.cveOrType}\nAffected Target: ${finding.target}\nRemediation: ${finding.remediation}`,
        type: IssueType.THREAT,
        priority: finding.severity,
        reporter,
        projectId: 'proj-1',
        threatType: finding.cveOrType,
        cvssScore: finding.cvssScore,
        affectedTarget: finding.target,
        remediation: finding.remediation,
      });
    }
  }
}
