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
    await this.setSetting('geminiApiKey', apiKey);
  }

  async getGeminiApiKey(): Promise<string | null> {
    const setting = await this.getSetting('geminiApiKey');
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

      return this.testGeminiApiKeyDirect(apiKey);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar API'
      };
    }
  }

  async testGeminiApiKeyDirect(apiKey: string): Promise<GeminiApiKeyResponse> {
    try {
      // Get selected model from settings for testing
      const modelSetting = await this.getSetting('geminiModel');
      const selectedModel = modelSetting ? modelSetting.value : 'gemini-2.5-flash';
      
      // Test the API key with a real request to Gemini
      const testPayload = {
        contents: [{ parts: [{ text: "Hello, this is a test message." }] }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
          return {
            success: true,
            message: 'Chave API válida e funcionando'
          };
        }
      }

      return {
        success: false,
        message: 'Chave API inválida ou sem permissões'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar API'
      };
    }
  }
}