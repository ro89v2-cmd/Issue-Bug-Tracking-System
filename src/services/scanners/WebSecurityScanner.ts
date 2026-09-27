// ===== Web Security Scanner =====
// OOP Concepts:
// - Inheritance: extends BaseScanner
// - Polymorphism: implements scan() method with real HTTP probes

import { BaseScanner } from './BaseScanner';
import { ScanFinding, WebScanSummary } from './types';
import { Priority } from '@/models/enums';

export class WebSecurityScanner extends BaseScanner {
  private _timeoutMs: number;

  constructor(timeoutMs: number = 8000) {
    super('Web Vulnerability & Threat Radar', '2.5.0');
    this._timeoutMs = timeoutMs;
  }

  // Polymorphic implementation of scan()
  async scan(targetUrl: string): Promise<ScanFinding[]> {
    const summary = await this.inspectEndpoint(targetUrl);
    return summary.findings;
  }

  async inspectEndpoint(targetUrl: string): Promise<WebScanSummary> {
    let normalizedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'http://' + normalizedUrl;
    }

    const findings: ScanFinding[] = [];
    const startTime = Date.now();
    let responseTimeMs = 0;
    let statusCode = 0;
    let serverHeader: string | undefined;
    let poweredByHeader: string | undefined;
    const isHttps = normalizedUrl.toLowerCase().startsWith('https://');

    // Check SSL/TLS protocol
    if (!isHttps && !normalizedUrl.includes('localhost') && !normalizedUrl.includes('127.0.0.1')) {
      findings.push({
        id: this.generateId('SSL'),
        category: 'ssl_tls',
        title: 'Unencrypted HTTP Transport Detected (Cleartext Traffic)',
        description: 'Endpoint communicates over cleartext HTTP without TLS encryption. Credentials, tokens, and data can be intercepted by Man-in-the-Middle (MitM) adversaries.',
        severity: Priority.HIGH,
        cvssScore: 7.5,
        target: normalizedUrl,
        evidence: `Scheme: ${new URL(normalizedUrl).protocol}`,
        remediation: 'Enforce HTTPS via TLS 1.3 certificates and configure 301 Permanent Redirect from HTTP to HTTPS.',
        cveOrType: 'CWE-319: Cleartext Transmission of Sensitive Information',
        autoLoggable: true,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this._timeoutMs);

      const response = await fetch(normalizedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'CyberTrace-SOC-ThreatScanner/2.5 (+https://cybertrace.internal/soc-bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      responseTimeMs = Date.now() - startTime;
      statusCode = response.status;

      serverHeader = response.headers.get('server') || undefined;
      poweredByHeader = response.headers.get('x-powered-by') || undefined;

      // 1. Check Information Leakage
      if (serverHeader) {
        findings.push({
          id: this.generateId('INFO'),
          category: 'information_disclosure',
          title: 'Server Fingerprint Banner Disclosure',
          description: `The web server explicitly discloses its underlying software banner: "${serverHeader}". This assists attackers in fingerprinting known CVEs.`,
          severity: Priority.LOW,
          cvssScore: 3.3,
          target: normalizedUrl,
          evidence: `Server: ${serverHeader}`,
          remediation: 'Configure web server (Nginx/Apache/Cloudflare) to suppress or mask the Server header (e.g., server_tokens off;).',
          cveOrType: 'CWE-200: Exposure of Sensitive Information',
          autoLoggable: true,
        });
      }

      if (poweredByHeader) {
        findings.push({
          id: this.generateId('INFO'),
          category: 'information_disclosure',
          title: 'Technology Stack Disclosure (X-Powered-By)',
          description: `Backend runtime framework disclosed via header: "${poweredByHeader}". Reveals server technology stack to external probes.`,
          severity: Priority.LOW,
          cvssScore: 3.1,
          target: normalizedUrl,
          evidence: `X-Powered-By: ${poweredByHeader}`,
          remediation: 'Disable X-Powered-By header in application framework (e.g. app.disable("x-powered-by") in Express, or poweredByHeader: false in next.config.ts).',
          cveOrType: 'CWE-200: Information Exposure',
          autoLoggable: true,
        });
      }

      // 2. Check Security Headers
      const csp = response.headers.get('content-security-policy');
      if (!csp) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'Missing Content-Security-Policy (CSP) Header',
          description: 'No Content-Security-Policy header defined. Application is susceptible to Cross-Site Scripting (XSS), malicious script injection, and clickjacking attacks.',
          severity: Priority.HIGH,
          cvssScore: 7.2,
          target: normalizedUrl,
          evidence: 'Header Content-Security-Policy is absent',
          remediation: "Deploy a restrictive Content-Security-Policy (e.g., default-src 'self'; script-src 'self'; object-src 'none').",
          cveOrType: 'CWE-1021: Improper Restriction of Rendered UI Layers or Frames',
          autoLoggable: true,
        });
      }

      const xFrame = response.headers.get('x-frame-options');
      if (!xFrame && (!csp || !csp.includes('frame-ancestors'))) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'Missing Anti-Clickjacking Protection (X-Frame-Options)',
          description: 'X-Frame-Options or CSP frame-ancestors header is missing. The site can be embedded into malicious transparent iframes for Clickjacking attacks.',
          severity: Priority.MEDIUM,
          cvssScore: 5.4,
          target: normalizedUrl,
          evidence: 'Header X-Frame-Options is absent',
          remediation: 'Set X-Frame-Options: DENY or SAMEORIGIN in HTTP response headers.',
          cveOrType: 'CWE-1021: Clickjacking Vulnerability',
          autoLoggable: true,
        });
      }

      const xContentType = response.headers.get('x-content-type-options');
      if (!xContentType || xContentType.toLowerCase() !== 'nosniff') {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'Missing MIME Sniffing Defense (X-Content-Type-Options: nosniff)',
          description: 'Browsers may attempt MIME-type sniffing on responses, allowing non-executable files (like images) to be executed as malicious JavaScript.',
          severity: Priority.LOW,
          cvssScore: 3.7,
          target: normalizedUrl,
          evidence: `X-Content-Type-Options: ${xContentType || 'none'}`,
          remediation: 'Add header: X-Content-Type-Options: nosniff to all responses.',
          cveOrType: 'CWE-430: Deployment of Wrong Handler',
          autoLoggable: true,
        });
      }

      if (isHttps) {
        const hsts = response.headers.get('strict-transport-security');
        if (!hsts) {
          findings.push({
            id: this.generateId('HDR'),
            category: 'header',
            title: 'Missing HTTP Strict Transport Security (HSTS)',
            description: 'HTTPS connection lacks Strict-Transport-Security header, leaving users vulnerable to SSL-stripping and downgrade attacks.',
            severity: Priority.MEDIUM,
            cvssScore: 5.8,
            target: normalizedUrl,
            evidence: 'Header Strict-Transport-Security is absent',
            remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
            cveOrType: 'CWE-523: Unprotected Transport of Credentials',
            autoLoggable: true,
          });
        }
      }

      // Check CORS Misconfiguration
      const corsOrigin = response.headers.get('access-control-allow-origin');
      const corsCredentials = response.headers.get('access-control-allow-credentials');
      if (corsOrigin === '*' && corsCredentials === 'true') {
        findings.push({
          id: this.generateId('CORS'),
          category: 'cors',
          title: 'Permissive Wildcard CORS with Credentials',
          description: 'Access-Control-Allow-Origin is configured as wildcard * alongside credentials true. Malicious domains can read authenticated session data.',
          severity: Priority.CRITICAL,
          cvssScore: 9.1,
          target: normalizedUrl,
          evidence: `Origin: *, Credentials: ${corsCredentials}`,
          remediation: 'Do not reflect wildcard origins when credentials are supported. Whitelist explicit trusted domain origins.',
          cveOrType: 'CWE-942: Overly Permissive Cross-Domain Whitelist',
          autoLoggable: true,
        });
      }

      // 3. Sensitive Path Probing (Safe verification)
      await this.probeSensitivePaths(normalizedUrl, findings);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      findings.push({
        id: this.generateId('CONN'),
        category: 'ssl_tls',
        title: 'Endpoint Connection Failure or Timeout',
        description: `Target was unreachable or refused connection: ${errorMsg}`,
        severity: Priority.MEDIUM,
        cvssScore: 5.0,
        target: normalizedUrl,
        evidence: errorMsg,
        remediation: 'Verify host availability, DNS resolution, and firewall ingress rules.',
        cveOrType: 'Availability Degraded',
        autoLoggable: false,
      });
    }

    // Compute Overall Security Posture Grade
    const score = this.calculateSecurityScore(findings);
    const securityGrade = this.scoreToGrade(score);

    const criticalCount = findings.filter(f => f.severity === Priority.CRITICAL).length;
    const highCount = findings.filter(f => f.severity === Priority.HIGH).length;
    const mediumCount = findings.filter(f => f.severity === Priority.MEDIUM).length;
    const lowCount = findings.filter(f => f.severity === Priority.LOW).length;

    return {
      targetUrl: normalizedUrl,
      scannedAt: new Date().toISOString(),
      responseTimeMs,
      statusCode,
      securityGrade,
      score,
      totalFindings: findings.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      findings,
      serverInfo: {
        server: serverHeader,
        poweredBy: poweredByHeader,
        https: isHttps,
      },
    };
  }

  private async probeSensitivePaths(baseUrl: string, findings: ScanFinding[]): Promise<void> {
    const sensitiveProbes = [
      {
        path: '/.env',
        signature: /(?:DB_|DATABASE_|API_KEY|SECRET|PASSWORD|PRIVATE_KEY)=/i,
        title: 'Exposed Environment Configuration File (.env)',
        desc: 'Critical configuration file containing private keys, database credentials, or secret tokens is exposed publicly.',
        cve: 'CWE-552: Files or Directories Accessible to External Parties',
        severity: Priority.CRITICAL,
        cvss: 9.8,
      },
      {
        path: '/.git/HEAD',
        signature: /^ref:\s+refs\/heads\//i,
        title: 'Exposed Git Source Repository Metadata (.git/HEAD)',
        desc: 'Git repository folder is publicly readable, allowing full source code cloning and git commit history extraction.',
        cve: 'CWE-538: Insertion of Sensitive Information into Externally-Accessible File',
        severity: Priority.CRITICAL,
        cvss: 9.4,
      },
    ];

    for (const probe of sensitiveProbes) {
      try {
        const probeUrl = new URL(probe.path, baseUrl).toString();
        const probeRes = await fetch(probeUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
          headers: { 'User-Agent': 'CyberTrace-SOC-ThreatScanner/2.5' }
        });

        if (probeRes.status === 200) {
          const text = await probeRes.text();
          if (probe.signature.test(text.substring(0, 500))) {
            findings.push({
              id: this.generateId('LEAK'),
              category: 'sensitive_file',
              title: probe.title,
              description: probe.desc,
              severity: probe.severity,
              cvssScore: probe.cvss,
              target: probeUrl,
              evidence: `Exposed at: ${probeUrl} (HTTP 200 with signature match)`,
              remediation: 'Configure web server (Nginx/Apache/Vercel) to forbid direct access to hidden files and directories (deny .git, .env).',
              cveOrType: probe.cve,
              autoLoggable: true,
            });
          }
        }
      } catch {
        // Probe timed out or blocked safely
      }
    }
  }

  private calculateSecurityScore(findings: ScanFinding[]): number {
    let score = 100;
    for (const f of findings) {
      if (f.severity === Priority.CRITICAL) score -= 30;
      else if (f.severity === Priority.HIGH) score -= 18;
      else if (f.severity === Priority.MEDIUM) score -= 8;
      else score -= 3;
    }
    return Math.max(0, Math.min(100, score));
  }

  private scoreToGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }
}
