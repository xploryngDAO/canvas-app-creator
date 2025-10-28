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
  
  // Configurações de retry
  private readonly MAX_RETRIES = 5; // Aumentado de 3 para 5 para erros 503
  private readonly INITIAL_RETRY_DELAY = 2000; // Aumentado de 1000 para 2000ms
  private readonly MAX_RETRY_DELAY = 30000; // Aumentado de 10000 para 30000ms (30 segundos)
  private readonly TIMEOUT_MS = 45000; // Aumentado de 30000 para 45000ms (45 segundos)
  
  // Status da API
  private isApiAvailable: boolean = true;
  private lastApiCheck: number = 0;
  private readonly API_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
  
  // Queue de mensagens offline
  private offlineQueue: Array<{
    id: string;
    prompt: string;
    timestamp: number;
    retryCount: number;
  }> = [];

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
          const systemPrompt = this.buildAdaptiveSystemPrompt(approach, config);
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

            // Tratar diferentes tipos de erro
            if (response.status === 429) {
              lastError = 'Rate limit excedido';
              console.log(`⏳ [DEBUG] Rate limit na tentativa ${attempt}, aguardando...`);
              
              if (attempt < maxRetries) {
                console.log('🔄 [DEBUG] Aguardando antes de tentar novamente...');
                await this.sleep(5000 * attempt); // Aumentar delay para rate limit
                continue;
              }
            } else if (response.status === 503) {
              lastError = 'Modelo sobrecarregado';
              console.log(`🔄 [DEBUG] Modelo sobrecarregado na tentativa ${attempt}, aguardando...`);
              
              if (attempt < maxRetries) {
                console.log('⏳ [DEBUG] Aguardando modelo ficar disponível...');
                await this.sleep(3000 * attempt); // Delay específico para 503
                continue;
              }
            } else if (response.status === 400) {
              // Erro 400 geralmente indica problema com API key ou formato da requisição
              lastError = 'API Key inválida ou malformada';
              console.error('❌ [ERROR] Erro 400 - possível problema com API Key');
              break; // Não tentar novamente para erro 400
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
    // Verificar se é modo IA Criativa
    if (config.useAICreative === true || config.appType === 'ai-creative') {
      console.log('🎨 [DEBUG] Modo IA Criativa detectado - construindo prompt criativo...');
      return this.buildCreativePrompt(config);
    }
    
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

  private buildCreativePrompt(config: AppConfig): string {
    console.log('🎨 [DEBUG] Construindo prompt criativo de alta qualidade profissional...');
    
    let prompt = `Crie um app web "${config.name}": ${config.description}

📋 ESTRUTURA HTML OBRIGATÓRIA:
- DOCTYPE html5 completo: <!DOCTYPE html>
- Meta tags essenciais: charset UTF-8, viewport responsivo, description
- TAILWIND CSS CDN obrigatório: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts para tipografia: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
- Estrutura HTML5 semântica: <html>, <head>, <body> completos
- Título da página apropriado no <title>

🚨 IMAGENS - REGRA CRÍTICA:
- NUNCA use URLs do Unsplash (source.unsplash.com ou images.unsplash.com)
- SEMPRE use placeholders SVG inline codificados em base64
- Para imagens de produtos: use SVG com ícone de produto
- Para avatares: use SVG com ícone de usuário
- Para backgrounds: use gradientes CSS ou SVG patterns
- Exemplo: <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtPC90ZXh0Pgo8L3N2Zz4K" alt="Placeholder">

🎯 DIRETRIZES DE DESIGN PROFISSIONAL:
- Use TAILWIND CSS como framework principal para consistência
- Implemente design system moderno com paleta de cores profissional
- Siga padrões de aplicações como Notion, Linear, Vercel, Figma
- Garanta qualidade visual comparável a Tailwind UI e Shadcn/ui

🎨 SISTEMA DE CORES E TIPOGRAFIA:
- Paleta principal: slate/gray para neutros, blue/indigo para primary, emerald/green para success, red para danger
- Tipografia: Inter, Roboto ou Poppins como fonte principal
- Hierarquia clara: text-4xl/3xl para títulos, text-lg/base para corpo, text-sm para labels
- Espaçamentos consistentes: 4, 8, 12, 16, 24, 32, 48, 64px (p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16)

🏗️ ESTRUTURA DE LAYOUT PROFISSIONAL:
- Header fixo (sticky top-0) com navegação clara e logo
- Sidebar responsiva com menu hambúrguer no mobile (hidden md:block)
- Grid layouts bem estruturados (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Container centralizado (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8)
- Breakpoints responsivos: sm:640px, md:768px, lg:1024px, xl:1280px

🧩 COMPONENTES MODERNOS OBRIGATÓRIOS:
- Cards: bg-white rounded-xl shadow-sm border border-gray-200 p-6
- Botões: Primary (bg-blue-600 hover:bg-blue-700), Secondary (bg-gray-100 hover:bg-gray-200)
- Inputs: border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg
- Modais: backdrop-blur-sm bg-black/50 com animações de entrada/saída
- Navegação: indicadores visuais ativos, hover states, breadcrumbs se necessário

✨ RECURSOS VISUAIS DE QUALIDADE:
- Ícones: Use Heroicons ou Lucide (SVG inline) para consistência
- Gradientes sutis: from-blue-50 to-indigo-100 para backgrounds
- Sombras profissionais: shadow-sm, shadow-md, shadow-lg conforme contexto
- Bordas arredondadas: rounded-lg para cards, rounded-full para avatars
- Estados hover/focus bem definidos com transições suaves

🎭 MICRO-INTERAÇÕES E ANIMAÇÕES:
- Transições: transition-all duration-200 ease-in-out
- Hover effects: transform hover:scale-105, hover:shadow-lg
- Loading states: spinners elegantes ou skeleton loaders
- Feedback visual: toast notifications, success/error states
- Animações de entrada: fade-in, slide-in conforme apropriado

📱 MOBILE FIRST OBRIGATÓRIO - PADRÕES EXEMPLARES:
- SEMPRE design mobile-first com breakpoints progressivos: sm:640px, md:768px, lg:1024px, xl:1280px
- Header mobile específico: "md:hidden" com menu hambúrguer funcional
- Sidebar responsiva: "fixed inset-y-0 left-0 w-64 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50"
- Touch targets obrigatórios: min-h-[44px] min-w-[44px] para botões e inputs (classe .btn-touch)
- Grid responsivo progressivo: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
- Navegação mobile: botão hambúrguer com overlay e transições suaves
- Sticky positioning: "sticky top-0 z-40" para headers mobile
- Overflow handling: "overflow-hidden" no container principal, "overflow-y-auto" no conteúdo
- Flexbox adaptativo: "flex flex-col min-h-screen" para layout principal
- Espaçamentos responsivos: "p-4 md:p-8", "mb-4 sm:mb-0"

🔧 FUNCIONALIDADES AVANÇADAS:
- Validação de formulários com feedback visual em tempo real
- Estados de loading com spinners ou progress bars
- Drag & drop se relevante (com feedback visual)
- Busca/filtros funcionais se aplicável
- Persistência com localStorage quando necessário
- Tratamento de estados vazios com ilustrações ou mensagens

🎯 PADRÕES DE UX INTUITIVA OBRIGATÓRIOS:
- Navegação com indicadores visuais ativos: "active-nav bg-orange-600 text-white" para item selecionado
- Estados hover bem definidos: "hover:bg-orange-600 hover:text-white transition-colors duration-200"
- Hierarquia visual clara: títulos h1/h2/h3 com cores distintivas (text-orange-500, text-orange-400)
- Call-to-actions destacados: botões primários com cores vibrantes e hover effects
- Feedback imediato: loading states, success/error messages, toast notifications
- Fluxos claros: breadcrumbs, progress indicators, step-by-step wizards quando aplicável
- Acessibilidade obrigatória: aria-label em todos os botões, semantic HTML5, contraste WCAG AA
- Estados de foco visíveis: focus:outline-none focus:ring-2 focus:ring-orange-500
- Micro-interações: transform hover:scale-105, transition-all duration-200 ease-in-out
- Consistência visual: paleta de cores unificada, tipografia harmoniosa, espaçamentos regulares

🤖 INTEGRAÇÃO DE IA RESPONSIVA (QUANDO SOLICITADO):
- Interface de chat responsiva: textarea auto-expansível com "resize-none" e "rows=1"
- Layout de conversa: avatares, mensagens alinhadas, timestamps
- Estados de loading: spinners durante processamento de IA
- Feedback visual: indicadores de digitação, status de conexão
- Persistência: localStorage para histórico de conversas
- Acessibilidade: aria-label descritivos, navegação por teclado
- Design adaptativo: interface compacta no mobile, expandida no desktop
- Integração suave: seção dedicada sem interferir no fluxo principal

💡 INSPIRAÇÃO E INOVAÇÃO RESPONSIVA:
- Analise o contexto e implemente funcionalidades inteligentes adaptáveis
- Padrões modernos responsivos: sticky headers mobile, floating action buttons touch-friendly
- Dark mode consistente: bg-gray-900, bg-gray-800, text-gray-100 em toda aplicação
- Layouts inovadores mas funcionais: cards adaptativos, grids flexíveis
- Recursos úteis responsivos: busca mobile-friendly, filtros em drawer/modal
- Performance mobile: lazy loading, debounce em buscas, otimização de imagens

🚀 QUALIDADE TÉCNICA:
- Código HTML5 semântico e bem estruturado
- CSS otimizado com Tailwind classes utilitárias
- JavaScript vanilla moderno (ES6+) para interatividade
- Performance otimizada: lazy loading, debounce em buscas
- Compatibilidade cross-browser
- Meta tags apropriadas para SEO e responsividade

🔧 VALIDAÇÃO DE QUALIDADE OBRIGATÓRIA:
- Verificar se o Tailwind CSS CDN está incluído no <head>
- Garantir que todos os componentes tenham classes Tailwind aplicadas
- Testar responsividade em breakpoints: sm, md, lg, xl
- Validar que o HTML é completo e funcional
- Confirmar que JavaScript está funcionando corretamente
- Assegurar que fontes estão carregando adequadamente

📤 FORMATO DE SAÍDA ESPECÍFICO:
- Retornar HTML completo iniciando com <!DOCTYPE html>
- Incluir OBRIGATORIAMENTE o Tailwind CSS CDN no <head>
- Estrutura completa: <html lang="pt-BR"><head>...</head><body>...</body></html>
- Todos os estilos devem usar classes Tailwind (não CSS inline)
- JavaScript deve estar no final do <body> ou em <script> tags
- Não incluir explicações, comentários ou markdown - APENAS HTML puro

IMPORTANTE: O resultado DEVE ser um arquivo HTML completo e funcional que pode ser aberto diretamente no navegador com todos os estilos Tailwind aplicados corretamente. Qualidade profissional é obrigatória!`;

    console.log('🎨 [DEBUG] Prompt criativo aprimorado construído:', {
      length: prompt.length,
      projectName: config.name,
      description: config.description?.substring(0, 100) + '...'
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
      console.warn('⚠️ [API_STATUS] API Key não configurada');
      return { success: false, error: 'API Key não configurada' };
    }

    try {
      console.log('🔍 [API_STATUS] Testando conexão com API Gemini...', {
        apiKeyPreview: this.apiKey.substring(0, 10) + '...',
        model: this.model,
        timestamp: new Date().toISOString()
      });

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

      // Usar getApiUrl() para garantir que temos a URL correta
      const apiUrl = this.getApiUrl();
      const fullUrl = `${apiUrl}?key=${this.apiKey}`;

      console.log('🌐 [API_STATUS] Enviando requisição de teste:', {
        apiUrl: apiUrl,
        model: this.model,
        baseUrl: this.baseUrl
      });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 [API_STATUS] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API_STATUS] Teste de conexão falhou:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200) + '...'
        });
        
        // Atualizar status da API baseado no resultado
        this.isApiAvailable = false;
        this.lastApiCheck = Date.now();
        
        if (response.status === 400) {
          console.error('❌ [API_STATUS] API Key inválida (400)');
          return { success: false, error: 'API Key inválida ou malformada. Verifique se a chave está correta.' };
        } else if (response.status === 403) {
          console.error('❌ [API_STATUS] API Key sem permissões (403)');
          return { success: false, error: 'API Key sem permissões ou projeto inválido' };
        } else if (response.status === 429) {
          console.warn('⚠️ [API_STATUS] Quota excedida (429)');
          return { success: false, error: 'Quota excedida ou rate limit atingido. Aguarde alguns minutos.' };
        } else if (response.status === 503) {
          console.warn('⚠️ [API_STATUS] Modelo sobrecarregado (503)');
          return { success: false, error: 'Modelo temporariamente sobrecarregado. Tente novamente em alguns minutos.' };
        }
        
        return { success: false, error: `Erro ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('✅ [API_STATUS] Teste de conexão bem-sucedido!', {
        hasResponse: !!data,
        candidatesCount: data.candidates?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Atualizar status da API como disponível
      this.isApiAvailable = true;
      this.lastApiCheck = Date.now();

      console.log('🟢 [API_STATUS] API Gemini está ONLINE e funcionando');

      return { success: true, quotaInfo: data };
    } catch (error) {
      console.error('❌ [API_STATUS] Erro no teste de conexão:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
      
      // Atualizar status da API como indisponível
      this.isApiAvailable = false;
      this.lastApiCheck = Date.now();
      
      console.log('🔴 [API_STATUS] API Gemini está OFFLINE');
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na conexão' 
      };
    }
  }

  // Método para forçar teste de conexão e atualizar status
  async forceConnectionTest(): Promise<{ success: boolean; error?: string; quotaInfo?: any }> {
    console.log('🔄 [FORCE_TEST] Forçando teste de conexão...');
    
    // Resetar cache de verificação para forçar novo teste
    this.lastApiCheck = 0;
    
    const result = await this.testConnection();
    
    console.log('📊 [FORCE_TEST] Resultado do teste forçado:', {
      success: result.success,
      error: result.error,
      apiAvailable: this.isApiAvailable
    });
    
    return result;
  }

  // Método para obter status atual da API
  getApiStatus(): { available: boolean; lastCheck: number } {
    return {
      available: this.isApiAvailable,
      lastCheck: this.lastApiCheck
    };
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

  /**
   * Calcula o delay para retry com backoff exponencial
   */
  private calculateRetryDelay(attempt: number): number {
    // Delay especial mais longo para erros 503 (serviço indisponível)
    const baseDelay = this.INITIAL_RETRY_DELAY;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), this.MAX_RETRY_DELAY);
    
    // Adicionar jitter para evitar thundering herd
    const jitter = Math.random() * 1000;
    
    return exponentialDelay + jitter;
  }

  /**
   * Verifica se o erro é recuperável (pode ser retentado)
   */
  private isRetryableError(status: number): boolean {
    // Incluir mais códigos de erro recuperáveis e dar prioridade especial ao 503
    return [429, 500, 502, 503, 504, 520, 521, 522, 523, 524].includes(status);
  }

  /**
   * Cria um timeout para requisições
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: Requisição excedeu ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Executa uma requisição com retry automático
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'operação'
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 [GEMINI_RETRY] Tentativa ${attempt + 1}/${this.MAX_RETRIES + 1} para ${operationName}`);
        
        // Executa a operação com timeout
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise(this.TIMEOUT_MS)
        ]);
        
        console.log(`✅ [GEMINI_RETRY] ${operationName} bem-sucedida na tentativa ${attempt + 1}`);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`⚠️ [GEMINI_RETRY] Tentativa ${attempt + 1} falhou para ${operationName}:`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: this.MAX_RETRIES + 1
        });

        // Se não é o último retry e o erro é recuperável
        if (attempt < this.MAX_RETRIES) {
          // Verifica se é um erro HTTP recuperável
          const isHttpError = lastError.message.includes('Erro na API:');
          const statusMatch = lastError.message.match(/Erro na API: (\d+)/);
          const status = statusMatch ? parseInt(statusMatch[1]) : 0;
          
          // Lógica especial para erro 503 (serviço indisponível)
          const is503Error = status === 503 || lastError.message.includes('503') || lastError.message.includes('indisponível');
          
          if (is503Error) {
            // Para erro 503, sempre tentar novamente com delay maior
            const delay = this.calculateRetryDelay(attempt) * 2; // Dobrar o delay para 503
            console.log(`⏳ [GEMINI_RETRY] Erro 503 detectado - aguardando ${delay}ms antes da próxima tentativa...`);
            await this.sleep(delay);
            continue;
          } else if (isHttpError && this.isRetryableError(status)) {
            const delay = this.calculateRetryDelay(attempt);
            console.log(`⏳ [GEMINI_RETRY] Aguardando ${delay}ms antes da próxima tentativa...`);
            await this.sleep(delay);
            continue;
          } else if (!isHttpError && (
            lastError.message.includes('Timeout') ||
            lastError.message.includes('fetch') ||
            lastError.message.includes('network') ||
            lastError.message.includes('NetworkError') ||
            lastError.message.includes('overloaded') ||
            lastError.message.includes('UNAVAILABLE')
          )) {
            // Retry para erros de rede/timeout/overload
            const delay = this.calculateRetryDelay(attempt);
            console.log(`⏳ [GEMINI_RETRY] Aguardando ${delay}ms antes da próxima tentativa (erro de rede/overload)...`);
            await this.sleep(delay);
            continue;
          }
        }
        
        // Se chegou aqui, não deve fazer retry
        break;
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error(`❌ [GEMINI_RETRY] Todas as tentativas falharam para ${operationName}:`, lastError);
    throw lastError;
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
   * Constrói um system prompt adaptativo que detecta o modo IA Criativa
   */
  private buildAdaptiveSystemPrompt(approach: 'mobile-first' | 'desktop-first', config?: AppConfig): string {
    // Detectar se é modo IA Criativa
    const isCreativeMode = config?.useAICreative === true || config?.appType === 'ai-creative';
    
    if (isCreativeMode) {
      console.log('🎨 [DEBUG] Aplicando system prompt minimalista para IA Criativa...');
      // System prompt minimalista para total liberdade criativa
      return `Você é um desenvolvedor web criativo e inovador. Crie um aplicativo web COMPLETO e FUNCIONAL baseado na descrição fornecida.

LIBERDADE TOTAL:
- Escolha livremente a melhor tecnologia e abordagem
- Crie designs únicos e inovadores
- Implemente funcionalidades criativas
- Use sua experiência para tomar as melhores decisões

REQUISITOS BÁSICOS:
- Retorne APENAS o código HTML completo, sem explicações
- Garanta que o código seja funcional e responsivo
- Siga as melhores práticas de desenvolvimento web
- Foque na experiência do usuário e qualidade visual

Seja criativo e inovador!`;
    }

    // System prompt padrão com diretrizes específicas
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

  // Verificar se a API está disponível
  async checkApiStatus(): Promise<boolean> {
    const now = Date.now();
    
    // Se já verificamos recentemente, usar cache
    if (now - this.lastApiCheck < this.API_CHECK_INTERVAL) {
      return this.isApiAvailable;
    }
    
    try {
      const result = await this.testConnection();
      this.isApiAvailable = result.success;
      this.lastApiCheck = now;
      
      console.log('🔍 [API_STATUS] Status da API verificado:', {
        available: this.isApiAvailable,
        timestamp: new Date(now).toISOString()
      });
      
      return this.isApiAvailable;
    } catch (error) {
      this.isApiAvailable = false;
      this.lastApiCheck = now;
      console.warn('⚠️ [API_STATUS] Falha na verificação da API:', error);
      return false;
    }
  }

  // Gerar resposta simulada para modo offline
  private generateOfflineResponse(prompt: string): string {
    const responses = [
      "Desculpe, estou temporariamente offline. Esta é uma resposta simulada para demonstrar a funcionalidade.",
      "A API Gemini está indisponível no momento. Aqui está uma resposta de exemplo para manter a funcionalidade.",
      "Modo offline ativo. Esta é uma resposta simulada enquanto a API está indisponível.",
      "Serviço temporariamente indisponível. Resposta de demonstração sendo exibida.",
      "API offline - Esta é uma resposta de fallback para manter a experiência do usuário."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Adicionar contexto baseado no prompt se possível
    if (prompt.toLowerCase().includes('código') || prompt.toLowerCase().includes('code')) {
      return `${randomResponse}\n\n// Exemplo de código (modo offline)\nfunction exemploOffline() {\n  console.log('API indisponível - modo demo ativo');\n  return 'Resposta simulada';\n}`;
    }
    
    return randomResponse;
  }

  // Adicionar mensagem à queue offline
  private addToOfflineQueue(prompt: string): string {
    const messageId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.offlineQueue.push({
      id: messageId,
      prompt,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    console.log('📥 [OFFLINE_QUEUE] Mensagem adicionada à queue:', {
      id: messageId,
      queueSize: this.offlineQueue.length
    });
    
    return messageId;
  }

  // Processar queue offline quando API voltar
  async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !this.isApiAvailable) {
      return;
    }
    
    console.log('🔄 [OFFLINE_QUEUE] Processando queue offline:', {
      queueSize: this.offlineQueue.length
    });
    
    const queueCopy = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const message of queueCopy) {
      try {
        await this.generateWithPrompt(message.prompt);
        console.log('✅ [OFFLINE_QUEUE] Mensagem processada:', message.id);
      } catch (error) {
        console.error('❌ [OFFLINE_QUEUE] Falha ao processar mensagem:', message.id, error);
        
        // Re-adicionar à queue se não excedeu tentativas
        if (message.retryCount < 3) {
          message.retryCount++;
          this.offlineQueue.push(message);
        }
      }
    }
  }

  // Obter status da queue offline
  getOfflineQueueStatus(): { size: number; messages: Array<{ id: string; timestamp: number; retryCount: number }> } {
    return {
      size: this.offlineQueue.length,
      messages: this.offlineQueue.map(msg => ({
        id: msg.id,
        timestamp: msg.timestamp,
        retryCount: msg.retryCount
      }))
    };
  }

  async generateWithPrompt(prompt: string): Promise<{ success: boolean; content?: string; error?: string; isOffline?: boolean; queueId?: string }> {
    // Verificar se a API está disponível
    const apiAvailable = await this.checkApiStatus();
    
    if (!apiAvailable) {
      console.log('🔌 [OFFLINE_MODE] API indisponível, ativando modo offline');
      
      const queueId = this.addToOfflineQueue(prompt);
      const offlineContent = this.generateOfflineResponse(prompt);
      
      return {
        success: true,
        content: offlineContent,
        isOffline: true,
        queueId
      };
    }

    return this.executeWithRetry(async () => {
      if (!this.apiKey) {
        throw new Error('API key não configurada');
      }
    
      if (!this.isValidApiKeyFormat(this.apiKey)) {
        throw new Error('Formato da API key inválido. A chave deve começar com "AIza" e ter pelo menos 35 caracteres.');
      }
    
      console.log('🔑 [GEMINI_DEBUG] Verificação da API Key:', {
        hasApiKey: !!this.apiKey,
        keyLength: this.apiKey?.length,
        keyPrefix: this.apiKey?.substring(0, 4),
        isValidFormat: this.isValidApiKeyFormat(this.apiKey),
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
        
        // Marcar API como indisponível em caso de erro 503
        if (response.status === 503) {
          this.isApiAvailable = false;
          this.lastApiCheck = Date.now();
        }
        
        // Mensagens de erro mais amigáveis
        let errorMessage = '';
        switch (response.status) {
          case 429:
            errorMessage = 'Limite de requisições excedido. Aguarde um momento antes de tentar novamente.';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível. Tentando novamente...';
            break;
          case 502:
            errorMessage = 'Erro no servidor. Tentando reconectar...';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tentando novamente...';
            break;
          default:
            errorMessage = `Erro na API: ${response.status} - ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('✅ [SUCCESS] Resposta da API recebida:', data);
  
      if (data.candidates && data.candidates.length > 0) {
        const content = data.candidates[0].content?.parts?.[0]?.text || '';
        
        // Marcar API como disponível após sucesso
        this.isApiAvailable = true;
        this.lastApiCheck = Date.now();
        
        // Processar queue offline se houver mensagens pendentes
        if (this.offlineQueue.length > 0) {
          setTimeout(() => this.processOfflineQueue(), 1000);
        }
        
        return { success: true, content };
      } else {
        throw new Error('Resposta inválida da API');
      }
    }, 'generateWithPrompt').catch(error => {
      console.error('❌ [FINAL_ERROR] Erro final após todas as tentativas:', error);
      
      // Marcar API como indisponível após falhas consecutivas
      this.isApiAvailable = false;
      this.lastApiCheck = Date.now();
      
      // Mensagens de erro finais mais amigáveis
      let finalErrorMessage = '';
      if (error.message.includes('timeout')) {
        finalErrorMessage = 'Timeout: A requisição demorou muito para responder. Verifique sua conexão.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        finalErrorMessage = 'Erro de conexão: Verifique sua internet e tente novamente.';
      } else if (error.message.includes('503')) {
        finalErrorMessage = 'Serviço indisponível: A API Gemini está temporariamente fora do ar. Modo offline ativado.';
      } else {
        finalErrorMessage = error.message;
      }
      
      return { success: false, error: finalErrorMessage };
    });
  }
}

export const geminiService = new GeminiService();

// Initialize service
geminiService.init().catch(console.error);
