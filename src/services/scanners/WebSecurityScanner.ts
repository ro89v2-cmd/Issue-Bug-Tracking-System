// ===== Web Security Scanner (Enhanced Detection + Easy Explanations) =====
// OOP Concepts:
// - Inheritance: extends BaseScanner
// - Polymorphism: implements scan() with comprehensive HTTP probes & plain language analysis

import { BaseScanner } from './BaseScanner';
import { ScanFinding, WebScanSummary } from './types';
import { Priority } from '@/models/enums';

export class WebSecurityScanner extends BaseScanner {
  private _timeoutMs: number;

  constructor(timeoutMs: number = 8000) {
    super('Web Vulnerability & Threat Radar', '3.0.0');
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

    // 1. ตรวจสอบการเข้ารหัส HTTPS (SSL/TLS Transport)
    if (!isHttps && !normalizedUrl.includes('localhost') && !normalizedUrl.includes('127.0.0.1')) {
      findings.push({
        id: this.generateId('SSL'),
        category: 'ssl_tls',
        title: 'เว็บไซต์ไม่ได้เข้ารหัสความปลอดภัย (ไม่ได้ใช้ HTTPS)',
        description: 'Endpoint communicates over cleartext HTTP without TLS encryption. Credentials, tokens, and data can be intercepted by Man-in-the-Middle (MitM) adversaries.',
        simpleExplanation: 'เหมือนส่งจดหมายเปิดผนึกโดยไม่ปิดซอง ข้อมูลที่ผู้ใช้พิมพ์ (เช่น รหัสผ่าน, ข้อมูลส่วนตัว) จะถูกส่งเป็นข้อความธรรมดา คนที่อยู่บน Wi-Fi เดียวกันหรือผู้ให้บริการอินเทอร์เน็ตสามารถแอบอ่านได้ทันที',
        riskImpact: 'เสี่ยงถูกดักจับรหัสผ่าน (Man-in-the-Middle) และถูกปลอมแปลงหน้าเว็บขโมยข้อมูลบัญชีผู้ใช้',
        howToFixEasy: 'ติดตั้งใบรับรอง SSL/TLS (เช่น ฟรีจาก Let\'s Encrypt หรือ Cloudflare) และตั้งค่าให้เปลี่ยนเส้นทาง (Redirect) ทุกการเข้าชมจาก HTTP เป็น HTTPS อัตโนมัติ',
        severity: Priority.HIGH,
        cvssScore: 7.5,
        target: normalizedUrl,
        evidence: `โปรโตคอลปัจจุบัน: ${new URL(normalizedUrl).protocol}`,
        remediation: 'Enforce HTTPS via TLS 1.3 certificates and configure 301 Permanent Redirect from HTTP to HTTPS.',
        cveOrType: 'CWE-319: ส่งข้อมูลสำคัญผ่านช่องทางไม่เข้ารหัส',
        autoLoggable: true,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this._timeoutMs);

      const response = await fetch(normalizedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'CyberTrace-SOC-ThreatScanner/3.0 (+https://cybertrace.internal/soc-bot)',
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

      // 2. ตรวจสอบการเปิดเผยข้อมูลเซิร์ฟเวอร์ (Information Leakage)
      if (serverHeader) {
        findings.push({
          id: this.generateId('INFO'),
          category: 'information_disclosure',
          title: `เซิร์ฟเวอร์เปิดเผยชื่อโปรแกรมระบบ (${serverHeader})`,
          description: `The web server explicitly discloses its underlying software banner: "${serverHeader}". This assists attackers in fingerprinting known CVEs.`,
          simpleExplanation: 'เซิร์ฟเวอร์กำลัง "บอกยี่ห้อและรุ่นของโปรแกรม" ให้คนภายนอกรู้ แฮกเกอร์จึงรู้ทันทีว่าระบบมีช่องโหว่ประจำรุ่นอะไรบ้าง ทำให้เจาะระบบได้ง่ายขึ้นโดยไม่ต้องเดา',
          riskImpact: 'แฮกเกอร์ค้นหาช่องโหว่เฉพาะรุ่นของซอฟต์แวร์เซิร์ฟเวอร์นี้มาโจมตีได้ตรงเป้าหมาย',
          howToFixEasy: 'ปิดการแสดงผล Header "Server" ในการตั้งค่าของ Nginx, Apache หรือ Cloudflare (เช่น server_tokens off;)',
          severity: Priority.LOW,
          cvssScore: 3.3,
          target: normalizedUrl,
          evidence: `Server Header: ${serverHeader}`,
          remediation: 'Configure web server (Nginx/Apache/Cloudflare) to suppress or mask the Server header (e.g., server_tokens off;).',
          cveOrType: 'CWE-200: เปิดเผยข้อมูลระบบสู่สาธารณะ',
          autoLoggable: true,
        });
      }

      if (poweredByHeader) {
        findings.push({
          id: this.generateId('INFO'),
          category: 'information_disclosure',
          title: `เซิร์ฟเวอร์เปิดเผยเทคโนโลยีที่ใช้สร้างเว็บ (${poweredByHeader})`,
          description: `Backend runtime framework disclosed via header: "${poweredByHeader}". Reveals server technology stack to external probes.`,
          simpleExplanation: 'เว็บประกาศให้ทุกคนรู้ว่าสร้างด้วยเครื่องมืออะไร (เช่น Next.js, Express, PHP) ทำให้ผู้ไม่หวังดีรู้โครงสร้างหลังบ้านทันที',
          riskImpact: 'เพิ่มโอกาสให้แฮกเกอร์เลือกชุดเครื่องมือเจาะระบบที่ออกแบบมาโจมตี Framework นี้โดยเฉพาะ',
          howToFixEasy: 'ปิดการส่ง Header X-Powered-By ในโค้ด (เช่น ใน Next.js ให้ใส่ poweredByHeader: false ใน next.config.ts)',
          severity: Priority.LOW,
          cvssScore: 3.1,
          target: normalizedUrl,
          evidence: `X-Powered-By: ${poweredByHeader}`,
          remediation: 'Disable X-Powered-By header in application framework config.',
          cveOrType: 'CWE-200: ข้อมูลเทคโนโลยีรั่วไหล',
          autoLoggable: true,
        });
      }

      // 3. ตรวจสอบ Security Headers สำคัญ
      // 3.1 Content-Security-Policy (CSP)
      const csp = response.headers.get('content-security-policy');
      if (!csp) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'ไม่มีเกราะป้องกันสคริปต์อันตราย (ขาด Content-Security-Policy: CSP)',
          description: 'No Content-Security-Policy header defined. Application is susceptible to Cross-Site Scripting (XSS), malicious script injection, and clickjacking attacks.',
          simpleExplanation: 'ขาดระบบกำหนดว่าหน้าเว็บนี้อนุญาตให้โหลดสคริปต์จากที่ไหนได้บ้าง ถ้ามีคนแอบฝังสคริปต์ไวรัสลงในช่องคอมเมนต์หรือ URL เบราว์เซอร์จะยอมรันสคริปต์นั้นทันทีเพราะไม่มีกฎห้ามไว้',
          riskImpact: 'เสี่ยงต่อการถูกแฮกแบบ XSS (Cross-Site Scripting) แฮกเกอร์สามารถขโมย Session, ขโมยรหัสผ่าน หรือขโมยบัตรเครดิตของผู้ใช้ได้',
          howToFixEasy: 'เพิ่ม Header "Content-Security-Policy" เพื่อระบุว่าให้โหลดไฟล์และโค้ดเฉพาะจากโดเมนของตัวเองเท่านั้น (เช่น default-src \'self\'; script-src \'self\';)',
          severity: Priority.HIGH,
          cvssScore: 7.2,
          target: normalizedUrl,
          evidence: 'ไม่พบ Content-Security-Policy ใน Header ตอบกลับ',
          remediation: "Deploy a restrictive Content-Security-Policy (e.g., default-src 'self'; script-src 'self'; object-src 'none').",
          cveOrType: 'CWE-1021 / CWE-79: เสี่ยงต่อ XSS และ Script Injection',
          autoLoggable: true,
        });
      }

      // 3.2 X-Frame-Options (Clickjacking)
      const xFrame = response.headers.get('x-frame-options');
      if (!xFrame && (!csp || !csp.includes('frame-ancestors'))) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'ไม่มีการป้องกันการฝังเว็บหลอกคลิก (ขาด X-Frame-Options: Clickjacking)',
          description: 'X-Frame-Options or CSP frame-ancestors header is missing. The site can be embedded into malicious transparent iframes for Clickjacking attacks.',
          simpleExplanation: 'ไม่ได้ห้ามเว็บอื่นเอาหน้าเว็บเราไปซ้อนในกรอบใส (iframe) แฮกเกอร์สามารถสร้างเว็บหลอกล่อให้ผู้ใช้กดปุ่มเล่นเกม แต่จริง ๆ แล้วปุ่มนั้นซ้อนทับอยู่บนปุ่ม "โอนเงิน" หรือ "ลบบัญชี" ในเว็บเรา ทำให้ผู้ใช้เผลอกดทำรายการโดยไม่รู้ตัว',
          riskImpact: 'ผู้ใช้ถูกหลอกให้คลิกทำรายการสำคัญโดยไม่รู้ตัว (Clickjacking Attack)',
          howToFixEasy: 'เพิ่ม Header "X-Frame-Options: DENY" หรือ "SAMEORIGIN" เพื่อสั่งให้เบราว์เซอร์ไม่อนุญาตให้เว็บแปลกปลอมนำหน้าเว็บเราไปใส่ใน iframe',
          severity: Priority.MEDIUM,
          cvssScore: 5.4,
          target: normalizedUrl,
          evidence: 'ไม่พบ Header X-Frame-Options',
          remediation: 'Set X-Frame-Options: DENY or SAMEORIGIN in HTTP response headers.',
          cveOrType: 'CWE-1021: ช่องโหว่หลอกคลิก (Clickjacking)',
          autoLoggable: true,
        });
      }

      // 3.3 X-Content-Type-Options
      const xContentType = response.headers.get('x-content-type-options');
      if (!xContentType || xContentType.toLowerCase() !== 'nosniff') {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'เบราว์เซอร์อาจถูกหลอกให้อ่านไฟล์ผิดประเภท (ขาด X-Content-Type-Options: nosniff)',
          description: 'Browsers may attempt MIME-type sniffing on responses, allowing non-executable files (like images) to be executed as malicious JavaScript.',
          simpleExplanation: 'ถ้าไม่มีคำสั่งนี้ เมื่อมีคนอัปโหลดไฟล์รูปภาพแต่แอบซ่อนโค้ดไวรัสไว้ข้างใน เบราว์เซอร์บางรุ่นอาจจะพยายาม "เดาชนิดไฟล์" แล้วเผลอรันโค้ดไวรัสนั้นแทนที่จะแสดงแค่รูปภาพ',
          riskImpact: 'ไฟล์อัปโหลดที่ไม่เป็นอันตรายอาจถูกเบราว์เซอร์ตีความผิดเป็นสคริปต์ไวรัส',
          howToFixEasy: 'เพิ่มคำสั่ง Header "X-Content-Type-Options: nosniff" ให้เซิร์ฟเวอร์ส่งกลับมาทุกครั้ง เพื่อบังคับให้เบราว์เซอร์เชื่อชนิดไฟล์ที่ระบุเท่านั้น ห้ามเดาเอง',
          severity: Priority.LOW,
          cvssScore: 3.7,
          target: normalizedUrl,
          evidence: `X-Content-Type-Options: ${xContentType || 'ไม่มีค่า'}`,
          remediation: 'Add header: X-Content-Type-Options: nosniff to all responses.',
          cveOrType: 'CWE-430: เสี่ยงต่อการตรวจจับชนิดไฟล์ผิดพลาด (MIME Sniffing)',
          autoLoggable: true,
        });
      }

      // 3.4 Strict-Transport-Security (HSTS)
      if (isHttps) {
        const hsts = response.headers.get('strict-transport-security');
        if (!hsts) {
          findings.push({
            id: this.generateId('HDR'),
            category: 'header',
            title: 'ยังไม่ได้บังคับใช้ HTTPS อย่างถาวร (ขาด HSTS Header)',
            description: 'HTTPS connection lacks Strict-Transport-Security header, leaving users vulnerable to SSL-stripping and downgrade attacks.',
            simpleExplanation: 'แม้เว็บจะมี HTTPS แต่ถ้าไม่มีคำสั่งนี้ แฮกเกอร์ที่อยู่บนเครือข่ายเดียวกันสามารถสั่ง "ลดระดับความปลอดภัย" บังคับให้เบราว์เซอร์ของผู้ใช้คุยเป็น HTTP ธรรมดาแทนได้ (SSL Stripping)',
            riskImpact: 'ผู้ใช้เสี่ยงโดนดักฟังข้อมูลระหว่างทางหากพิมพ์ url โดยไม่ใส่ https:// นำหน้า',
            howToFixEasy: 'เพิ่ม Header: Strict-Transport-Security: max-age=31536000; includeSubDomains เพื่อสั่งเบราว์เซอร์ว่าห้ามเข้าเว็บนี้แบบ HTTP ธรรมดาโดยเด็ดขาดเป็นเวลา 1 ปี',
            severity: Priority.MEDIUM,
            cvssScore: 5.8,
            target: normalizedUrl,
            evidence: 'ไม่พบ Strict-Transport-Security ใน Header',
            remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
            cveOrType: 'CWE-523: ไม่ได้บังคับเข้ารหัสข้อมูลตลอดเวลา',
            autoLoggable: true,
          });
        }
      }

      // 3.5 Referrer-Policy
      const referrerPolicy = response.headers.get('referrer-policy');
      if (!referrerPolicy) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'เสี่ยงข้อมูลใน URL รั่วไหลไปยังเว็บอื่น (ขาด Referrer-Policy)',
          description: 'No Referrer-Policy header specified. When users click outbound links, the full URL may be leaked to external analytics or third-party servers.',
          simpleExplanation: 'เมื่อผู้ใช้คลิกลิงก์ออกไปยังเว็บอื่น เบราว์เซอร์จะส่ง URL หน้าเดิมที่ผู้ใช้กำลังดูอยู่ไปให้เว็บปลายทางรู้ด้วย หากใน URL มีข้อมูลสำคัญ (เช่น token หรือ email) ก็จะหลุดไปด้วยทันที',
          riskImpact: 'ข้อมูลพารามิเตอร์หรือโทเคนที่อาจติดอยู่ใน URL หลุดไปยังเว็บภายนอก',
          howToFixEasy: 'เพิ่ม Header "Referrer-Policy: strict-origin-when-cross-origin"',
          severity: Priority.LOW,
          cvssScore: 3.2,
          target: normalizedUrl,
          evidence: 'ไม่พบ Referrer-Policy Header',
          remediation: 'Set Referrer-Policy: strict-origin-when-cross-origin',
          cveOrType: 'CWE-200: ข้อมูล URL รั่วไหลผ่าน Referrer',
          autoLoggable: true,
        });
      }

      // 3.6 Permissions-Policy
      const permPolicy = response.headers.get('permissions-policy');
      if (!permPolicy) {
        findings.push({
          id: this.generateId('HDR'),
          category: 'header',
          title: 'ไม่มีการจำกัดสิทธิ์เข้าถึงอุปกรณ์ของผู้ใช้ (ขาด Permissions-Policy)',
          description: 'Permissions-Policy header is absent. Third-party iframes may request access to camera, microphone, or geolocation.',
          simpleExplanation: 'ไม่ได้ตั้งกฎล็อกไว้ว่าเว็บไซต์หรือ iframe ที่ฝังอยู่มีสิทธิ์ขอเปิดกล้อง ไมโครโฟน หรือเข้าถึงตำแหน่ง GPS ของผู้ใช้ได้หรือไม่',
          riskImpact: 'หากมีสคริปต์ไม่พึงประสงค์ฝังอยู่ในหน้าเว็บ อาจพยายามขอเปิดกล้องหรือตำแหน่ง GPS ของผู้ใช้งานได้',
          howToFixEasy: 'เพิ่ม Header "Permissions-Policy: camera=(), microphone=(), geolocation=()" เพื่อปิดการใช้งานฮาร์ดแวร์ที่ไม่จำเป็น',
          severity: Priority.LOW,
          cvssScore: 2.8,
          target: normalizedUrl,
          evidence: 'ไม่พบ Permissions-Policy Header',
          remediation: 'Configure Permissions-Policy header to restrict unnecessary browser hardware APIs.',
          cveOrType: 'CWE-250: สิทธิ์การเข้าถึงอุปกรณ์กว้างเกินไป',
          autoLoggable: true,
        });
      }

      // 4. ตรวจสอบการตั้งค่า CORS
      const corsOrigin = response.headers.get('access-control-allow-origin');
      const corsCredentials = response.headers.get('access-control-allow-credentials');
      if (corsOrigin === '*' && corsCredentials === 'true') {
        findings.push({
          id: this.generateId('CORS'),
          category: 'cors',
          title: 'ตั้งค่าสิทธิ์ข้ามเว็บอันตรายขั้นวิกฤต (CORS Wildcard + Credentials)',
          description: 'Access-Control-Allow-Origin is configured as wildcard * alongside credentials true. Malicious domains can read authenticated session data.',
          simpleExplanation: 'เหมือนเปิดประตูบ้านทิ้งไว้ให้ทุกคนในโลกเข้าออกได้ แถมยังบอกให้หยิบกุญแจส่วนตัวไปใช้ได้ด้วย เว็บไซต์อันตรายภายนอกสามารถสั่งให้เบราว์เซอร์ของผู้ใช้ดึงข้อมูลลับออกมาส่งให้แฮกเกอร์ได้โดยตรง',
          riskImpact: 'แฮกเกอร์ขโมยข้อมูลบัญชี ประวัติ หรือข้อมูลส่วนตัวของผู้ใช้งานที่ล็อกอินอยู่ได้ทั้งหมด',
          howToFixEasy: 'ห้ามตั้งค่า Access-Control-Allow-Origin เป็นดอกจัน (*) หากมีการใช้คุกกี้ล็อกอิน ให้ระบุชื่อโดเมนเฉพาะที่ไว้ใจได้เท่านั้น',
          severity: Priority.CRITICAL,
          cvssScore: 9.1,
          target: normalizedUrl,
          evidence: `Origin: *, Credentials: ${corsCredentials}`,
          remediation: 'Do not reflect wildcard origins when credentials are supported. Whitelist explicit trusted domain origins.',
          cveOrType: 'CWE-942: สิทธิ์ CORS หละหลวมร้ายแรง',
          autoLoggable: true,
        });
      }

      // 5. ตรวจสอบความปลอดภัยของคุกกี้ (Cookie Security Flags)
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        if (!setCookie.toLowerCase().includes('httponly')) {
          findings.push({
            id: this.generateId('COOKIE'),
            category: 'cookie',
            title: 'คุกกี้ไม่ได้เปิดใช้งาน HttpOnly (เสี่ยงถูกขโมยผ่าน JavaScript)',
            description: 'Set-Cookie header lacks HttpOnly flag. Client-side scripts can access authentication cookies via document.cookie.',
            simpleExplanation: 'คุกกี้ที่ใช้จำการล็อกอินไม่ได้ถูกซ่อนจากโค้ด JavaScript ถ้าเว็บโดนแฮกเกอร์ฝังสคริปต์ (XSS) สคริปต์นั้นจะสั่งอ่านคุกกี้แล้วส่งไปให้แฮกเกอร์ทันที ทำให้แฮกเกอร์สวมรอยเป็นคุณได้',
            riskImpact: 'บัญชีผู้ใช้งานถูกขโมย (Session Hijacking) ได้อย่างง่ายดาย',
            howToFixEasy: 'ตั้งค่าตอนส่งคุกกี้ให้มีตัวเลือก `httpOnly: true` เพื่อให้มีแต่เซิร์ฟเวอร์เท่านั้นที่อ่านคุกกี้นี้ได้ ห้าม JavaScript แตะต้อง',
            severity: Priority.HIGH,
            cvssScore: 7.4,
            target: normalizedUrl,
            evidence: `Set-Cookie: ${setCookie.substring(0, 100)}...`,
            remediation: 'Add HttpOnly flag to authentication session cookies.',
            cveOrType: 'CWE-1004: คุกกี้ขาดการตั้งค่า HttpOnly',
            autoLoggable: true,
          });
        }

        if (!setCookie.toLowerCase().includes('secure') && isHttps) {
          findings.push({
            id: this.generateId('COOKIE'),
            category: 'cookie',
            title: 'คุกกี้ไม่ได้บังคับส่งผ่าน HTTPS เท่านั้น (ขาด Secure Flag)',
            description: 'Cookie set on HTTPS without the Secure flag can be transmitted over unencrypted HTTP.',
            simpleExplanation: 'ไม่ได้ติดป้ายกำกับว่าคุกกี้นี้ห้ามส่งผ่านช่องทางไม่ปลอดภัย หากผู้ใช้เผลอเปิดหน้าเว็บแบบ HTTP คุกกี้ล็อกอินนี้จะถูกส่งออกไปแบบไม่เข้ารหัสทันที',
            riskImpact: 'คุกกี้ล็อกอินถูกดักจับได้บนเครือข่าย Wi-Fi สาธารณะ',
            howToFixEasy: 'ตั้งค่าตอนส่งคุกกี้ให้มีตัวเลือก `secure: true`',
            severity: Priority.MEDIUM,
            cvssScore: 5.3,
            target: normalizedUrl,
            evidence: 'Set-Cookie lacks Secure flag',
            remediation: 'Add Secure flag to all session cookies.',
            cveOrType: 'CWE-614: คุกกี้ส่งผ่านช่องทางไม่ปลอดภัย',
            autoLoggable: true,
          });
        }
      }

      // 6. ตรวจสอบไฟล์ลับหรือฐานข้อมูลหลุดสู่สาธารณะ (Deep Sensitive Path Probing)
      await this.probeSensitivePaths(normalizedUrl, findings);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      findings.push({
        id: this.generateId('CONN'),
        category: 'ssl_tls',
        title: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ปลายทางได้ หรือถูกบล็อกการเชื่อมต่อ',
        description: `Target was unreachable or refused connection: ${errorMsg}`,
        simpleExplanation: 'ระบบไม่สามารถส่งคำขอไปสแกนเซิร์ฟเวอร์เป้าหมายได้ อาจเกิดจากเซิร์ฟเวอร์ปิดอยู่ พิมพ์ URL ผิด หรือติดไฟร์วอลล์บล็อกไว้',
        riskImpact: 'ผู้ใช้ภายนอกอาจไม่สามารถเข้าใช้งานระบบได้ (Service Down)',
        howToFixEasy: 'ตรวจสอบว่าเซิร์ฟเวอร์เปิดทำงานอยู่จริง ตรวจสอบการสะกดชื่อโดเมน/พอร์ต และตรวจสอบกฎไฟร์วอลล์',
        severity: Priority.MEDIUM,
        cvssScore: 5.0,
        target: normalizedUrl,
        evidence: errorMsg,
        remediation: 'Verify host availability, DNS resolution, and firewall ingress rules.',
        cveOrType: 'ระบบปลายทางไม่ตอบสนอง',
        autoLoggable: false,
      });
    }

    // คำนวณคะแนนและเกรด
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
        title: 'ไฟล์ตั้งค่าและรหัสผ่านลับหลุดสู่สาธารณะ (.env File Leaked!)',
        desc: 'Critical configuration file containing private keys, database credentials, or secret tokens is exposed publicly.',
        simple: 'อันตรายขั้นร้ายแรงที่สุด! ไฟล์ .env ที่เก็บรหัสผ่านฐานข้อมูลและ API Key ลับถูกเปิดทิ้งไว้ให้ใครก็ได้โหลดไปอ่าน',
        impact: 'แฮกเกอร์ดาวน์โหลดรหัสผ่านไปล็อกอินเข้าฐานข้อมูลโดยตรง ขโมยหรือลบข้อมูลทั้งระบบได้ทันที',
        fix: 'ตั้งค่าเว็บเซิร์ฟเวอร์ (Nginx/Apache/Vercel) ให้ปฏิเสธการเข้าถึงไฟล์ที่ขึ้นต้นด้วยจุด (.) ทั้งหมดทันที',
        cve: 'CWE-552: ไฟล์ลับสำคัญเปิดเผยสู่สาธารณะ',
        severity: Priority.CRITICAL,
        cvss: 9.8,
      },
      {
        path: '/.git/HEAD',
        signature: /^ref:\s+refs\/heads\//i,
        title: 'โฟลเดอร์ Git หลุดสู่สาธารณะ (.git Directory Exposed)',
        desc: 'Git repository folder is publicly readable, allowing full source code cloning and git commit history extraction.',
        simple: 'โฟลเดอร์ .git เปิดทิ้งไว้ แฮกเกอร์สามารถใช้โปรแกรมดูดซอร์สโค้ดและประวัติการแก้โค้ดทั้งหมดของโปรเจกต์คุณไปได้ทั้งดุ้น',
        impact: 'ซอร์สโค้ดและรหัสผ่านลับในประวัติ Git โดนขโมยไปทั้งหมด',
        fix: 'บล็อกการเข้าถึงโฟลเดอร์ /.git/* บน Web Server ทันที',
        cve: 'CWE-538: ซอร์สโค้ดใน Git หลุดสู่ภายนอก',
        severity: Priority.CRITICAL,
        cvss: 9.4,
      },
      {
        path: '/package.json',
        signature: /"(?:name|dependencies|devDependencies)"\s*:/i,
        title: 'ไฟล์รายการแพ็กเกจของระบบหลุดสู่สาธารณะ (package.json Exposed)',
        desc: 'Node.js package manifest is accessible, revealing exact versions of all installed libraries.',
        simple: 'ไฟล์รายการไลบรารีที่เว็บใช้งานเปิดให้คนนอกอ่านได้ ทำให้ผู้ไม่หวังดีรู้ว่าเว็บใช้ไลบรารีเวอร์ชันไหนที่มีบั๊กอยู่บ้าง',
        impact: 'แฮกเกอร์ตรวจสอบหาช่องโหว่สำเร็จรูปของไลบรารีแต่ละตัวมาโจมตี',
        fix: 'บล็อกการดาวน์โหลดไฟล์ package.json จากหน้าเว็บโดยตรง',
        cve: 'CWE-200: ข้อมูลแพ็กเกจระบบรั่วไหล',
        severity: Priority.MEDIUM,
        cvss: 5.3,
      },
      {
        path: '/backup.sql',
        signature: /(?:CREATE TABLE|INSERT INTO|DROP TABLE)/i,
        title: 'ไฟล์สำรองฐานข้อมูลหลุดสู่สาธารณะ (backup.sql Exposed)',
        desc: 'Database backup file is publicly downloadable.',
        simple: 'ไฟล์สำรองข้อมูล (Database Backup) วางไว้ในโฟลเดอร์เว็บสาธารณะ ใครกดดาวน์โหลดไปก็จะได้ข้อมูลทั้งหมดไปดู',
        impact: 'ข้อมูลลูกค้า ข้อมูลบัญชี และรหัสผ่านทั้งหมดถูกขโมยออกไป',
        fix: 'ลบไฟล์ backup ออกจากโฟลเดอร์สาธารณะ และเก็บไฟล์สำรองไว้ในพื้นที่ปลอดภัยที่มีการล็อกสิทธิ์',
        cve: 'CWE-552: ฐานข้อมูลสำรองหลุดสู่สาธารณะ',
        severity: Priority.CRITICAL,
        cvss: 9.9,
      },
      {
        path: '/server-status',
        signature: /Apache Server Status/i,
        title: 'หน้าตรวจสอบสถานะเซิร์ฟเวอร์เปิดสาธารณะ (server-status Open)',
        desc: 'Server status monitoring dashboard is openly accessible without authentication.',
        simple: 'หน้าสรุปการทำงานของเซิร์ฟเวอร์ไม่ได้ตั้งรหัสผ่าน ใครก็ดูได้ว่ามีใครกำลังเข้าเว็บหน้าไหนบ้าง และมีทราฟฟิกเท่าไร',
        impact: 'เปิดเผยข้อมูลสถิติการใช้งาน และ URL ภายในที่อาจมีข้อมูลลับ',
        fix: 'จำกัดสิทธิ์หน้า server-status ให้เข้าดูได้เฉพาะ IP ของผู้ดูแลระบบ (Allow from 127.0.0.1)',
        cve: 'CWE-200: หน้ารายงานระบบเปิดเผยโดยไม่ล็อกอิน',
        severity: Priority.MEDIUM,
        cvss: 5.0,
      }
    ];

    for (const probe of sensitiveProbes) {
      try {
        const probeUrl = new URL(probe.path, baseUrl).toString();
        const probeRes = await fetch(probeUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(2500),
          headers: { 'User-Agent': 'CyberTrace-SOC-ThreatScanner/3.0' }
        });

        if (probeRes.status === 200) {
          const text = await probeRes.text();
          if (probe.signature.test(text.substring(0, 500))) {
            findings.push({
              id: this.generateId('LEAK'),
              category: 'sensitive_file',
              title: probe.title,
              description: probe.desc,
              simpleExplanation: probe.simple,
              riskImpact: probe.impact,
              howToFixEasy: probe.fix,
              severity: probe.severity,
              cvssScore: probe.cvss,
              target: probeUrl,
              evidence: `พบไฟล์ที่ URL: ${probeUrl} (ตอบกลับสถานะ HTTP 200 และเนื้อหาตรงกับข้อมูลสำคัญ)`,
              remediation: 'Configure web server (Nginx/Apache/Vercel) to forbid direct access to hidden files and directories.',
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
