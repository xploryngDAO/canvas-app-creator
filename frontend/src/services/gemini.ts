import { AppConfig } from '../types/app';
import { settingsService } from './settingsService';

export interface GeminiResponse {
  success: boolean;
  code?: string;
  files?: { [key: string]: string };
  error?: string;
  quotaInfo?: any;
}

export class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = '';
  private model = 'gemini-2.5-flash'; // Default model, will be overridden by settings

  /**
   * Gera a URL da API baseada no modelo atual
   */
  private getApiUrl(modelOverride?: string): string {
    const currentModel = modelOverride || this.model;
    return `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`;
  }

  /**
   * Atualiza o modelo e a URL base
   */
  private updateModel(newModel: string): void {
    this.model = newModel;
    this.baseUrl = this.getApiUrl(newModel);
  }

  async init(): Promise<void> {
    console.log('🚀 [GEMINI_SERVICE] Iniciando inicialização do GeminiService...');
    try {
      // Carregar API key do settingsService (banco de dados)
      console.log('🔄 [GEMINI_SERVICE] Inicializando settingsService...');
      await settingsService.init();
      
      console.log('🔍 [GEMINI_SERVICE] Buscando API key do banco de dados...');
      const apiKeyResult = await settingsService.getGeminiApiKey();
      
      console.log('📊 [GEMINI_SERVICE] Resultado da busca da API key:', {
        success: apiKeyResult.success,
        hasData: !!apiKeyResult.data,
        dataValue: apiKeyResult.data?.value ? `${apiKeyResult.data.value.substring(0, 10)}...` : 'null',
        error: apiKeyResult.error
      });
      
      if (apiKeyResult.success && apiKeyResult.data) {
        this.apiKey = apiKeyResult.data.value;
        console.log('✅ [GEMINI_SERVICE] API Key carregada do banco de dados:', {
          keyLength: this.apiKey?.length || 0,
          keyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'null'
        });
      } else {
        console.log('⚠️ [GEMINI_SERVICE] Nenhuma API Key encontrada no banco de dados:', {
          success: apiKeyResult.success,
          error: apiKeyResult.error
        });
        this.apiKey = null;
      }

      // Carregar modelo das configurações
      console.log('🔍 [GEMINI_SERVICE] Buscando modelo das configurações...');
      const modelResult = await settingsService.getSetting('geminiModel');
      
      console.log('📊 [GEMINI_SERVICE] Resultado da busca do modelo:', {
        success: modelResult.success,
        hasData: !!modelResult.data,
        modelValue: modelResult.data?.value || 'não encontrado',
        error: modelResult.error
      });
      
      if (modelResult.success && modelResult.data) {
        this.updateModel(modelResult.data.value);
        console.log('✅ [GEMINI_SERVICE] Modelo carregado das configurações:', {
          model: this.model,
          baseUrl: this.baseUrl
        });
      } else {
        // Usar modelo padrão se não encontrado
        this.updateModel(this.model);
        console.log('⚠️ [GEMINI_SERVICE] Usando modelo padrão:', {
          model: this.model,
          baseUrl: this.baseUrl,
          reason: 'Modelo não encontrado nas configurações'
        });
      }
    } catch (error) {
      console.error('❌ [GEMINI_SERVICE] Erro ao inicializar GeminiService:', error);
      this.apiKey = null;
      // Garantir que temos uma URL base mesmo em caso de erro
      this.updateModel(this.model);
    }
    
    console.log('🏁 [GEMINI_SERVICE] Inicialização concluída. Estado final:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0,
      model: this.model,
      baseUrl: this.baseUrl
    });
  }

  async reload(): Promise<void> {
    console.log('🔄 [GEMINI_SERVICE] Recarregando GeminiService...');
    await this.init();
    console.log('✅ [GEMINI_SERVICE] Reload concluído');
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('✅ [DEBUG] API Key configurada');
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generate(config: AppConfig): Promise<GeminiResponse> {
    console.log('🚀 [DEBUG] Iniciando geração com configuração:', config);

    if (!this.apiKey) {
      console.error('❌ [ERROR] API Key não configurada');
      return {
        success: false,
        error: 'API Key não configurada. Configure sua API Key do Gemini nas configurações.'
      };
    }

    if (!this.isValidApiKeyFormat(this.apiKey)) {
      console.error('❌ [ERROR] Formato de API Key inválido');
      return {
        success: false,
        error: 'Formato de API Key inválido. Verifique se a API Key está correta.'
      };
    }

    try {
      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(config);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        console.log('📦 [DEBUG] Resultado encontrado no cache');
        return cachedResult;
      }

      // Verificar status da quota antes de fazer a requisição
      const quotaStatus = await this.checkQuotaStatus();
      if (!quotaStatus.canMakeRequest) {
        console.error('❌ [ERROR] Quota excedida:', quotaStatus.message);
        return {
          success: false,
          error: quotaStatus.message,
          quotaInfo: quotaStatus
        };
      }

      const maxRetries = 3;
      let lastError = '';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 [DEBUG] Tentativa ${attempt}/${maxRetries}`);

        try {
          // Determinar abordagem responsiva
          const approach = this.determineResponsiveApproach(config);
          console.log('📱 [DEBUG] Abordagem responsiva determinada:', approach);

          // Construir prompts
          const systemPrompt = this.buildAdaptiveSystemPrompt(approach);
          const customPrompt = this.buildPrompt(config);
          const fullPrompt = `${systemPrompt}\n\n${customPrompt}`;

          console.log('📝 [DEBUG] Prompt construído:', {
            systemPromptLength: systemPrompt.length,
            customPromptLength: customPrompt.length,
            fullPromptLength: fullPrompt.length
          });

          const requestBody = {
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          };

          console.log('🌐 [DEBUG] Fazendo requisição para:', this.baseUrl);
          const response = await fetch(this.baseUrl + `?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [ERROR] Resposta da API não OK:', {
              status: response.status,
              statusText: response.statusText,
              errorText
            });

            // Tratar rate limit especificamente
            if (response.status === 429) {
              lastError = 'Rate limit excedido';
              console.log(`⏳ [DEBUG] Rate limit na tentativa ${attempt}, aguardando...`);
              
              // Tentar com modelo alternativo se disponível
              if (attempt < maxRetries) {
                console.log('🔄 [DEBUG] Tentando com modelo alternativo...');
                // Aqui poderia alternar para gemini-pro se necessário
                await this.sleep(2000 * attempt);
                continue;
              }
            }

            lastError = `Erro na API: ${response.status} - ${response.statusText}`;
            if (attempt < maxRetries) {
              await this.sleep(1000 * attempt);
              continue;
            }
            break;
          }

          const data = await response.json();
          console.log('📥 [DEBUG] Resposta da API recebida:', {
            hasCandidates: !!data.candidates,
            candidatesLength: data.candidates?.length || 0
          });

          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const content = data.candidates[0].content.parts[0].text;
            console.log('✅ [DEBUG] Conteúdo extraído com sucesso:', {
              contentLength: content.length,
              contentPreview: content.substring(0, 200) + '...'
            });

            const extractedCode = this.extractCode(content);
            console.log('🔍 [DEBUG] Código extraído:', {
              extractedLength: extractedCode.length,
              extractedPreview: extractedCode.substring(0, 200) + '...'
            });

            const result: GeminiResponse = {
              success: true,
              code: extractedCode,
              files: { 'index.html': extractedCode }
            };

            // Salvar no cache
            this.saveToCache(cacheKey, result);

            return result;
          } else {
            console.error('❌ [ERROR] Estrutura de resposta inválida:', data);
            lastError = 'Resposta inválida da API';
            if (attempt < maxRetries) {
              await this.sleep(2000 * attempt);
              continue;
            }
          }
        } catch (error) {
          console.error(`❌ [ERROR] Erro na tentativa ${attempt}:`, error);
          lastError = error instanceof Error ? error.message : 'Erro desconhecido';
          if (attempt < maxRetries) {
            await this.sleep(2000 * attempt);
          }
        }
      }

      return {
        success: false,
        error: lastError.includes('quota') || lastError.includes('429') || lastError.includes('rate limit') 
          ? `Quota da API Gemini excedida após ${maxRetries} tentativas. Configure uma API Key diferente ou aguarde alguns minutos.`
          : lastError || 'Falha após múltiplas tentativas'
      };
    } catch (error) {
      console.error('❌ [ERROR] Erro geral na geração:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na geração'
      };
    }
  }

  private isValidApiKeyFormat(apiKey: string | null): boolean {
    console.log('🔍 [DEBUG] Validando formato da API key:', {
      apiKey: apiKey,
      type: typeof apiKey,
      isNull: apiKey === null,
      isUndefined: apiKey === undefined,
      length: apiKey ? apiKey.length : 0
    });

    // Validar se apiKey é uma string válida antes de usar startsWith
    if (!apiKey || typeof apiKey !== 'string') {
      console.log('❌ [DEBUG] API key inválida: não é string ou é null/undefined');
      return false;
    }

    // Fazer trim para remover espaços em branco
    const trimmedKey = apiKey.trim();
    console.log('🔍 [DEBUG] API key após trim:', {
      original: `"${apiKey}"`,
      trimmed: `"${trimmedKey}"`,
      originalLength: apiKey.length,
      trimmedLength: trimmedKey.length
    });

    // Validar formato da API key do Google Gemini
    // Deve começar com "AIza" e ter pelo menos 39 caracteres
    const startsWithAIza = trimmedKey.startsWith('AIza');
    const hasMinLength = trimmedKey.length >= 39;
    
    console.log('🔍 [DEBUG] Validação detalhada:', {
      startsWithAIza,
      hasMinLength,
      actualLength: trimmedKey.length,
      first4Chars: trimmedKey.substring(0, 4),
      isValid: startsWithAIza && hasMinLength
    });

    const isValid = startsWithAIza && hasMinLength;
    
    if (isValid) {
      console.log('✅ [DEBUG] API key válida!');
    } else {
      console.log('❌ [DEBUG] API key inválida:', {
        reason: !startsWithAIza ? 'Não começa com AIza' : 'Comprimento insuficiente'
      });
    }

    return isValid;
  }

  private buildPrompt(config: AppConfig): string {
    // Construir prompt detalhado usando TODAS as configurações do Wizard
    let prompt = `Crie uma aplicação ${config.appType} chamada "${config.name}": ${config.description}.\n\n`;
    
    // Stack tecnológico
    prompt += `STACK TECNOLÓGICO:\n`;
    prompt += `- Frontend: ${config.frontendStack}\n`;
    prompt += `- CSS Framework: ${config.cssFramework}\n`;
    prompt += `- Plataforma: ${config.platformType}\n\n`;
    
    // Design e aparência
    prompt += `DESIGN E APARÊNCIA:\n`;
    prompt += `- Tema de cores: ${config.colorTheme}\n`;
    prompt += `- Fonte principal: ${config.mainFont}\n`;
    prompt += `- Estilo de layout: ${config.layoutStyle}\n`;
    prompt += `- Estrutura de menu: ${config.menuStructure}\n\n`;
    
    // Funcionalidades habilitadas
    const enabledFeatures = [];
    if (config.enableAuth) {
      enabledFeatures.push(`Autenticação (${config.authType} via ${config.authProvider})`);
      if (config.adminUsername && config.adminPassword) {
        enabledFeatures.push(`Admin: ${config.adminUsername}/${config.adminPassword}`);
      }
    }
    if (config.enableDatabase) {
      enabledFeatures.push(`Banco de dados (${config.databaseType})`);
    }
    if (config.enablePayments) {
      enabledFeatures.push(`Pagamentos (${config.paymentProvider})`);
    }
    
    if (enabledFeatures.length > 0) {
      prompt += `FUNCIONALIDADES:\n`;
      enabledFeatures.forEach(feature => prompt += `- ${feature}\n`);
      prompt += `\n`;
    }
    
    // Features array (funcionalidades adicionais)
    if (config.features && config.features.length > 0) {
      prompt += `FEATURES ADICIONAIS:\n`;
      config.features.forEach(feature => prompt += `- ${feature}\n`);
      prompt += `\n`;
    }
    
    // Integrações
    if (config.integrations && Object.keys(config.integrations).length > 0) {
      prompt += `INTEGRAÇÕES:\n`;
      Object.entries(config.integrations).forEach(([key, value]) => {
        if (value && typeof value === 'object' && value.enabled) {
          prompt += `- ${key}\n`;
        }
      });
      prompt += `\n`;
    }
    
    // Elementos de layout personalizados
    if (config.customLayoutElements && config.customLayoutElements.length > 0) {
      prompt += `ELEMENTOS DE LAYOUT PERSONALIZADOS:\n`;
      config.customLayoutElements.forEach(element => {
        prompt += `- ${JSON.stringify(element)}\n`;
      });
      prompt += `\n`;
    }
    
    // Instruções finais
    prompt += `INSTRUÇÕES FINAIS:\n`;
    prompt += `- Retorne APENAS código HTML completo, responsivo e funcional\n`;
    prompt += `- Implemente layout com menus FIXOS que NÃO fazem scroll\n`;
    prompt += `- Use position: fixed para header/navbar e sidebar\n`;
    prompt += `- APENAS o conteúdo principal deve ter overflow-y: auto\n`;
    prompt += `- Siga rigorosamente o tema de cores ${config.colorTheme}\n`;
    prompt += `- Use a fonte ${config.mainFont} como fonte principal\n`;
    prompt += `- Implemente a estrutura de menu ${config.menuStructure}\n`;
    prompt += `- Garanta compatibilidade com ${config.platformType}\n`;

    console.log('🔍 [DEBUG] Prompt completo construído:', prompt);
    console.log('🔍 [DEBUG] Tamanho do prompt:', prompt.length, 'caracteres');
    console.log('🔍 [DEBUG] Configurações utilizadas:', {
      appType: config.appType,
      frontendStack: config.frontendStack,
      cssFramework: config.cssFramework,
      colorTheme: config.colorTheme,
      mainFont: config.mainFont,
      layoutStyle: config.layoutStyle,
      menuStructure: config.menuStructure,
      enableAuth: config.enableAuth,
      enableDatabase: config.enableDatabase,
      enablePayments: config.enablePayments,
      featuresCount: config.features?.length || 0,
      integrationsCount: Object.keys(config.integrations || {}).length,
      customElementsCount: config.customLayoutElements?.length || 0
    });
    
    return prompt;
  }

  private extractCode(text: string): string {
    // Tentar extrair código entre ```html e ```
    const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) {
      return htmlMatch[1].trim();
    }

    // Tentar extrair código entre ``` e ```
    const codeMatch = text.match(/```\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return codeMatch[1].trim();
    }

    // Se começar com <!DOCTYPE html>, usar o texto completo
    if (text.trim().startsWith('<!DOCTYPE html>')) {
      return text.trim();
    }

    // Caso contrário, procurar por <!DOCTYPE html> no texto
    const doctypeIndex = text.indexOf('<!DOCTYPE html>');
    if (doctypeIndex !== -1) {
      return text.substring(doctypeIndex).trim();
    }

    // Se não encontrar, retornar o texto completo
    return text.trim();
  }

  async testConnection(): Promise<{ success: boolean; error?: string; quotaInfo?: any }> {
    if (!this.apiKey) {
      return { success: false, error: 'API Key não configurada' };
    }

    try {
      console.log('🔍 [DEBUG] Testando conexão com API Key:', this.apiKey.substring(0, 10) + '...');

      const testPrompt = 'Responda apenas "OK" se você conseguir me ouvir.';
      const requestBody = {
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      };

      const response = await fetch(this.baseUrl + `?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 [DEBUG] Resposta do teste de conexão:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ERROR] Teste de conexão falhou:', errorText);
        
        if (response.status === 400) {
          return { success: false, error: 'API Key inválida ou malformada' };
        } else if (response.status === 403) {
          return { success: false, error: 'API Key sem permissões ou projeto inválido' };
        } else if (response.status === 429) {
          return { success: false, error: 'Quota excedida ou rate limit atingido' };
        }
        
        return { success: false, error: `Erro ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('✅ [DEBUG] Teste de conexão bem-sucedido:', data);

      return { success: true, quotaInfo: data };
    } catch (error) {
      console.error('❌ [ERROR] Erro no teste de conexão:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na conexão' 
      };
    }
  }

  private generateCacheKey(config: AppConfig): string {
    // Gerar uma chave única baseada na configuração
    const configString = JSON.stringify({
      name: config.name,
      description: config.description,
      appType: config.appType,
      frontendStack: config.frontendStack,
      cssFramework: config.cssFramework,
      colorTheme: config.colorTheme,
      mainFont: config.mainFont,
      layoutStyle: config.layoutStyle,
      menuStructure: config.menuStructure,
      features: config.features,
      integrations: config.integrations
    });
    
    // Criar hash simples da string
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `gemini_cache_${Math.abs(hash)}`;
  }

  private getFromCache(key: string): GeminiResponse | null {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        
        // Cache válido por 1 hora
        if (now - parsed.timestamp < 60 * 60 * 1000) {
          console.log('📦 [DEBUG] Cache hit para:', key);
          return parsed.data;
        } else {
          console.log('⏰ [DEBUG] Cache expirado para:', key);
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('❌ [ERROR] Erro ao ler cache:', error);
    }
    
    return null;
  }

  private saveToCache(key: string, data: GeminiResponse): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log('💾 [DEBUG] Dados salvos no cache:', key);
    } catch (error) {
      console.error('❌ [ERROR] Erro ao salvar no cache:', error);
    }
  }

  private async checkQuotaStatus(): Promise<{ canMakeRequest: boolean; message: string }> {
    // Implementar verificação básica de quota baseada em localStorage
    const quotaKey = 'gemini_quota_status';
    const now = Date.now();
    
    try {
      const quotaData = localStorage.getItem(quotaKey);
      if (quotaData) {
        const parsed = JSON.parse(quotaData);
        
        // Se foi bloqueado recentemente (últimos 10 minutos), não permitir
        if (parsed.blocked && (now - parsed.timestamp) < 10 * 60 * 1000) {
          return {
            canMakeRequest: false,
            message: 'Quota temporariamente excedida. Aguarde alguns minutos antes de tentar novamente.'
          };
        }
      }
    } catch (error) {
      console.error('❌ [ERROR] Erro ao verificar quota:', error);
    }
    
    return { canMakeRequest: true, message: 'OK' };
  }

  private markQuotaExceeded(): void {
    const quotaKey = 'gemini_quota_status';
    const quotaData = {
      blocked: true,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(quotaKey, JSON.stringify(quotaData));
      console.log('🚫 [DEBUG] Quota marcada como excedida');
    } catch (error) {
      console.error('❌ [ERROR] Erro ao marcar quota excedida:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private determineResponsiveApproach(config: AppConfig): 'mobile-first' | 'desktop-first' {
    // Analisar palavras-chave na descrição e tipo de app
    const description = config.description?.toLowerCase() || '';
    const appType = config.appType?.toLowerCase() || '';
    const features = config.features?.map(f => f.toLowerCase()).join(' ') || '';
    
    const fullText = `${description} ${appType} ${features}`;
    
    // Palavras-chave que indicam mobile-first
    const mobileKeywords = [
      'mobile', 'smartphone', 'app', 'touch', 'swipe', 'responsive',
      'social', 'chat', 'messaging', 'photo', 'camera', 'location',
      'notification', 'offline', 'pwa', 'progressive web app'
    ];
    
    // Palavras-chave que indicam desktop-first
    const desktopKeywords = [
      'dashboard', 'admin', 'management', 'enterprise', 'business',
      'analytics', 'reporting', 'data visualization', 'complex forms',
      'spreadsheet', 'table', 'grid', 'multiple windows', 'sidebar'
    ];
    
    const hasMobileKeywords = mobileKeywords.some(keyword => fullText.includes(keyword));
    const hasDesktopKeywords = desktopKeywords.some(keyword => fullText.includes(keyword));
    
    // Se tem palavras mobile e não tem desktop, é mobile-first
    if (hasMobileKeywords && !hasDesktopKeywords) {
      return 'mobile-first';
    }
    
    // Se tem palavras desktop e não tem mobile, é desktop-first
    if (hasDesktopKeywords && !hasMobileKeywords) {
      return 'desktop-first';
    }
    
    // Analisar configuração do app
    const appTypeConfig = config.appType?.toLowerCase() || '';
    const descriptionConfig = config.description?.toLowerCase() || '';
    
    // Tipos de aplicação que geralmente são desktop-first
    const desktopAppTypes = [
      'admin panel', 'dashboard', 'cms', 'crm', 'erp', 'management system',
      'analytics', 'reporting', 'data visualization', 'enterprise'
    ];
    
    const isDesktopApp = desktopAppTypes.some(type => 
      appTypeConfig.includes(type) || descriptionConfig.includes(type)
    );
    
    return isDesktopApp ? 'desktop-first' : 'mobile-first';
  }

  /**
   * Constrói um system prompt simplificado que colabora com o customPrompt
   */
  private buildAdaptiveSystemPrompt(approach: 'mobile-first' | 'desktop-first'): string {
    return `Você é um desenvolvedor web especialista. Crie um aplicativo web completo seguindo EXATAMENTE as especificações do prompt personalizado.

INSTRUÇÕES BÁSICAS:
- Retorne APENAS o código HTML completo, sem explicações adicionais
- Use TODAS as tecnologias, frameworks, cores, fontes e configurações especificadas no prompt personalizado
- Implemente TODAS as funcionalidades e estruturas conforme solicitado no prompt personalizado
- Respeite COMPLETAMENTE o sistema de design especificado (cores, fontes, layout)
- Garanta que o código seja funcional e completamente responsivo
- Siga as melhores práticas de acessibilidade e performance

LAYOUT FIXO OBRIGATÓRIO:
- SEMPRE implemente menus FIXOS que não fazem scroll
- Header/navbar: position: fixed no topo
- Sidebar (se especificada): position: fixed na lateral
- Footer (se especificado): position: fixed na parte inferior
- APENAS o conteúdo principal deve ter scroll vertical
- Use calc() para altura: calc(100vh - altura_header - altura_footer)

RESTRIÇÕES DE LAYOUT RESPONSIVO:
- O conteúdo principal NUNCA deve permitir scroll horizontal em nenhuma resolução
- TODOS os componentes devem se adaptar responsivamente para caber na largura disponível
- Implementar breakpoints obrigatórios: 320px, 480px, 768px, 1024px, 1200px
- Usar overflow-x: hidden no body e container principal para prevenir scroll horizontal
- Garantir que imagens, tabelas e elementos largos sejam responsivos (max-width: 100%)

DIRETRIZES PARA VERSÃO MOBILE:
- Para dispositivos móveis (até 768px), implementar:
  * Barra de navegação inferior fixa para acesso rápido (máximo 5 itens principais)
  * Barra superior fixa para elementos críticos (logo, busca, perfil)
  * Menu hambúrguer overlay quando houver mais de 5 opções de navegação
  * Transformar sidebars em drawers/overlays que deslizam da lateral
- Priorizar navegação por toque com áreas mínimas de 48x48px
- Implementar gestos intuitivos (swipe, tap, long press)

REQUISITOS DE IMPLEMENTAÇÃO MOBILE:
- Utilizar CSS media queries específicas: @media (max-width: 768px)
- Garantir redimensionamento proporcional de TODOS os componentes
- Testar compatibilidade em viewports de 320px a 768px de largura
- Validar ausência total de scroll horizontal em todos os cenários
- Implementar viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">

CRITÉRIOS DE QUALIDADE RESPONSIVA:
- Layout deve permanecer estável sem distorções em qualquer resolução
- Elementos interativos devem manter área de toque mínima de 48x48px
- Transições entre modos de menu devem ser suaves (transition: 0.3s ease)
- Textos devem ser legíveis sem zoom (mínimo 16px em mobile)
- Botões e links devem ter espaçamento adequado para evitar toques acidentais
- Implementar estados hover/focus visíveis para acessibilidade

RESPONSIVIDADE ${approach.toUpperCase()}:
- Implemente breakpoints apropriados para a abordagem ${approach}
- Em mobile: transforme sidebar em menu hambúrguer overlay
- Mantenha funcionalidade completa em todas as resoluções
- Use media queries para ajustar layout conforme necessário
- Priorize performance em dispositivos móveis (lazy loading, otimização de imagens)

PRIORIDADE ABSOLUTA: Siga EXATAMENTE todas as configurações do prompt personalizado - cores, fontes, layout, funcionalidades e integrações especificadas.`;
  }

  async generateWithPrompt(prompt: string): Promise<{ success: boolean; content?: string; error?: string }> {
    console.log('🔍 [GEMINI_DEBUG] Iniciando generateWithPrompt:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0,
      apiKeyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'null',
      currentModel: this.model,
      baseUrl: this.baseUrl
    });

    if (!this.apiKey) {
      console.error('❌ [GEMINI_DEBUG] API Key não encontrada');
      return {
        success: false,
        error: 'API Key não configurada. Configure sua API Key do Gemini nas configurações.'
      };
    }
  
    if (!this.isValidApiKeyFormat(this.apiKey)) {
      console.error('❌ [GEMINI_DEBUG] Formato de API Key inválido:', {
        keyLength: this.apiKey.length,
        keyStart: this.apiKey.substring(0, 10)
      });
      return {
        success: false,
        error: 'Formato de API Key inválido. Verifique se a API Key está correta.'
      };
    }
  
    try {
      console.log('🚀 [GEMINI_DEBUG] Enviando prompt para Gemini:', {
        promptLength: prompt.length,
        model: this.model,
        apiKeyPresent: !!this.apiKey,
        apiKeyValid: this.isValidApiKeyFormat(this.apiKey)
      });
  
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
  
      // Usar URL dinâmica baseada no modelo atual
      const apiUrl = this.getApiUrl();
      const fullUrl = apiUrl + `?key=${this.apiKey}`;
      
      console.log('🌐 [GEMINI_DEBUG] Fazendo requisição para URL dinâmica:', {
        apiUrl: apiUrl,
        fullUrl: fullUrl.replace(this.apiKey!, '[API_KEY_HIDDEN]'),
        model: this.model,
        baseUrl: this.baseUrl,
        getApiUrlResult: apiUrl
      });
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ERROR] Resposta da API não OK:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
  
        if (response.status === 429) {
          return {
            success: false,
            error: 'Rate limit excedido. Tente novamente em alguns minutos.'
          };
        }
  
        return {
          success: false,
          error: `Erro na API: ${response.status} - ${response.statusText}`
        };
      }
  
      const data = await response.json();
      console.log('📥 [DEBUG] Resposta da API recebida:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0
      });
  
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        console.log('✅ [DEBUG] Conteúdo extraído com sucesso:', {
          contentLength: content.length,
          contentPreview: content.substring(0, 200) + '...'
        });
  
        return {
          success: true,
          content: content
        };
      } else {
        console.error('❌ [ERROR] Estrutura de resposta inválida:', data);
        return {
          success: false,
          error: 'Resposta inválida da API'
        };
      }
    } catch (error) {
      console.error('❌ [ERROR] Erro na requisição:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const geminiService = new GeminiService();

// Initialize service
geminiService.init().catch(console.error);