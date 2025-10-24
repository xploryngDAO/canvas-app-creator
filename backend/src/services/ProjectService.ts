import { ProjectRepository, Project } from '../repositories/ProjectRepository';

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
  description?: string;
}

export interface CompileProjectResponse {
  success: boolean;
  message: string;
  outputPath?: string;
  logs?: string[];
}

export class ProjectService {
  private projectRepo: ProjectRepository;

  constructor(projectRepo: ProjectRepository) {
    this.projectRepo = projectRepo;
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepo.getAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepo.getById(id);
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const projectData = {
      name: data.name,
      type: data.appType,
      frontend_stack: data.frontendStack,
      css_framework: data.cssFramework,
      color_theme: data.colorTheme,
      main_font: data.mainFont,
      layout_style: data.layoutStyle,
      enable_auth: data.enableAuth,
      enable_database: data.enableDatabase,
      enable_payments: data.enablePayments,
      status: 'created' as const,
      output_path: ''
    };

    return this.projectRepo.create(projectData);
  }

  async updateProject(id: string, data: Partial<CreateProjectRequest>): Promise<boolean> {
    return this.projectRepo.update(id, data);
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projectRepo.delete(id);
  }

  async compileProject(request: CompileProjectRequest): Promise<CompileProjectResponse> {
    try {
      const project = await this.projectRepo.getById(request.projectId);
      if (!project) {
        return {
          success: false,
          message: 'Projeto não encontrado'
        };
      }

      // Update project status to compiling
      await this.projectRepo.update(request.projectId, { status: 'compiling' });

      // Simulate compilation process
      const logs = [
        '🚀 Iniciando compilação do projeto...',
        `📦 Configurando ${project.type} com ${project.frontend_stack}`,
        `🎨 Aplicando tema ${project.color_theme} com ${project.css_framework}`,
        '✅ Projeto compilado com sucesso!'
      ];

      // Update project status to compiled
      await this.projectRepo.update(request.projectId, { 
        status: 'compiled',
        output_path: `/generated/${project.id}`
      });

      return {
        success: true,
        message: 'Projeto compilado com sucesso!',
        outputPath: `/generated/${project.id}`,
        logs
      };
    } catch (error) {
      // Update project status to error
      await this.projectRepo.update(request.projectId, { status: 'error' });
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido durante a compilação'
      };
    }
  }
}