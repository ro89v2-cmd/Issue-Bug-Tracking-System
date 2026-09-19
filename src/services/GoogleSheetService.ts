// ===== Google Sheets Service =====
// OOP Concept: Encapsulation & Singleton Pattern
// - มี fallback เป็น In-Memory mock database ถ้ายังไม่ได้ใส่ credentials ของ Google Sheets

import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export class GoogleSheetService {
  private static _instance: GoogleSheetService | null = null;
  private _doc: GoogleSpreadsheet | null = null;
  private _initialized: boolean = false;
  private _useMock: boolean = false;

  // Mock in-memory storage for development without real Google Sheets credentials
  private _mockDb: Record<string, Record<string, string>[]> = {
    Issues: [
      {
        id: 'mock-1',
        title: 'ปุ่มบันทึกไม่ตอบสนองบนหน้า Login',
        description: 'เมื่อกดปุ่ม Submit ไม่มีการเรียก API หรือแสดง error',
        status: 'Open',
        priority: 'High',
        type: 'Bug',
        assignee: 'สมชาย',
        reporter: 'สมศักดิ์',
        projectId: 'proj-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: 'frontend,auth',
        stepsToReproduce: '1. ไปหน้า Login\n2. กรอก username/password\n3. กด Enter หรือกดปุ่ม Login',
        expectedBehavior: 'ควรจะเข้าสู่ระบบสำเร็จและ redirect ไปหน้าหลัก',
        actualBehavior: 'ไม่มีอะไรเกิดขึ้น',
        environment: 'Chrome 122 on Windows 11',
      },
      {
        id: 'mock-2',
        title: 'เพิ่มระบบ Export รายงานเป็น Excel/CSV',
        description: 'ผู้ใช้ต้องการดาวน์โหลดรายการบั๊กออกไปทำสรุปรายสัปดาห์',
        status: 'In Progress',
        priority: 'Medium',
        type: 'Feature',
        assignee: 'สมหญิง',
        reporter: 'หัวหน้าทีม',
        projectId: 'proj-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: 'export,reporting',
        useCase: 'Admin/Manager ต้องการสรุปจำนวนบั๊กประจำเดือน',
        acceptanceCriteria: '1. มีปุ่ม Export\n2. โหลดไฟล์นามสกุล .csv ได้ถูกต้อง',
        estimatedEffort: 'Medium',
      },
    ],
    Projects: [
      {
        id: 'proj-1',
        name: 'ระบบจัดการสต็อกสินค้า (E-Commerce)',
        description: 'ระบบหลังบ้านและคลังสินค้า',
        owner: 'สมศักดิ์',
        createdAt: new Date().toISOString(),
      }
    ],
    Users: [
      {
        id: 'user-1',
        name: 'สมชาย นักพัฒนา',
        email: 'somchai@company.com',
        role: 'Developer',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-2',
        name: 'สมหญิง นักทดสอบ',
        email: 'somying@company.com',
        role: 'Tester',
        createdAt: new Date().toISOString(),
      }
    ]
  };

  private constructor() {}

  static getInstance(): GoogleSheetService {
    if (!GoogleSheetService._instance) {
      GoogleSheetService._instance = new GoogleSheetService();
    }
    return GoogleSheetService._instance;
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // ถ้าไม่มี credentials ให้สลับมาใช้ In-Memory Storage อัตโนมัติ (รันโปรเจคได้ทันที)
    if (!email || !key || !sheetId || email.includes('your-service-account')) {
      console.warn('⚠️ Google Sheets credentials not configured. Using in-memory fallback storage.');
      this._useMock = true;
      this._initialized = true;
      return;
    }

    try {
      const serviceAccountAuth = new JWT({
        email: email,
        key: key.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this._doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      await this._doc.loadInfo();
      this._initialized = true;
      console.log(`Connected to Google Sheet: ${this._doc.title}`);
    } catch (error) {
      console.error('Failed to connect to Google Sheets, fallback to mock:', error);
      this._useMock = true;
      this._initialized = true;
    }
  }

  async getSheet(sheetName: string): Promise<GoogleSpreadsheetWorksheet | null> {
    await this.initialize();
    if (this._useMock || !this._doc) return null;

    let sheet = this._doc.sheetsByTitle[sheetName];
    if (!sheet) {
      sheet = await this._doc.addSheet({ title: sheetName });
    }
    return sheet;
  }

  async getAllRows(sheetName: string): Promise<Record<string, string>[]> {
    await this.initialize();
    if (this._useMock || !this._doc) {
      return [...(this._mockDb[sheetName] || [])];
    }

    const sheet = await this.getSheet(sheetName);
    if (!sheet) return [];
    const rows = await sheet.getRows();
    return rows.map(row => {
      const obj: Record<string, string> = {};
      const headers = sheet.headerValues;
      headers.forEach(header => {
        obj[header] = row.get(header) || '';
      });
      return obj;
    });
  }

  async addRow(sheetName: string, data: Record<string, string>): Promise<void> {
    await this.initialize();
    if (this._useMock || !this._doc) {
      if (!this._mockDb[sheetName]) this._mockDb[sheetName] = [];
      this._mockDb[sheetName].unshift(data);
      return;
    }

    const sheet = await this.getSheet(sheetName);
    if (!sheet) return;

    if (sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(Object.keys(data));
    }
    await sheet.addRow(data);
  }

  async updateRow(sheetName: string, id: string, data: Record<string, string>): Promise<boolean> {
    await this.initialize();
    if (this._useMock || !this._doc) {
      const list = this._mockDb[sheetName] || [];
      const index = list.findIndex(item => item.id === id);
      if (index === -1) return false;
      list[index] = { ...list[index], ...data };
      return true;
    }

    const sheet = await this.getSheet(sheetName);
    if (!sheet) return false;
    const rows = await sheet.getRows();
    const targetRow = rows.find(row => row.get('id') === id);
    if (!targetRow) return false;

    Object.entries(data).forEach(([key, value]) => {
      targetRow.set(key, value);
    });
    await targetRow.save();
    return true;
  }

  async deleteRow(sheetName: string, id: string): Promise<boolean> {
    await this.initialize();
    if (this._useMock || !this._doc) {
      const list = this._mockDb[sheetName] || [];
      const beforeLen = list.length;
      this._mockDb[sheetName] = list.filter(item => item.id !== id);
      return this._mockDb[sheetName].length < beforeLen;
    }

    const sheet = await this.getSheet(sheetName);
    if (!sheet) return false;
    const rows = await sheet.getRows();
    const targetRow = rows.find(row => row.get('id') === id);
    if (!targetRow) return false;

    await targetRow.delete();
    return true;
  }

  async findById(sheetName: string, id: string): Promise<Record<string, string> | null> {
    await this.initialize();
    if (this._useMock || !this._doc) {
      const list = this._mockDb[sheetName] || [];
      return list.find(item => item.id === id) || null;
    }

    const sheet = await this.getSheet(sheetName);
    if (!sheet) return null;
    const rows = await sheet.getRows();
    const targetRow = rows.find(row => row.get('id') === id);
    if (!targetRow) return null;

    const obj: Record<string, string> = {};
    sheet.headerValues.forEach(header => {
      obj[header] = targetRow.get(header) || '';
    });
    return obj;
  }
}
