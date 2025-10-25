import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CodeGenerationService } from '../services/CodeGenerationService';
import { SettingsService } from '../services/SettingsService';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { initializeDatabase } from '../database/init';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    const db = initializeDatabase();
    const projectRepo = new ProjectRepository(db);
    const settingsRepo = new SettingsRepository(db);
    const settingsService = new SettingsService(settingsRepo);
    const codeGenerationService = new CodeGenerationService(settingsService);
    this.projectService = new ProjectService(projectRepo, codeGenerationService);
  }

  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.projectService.getAllProjects();
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }
      const project = await this.projectService.getProjectById(id);
      
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const projectData = req.body;
      
      // Validate required fields
      if (!projectData.name?.trim()) {
        res.status(400).json({
          success: false,
          error: 'Project name is required'
        });
        return;
      }

      if (!projectData.appType?.trim()) {
        res.status(400).json({
          success: false,
          error: 'Project type is required'
        });
        return;
      }

      const project = await this.projectService.createProject(projectData);
      
      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }
      const projectData = req.body;
      
      const success = await this.projectService.updateProject(id, projectData);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Project updated successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }
      const deleted = await this.projectService.deleteProject(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async compileProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, description } = req.body;
      
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const result = await this.projectService.compileProject({
        projectId,
        description
      });
      
      res.json({
        success: result.success,
        data: result,
        message: result.message
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }
}