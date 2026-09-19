// ===== Issue Base Class =====
// OOP Concepts:
// - Encapsulation: protected fields + getter/setter
// - Inheritance: เป็น base class ที่ Bug และ Feature จะ extend
// - Polymorphism: methods ที่จะถูก override ใน subclass

import { v4 as uuidv4 } from 'uuid';
import { Priority, Status, IssueType } from './enums';

export class Issue {
  // Encapsulation: protected fields (ให้ subclass เข้าถึงได้)
  protected _id: string;
  protected _title: string;
  protected _description: string;
  protected _status: Status;
  protected _priority: Priority;
  protected _type: IssueType;
  protected _assignee: string;
  protected _reporter: string;
  protected _projectId: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _tags: string[];

  constructor(
    title: string,
    description: string,
    priority: Priority,
    type: IssueType,
    reporter: string,
    projectId: string,
    assignee: string = '',
    id?: string
  ) {
    this._id = id || uuidv4();
    this._title = title;
    this._description = description;
    this._status = Status.OPEN;
    this._priority = priority;
    this._type = type;
    this._assignee = assignee;
    this._reporter = reporter;
    this._projectId = projectId;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._tags = [];
  }

  // === Getters ===
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get status(): Status { return this._status; }
  get priority(): Priority { return this._priority; }
  get type(): IssueType { return this._type; }
  get assignee(): string { return this._assignee; }
  get reporter(): string { return this._reporter; }
  get projectId(): string { return this._projectId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get tags(): string[] { return [...this._tags]; }

  // === Setters with validation ===
  set title(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    this._title = value.trim();
    this._updatedAt = new Date();
  }

  set description(value: string) {
    this._description = value;
    this._updatedAt = new Date();
  }

  set status(value: Status) {
    this._status = value;
    this._updatedAt = new Date();
  }

  set priority(value: Priority) {
    this._priority = value;
    this._updatedAt = new Date();
  }

  set assignee(value: string) {
    this._assignee = value;
    this._updatedAt = new Date();
  }

  // === Methods ===
  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this._tags = this._tags.filter(t => t !== tag);
    this._updatedAt = new Date();
  }

  // Polymorphism: method ที่จะถูก override ใน subclass
  getDetails(): string {
    return `[${this._type}] ${this._title} - ${this._status} (${this._priority})`;
  }

  // Polymorphism: method ที่จะถูก override ใน subclass
  getTypeLabel(): string {
    return 'Issue';
  }

  // Polymorphism: method สำหรับคำนวณ severity score
  getSeverityScore(): number {
    const priorityScores: Record<Priority, number> = {
      [Priority.LOW]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.HIGH]: 3,
      [Priority.CRITICAL]: 4,
    };
    return priorityScores[this._priority];
  }

  toJSON(): Record<string, string> {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      priority: this._priority,
      type: this._type,
      assignee: this._assignee,
      reporter: this._reporter,
      projectId: this._projectId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      tags: this._tags.join(','),
    };
  }

  static fromJSON(data: Record<string, string>): Issue {
    const issue = new Issue(
      data.title,
      data.description,
      data.priority as Priority,
      data.type as IssueType,
      data.reporter,
      data.projectId,
      data.assignee,
      data.id
    );
    issue._status = data.status as Status;
    issue._createdAt = new Date(data.createdAt);
    issue._updatedAt = new Date(data.updatedAt);
    issue._tags = data.tags ? data.tags.split(',').filter(Boolean) : [];
    return issue;
  }

  toString(): string {
    return this.getDetails();
  }
}
