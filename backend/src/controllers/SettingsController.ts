import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { initializeDatabase } from '../database/init';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    const db = initializeDatabase();
    const settingsRepo = new SettingsRepository(db);
    this.settingsService = new SettingsService(settingsRepo);
  }

  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.getAllSettings();
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Setting key is required'
        });
        return;
      }
      const setting = await this.settingsService.getSetting(key);
      
      if (!setting) {
        res.status(404).json({
          success: false,
          error: 'Setting not found'
        });
        return;
      }

      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async setSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Setting key is required'
        });
        return;
      }
      const { value } = req.body;
      
      if (!value && value !== '') {
        res.status(400).json({
          success: false,
          error: 'Setting value is required'
        });
        return;
      }

      await this.settingsService.setSetting(key, value);
      
      res.json({
        success: true,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Setting key is required'
        });
        return;
      }
      const deleted = await this.settingsService.deleteSetting(key);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Setting not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async setGeminiApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey?.trim()) {
        res.status(400).json({
          success: false,
          error: 'API key is required'
        });
        return;
      }

      await this.settingsService.setGeminiApiKey(apiKey);
      
      res.json({
        success: true,
        message: 'Gemini API key updated successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getGeminiApiKey(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = await this.settingsService.getGeminiApiKey();
      
      res.json({
        success: true,
        data: { 
          hasApiKey: !!apiKey,
          // Don't return the actual key for security
          apiKey: apiKey ? '***' + apiKey.slice(-4) : null
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async testGeminiApiKey(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.settingsService.testGeminiApiKey();
      
      res.json({
        success: result.success,
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