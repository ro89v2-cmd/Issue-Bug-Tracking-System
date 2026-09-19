// ===== Project Service =====
import { GoogleSheetService } from './GoogleSheetService';
import { Project } from '@/models/Project';

const SHEET_NAME = 'Projects';

export class ProjectService {
  private _sheetService: GoogleSheetService;

  constructor() {
    this._sheetService = GoogleSheetService.getInstance();
  }

  async createProject(name: string, description: string, owner: string): Promise<Project> {
    const project = new Project(name, description, owner);
    await this._sheetService.addRow(SHEET_NAME, project.toJSON() as unknown as Record<string, string>);
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    const rows = await this._sheetService.getAllRows(SHEET_NAME);
    return rows.map(row => Project.fromJSON(row));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const data = await this._sheetService.findById(SHEET_NAME, id);
    if (!data) return null;
    return Project.fromJSON(data);
  }

  async updateProject(id: string, updates: Record<string, string>): Promise<boolean> {
    return this._sheetService.updateRow(SHEET_NAME, id, updates);
  }

  async deleteProject(id: string): Promise<boolean> {
    return this._sheetService.deleteRow(SHEET_NAME, id);
  }
}
