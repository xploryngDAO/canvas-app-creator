import { apiService, ApiResponse } from './api';

export interface Project {
  id: string;
  name: string;
  appType: string;
  frontendStack: string;
  cssFramework: string;
  colorTheme: string;
  mainFont: string;
  layoutStyle: string;
  enableAuth: boolean;
  enableDatabase: boolean;
  enablePayments: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft';
  outputPath?: string;
}

export interface CreateProjectRequest {
  name: string;
  appType: string;
  frontendStack: string;
  cssFramework: string;
  colorTheme: string;
  mainFont: string;
  layoutStyle: string;
  enableAuth: boolean;
  enableDatabase: boolean;
  enablePayments: boolean;
}

export interface CompileProjectRequest {
  projectId: string;
}

export interface CompileProjectResponse {
  success: boolean;
  outputPath?: string;
  logs?: string[];
}

class ProjectService {
  // Get all projects
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    return apiService.get<Project[]>('/projects');
  }

  // Get project by ID
  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    return apiService.get<Project>(`/projects/${id}`);
  }

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return apiService.post<Project>('/projects', projectData);
  }

  // Update project
  async updateProject(id: string, projectData: Partial<CreateProjectRequest>): Promise<ApiResponse<Project>> {
    return apiService.put<Project>(`/projects/${id}`, projectData);
  }

  // Delete project
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/projects/${id}`);
  }

  // Compile project
  async compileProject(projectId: string): Promise<ApiResponse<CompileProjectResponse>> {
    return apiService.post<CompileProjectResponse>('/projects/compile', { projectId });
  }
}

export const projectService = new ProjectService();