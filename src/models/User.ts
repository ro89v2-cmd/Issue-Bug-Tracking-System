// ===== User Class =====
// OOP Concept: Encapsulation
// - ใช้ private fields เพื่อซ่อนข้อมูลภายใน
// - ใช้ getter/setter เพื่อควบคุมการเข้าถึงข้อมูล

import { v4 as uuidv4 } from 'uuid';

export class User {
  // Encapsulation: private fields
  private _id: string;
  private _name: string;
  private _email: string;
  private _role: string;
  private _createdAt: Date;

  constructor(name: string, email: string, role: string = 'Developer', id?: string) {
    this._id = id || uuidv4();
    this._name = name;
    this._email = email;
    this._role = role;
    this._createdAt = new Date();
  }

  // Getters - ควบคุมการอ่านข้อมูล
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get role(): string { return this._role; }
  get createdAt(): Date { return this._createdAt; }

  // Setters - ควบคุมการเขียนข้อมูลพร้อม validation
  set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this._name = value.trim();
  }

  set email(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value;
  }

  set role(value: string) {
    const validRoles = ['Admin', 'Developer', 'Tester', 'Manager'];
    if (!validRoles.includes(value)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    this._role = value;
  }

  // Method เพื่อแปลงเป็น plain object สำหรับส่งไป Google Sheets
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      createdAt: this._createdAt.toISOString(),
    };
  }

  // Static method เพื่อสร้าง User จาก plain object
  static fromJSON(data: Record<string, string>): User {
    const user = new User(data.name, data.email, data.role, data.id);
    user._createdAt = new Date(data.createdAt);
    return user;
  }

  toString(): string {
    return `${this._name} (${this._role}) - ${this._email}`;
  }
}
