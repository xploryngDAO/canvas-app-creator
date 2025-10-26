import { database } from './database';

export interface Setting {
  key: string;
  value: string;
}

export interface GeminiApiKeyResponse {
  success: boolean;
  message: string;
}

class SettingsService {
  private isInitialized = false;

  // Initialize database
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await database.init();
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar SettingsService:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // Get all settings
  async getAllSettings(): Promise<{ success: boolean; data?: Setting[]; error?: string }> {
    try {
      await this.ensureInitialized();
      const settings = await database.getAllSettings();
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get specific setting
  async getSetting(key: string): Promise<{ success: boolean; data?: Setting; error?: string }> {
    try {
      await this.ensureInitialized();
      const setting = await database.getSetting(key);
      if (setting) {
        return { success: true, data: setting };
      } else {
        return { success: false, error: 'Setting not found' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Set setting value
  async setSetting(key: string, value: string): Promise<{ success: boolean; data?: Setting; error?: string }> {
    try {
      await this.ensureInitialized();
      await database.setSetting(key, value);
      return { success: true, data: { key, value } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete setting
  async deleteSetting(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.ensureInitialized();
      await database.deleteSetting(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get Gemini API Key
  async getGeminiApiKey(): Promise<{ success: boolean; data?: Setting; error?: string }> {
    return this.getSetting('geminiApiKey');
  }

  // Set Gemini API Key
  async setGeminiApiKey(apiKey: string): Promise<{ success: boolean; data?: GeminiApiKeyResponse; error?: string }> {
    try {
      await this.setSetting('geminiApiKey', apiKey);
      return { 
        success: true, 
        data: { 
          success: true, 
          message: 'API key saved successfully' 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test Gemini API Key
  async testGeminiApiKey(apiKey?: string): Promise<{ success: boolean; data?: GeminiApiKeyResponse; error?: string }> {
    try {
      let keyToTest = apiKey;
      
      if (!keyToTest) {
        const setting = await this.getSetting('geminiApiKey');
        if (!setting.success || !setting.data) {
          return { 
            success: false, 
            error: 'No API key found' 
          };
        }
        keyToTest = setting.data.value;
      }

      // Test the API key by making a simple request to Gemini
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + keyToTest, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test connection'
            }]
          }]
        })
      });

      if (response.ok) {
        return { 
          success: true, 
          data: { 
            success: true, 
            message: 'API key is valid' 
          } 
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid API key' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection error' 
      };
    }
  }
}

export const settingsService = new SettingsService();