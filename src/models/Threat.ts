// ===== Threat Class =====
// OOP Concepts:
// - Inheritance: extends Issue (สืบทอดคุณสมบัติจาก Issue)
// - Polymorphism: override methods getDetails(), getTypeLabel(), getSeverityScore()
// - Encapsulation: เพิ่ม private fields เฉพาะของ Threat / Cybersecurity Vulnerability

import { Issue } from './Issue';
import { Priority, Status, IssueType } from './enums';

export class Threat extends Issue {
  // Encapsulation: fields เฉพาะของ Threat
  private _threatType: string;
  private _cvssScore: number;
  private _affectedTarget: string;
  private _remediation: string;

  constructor(
    title: string,
    description: string,
    priority: Priority,
    reporter: string,
    projectId: string,
    threatType: string = 'Security Vulnerability',
    cvssScore: number = 5.0,
    affectedTarget: string = '',
    remediation: string = '',
    assignee: string = '',
    id?: string
  ) {
    // Inheritance: เรียก constructor ของ parent class ด้วย IssueType.THREAT
    super(title, description, priority, IssueType.THREAT, reporter, projectId, assignee, id);
    this._threatType = threatType;
    this._cvssScore = Math.min(10.0, Math.max(0.0, cvssScore));
    this._affectedTarget = affectedTarget;
    this._remediation = remediation;
  }

  // Getters เฉพาะของ Threat
  get threatType(): string { return this._threatType; }
  get cvssScore(): number { return this._cvssScore; }
  get affectedTarget(): string { return this._affectedTarget; }
  get remediation(): string { return this._remediation; }

  // Setters พร้อม Data Validation
  set threatType(value: string) {
    this._threatType = value;
    this._updatedAt = new Date();
  }

  set cvssScore(value: number) {
    this._cvssScore = Math.min(10.0, Math.max(0.0, Number(value) || 0));
    this._updatedAt = new Date();
  }

  set affectedTarget(value: string) {
    this._affectedTarget = value;
    this._updatedAt = new Date();
  }

  set remediation(value: string) {
    this._remediation = value;
    this._updatedAt = new Date();
  }

  // Polymorphism: override getDetails()
  override getDetails(): string {
    return `🚨 [Threat] ${this._title} - ${this._status} (CVSS: ${this._cvssScore.toFixed(1)}, ${this._priority}) | Target: ${this._affectedTarget || 'N/A'}`;
  }

  // Polymorphism: override getTypeLabel()
  override getTypeLabel(): string {
    return '🚨 Threat';
  }

  // Polymorphism: override getSeverityScore() - Threat จะมี weight ความรุนแรงสูงสุดในระบบ
  override getSeverityScore(): number {
    const baseScore = super.getSeverityScore();
    // Threat มีตัวคูณ 2 เท่า และบวกคะแนนตาม CVSS Score
    const cvssBonus = Math.round(this._cvssScore / 3);
    return (baseScore * 2) + cvssBonus;
  }

  // Override toJSON เพื่อบันทึกฟิลด์เฉพาะของ Threat
  override toJSON(): Record<string, string> {
    return {
      ...super.toJSON(),
      threatType: this._threatType,
      cvssScore: this._cvssScore.toString(),
      affectedTarget: this._affectedTarget,
      remediation: this._remediation,
    };
  }

  static override fromJSON(data: Record<string, string>): Threat {
    const threat = new Threat(
      data.title,
      data.description,
      data.priority as Priority,
      data.reporter,
      data.projectId,
      data.threatType || 'Security Vulnerability',
      parseFloat(data.cvssScore) || 5.0,
      data.affectedTarget || '',
      data.remediation || '',
      data.assignee,
      data.id
    );
    threat._status = data.status as Status;
    threat._createdAt = new Date(data.createdAt);
    threat._updatedAt = new Date(data.updatedAt);
    threat._tags = data.tags ? data.tags.split(',').filter(Boolean) : [];
    return threat;
  }
}
