# 🐞 Issue & Bug Tracking System (OOP Project)

โปรเจคระบบติดตามบั๊กและงานพัฒนา (Issue & Bug Tracking System) พัฒนาด้วย **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** และเชื่อมต่อ **Google Sheets** เป็นฐานข้อมูล โดยออกแบบโครงสร้างโค้ดตามหลักการ **Object-Oriented Programming (OOP)** ครบถ้วน

---

## 🏛️ โครงสร้างหลักการ OOP ในโปรเจคนี้

### 1. Encapsulation (การห่อหุ้มข้อมูล)
- ดูตัวอย่างใน [`src/models/User.ts`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/User.ts) และ [`src/models/Issue.ts`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/Issue.ts)
- กำหนด fields เป็น `private` หรือ `protected` เช่น `_id`, `_title`, `_status`
- การเข้าถึงหรือแก้ไขข้อมูลต้องผ่าน **Getter** และ **Setter** เท่านั้น พร้อมทั้งมี Data Validation ป้องกันข้อมูลผิดพลาด เช่น ตรวจสอบความถูกต้องของ Email, รูปแบบชื่อ, และสิทธิ์การใช้งาน

### 2. Inheritance (การสืบทอดคุณสมบัติ)
- Base Class: [`Issue`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/Issue.ts)
- Subclasses:
  - [`Bug`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/Bug.ts) extends `Issue` เพิ่มฟิลด์: `stepsToReproduce`, `expectedBehavior`, `actualBehavior`, `environment`
  - [`Feature`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/Feature.ts) extends `Issue` เพิ่มฟิลด์: `useCase`, `acceptanceCriteria`, `estimatedEffort`
  - [`Threat`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/Threat.ts) extends `Issue` เพิ่มฟิลด์: `threatType`, `cvssScore`, `affectedTarget`, `remediation`
- Scanner Engine Hierarchy:
  - Base Class: `BaseScanner`
  - Derived Scanners: `WebSecurityScanner`, `CodeVulnerabilityScanner`

### 3. Polymorphism (การพ้องรูป)
- Method Overriding:
  - `getDetails()`: Subclass แต่ละคลาสแสดงผลรายละเอียดแตกต่างกัน
  - `getTypeLabel()`: คืนค่า emoji และป้ายประเภทตาม subclass (🐛 Bug, ✨ Feature, 🚨 Threat)
  - `getSeverityScore()`: คำนวณคะแนนความรุนแรง โดย `Threat` และ `Bug` จะมีตัวคูณความรุนแรงตาม CVSS สูงกว่า `Feature`
  - `scan()`: Subclass Scanner แต่ละตัวแยกวิธีสแกน (Network HTTP vs Code AST/Regex)

### 4. Design Patterns ที่ใช้
- **Factory Pattern**: [`IssueFactory`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/models/IssueFactory.ts) สำหรับสร้าง Instance ของ `Bug`, `Feature`, `Threat` หรือ `Issue` ตามประเภท
- **Singleton Pattern**: [`GoogleSheetService`](file:///C:/Users/mlapp/OneDrive/Desktop/Issue%20Bug%20Tracing%20System/issue-bug-tracking/src/services/GoogleSheetService.ts) และ `ThreatScannerService`
- **Facade Pattern**: `ThreatScannerService` ประสานงานระหว่าง Web Scanner, Code Scanner และ IssueService สำหรับ Auto-Incident Generation

---

## 🚀 วิธีการรันโปรเจค

1. เข้าไปที่โฟลเดอร์โปรเจค:
   ```bash
   cd issue-bug-tracking
   ```

2. รันแอปพลิเคชันในโหมดพัฒนา:
   ```bash
   npm run dev
   ```

3. เปิดเบราว์เซอร์ไปที่:
   ```
   http://localhost:3000
   ```

---

## 📊 การเชื่อมต่อ Google Sheets (Database)

โปรเจคมีระบบ **In-Memory Fallback** อยู่ในตัว สามารถเปิดใช้งานและทดสอบฟังก์ชันทั้งหมดได้ทันทีโดยไม่ต้องเชื่อม Google Sheets ก็ได้

หากต้องการเชื่อมต่อกับ Google Sheet จริง:
1. สร้าง Google Sheet และคัดลอก **Sheet ID** จาก URL
2. ไปที่ [Google Cloud Console](https://console.cloud.google.com) สร้าง **Service Account** และดาวน์โหลด Service Account Key (JSON)
3. กด **Share** Google Sheet ให้กับอีเมล Service Account (สิทธิ์ Editor)
4. สร้างไฟล์ `.env.local` ในโฟลเดอร์ `issue-bug-tracking/` ตามตัวอย่างใน `.env.local.example`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@xxx.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your_sheet_id_here
   ```
