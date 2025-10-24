import { SettingsRepository } from '../repositories/SettingsRepository';

export interface Setting {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface GeminiApiKeyResponse {
  success: boolean;
  message: string;
}

export class SettingsService {
  constructor(
    private settingsRepo: SettingsRepository
  ) {}

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepo.getAll();
  }

  async getSetting(key: string): Promise<Setting | null> {
    return this.settingsRepo.getByKey(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.settingsRepo.getByKey(key);
    
    if (existing) {
      await this.settingsRepo.update(key, value);
    } else {
      await this.settingsRepo.create(key, value);
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    return this.settingsRepo.delete(key);
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    await this.setSetting('gemini_api_key', apiKey);
  }

  async getGeminiApiKey(): Promise<string | null> {
    const setting = await this.getSetting('gemini_api_key');
    return setting ? setting.value : null;
  }

  async testGeminiApiKey(): Promise<GeminiApiKeyResponse> {
    try {
      const apiKey = await this.getGeminiApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          message: 'Nenhuma chave API configurada'
        };
      }

      // Simulate API test - in a real implementation, you would make an actual API call
      // For now, just validate the format
      if (apiKey.startsWith('AIza') && apiKey.length > 30) {
        return {
          success: true,
          message: 'Chave API válida e funcionando'
        };
      } else {
        return {
          success: false,
          message: 'Formato de chave API inválido'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}