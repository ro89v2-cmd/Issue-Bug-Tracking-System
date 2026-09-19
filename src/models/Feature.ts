// ===== Feature Class =====
// OOP Concepts:
// - Inheritance: extends Issue
// - Polymorphism: override methods
// - Encapsulation: private fields เฉพาะของ Feature

import { Issue } from './Issue';
import { Priority, Status, IssueType } from './enums';

export class Feature extends Issue {
  // Encapsulation: fields เฉพาะของ Feature
  private _useCase: string;
  private _acceptanceCriteria: string;
  private _estimatedEffort: string;

  constructor(
    title: string,
    description: string,
    priority: Priority,
    reporter: string,
    projectId: string,
    useCase: string = '',
    acceptanceCriteria: string = '',
    estimatedEffort: string = 'Medium',
    assignee: string = '',
    id?: string
  ) {
    super(title, description, priority, IssueType.FEATURE, reporter, projectId, assignee, id);
    this._useCase = useCase;
    this._acceptanceCriteria = acceptanceCriteria;
    this._estimatedEffort = estimatedEffort;
  }

  // Getters
  get useCase(): string { return this._useCase; }
  get acceptanceCriteria(): string { return this._acceptanceCriteria; }
  get estimatedEffort(): string { return this._estimatedEffort; }

  // Setters
  set useCase(value: string) {
    this._useCase = value;
    this._updatedAt = new Date();
  }

  set acceptanceCriteria(value: string) {
    this._acceptanceCriteria = value;
    this._updatedAt = new Date();
  }

  set estimatedEffort(value: string) {
    const validEfforts = ['Low', 'Medium', 'High', 'Very High'];
    if (!validEfforts.includes(value)) {
      throw new Error(`Invalid effort. Must be one of: ${validEfforts.join(', ')}`);
    }
    this._estimatedEffort = value;
    this._updatedAt = new Date();
  }

  // Polymorphism: override getDetails()
  override getDetails(): string {
    return `✨ [Feature] ${this._title} - ${this._status} (${this._priority}) | Effort: ${this._estimatedEffort}`;
  }

  // Polymorphism: override getTypeLabel()
  override getTypeLabel(): string {
    return '✨ Feature Request';
  }

  // Polymorphism: override getSeverityScore() - Feature มี severity ต่ำกว่า Bug
  override getSeverityScore(): number {
    const baseScore = super.getSeverityScore();
    return baseScore; // Feature ใช้ score ปกติ
  }

  override toJSON(): Record<string, string> {
    return {
      ...super.toJSON(),
      useCase: this._useCase,
      acceptanceCriteria: this._acceptanceCriteria,
      estimatedEffort: this._estimatedEffort,
    };
  }

  static override fromJSON(data: Record<string, string>): Feature {
    const feature = new Feature(
      data.title,
      data.description,
      data.priority as Priority,
      data.reporter,
      data.projectId,
      data.useCase || '',
      data.acceptanceCriteria || '',
      data.estimatedEffort || 'Medium',
      data.assignee,
      data.id
    );
    feature._status = data.status as Status;
    feature._createdAt = new Date(data.createdAt);
    feature._updatedAt = new Date(data.updatedAt);
    feature._tags = data.tags ? data.tags.split(',').filter(Boolean) : [];
    return feature;
  }
}
