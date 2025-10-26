import { SettingsService } from './SettingsService';

export interface CodeGenerationRequest {
  projectId: string;
  appType: string;
  frontendStack: string;
  cssFramework: string;
  colorTheme: string;
  mainFont: string;
  layoutStyle: string;
  enableAuth: boolean;
  enableDatabase: boolean;
  enablePayments: boolean;
  customPrompt?: string;
}

export interface CodeGenerationResponse {
  success: boolean;
  message: string;
  generatedCode?: string;
  files?: GeneratedFile[];
  logs?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'md';
}

export class CodeGenerationService {
  constructor(private settingsService: SettingsService) {}

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      const apiKey = await this.settingsService.getGeminiApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          message: 'Chave API do Gemini não configurada'
        };
      }

      // Get selected model from settings
      const modelSetting = await this.settingsService.getSetting('geminiModel');
      const selectedModel = modelSetting ? modelSetting.value : 'gemini-1.5-flash-002';
      const API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

      console.log('🔍 [DEBUG] CodeGenerationService - Usando modelo:', {
        selectedModel,
        API_BASE_URL,
        modelSetting
      });

      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const logs = [
        '🤖 Conectando com Gemini AI...',
        '📝 Gerando prompt do sistema...',
        '⚡ Processando configurações do projeto...',
        '🎨 Aplicando estilos e tema...',
        '🔧 Gerando código funcional...'
      ];

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topP: 0.8,
          topK: 40
        }
      };

      console.log('🔍 [DEBUG] System Prompt enviado:', systemPrompt);
      console.log('🔍 [DEBUG] User Prompt enviado:', userPrompt);
      console.log('🔍 [DEBUG] Payload completo:', JSON.stringify(payload, null, 2));

      const response = await this.fetchWithRetry(API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('🔍 [DEBUG] Resposta completa da API:', JSON.stringify(result, null, 2));
      
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('🔍 [DEBUG] Texto gerado (primeiros 500 chars):', generatedText?.slice(0, 500));

      if (!generatedText) {
        console.error('🔍 [DEBUG] Falha na geração - sem texto gerado');
        return {
          success: false,
          message: 'Falha na geração de código. Verifique sua chave API.',
          logs
        };
      }

      // Process the generated code
      console.log('🔍 [DEBUG] Iniciando processamento do código...');
      const processedCode = this.processGeneratedCode(generatedText);
      console.log('🔍 [DEBUG] Código processado (primeiros 500 chars):', processedCode.slice(0, 500));
      
      const files = this.extractFiles(processedCode, request);
      console.log('🔍 [DEBUG] Arquivos extraídos:', files.map(f => ({ path: f.path, type: f.type, size: f.content.length })));

      logs.push('✅ Código gerado com sucesso!');

      return {
        success: true,
        message: 'Código gerado com sucesso!',
        generatedCode: processedCode,
        files,
        logs
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido na geração',
        logs: ['❌ Erro na geração de código']
      };
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    // Configuração dinâmica do CSS Framework
    const getCssFrameworkInstructions = () => {
      switch (request.cssFramework.toLowerCase()) {
        case 'tailwind':
          return {
            framework: 'Tailwind CSS via CDN',
            classes: 'Use classes responsivas do Tailwind (sm:, md:, lg:, xl:)',
            instructions: '- Use Tailwind CSS via CDN para estilização'
          };
        case 'bootstrap':
          return {
            framework: 'Bootstrap CSS via CDN',
            classes: 'Use classes responsivas do Bootstrap (col-sm-, col-md-, col-lg-, col-xl-)',
            instructions: '- Use Bootstrap CSS via CDN para estilização'
          };
        case 'bulma':
          return {
            framework: 'Bulma CSS via CDN',
            classes: 'Use classes responsivas do Bulma (is-mobile, is-tablet, is-desktop)',
            instructions: '- Use Bulma CSS via CDN para estilização'
          };
        case 'css':
        case 'pure':
        default:
          return {
            framework: 'CSS puro',
            classes: 'Use media queries para responsividade (@media screen and (min-width: ...))',
            instructions: '- Use CSS puro com media queries para estilização'
          };
      }
    };

    // Configuração dinâmica do Frontend Stack
    const getFrontendStackInstructions = () => {
      switch (request.frontendStack.toLowerCase()) {
        case 'react':
          return {
            structure: 'componentes React funcionais com JSX',
            output: 'Retorne APENAS o código JSX dos componentes principais, sem explicações',
            javascript: 'Use React hooks (useState, useEffect) conforme necessário',
            includes: '- Inclua imports necessários do React'
          };
        case 'vue':
          return {
            structure: 'componentes Vue 3 com Composition API',
            output: 'Retorne APENAS o código Vue SFC (Single File Component), sem explicações',
            javascript: 'Use Vue 3 Composition API (ref, reactive, computed) conforme necessário',
            includes: '- Inclua imports necessários do Vue'
          };
        case 'angular':
          return {
            structure: 'componentes Angular com TypeScript',
            output: 'Retorne APENAS o código Angular (component.ts e template), sem explicações',
            javascript: 'Use Angular services e dependency injection conforme necessário',
            includes: '- Inclua imports necessários do Angular'
          };
        case 'html-vanilla':
          return {
            structure: 'HTML completo com CSS e JavaScript vanilla',
            output: 'Retorne APENAS o código HTML completo com CSS inline ou externo e JavaScript vanilla, sem explicações',
            javascript: 'Use JavaScript vanilla puro (sem frameworks) - pode ser inline no HTML ou em tags <script>',
            includes: '- Inclua meta viewport: <meta name="viewport" content="width=device-width, initial-scale=1.0">\n- Use HTML5 semântico\n- CSS pode ser inline no <style> ou externo\n- JavaScript vanilla para interatividade'
          };
        case 'html':
        case 'vanilla':
        default:
          return {
            structure: 'HTML completo com JavaScript vanilla',
            output: 'Retorne APENAS o código HTML completo, sem explicações',
            javascript: 'Inclua JavaScript inline no HTML',
            includes: '- Inclua meta viewport: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
          };
      }
    };

    const cssConfig = getCssFrameworkInstructions();
    const frontendConfig = getFrontendStackInstructions();

    return `Você é um desenvolvedor web especialista. Crie um aplicativo web completo usando ${frontendConfig.structure} com ABORDAGEM MOBILE-FIRST.

INSTRUÇÕES IMPORTANTES:
- ${frontendConfig.output}
- ${cssConfig.instructions}
- ${frontendConfig.javascript}
- OBRIGATÓRIO: Design MOBILE-FIRST com 100% de responsividade
- ${cssConfig.classes}
- ${frontendConfig.includes}
- Elementos touch-friendly (mínimo 44px de altura para botões)
- Layout flexível que funciona em todas as telas (320px+)
- Teste mental em: mobile (320px), tablet (768px), desktop (1024px+)
- Priorize experiência mobile, depois adapte para telas maiores
- Garanta que o código seja funcional e completamente responsivo

CONFIGURAÇÕES DO PROJETO:
- Tipo: ${request.appType}
- Stack Frontend: ${request.frontendStack}
- Framework CSS: ${request.cssFramework}
- Tema de Cores: ${request.colorTheme}
- Fonte Principal: ${request.mainFont}
- Estilo de Layout: ${request.layoutStyle}
- Autenticação: ${request.enableAuth ? 'Habilitada' : 'Desabilitada'}
- Banco de Dados: ${request.enableDatabase ? 'Habilitado' : 'Desabilitado'}
- Pagamentos: ${request.enablePayments ? 'Habilitados' : 'Desabilitados'}

APLICAÇÃO DAS CONFIGURAÇÕES:
- Aplique o tema de cores ${request.colorTheme} consistentemente
- Use a fonte ${request.mainFont} como fonte principal
- Implemente o estilo de layout ${request.layoutStyle}

${request.enableAuth ? '- Inclua sistema básico de login/registro' : ''}
${request.enableDatabase ? '- Simule operações de banco de dados com localStorage' : ''}
${request.enablePayments ? '- Inclua interface de pagamento simulada' : ''}`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = `Crie um ${request.appType} completo e funcional`;
    
    if (request.customPrompt) {
      prompt += ` com as seguintes especificações: ${request.customPrompt}`;
    }
    
    prompt += `. Garanta que seja totalmente responsivo e siga as configurações especificadas no prompt do sistema.`;
    
    return prompt;
  }

  private async fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private processGeneratedCode(code: string): string {
    console.log('🔍 [DEBUG] Código original (primeiros 200 chars):', code.slice(0, 200));
    
    // Remove markdown code blocks if present
    let cleanedCode = code.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    console.log('🔍 [DEBUG] Após remoção markdown (primeiros 200 chars):', cleanedCode.slice(0, 200));
    
    // Remove any leading/trailing whitespace
    cleanedCode = cleanedCode.trim();
    
    // Fix Unsplash images
    console.log('🔍 [DEBUG] Aplicando fixUnsplashImages...');
    cleanedCode = this.fixUnsplashImages(cleanedCode);
    
    // Ensure viewport meta tag
    console.log('🔍 [DEBUG] Verificando viewport meta...');
    cleanedCode = this.ensureViewportMeta(cleanedCode);
    
    console.log('🔍 [DEBUG] Código final processado (primeiros 200 chars):', cleanedCode.slice(0, 200));
    return cleanedCode;
  }

  private fixUnsplashImages(code: string): string {
    // Função para criar SVG placeholder
    const createPlaceholderSVG = (width = 400, height = 300, text = 'Imagem') => {
      const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#e5e7eb"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">${text}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    };

    // Mapear URLs do Unsplash para placeholders específicos
    const unsplashReplacements: { [key: string]: string } = {
      'https://images.unsplash.com/photo-1620917637841-3b7c25143a4e': createPlaceholderSVG(400, 300, 'Paleta de Sombras'),
      'https://images.unsplash.com/photo-1622384992984-78326e7922d5': createPlaceholderSVG(400, 300, 'Rímel'),
      'https://images.unsplash.com/photo-1590890289136-11f44e156475': createPlaceholderSVG(400, 300, 'Blush Pêssego'),
      'https://images.unsplash.com/photo-1596420455447-b2488a03f47c': createPlaceholderSVG(400, 300, 'Iluminador'),
      'https://images.unsplash.com/photo-1616782299596-9818817a22ed': createPlaceholderSVG(400, 300, 'Corretivo'),
      'https://images.unsplash.com/photo-1632731853610-c4e9f7833a6f': createPlaceholderSVG(400, 300, 'Base HD'),
      'https://images.unsplash.com/photo-1603525547653-379e4d0d046f': createPlaceholderSVG(400, 300, 'Delineador')
    };

    let fixedCode = code;
    
    // Substituir URLs completas do Unsplash
    Object.keys(unsplashReplacements).forEach(originalUrl => {
      const regex = new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"\'\\s]*', 'g');
      fixedCode = fixedCode.replace(regex, unsplashReplacements[originalUrl]);
    });

    // Substituir qualquer URL do Unsplash restante (incluindo variações com parâmetros)
    fixedCode = fixedCode.replace(/https:\/\/images\.unsplash\.com\/[^"'\s>]*/g, createPlaceholderSVG(400, 300, 'Produto'));
    
    // Substituir também URLs do Unsplash sem https
    fixedCode = fixedCode.replace(/http:\/\/images\.unsplash\.com\/[^"'\s>]*/g, createPlaceholderSVG(400, 300, 'Produto'));
    
    // Substituir URLs do Unsplash em atributos src, srcset, data-src, etc.
    fixedCode = fixedCode.replace(/(src|srcset|data-src|background-image|url)\s*[:=]\s*["']?https?:\/\/images\.unsplash\.com\/[^"'\s>)]*["']?/gi, 
      (match, attr) => `${attr}="${createPlaceholderSVG(400, 300, 'Produto')}"`);
    
    return fixedCode;
  }

  private ensureViewportMeta(code: string): string {
    if (!code.includes('viewport')) {
      const headMatch = code.match(/<head[^>]*>/i);
      if (headMatch) {
        const insertIndex = headMatch.index! + headMatch[0].length;
        const viewportMeta = '\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">';
        code = code.slice(0, insertIndex) + viewportMeta + code.slice(insertIndex);
      }
    }
    return code;
  }

  private extractFiles(code: string, request: CodeGenerationRequest): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Main HTML file
    files.push({
      path: 'index.html',
      content: code,
      type: 'html'
    });

    // Generate package.json if needed
    if (request.frontendStack !== 'vanilla') {
      files.push({
        path: 'package.json',
        content: this.generatePackageJson(request),
        type: 'json'
      });
    }

    // Generate README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(request),
      type: 'md'
    });

    return files;
  }

  private generatePackageJson(request: CodeGenerationRequest): string {
    const packageJson = {
      name: request.projectId.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: '1.0.0',
      description: `${request.appType} criado com Canvas App Creator`,
      main: 'index.html',
      scripts: {
        start: 'serve -s .',
        build: 'echo "Build completed"'
      },
      dependencies: {},
      devDependencies: {
        serve: '^14.0.0'
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  private generateReadme(request: CodeGenerationRequest): string {
    return `# ${request.projectId}

${request.appType} criado com Canvas App Creator

## Configurações do Projeto

- **Tipo**: ${request.appType}
- **Stack Frontend**: ${request.frontendStack}
- **Framework CSS**: ${request.cssFramework}
- **Tema**: ${request.colorTheme}
- **Fonte**: ${request.mainFont}
- **Layout**: ${request.layoutStyle}
- **Autenticação**: ${request.enableAuth ? 'Habilitada' : 'Desabilitada'}
- **Banco de Dados**: ${request.enableDatabase ? 'Habilitado' : 'Desabilitado'}
- **Pagamentos**: ${request.enablePayments ? 'Habilitados' : 'Desabilitados'}

## Como executar

1. Abra o arquivo \`index.html\` em um navegador
2. Ou use um servidor local: \`npx serve .\`

## Recursos

- 📱 Design Mobile-First
- 🎨 Interface Responsiva
- ⚡ Performance Otimizada
- 🔧 Código Limpo e Organizado

Criado com ❤️ pelo Canvas App Creator
`;
  }
}