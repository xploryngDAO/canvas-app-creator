import React, { useState, useEffect } from 'react';
import { Save, Key, Settings as SettingsIcon, Palette, Globe, HelpCircle, ExternalLink, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { settingsService } from '@/services/settingsService';
import { CUSTOM_LAYOUT_ELEMENTS } from '@/constants/customLayoutElements';
import { 
  APP_TYPES_EXPANDED, 
  FRONTEND_STACKS_EXPANDED, 
  CSS_FRAMEWORKS_EXPANDED, 
  COLOR_THEMES_EXPANDED, 
  FONT_FAMILIES_EXPANDED, 
  LAYOUT_STYLES_EXPANDED, 
  MENU_STRUCTURES_EXPANDED 
} from '@/constants/settingsOptions';

const SettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  
  const [settings, setSettings] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    defaultAppType: 'landing-page',
    defaultFrontendStack: 'React',
    defaultCssFramework: 'TailwindCSS',
    defaultColorTheme: 'blue',
    defaultLanguage: 'pt-BR',
    defaultFontFamily: 'Inter',
    defaultLayoutStyle: 'modern',
    defaultMenuStructure: 'sidebar',
    darkMode: true,
    autoSave: true,
    notifications: true,
    defaultCustomLayoutElements: []
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Initialize settings service
      await settingsService.init();
      
      // Load all settings with proper error handling
      const settingKeys = [
        'geminiApiKey',
        'geminiModel',
        'defaultAppType',
        'defaultFrontendStack', 
        'defaultCssFramework',
        'defaultColorTheme',
        'defaultLanguage',
        'defaultFontFamily',
        'defaultLayoutStyle',
        'defaultMenuStructure',
        'darkMode',
        'autoSave',
        'notifications',
        'defaultCustomLayoutElements'
      ];

      const responses = await Promise.allSettled(
        settingKeys.map(key => settingsService.getSetting(key))
      );

      // Extract values with fallbacks for missing settings
      const getValue = (index: number, fallback: string | boolean | string[]) => {
        const response = responses[index];
        if (response.status === 'fulfilled' && response.value.success && response.value.data) {
          const value = response.value.data.value;
          if (typeof fallback === 'boolean') return value === 'true';
          if (Array.isArray(fallback)) {
            try {
              return JSON.parse(value);
            } catch {
              return fallback;
            }
          }
          return value;
        }
        return fallback;
      };

      setSettings({
        geminiApiKey: getValue(0, '') as string,
        geminiModel: getValue(1, 'gemini-2.5-flash') as string,
        defaultAppType: getValue(2, 'landing-page') as string,
        defaultFrontendStack: getValue(3, 'React') as string,
        defaultCssFramework: getValue(4, 'TailwindCSS') as string,
        defaultColorTheme: getValue(5, 'blue') as string,
        defaultLanguage: getValue(6, 'pt-BR') as string,
        defaultFontFamily: getValue(7, 'Inter') as string,
        defaultLayoutStyle: getValue(8, 'modern') as string,
        defaultMenuStructure: getValue(9, 'sidebar') as string,
        darkMode: getValue(10, true) as boolean,
        autoSave: getValue(11, true) as boolean,
        notifications: getValue(12, true) as boolean,
        defaultCustomLayoutElements: getValue(13, []) as string[]
      });
    } catch (err) {
      console.warn('Some settings could not be loaded, using defaults:', err);
      // Don't show error toast for missing settings, just use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomLayoutElementToggle = (elementValue: string) => {
    setSettings(prev => {
      const currentElements = prev.defaultCustomLayoutElements || [];
      const isSelected = currentElements.includes(elementValue);
      const newElements = isSelected
        ? currentElements.filter(el => el !== elementValue)
        : [...currentElements, elementValue];
      
      return { ...prev, defaultCustomLayoutElements: newElements };
    });
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Save all settings
      const savePromises = [
        settingsService.setSetting('geminiApiKey', settings.geminiApiKey),
        settingsService.setSetting('geminiModel', settings.geminiModel),
        settingsService.setSetting('defaultAppType', settings.defaultAppType),
        settingsService.setSetting('defaultFrontendStack', settings.defaultFrontendStack),
        settingsService.setSetting('defaultCssFramework', settings.defaultCssFramework),
        settingsService.setSetting('defaultColorTheme', settings.defaultColorTheme),
        settingsService.setSetting('defaultLanguage', settings.defaultLanguage),
        settingsService.setSetting('defaultFontFamily', settings.defaultFontFamily),
        settingsService.setSetting('defaultLayoutStyle', settings.defaultLayoutStyle),
        settingsService.setSetting('defaultMenuStructure', settings.defaultMenuStructure),
        settingsService.setSetting('darkMode', settings.darkMode.toString()),
        settingsService.setSetting('autoSave', settings.autoSave.toString()),
        settingsService.setSetting('notifications', settings.notifications.toString()),
        settingsService.setSetting('defaultCustomLayoutElements', JSON.stringify(settings.defaultCustomLayoutElements))
      ];

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        // Recarregar o GeminiService após salvar a API key
        const { geminiService } = await import('@/services/gemini');
        await geminiService.reload();
        
        success('Configurações salvas!', 'Todas as configurações foram salvas com sucesso');
      } else {
        error('Erro ao salvar', 'Algumas configurações não puderam ser salvas');
      }
    } catch (err) {
      error('Erro inesperado', 'Ocorreu um erro inesperado ao salvar as configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestGeminiApi = async () => {
    if (!settings.geminiApiKey.trim()) {
      error('API Key obrigatória', 'Por favor, insira uma API Key válida');
      return;
    }

    try {
      setIsTestingApi(true);
      const response = await settingsService.testGeminiApiKey(settings.geminiApiKey);
      
      if (response.success) {
        success('API Key válida!', 'A conexão com a API do Gemini foi testada com sucesso');
      } else {
        error('API Key inválida', response.error || 'Não foi possível conectar com a API do Gemini');
      }
    } catch (err) {
      error('Erro no teste', 'Ocorreu um erro inesperado ao testar a API Key');
    } finally {
      setIsTestingApi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-white text-xl">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header fixo */}
      <div className="sticky top-8 z-40 bg-gray-900/95 border-b border-gray-700/50 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-2 py-1 sm:px-4 sm:py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a 
              href="/" 
              className="p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group"
            >
              <ArrowLeft 
                size={18} 
                className="sm:w-5 sm:h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-200" 
              />
            </a>
            <div className="w-px h-6 sm:h-8 bg-gray-700"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Personalize sua experiência no Canvas App Creator</p>
            </div>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving} 
            variant="outline"
            size="sm"
            className="self-start sm:self-auto group border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 text-sm text-white"
          >
            <Save size={14} className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar Tudo'}</span>
            <span className="sm:hidden">{isSaving ? '...' : 'Salvar'}</span>
          </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          {/* API Configuration */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <Key size={18} className="sm:w-5 sm:h-5 text-blue-400" />
                <h2 className="text-base sm:text-xl font-semibold text-white">Configuração da API</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Configure suas chaves de API para integração com serviços externos</p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Gemini API Key *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.geminiApiKey}
                        onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                        placeholder="Cole sua API Key do Gemini aqui"
                        className="text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showApiKey ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestGeminiApi}
                      disabled={isTestingApi || !settings.geminiApiKey.trim()}
                      size="sm"
                      className="text-sm"
                    >
                      {isTestingApi ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="hidden sm:inline">Testando...</span>
                          <span className="sm:hidden">...</span>
                        </div>
                      ) : (
                        'Testar'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Necessária para gerar código usando IA. Obtenha em{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {/* Gemini Model Selection */}
                <div>
                  <Select
                    label="Modelo Gemini"
                    value={settings.geminiModel}
                    onChange={(e) => handleInputChange('geminiModel', e.target.value)}
                    className="text-sm"
                    options={[
                      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recomendado) ⚡" },
                      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Premium) 💎" },
                      { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Experimental ⚡" },
                      { value: "gemini-1.5-flash-002", label: "Gemini 1.5 Flash 002 ⚡" },
                      { value: "gemini-1.5-pro-002", label: "Gemini 1.5 Pro 002 💎" }
                    ]}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Modelos Flash têm free tier com rate limits. Modelos Pro são pagos mas oferecem melhor qualidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Project Settings */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg font-semibold text-white">
                <SettingsIcon size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-400" />
                Configurações Padrão de Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Seção: Tipo de Aplicação */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Tipo de Aplicação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {APP_TYPES_EXPANDED.map((appType) => (
                    <div
                      key={appType.value}
                      onClick={() => handleInputChange('defaultAppType', appType.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultAppType === appType.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg">
                          {appType.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{appType.title}</h4>
                          <p className="text-xs text-gray-400">{appType.description}</p>
                        </div>
                        {settings.defaultAppType === appType.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              {/* Seção: Frontend Stack */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Stack Frontend</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FRONTEND_STACKS_EXPANDED.map((stack) => (
                    <div
                      key={stack.value}
                      onClick={() => handleInputChange('defaultFrontendStack', stack.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultFrontendStack === stack.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg">
                          {stack.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{stack.title}</h4>
                          <p className="text-xs text-gray-400">{stack.description}</p>
                        </div>
                        {settings.defaultFrontendStack === stack.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Framework CSS */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Framework CSS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CSS_FRAMEWORKS_EXPANDED.map((framework) => (
                    <div
                      key={framework.value}
                      onClick={() => handleInputChange('defaultCssFramework', framework.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultCssFramework === framework.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg">
                          {framework.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{framework.title}</h4>
                          <p className="text-xs text-gray-400">{framework.description}</p>
                        </div>
                        {settings.defaultCssFramework === framework.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Tema de Cores */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Tema de Cores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COLOR_THEMES_EXPANDED.map((theme) => (
                    <div
                      key={theme.value}
                      onClick={() => handleInputChange('defaultColorTheme', theme.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultColorTheme === theme.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg p-2">
                          {theme.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{theme.title}</h4>
                          <p className="text-xs text-gray-400">{theme.description}</p>
                        </div>
                        {settings.defaultColorTheme === theme.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Fonte Principal */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Fonte Principal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FONT_FAMILIES_EXPANDED.map((font) => (
                    <div
                      key={font.value}
                      onClick={() => handleInputChange('defaultFontFamily', font.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultFontFamily === font.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg p-2">
                          {font.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{font.title}</h4>
                          <p className="text-xs text-gray-400">{font.description}</p>
                        </div>
                        {settings.defaultFontFamily === font.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Estilo de Layout */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Estilo de Layout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LAYOUT_STYLES_EXPANDED.map((layout) => (
                    <div
                      key={layout.value}
                      onClick={() => handleInputChange('defaultLayoutStyle', layout.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultLayoutStyle === layout.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg p-2">
                          {layout.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{layout.title}</h4>
                          <p className="text-xs text-gray-400">{layout.description}</p>
                        </div>
                        {settings.defaultLayoutStyle === layout.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Estrutura de Menu */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Estrutura de Menu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MENU_STRUCTURES_EXPANDED.map((menu) => (
                    <div
                      key={menu.value}
                      onClick={() => handleInputChange('defaultMenuStructure', menu.value)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                        ${settings.defaultMenuStructure === menu.value
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="h-16 mb-3 flex items-center justify-center rounded-lg p-2">
                          {menu.preview}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm mb-1">{menu.title}</h4>
                          <p className="text-xs text-gray-400">{menu.description}</p>
                        </div>
                        {settings.defaultMenuStructure === menu.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Elementos do Layout Personalizado */}
              {settings.defaultMenuStructure === 'custom' && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Elementos do Layout Personalizado</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Selecione os elementos que farão parte do layout personalizado padrão
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CUSTOM_LAYOUT_ELEMENTS.map((element) => (
                      <div
                        key={element.value}
                        onClick={() => handleCustomLayoutElementToggle(element.value)}
                        className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 min-h-[140px] flex flex-col ${
                          settings.defaultCustomLayoutElements?.includes(element.value)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                      >
                        {settings.defaultCustomLayoutElements?.includes(element.value) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="h-12 mb-2 bg-gray-700 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                          {element.preview}
                        </div>
                        
                        <div className="flex-grow flex flex-col justify-between">
                          <h4 className="text-white font-medium text-xs mb-1">
                            {element.label.replace('✅ ', '')}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {settings.defaultCustomLayoutElements && settings.defaultCustomLayoutElements.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Elementos selecionados:</p>
                      <div className="flex flex-wrap gap-2">
                        {settings.defaultCustomLayoutElements.map((elementValue) => {
                          const element = CUSTOM_LAYOUT_ELEMENTS.find(el => el.value === elementValue);
                          return (
                            <span 
                              key={elementValue}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                            >
                              {element?.label.replace('✅ ', '')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seção: Funcionalidades */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Funcionalidades</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="defaultEnableAuth"
                      checked={settings.defaultEnableAuth || false}
                      onChange={(e) => handleInputChange('defaultEnableAuth', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="defaultEnableAuth" className="text-sm text-gray-300">
                      Autenticação por padrão
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="defaultEnableDatabase"
                      checked={settings.defaultEnableDatabase || false}
                      onChange={(e) => handleInputChange('defaultEnableDatabase', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="defaultEnableDatabase" className="text-sm text-gray-300">
                      Banco de dados por padrão
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="defaultEnablePayments"
                      checked={settings.defaultEnablePayments || false}
                      onChange={(e) => handleInputChange('defaultEnablePayments', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="defaultEnablePayments" className="text-sm text-gray-300">
                      Pagamentos por padrão
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção: Configurações Avançadas */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Configurações Avançadas</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Select
                    label="Tipo de Autenticação"
                    value={settings.defaultAuthType || 'simple'}
                    onChange={(e) => handleInputChange('defaultAuthType', e.target.value)}
                    options={[
                      { value: 'simple', label: 'Simples (Local)' },
                      { value: 'jwt', label: 'JWT Token' },
                      { value: 'oauth', label: 'OAuth (Google/Facebook)' }
                    ]}
                    className="text-sm"
                  />
                  
                  <Select
                    label="Tipo de Banco de Dados"
                    value={settings.defaultDatabaseType || 'none'}
                    onChange={(e) => handleInputChange('defaultDatabaseType', e.target.value)}
                    options={[
                      { value: 'none', label: 'Nenhum' },
                      { value: 'sqlite', label: 'SQLite' },
                      { value: 'mysql', label: 'MySQL' },
                      { value: 'postgresql', label: 'PostgreSQL' },
                      { value: 'mongodb', label: 'MongoDB' }
                    ]}
                    className="text-sm"
                  />
                  
                  <Select
                    label="Provedor de Pagamentos"
                    value={settings.defaultPaymentProvider || 'none'}
                    onChange={(e) => handleInputChange('defaultPaymentProvider', e.target.value)}
                    options={[
                      { value: 'none', label: 'Nenhum' },
                      { value: 'stripe', label: 'Stripe' },
                      { value: 'paypal', label: 'PayPal' },
                      { value: 'mercadopago', label: 'Mercado Pago' }
                    ]}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Seção: Idioma */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Localização</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <Select
                    label="Idioma Padrão"
                    value={settings.defaultLanguage}
                    onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                    options={[
                      { value: 'pt-BR', label: 'Português (Brasil)' },
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'es-ES', label: 'Español' }
                    ]}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg font-semibold text-white">
                <Palette size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-purple-400" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-300">Modo Escuro</label>
                    <p className="text-xs text-gray-400">Interface com tema escuro</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('darkMode', !settings.darkMode)}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      settings.darkMode ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        settings.darkMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg font-semibold text-white">
                <Globe size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-400" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-300">Salvamento Automático</label>
                    <p className="text-xs text-gray-400">Salvar projetos automaticamente</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('autoSave', !settings.autoSave)}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      settings.autoSave ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSave ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-300">Notificações</label>
                    <p className="text-xs text-gray-400">Receber notificações do sistema</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg font-semibold text-white">
                <HelpCircle size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-yellow-400" />
                Ajuda & Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                <a
                  href="#"
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm text-gray-300">Documentação</span>
                  <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                </a>
                
                <a
                  href="#"
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm text-gray-300">Reportar Bug</span>
                  <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                </a>
                
                <a
                  href="#"
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm text-gray-300">Suporte Técnico</span>
                  <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;