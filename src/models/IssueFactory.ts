// ===== Issue Factory =====
// OOP Concept: Polymorphism + Factory Pattern
// ใช้ Factory เพื่อสร้าง Issue ที่ถูกต้องตาม type

import { Issue } from './Issue';
import { Bug } from './Bug';
import { Feature } from './Feature';
import { Threat } from './Threat';
import { IssueType } from './enums';

export class IssueFactory {
  // Polymorphism: สร้าง object ที่แตกต่างกันตาม type
  // แต่ return เป็น Issue type เดียวกัน
  static createFromJSON(data: Record<string, string>): Issue {
    switch (data.type) {
      case IssueType.BUG:
        return Bug.fromJSON(data);
      case IssueType.FEATURE:
        return Feature.fromJSON(data);
      case IssueType.THREAT:
        return Threat.fromJSON(data);
      default:
        return Issue.fromJSON(data);
    }
  }
}
