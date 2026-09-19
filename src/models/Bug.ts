// ===== Bug Class =====
// OOP Concepts:
// - Inheritance: extends Issue (สืบทอดคุณสมบัติจาก Issue)
// - Polymorphism: override methods getDetails(), getTypeLabel(), getSeverityScore()
// - Encapsulation: เพิ่ม private fields เฉพาะของ Bug

import { Issue } from './Issue';
import { Priority, Status, IssueType } from './enums';

export class Bug extends Issue {
  // Encapsulation: fields เฉพาะของ Bug
  private _stepsToReproduce: string;
  private _expectedBehavior: string;
  private _actualBehavior: string;
  private _environment: string;

  constructor(
    title: string,
    description: string,
    priority: Priority,
    reporter: string,
    projectId: string,
    stepsToReproduce: string = '',
    expectedBehavior: string = '',
    actualBehavior: string = '',
    environment: string = '',
    assignee: string = '',
    id?: string
  ) {
    // Inheritance: เรียก constructor ของ parent class
    super(title, description, priority, IssueType.BUG, reporter, projectId, assignee, id);
    this._stepsToReproduce = stepsToReproduce;
    this._expectedBehavior = expectedBehavior;
    this._actualBehavior = actualBehavior;
    this._environment = environment;
  }

  // Getters เฉพาะของ Bug
  get stepsToReproduce(): string { return this._stepsToReproduce; }
  get expectedBehavior(): string { return this._expectedBehavior; }
  get actualBehavior(): string { return this._actualBehavior; }
  get environment(): string { return this._environment; }

  // Setters
  set stepsToReproduce(value: string) {
    this._stepsToReproduce = value;
    this._updatedAt = new Date();
  }

  set expectedBehavior(value: string) {
    this._expectedBehavior = value;
    this._updatedAt = new Date();
  }

  set actualBehavior(value: string) {
    this._actualBehavior = value;
    this._updatedAt = new Date();
  }

  set environment(value: string) {
    this._environment = value;
    this._updatedAt = new Date();
  }

  // Polymorphism: override getDetails()
  override getDetails(): string {
    return `🐛 [Bug] ${this._title} - ${this._status} (${this._priority}) | Env: ${this._environment || 'N/A'}`;
  }

  // Polymorphism: override getTypeLabel()
  override getTypeLabel(): string {
    return '🐛 Bug';
  }

  // Polymorphism: override getSeverityScore() - Bug มี severity สูงกว่าปกติ
  override getSeverityScore(): number {
    const baseScore = super.getSeverityScore();
    // Bug จะมี severity เพิ่มขึ้น 1.5 เท่า
    return Math.round(baseScore * 1.5);
  }

  // Override toJSON เพื่อรวมข้อมูลเฉพาะของ Bug
  override toJSON(): Record<string, string> {
    return {
      ...super.toJSON(),
      stepsToReproduce: this._stepsToReproduce,
      expectedBehavior: this._expectedBehavior,
      actualBehavior: this._actualBehavior,
      environment: this._environment,
    };
  }

  static override fromJSON(data: Record<string, string>): Bug {
    const bug = new Bug(
      data.title,
      data.description,
      data.priority as Priority,
      data.reporter,
      data.projectId,
      data.stepsToReproduce || '',
      data.expectedBehavior || '',
      data.actualBehavior || '',
      data.environment || '',
      data.assignee,
      data.id
    );
    bug._status = data.status as Status;
    bug._createdAt = new Date(data.createdAt);
    bug._updatedAt = new Date(data.updatedAt);
    bug._tags = data.tags ? data.tags.split(',').filter(Boolean) : [];
    return bug;
  }
}
