import { database } from './database';

export interface GeminiResponse {
  success: boolean;
  code?: string;
  error?: string;
}

export interface AppConfig {
  name: string;
  description: string;
  type: string;
  frontend: string;
  css: string;
  theme: any;
  layout: string;
  menu: any;
  features: string[];
  integrations: string[];
}

class GeminiService {
  private apiKey: string | null = null;
  private model: string = 'gemini-2.5-flash';
  private baseUrl = '';

  async init(): Promise<void> {
    const apiKeySetting = await database.getSetting('geminiApiKey');
    this.apiKey = apiKeySetting ? apiKeySetting.value : null;
    
    const modelSetting = await database.getSetting('geminiModel');
    this.model = modelSetting ? modelSetting.value : 'gemini-2.5-flash';
    
    this.updateBaseUrl();
    
    console.log('🔍 [DEBUG] GeminiService init - Configurações carregadas:', {
      hasKey: this.apiKey ? 'Sim' : 'Não',
      keyType: typeof this.apiKey,
      keyLength: this.apiKey ? this.apiKey.length : 0,
      keyPreview: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'null',
      model: this.model,
      baseUrl: this.baseUrl,
      apiKeySetting,
      modelSetting
    });
  }

  async reload(): Promise<void> {
    const apiKeySetting = await database.getSetting('geminiApiKey');
    this.apiKey = apiKeySetting ? apiKeySetting.value : null;
    
    const modelSetting = await database.getSetting('geminiModel');
    this.model = modelSetting ? modelSetting.value : 'gemini-2.5-flash';
    
    this.updateBaseUrl();
    
    console.log('🔍 [DEBUG] GeminiService reload - Configurações recarregadas:', {
      hasKey: this.apiKey ? 'Sim' : 'Não',
      keyType: typeof this.apiKey,
      keyLength: this.apiKey ? this.apiKey.length : 0,
      keyPreview: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'null',
      model: this.model,
      baseUrl: this.baseUrl,
      apiKeySetting,
      modelSetting
    });
  }

  private updateBaseUrl(): void {
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async setApiKey(key: string): Promise<void> {
    console.log('🔍 [DEBUG] GeminiService setApiKey - Definindo nova API Key:', {
      keyType: typeof key,
      keyLength: key ? key.length : 0,
      keyPreview: key ? `${key.substring(0, 8)}...` : 'null'
    });
    this.apiKey = key;
    await database.setSetting('geminiApiKey', key);
    console.log('🔍 [DEBUG] GeminiService setApiKey - API Key salva no database');
  }

  async generateApp(config: AppConfig, customPrompt?: string): Promise<GeminiResponse> {
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
      console.log('🚀 [DEBUG] Iniciando geração com Gemini...');
      
      // Verificar cache primeiro
      const { cacheService } = await import('./cache');
      const cachedResult = cacheService.get(config);
      
      if (cachedResult) {
        console.log('💾 [CACHE] Usando resultado do cache');
        return {
          success: true,
          code: cachedResult
        };
      }
      
      // Verificar status da quota antes de fazer a requisição
      const quotaStatus = await this.checkQuotaStatus();
      console.log('📊 [DEBUG] Status da quota:', quotaStatus);
      
      if (!quotaStatus.available) {
        return {
          success: false,
          error: 'Quota da API Gemini esgotada. Tente novamente mais tarde ou verifique seus limites de API.'
        };
      }

      // Tentar gerar o app com retry automático
      const maxRetries = 3;
      let lastError = '';
      
      // Lista de modelos para fallback quando quota esgotada
      const fallbackModels = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-002', 'gemini-1.5-pro-002'];
      let currentModelIndex = 0;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 [DEBUG] Tentativa ${attempt}/${maxRetries} com modelo ${this.model}`);
        
        try {
          const result = await this.generateAppWithoutRetry(config, customPrompt);
          
          if (result.success && result.code) {
            console.log('✅ [DEBUG] Geração bem-sucedida na tentativa', attempt);
            
            // Armazenar no cache
            cacheService.set(config, result.code);
            
            return result;
          } else if (result.error?.includes('429') || result.error?.includes('rate limit') || result.error?.includes('quota')) {
            lastError = result.error;
            console.log(`❌ [DEBUG] Quota esgotada para modelo ${this.model}`);
            
            // Tentar modelo de fallback se disponível
            if (currentModelIndex < fallbackModels.length) {
              const fallbackModel = fallbackModels[currentModelIndex];
              console.log(`🔄 [DEBUG] Tentando modelo de fallback: ${fallbackModel}`);
              
              // Salvar modelo atual temporariamente
              const originalModel = this.model;
              this.model = fallbackModel;
              this.updateBaseUrl();
              
              currentModelIndex++;
              
              // Tentar com o novo modelo
              const fallbackResult = await this.generateAppWithoutRetry(config, customPrompt);
              
              if (fallbackResult.success && fallbackResult.code) {
                console.log(`✅ [DEBUG] Sucesso com modelo de fallback: ${fallbackModel}`);
                
                // Salvar o modelo que funcionou
                await database.setSetting('geminiModel', fallbackModel);
                
                // Armazenar no cache
                cacheService.set(config, fallbackResult.code);
                
                return fallbackResult;
              } else {
                // Restaurar modelo original se fallback falhou
                this.model = originalModel;
                this.updateBaseUrl();
                console.log(`❌ [DEBUG] Fallback ${fallbackModel} também falhou`);
              }
            }
            
            const retryTime = this.extractRetryTime(result.error);
            
            if (retryTime && retryTime <= 60 && attempt < maxRetries) {
              console.log(`⏳ [DEBUG] Rate limit detectado. Aguardando ${retryTime}s antes da próxima tentativa...`);
              await this.sleep(retryTime * 1000);
              continue;
            } else {
              console.log('❌ [DEBUG] Rate limit com tempo muito longo ou última tentativa');
              // Retornar erro específico para quota excedida
              return {
                success: false,
                error: `Quota excedida para todos os modelos disponíveis. Tente novamente em alguns minutos ou configure uma API Key diferente. (Tentativa ${attempt}/${maxRetries})`
              };
            }
          } else {
            console.log('❌ [DEBUG] Erro não relacionado a rate limit:', result.error);
            return result;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ [ERROR] Tentativa ${attempt} falhou:`, lastError);
          
          if (attempt === maxRetries) {
            break;
          }
          
          // Aguardar antes da próxima tentativa
          await this.sleep(2000 * attempt);
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
    // Verificações de segurança para evitar erros de undefined
    const features = config.features || [];
    const integrations = config.integrations || [];
    
    const featuresText = features.length > 0 ? features.join(', ') : '';
    const integrationsText = integrations.length > 0 ? integrations.join(', ') : '';

    // Prompt otimizado e conciso (similar ao index_sqlite.html)
    let prompt = `Crie um app web ${config.type} chamado "${config.name}": ${config.description}. Use ${config.frontend} + ${config.css}`;
    
    if (featuresText) {
      prompt += `. Funcionalidades: ${featuresText}`;
    }
    
    if (integrationsText) {
      prompt += `. Integrações: ${integrationsText}`;
    }
    
    prompt += `. Retorne APENAS código HTML completo, responsivo, funcional.`;

    console.log('🔍 [DEBUG] Prompt otimizado:', prompt);
    console.log('🔍 [DEBUG] Tamanho do prompt:', prompt.length, 'caracteres');
    
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
      console.log('🔍 [DEBUG] URL da API:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Teste de conexão. Responda apenas "OK".'
            }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 10,
          }
        })
      });

      console.log('🔍 [DEBUG] Status da resposta:', response.status);
      console.log('🔍 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 [DEBUG] Erro da API:', errorData);
        
        // Verificar se é erro de quota
        if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('rate limit')) {
          return { 
            success: false, 
            error: `Quota excedida: ${errorData.error.message}`,
            quotaInfo: errorData.error
          };
        }
        
        throw new Error(errorData.error?.message || 'Erro na API do Gemini');
      }

      const data = await response.json();
      console.log('🔍 [DEBUG] Resposta da API:', data);
      
      return { 
        success: true,
        quotaInfo: {
          status: 'OK',
          model: this.model,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('🔍 [DEBUG] Erro no teste de conexão:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractRetryTime(errorMessage?: string): number | null {
    if (!errorMessage) return null;
    
    // Procurar por padrões como "retry in 42.035151379s"
    const match = errorMessage.match(/retry in (\d+(?:\.\d+)?)s/);
    if (match) {
      return Math.ceil(parseFloat(match[1]));
    }
    
    return null;
  }

  private async generateAppWithoutRetry(config: AppConfig, customPrompt?: string): Promise<GeminiResponse> {
    // Versão sem retry para evitar loop infinito
    try {
      const prompt = customPrompt || this.buildPrompt(config);
      
      // Detectar tipo de aplicação para definir abordagem de responsividade
      const responsiveApproach = this.detectResponsiveApproach(config, customPrompt);
      
      // System prompt flexível que colabora com custom prompt
      const systemPrompt = this.buildAdaptiveSystemPrompt(responsiveApproach);
      
      console.log(`🎯 [GEMINI] Abordagem de responsividade detectada: ${responsiveApproach}`);
      console.log('🔍 [DEBUG] Usando configuração adaptativa baseada no tipo de aplicação');

      console.log('🔍 [DEBUG] Usando configuração idêntica ao index_sqlite.html');
      console.log('URL:', this.baseUrl);
      console.log('Headers: x-goog-api-key definida');
      
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };
      
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta da API:', errorData);
        throw new Error(errorData.error?.message || 'Erro na API do Gemini');
      }

      const data = await response.json();
      console.log('✅ Resposta da API recebida:', data);
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Resposta vazia da API do Gemini');
      }

      const code = this.extractCode(generatedText);
      return { success: true, code };
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async checkQuotaStatus(): Promise<{ available: boolean; limit?: number; used?: number; resetTime?: string }> {
    try {
      // Fazer uma requisição simples para verificar o status da quota
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'ping'
            }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1,
          }
        })
      });

      const headers = response.headers;
      console.log('🔍 [DEBUG] Headers de quota:', Object.fromEntries(headers.entries()));

      if (response.status === 429) {
        const errorData = await response.json();
        const retryAfter = headers.get('retry-after');
        
        return {
          available: false,
          resetTime: retryAfter ? new Date(Date.now() + parseInt(retryAfter) * 1000).toISOString() : undefined
        };
      }

      return {
        available: response.ok,
        limit: headers.get('x-ratelimit-limit') ? parseInt(headers.get('x-ratelimit-limit')!) : undefined,
        used: headers.get('x-ratelimit-used') ? parseInt(headers.get('x-ratelimit-used')!) : undefined,
        resetTime: headers.get('x-ratelimit-reset') || undefined
      };
    } catch (error) {
      console.error('🔍 [DEBUG] Erro ao verificar quota:', error);
      return { available: false };
    }
  }

  /**
   * Detecta a abordagem de responsividade baseada no tipo de aplicação
   */
  private detectResponsiveApproach(config: AppConfig, customPrompt?: string): 'mobile-first' | 'desktop-first' {
    // Analisar custom prompt primeiro (prioridade máxima)
    if (customPrompt) {
      const lowerPrompt = customPrompt.toLowerCase();
      
      // Palavras-chave que indicam desktop-first
      const desktopKeywords = [
        'desktop', 'admin', 'dashboard', 'management', 'cms', 'crm', 'erp',
        'enterprise', 'business', 'corporate', 'professional', 'office',
        'analytics', 'reporting', 'data visualization', 'complex interface',
        'multi-panel', 'sidebar', 'desktop-first', 'large screen'
      ];
      
      // Palavras-chave que indicam mobile-first
      const mobileKeywords = [
        'mobile', 'app', 'touch', 'swipe', 'responsive', 'mobile-first',
        'smartphone', 'tablet', 'pwa', 'progressive web app', 'social',
        'chat', 'messaging', 'e-commerce', 'shopping', 'blog', 'portfolio'
      ];
      
      const hasDesktopKeywords = desktopKeywords.some(keyword => lowerPrompt.includes(keyword));
      const hasMobileKeywords = mobileKeywords.some(keyword => lowerPrompt.includes(keyword));
      
      if (hasDesktopKeywords && !hasMobileKeywords) {
        return 'desktop-first';
      }
    }
    
    // Analisar configuração do app
    const appType = config.appType?.toLowerCase() || '';
    const description = config.description?.toLowerCase() || '';
    
    // Tipos de aplicação que geralmente são desktop-first
    const desktopAppTypes = [
      'admin panel', 'dashboard', 'cms', 'crm', 'erp', 'management system',
      'analytics', 'reporting', 'data visualization', 'enterprise'
    ];
    
    const isDesktopApp = desktopAppTypes.some(type => 
      appType.includes(type) || description.includes(type)
    );
    
    return isDesktopApp ? 'desktop-first' : 'mobile-first';
  }

  /**
   * Constrói um system prompt adaptativo baseado na abordagem de responsividade
   */
  private buildAdaptiveSystemPrompt(approach: 'mobile-first' | 'desktop-first'): string {
    const baseInstructions = `Você é um desenvolvedor web especialista. Crie um aplicativo web completo usando as tecnologias e frameworks especificados no prompt personalizado.

INSTRUÇÕES FUNDAMENTAIS:
- Retorne APENAS o código HTML completo, sem explicações adicionais
- Use as tecnologias, frameworks e bibliotecas especificadas no prompt personalizado
- Implemente a estrutura e funcionalidades conforme solicitado
- Garanta que o código seja funcional e completamente responsivo
- Use breakpoints responsivos apropriados para a tecnologia escolhida
- Siga as melhores práticas de acessibilidade (WCAG 2.1)
- Otimize para performance, SEO e experiência do usuário
- Mantenha consistência com o sistema de design especificado

QUALIDADE DE CÓDIGO (ALTA PRIORIDADE):
- Use HTML5 semântico com tags apropriadas (header, nav, main, section, article, aside, footer)
- Implemente meta tags essenciais: viewport, description, charset, og:tags
- Adicione estrutura de dados JSON-LD quando relevante
- Use lazy loading para imagens: loading="lazy"
- Implemente preload para recursos críticos
- Garanta contraste adequado (mínimo 4.5:1 para texto normal)
- Use aria-labels e roles para acessibilidade
- Implemente skip links para navegação por teclado
- Otimize Critical Rendering Path com CSS inline para above-the-fold
- Use CSS Grid e Flexbox de forma eficiente
- Implemente Progressive Enhancement
- Adicione estados de hover, focus e active consistentes
- Use animações CSS performáticas (transform, opacity)
- Implemente error boundaries e fallbacks
- Garanta que funcione sem JavaScript (quando possível)`;

    if (approach === 'mobile-first') {
      return `${baseInstructions}

ABORDAGEM MOBILE-FIRST:
- Priorize a experiência mobile como base do design
- Elementos touch-friendly (mínimo 44px de altura para botões e áreas clicáveis)
- Layout flexível que funciona perfeitamente em telas pequenas (320px+)
- Use breakpoints progressivos: mobile → tablet (768px+) → desktop (1024px+)
- Navegação otimizada para mobile (menu colapsável, navegação inferior quando apropriado)
- Conteúdo hierarquizado para leitura e interação vertical
- Imagens e mídia responsivas com carregamento otimizado
- Prioridade de teste: mobile (375px), tablet (768px), desktop (1200px+)
- Gestos e interações naturais para dispositivos touch`;
    } else {
      return `${baseInstructions}

ABORDAGEM DESKTOP-FIRST:
- Priorize interfaces produtivas e eficientes para desktop
- Layout otimizado para telas grandes com aproveitamento do espaço disponível
- Navegação horizontal com menus expandidos e sidebars quando apropriado
- Aproveite o espaço para dashboards, visualizações e interfaces complexas
- Use breakpoints regressivos: desktop → tablet (1024px-) → mobile (768px-)
- Mantenha funcionalidade completa em mobile através de adaptações inteligentes
- Elementos de interface otimizados para mouse e teclado, mas acessíveis em touch
- Prioridade de teste: desktop (1200px+), tablet (768px), mobile (375px)
- Atalhos de teclado e interações avançadas quando relevante`;
    }
  }
}

export const geminiService = new GeminiService();

// Initialize service
geminiService.init().catch(console.error);