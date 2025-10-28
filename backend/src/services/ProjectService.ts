import { ProjectRepository, Project } from '../repositories/ProjectRepository';
import { CodeGenerationService, CodeGenerationRequest, GeneratedFile } from './CodeGenerationService';

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
  description?: string | undefined;
}

export interface CompileProjectResponse {
  success: boolean;
  message: string;
  outputPath?: string | undefined;
  logs?: string[] | undefined;
  generatedCode?: string | undefined;
  files?: GeneratedFile[] | undefined;
}

export class ProjectService {
  private projectRepo: ProjectRepository;
  private codeGenerationService: CodeGenerationService;

  constructor(projectRepo: ProjectRepository, codeGenerationService: CodeGenerationService) {
    this.projectRepo = projectRepo;
    this.codeGenerationService = codeGenerationService;
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

      // Prepare code generation request
      const codeGenRequest: CodeGenerationRequest = {
        projectId: project.id,
        appType: project.type,
        frontendStack: project.frontend_stack,
        cssFramework: project.css_framework,
        colorTheme: project.color_theme,
        mainFont: project.main_font,
        layoutStyle: project.layout_style,
        enableAuth: project.enable_auth,
        enableDatabase: project.enable_database,
        enablePayments: project.enable_payments,
        customPrompt: request.description || undefined
      };

      // Generate real code using Gemini AI
      const codeGenResult = await this.codeGenerationService.generateCode(codeGenRequest);

      if (!codeGenResult.success) {
        await this.projectRepo.update(request.projectId, { status: 'error' });
        return {
          success: false,
          message: codeGenResult.message,
          logs: codeGenResult.logs || undefined
        };
      }

      // Update project status to compiled
      await this.projectRepo.update(request.projectId, { 
        status: 'compiled',
        output_path: `/generated/${project.id}`
      });

      return {
        success: true,
        message: 'Projeto compilado com sucesso!',
        outputPath: `/generated/${project.id}`,
        logs: codeGenResult.logs || undefined,
        generatedCode: codeGenResult.generatedCode || undefined,
        files: codeGenResult.files || undefined
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