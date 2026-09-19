// ===== User Service =====
import { GoogleSheetService } from './GoogleSheetService';
import { User } from '@/models/User';

const SHEET_NAME = 'Users';

export class UserService {
  private _sheetService: GoogleSheetService;

  constructor() {
    this._sheetService = GoogleSheetService.getInstance();
  }

  async createUser(name: string, email: string, role: string = 'Developer'): Promise<User> {
    const user = new User(name, email, role);
    await this._sheetService.addRow(SHEET_NAME, user.toJSON() as unknown as Record<string, string>);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const rows = await this._sheetService.getAllRows(SHEET_NAME);
    return rows.map(row => User.fromJSON(row));
  }

  async getUserById(id: string): Promise<User | null> {
    const data = await this._sheetService.findById(SHEET_NAME, id);
    if (!data) return null;
    return User.fromJSON(data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  async updateUser(id: string, updates: Record<string, string>): Promise<boolean> {
    return this._sheetService.updateRow(SHEET_NAME, id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this._sheetService.deleteRow(SHEET_NAME, id);
  }
}
