// ===== Issue Service =====
// OOP Concept: Encapsulation + Polymorphism
// - จัดการ CRUD operations สำหรับ Issues ทั้งหมด
// - ใช้ Polymorphism ผ่าน IssueFactory

import { GoogleSheetService } from './GoogleSheetService';
import { Issue } from '@/models/Issue';
import { Bug } from '@/models/Bug';
import { Feature } from '@/models/Feature';
import { Threat } from '@/models/Threat';
import { IssueFactory } from '@/models/IssueFactory';
import { IssueType, Priority, Status } from '@/models/enums';

const SHEET_NAME = 'Issues';

export class IssueService {
  private _sheetService: GoogleSheetService;

  constructor() {
    this._sheetService = GoogleSheetService.getInstance();
  }

  async createIssue(data: {
    title: string;
    description: string;
    type: IssueType;
    priority: Priority;
    reporter: string;
    projectId: string;
    assignee?: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    environment?: string;
    useCase?: string;
    acceptanceCriteria?: string;
    estimatedEffort?: string;
    threatType?: string;
    cvssScore?: number;
    affectedTarget?: string;
    remediation?: string;
  }): Promise<Issue> {
    let issue: Issue;

    switch (data.type) {
      case IssueType.BUG:
        issue = new Bug(
          data.title,
          data.description,
          data.priority,
          data.reporter,
          data.projectId,
          data.stepsToReproduce || '',
          data.expectedBehavior || '',
          data.actualBehavior || '',
          data.environment || '',
          data.assignee || ''
        );
        break;
      case IssueType.FEATURE:
        issue = new Feature(
          data.title,
          data.description,
          data.priority,
          data.reporter,
          data.projectId,
          data.useCase || '',
          data.acceptanceCriteria || '',
          data.estimatedEffort || 'Medium',
          data.assignee || ''
        );
        break;
      case IssueType.THREAT:
        issue = new Threat(
          data.title,
          data.description,
          data.priority,
          data.reporter,
          data.projectId,
          data.threatType || 'Security Vulnerability',
          data.cvssScore !== undefined ? data.cvssScore : 5.0,
          data.affectedTarget || '',
          data.remediation || '',
          data.assignee || ''
        );
        break;
      default:
        issue = new Issue(
          data.title,
          data.description,
          data.priority,
          IssueType.TASK,
          data.reporter,
          data.projectId,
          data.assignee || ''
        );
    }

    await this._sheetService.addRow(SHEET_NAME, issue.toJSON());
    return issue;
  }

  async getAllIssues(): Promise<Issue[]> {
    const rows = await this._sheetService.getAllRows(SHEET_NAME);
    return rows.map(row => IssueFactory.createFromJSON(row));
  }

  async getIssueById(id: string): Promise<Issue | null> {
    const data = await this._sheetService.findById(SHEET_NAME, id);
    if (!data) return null;
    return IssueFactory.createFromJSON(data);
  }

  async updateIssue(id: string, updates: Record<string, string>): Promise<boolean> {
    const existing = await this._sheetService.findById(SHEET_NAME, id);
    if (!existing) return false;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this._sheetService.updateRow(SHEET_NAME, id, merged);
  }

  async deleteIssue(id: string): Promise<boolean> {
    return this._sheetService.deleteRow(SHEET_NAME, id);
  }

  async getIssuesByProject(projectId: string): Promise<Issue[]> {
    const allIssues = await this.getAllIssues();
    return allIssues.filter(issue => issue.projectId === projectId);
  }

  async getIssuesByStatus(status: Status): Promise<Issue[]> {
    const allIssues = await this.getAllIssues();
    return allIssues.filter(issue => issue.status === status);
  }

  async getIssuesByPriority(priority: Priority): Promise<Issue[]> {
    const allIssues = await this.getAllIssues();
    return allIssues.filter(issue => issue.priority === priority);
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const issues = await this.getAllIssues();
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};

    issues.forEach(issue => {
      byStatus[issue.status] = (byStatus[issue.status] || 0) + 1;
      byPriority[issue.priority] = (byPriority[issue.priority] || 0) + 1;
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });

    return { total: issues.length, byStatus, byPriority, byType };
  }
}
