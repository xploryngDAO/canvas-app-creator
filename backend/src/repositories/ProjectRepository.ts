import { Database, saveDatabase } from '../database/init';

export interface Project {
  id: string;
  name: string;
  type: string;
  frontend_stack: string;
  css_framework: string;
  color_theme: string;
  main_font: string;
  layout_style: string;
  enable_auth: boolean;
  enable_database: boolean;
  enable_payments: boolean;
  status: string;
  output_path: string;
  created_at: string;
  updated_at: string;
}

export class ProjectRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getAll(): Project[] {
    return this.db.projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getById(id: string): Project | null {
    const project = this.db.projects.find(p => p.id === id);
    return project || null;
  }

  create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const project: Project = {
      id,
      ...data,
      created_at: now,
      updated_at: now
    };
    
    this.db.projects.push(project);
    saveDatabase();
    
    return project;
  }

  update(id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>): boolean {
    const now = new Date().toISOString();
    const projectIndex = this.db.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return false;
    }
    
    this.db.projects[projectIndex] = {
      ...this.db.projects[projectIndex],
      ...data,
      updated_at: now
    };
    
    saveDatabase();
    return true;
  }

  delete(id: string): boolean {
    const projectIndex = this.db.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return false;
    }
    
    this.db.projects.splice(projectIndex, 1);
    saveDatabase();
    
    return true;
  }

  updateOutputPath(id: string, outputPath: string): boolean {
    const now = new Date().toISOString();
    const projectIndex = this.db.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return false;
    }
    
    this.db.projects[projectIndex].output_path = outputPath;
    this.db.projects[projectIndex].updated_at = now;
    
    saveDatabase();
    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}