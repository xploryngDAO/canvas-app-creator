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
  private readonly API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  
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
      };

      const response = await this.fetchWithRetry(this.API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        return {
          success: false,
          message: 'Falha na geração de código. Verifique sua chave API.',
          logs
        };
      }

      // Process and clean the generated code
      const cleanedCode = this.processGeneratedCode(generatedText);
      const files = this.extractFiles(cleanedCode, request);

      logs.push('✅ Código gerado com sucesso!');

      return {
        success: true,
        message: 'Código gerado com sucesso!',
        generatedCode: cleanedCode,
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
    return `Você é um desenvolvedor web especialista. Crie um aplicativo web completo usando HTML, CSS (${request.cssFramework}) e JavaScript vanilla com ABORDAGEM MOBILE-FIRST.

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

INSTRUÇÕES IMPORTANTES:
- Retorne APENAS o código HTML completo, sem explicações
- Use ${request.cssFramework} via CDN para estilização
- Inclua JavaScript inline no HTML
- OBRIGATÓRIO: Design MOBILE-FIRST com 100% de responsividade
- Use classes responsivas (sm:, md:, lg:, xl:)
- Inclua meta viewport: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Elementos touch-friendly (mínimo 44px de altura para botões)
- Layout flexível que funciona em todas as telas (320px+)
- Teste mental em: mobile (320px), tablet (768px), desktop (1024px+)
- Priorize experiência mobile, depois adapte para telas maiores
- Garanta que o código seja funcional e completamente responsivo
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
    // Remove markdown code blocks if present
    let cleanedCode = code.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    
    // Fix common issues
    cleanedCode = this.fixUnsplashImages(cleanedCode);
    cleanedCode = this.ensureViewportMeta(cleanedCode);
    
    return cleanedCode.trim();
  }

  private fixUnsplashImages(code: string): string {
    // Replace Unsplash URLs with placeholder images
    return code.replace(
      /https:\/\/images\.unsplash\.com\/[^"'\s)]+/g,
      'https://via.placeholder.com/400x300/6366f1/ffffff?text=Image'
    );
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