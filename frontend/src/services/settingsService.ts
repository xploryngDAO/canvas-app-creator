import { apiService, ApiResponse } from './api';

export interface Setting {
  key: string;
  value: string;
}

export interface GeminiApiKeyResponse {
  success: boolean;
  message: string;
}

class SettingsService {
  // Get all settings
  async getAllSettings(): Promise<ApiResponse<Setting[]>> {
    return apiService.get<Setting[]>('/settings');
  }

  // Get specific setting
  async getSetting(key: string): Promise<ApiResponse<Setting>> {
    return apiService.get<Setting>(`/settings/${key}`);
  }

  // Set setting value
  async setSetting(key: string, value: string): Promise<ApiResponse<Setting>> {
    return apiService.post<Setting>(`/settings/${key}`, { value });
  }

  // Delete setting
  async deleteSetting(key: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/settings/${key}`);
  }

  // Get Gemini API Key
  async getGeminiApiKey(): Promise<ApiResponse<Setting>> {
    return apiService.get<Setting>('/settings/gemini/api-key');
  }

  // Set Gemini API Key
  async setGeminiApiKey(apiKey: string): Promise<ApiResponse<GeminiApiKeyResponse>> {
    return apiService.post<GeminiApiKeyResponse>('/settings/gemini/api-key', { apiKey });
  }

  // Test Gemini API Key
  async testGeminiApiKey(apiKey?: string): Promise<ApiResponse<GeminiApiKeyResponse>> {
    if (apiKey) {
      return apiService.post<GeminiApiKeyResponse>('/settings/gemini/test', { apiKey });
    }
    return apiService.post<GeminiApiKeyResponse>('/settings/gemini/test');
  }
}

export const settingsService = new SettingsService();