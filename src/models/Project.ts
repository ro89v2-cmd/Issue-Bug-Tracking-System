// ===== Project Class =====
// OOP Concept: Encapsulation

import { v4 as uuidv4 } from 'uuid';

export class Project {
  private _id: string;
  private _name: string;
  private _description: string;
  private _owner: string;
  private _createdAt: Date;

  constructor(name: string, description: string, owner: string, id?: string) {
    this._id = id || uuidv4();
    this._name = name;
    this._description = description;
    this._owner = owner;
    this._createdAt = new Date();
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get owner(): string { return this._owner; }
  get createdAt(): Date { return this._createdAt; }

  set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
    this._name = value.trim();
  }

  set description(value: string) {
    this._description = value;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      owner: this._owner,
      createdAt: this._createdAt.toISOString(),
    };
  }

  static fromJSON(data: Record<string, string>): Project {
    const project = new Project(data.name, data.description, data.owner, data.id);
    project._createdAt = new Date(data.createdAt);
    return project;
  }

  toString(): string {
    return `${this._name} - ${this._description}`;
  }
}
