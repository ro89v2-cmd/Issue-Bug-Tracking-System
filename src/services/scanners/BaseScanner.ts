// ===== Base Scanner Abstract Class =====
// OOP Concepts:
// - Abstraction: Abstract class defining scan interface
// - Encapsulation: Protected metadata fields & helper methods
// - Polymorphism: Derived scanners override executeScan()

import { Priority } from '@/models/enums';
import { ScanFinding } from './types';

export abstract class BaseScanner {
  protected _scannerName: string;
  protected _version: string;

  constructor(scannerName: string, version: string = '1.0.0') {
    this._scannerName = scannerName;
    this._version = version;
  }

  get scannerName(): string {
    return this._scannerName;
  }

  get version(): string {
    return this._version;
  }

  // Polymorphic abstract method
  abstract scan(target: string): Promise<ScanFinding[]>;

  // Protected helper to generate unique finding ID
  protected generateId(prefix: string = 'VULN'): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
  }

  // Protected helper to map CVSS score to Priority
  protected cvssToPriority(score: number): Priority {
    if (score >= 9.0) return Priority.CRITICAL;
    if (score >= 7.0) return Priority.HIGH;
    if (score >= 4.0) return Priority.MEDIUM;
    return Priority.LOW;
  }
}
