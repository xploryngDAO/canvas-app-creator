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
      const selectedModel = modelSetting ? modelSetting.value : 'gemini-2.5-flash';
      const API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

      console.log('🔍 [DEBUG] CodeGenerationService - Usando modelo:', {
        selectedModel,
        API_BASE_URL,
        modelSetting
      });

      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      console.log('🎯 [CONFIG] Configurações aplicadas:', {
        modelo: selectedModel,
        tipo: request.appType,
        frontend: request.frontendStack,
        css: request.cssFramework,
        tema: request.colorTheme,
        fonte: request.mainFont,
        layout: request.layoutStyle,
        auth: request.enableAuth,
        database: request.enableDatabase,
        payments: request.enablePayments
      });

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

    const cssConfig = getCssFrameworkInstructions();

    // Templates específicos para componentes funcionais
    const getComponentTemplates = () => {
      const templates = {
        kanban: `
// TEMPLATE KANBAN FUNCIONAL:
const kanbanData = JSON.parse(localStorage.getItem('kanbanData')) || {
  todo: [], inProgress: [], done: []
};

function createTask(title, description, column = 'todo') {
  const task = {
    id: Date.now(),
    title,
    description,
    column,
    createdAt: new Date().toISOString()
  };
  kanbanData[column].push(task);
  saveKanban();
  renderKanban();
}

function moveTask(taskId, fromColumn, toColumn) {
  const taskIndex = kanbanData[fromColumn].findIndex(t => t.id == taskId);
  if (taskIndex > -1) {
    const task = kanbanData[fromColumn].splice(taskIndex, 1)[0];
    task.column = toColumn;
    kanbanData[toColumn].push(task);
    saveKanban();
    renderKanban();
  }
}

function saveKanban() {
  localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
}`,

        calendar: `
// TEMPLATE CALENDÁRIO FUNCIONAL:
const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};

function addEvent(date, title, description) {
  if (!calendarData[date]) calendarData[date] = [];
  calendarData[date].push({
    id: Date.now(),
    title,
    description,
    time: new Date().toLocaleTimeString()
  });
  saveCalendar();
  renderCalendar();
}

function saveCalendar() {
  localStorage.setItem('calendarData', JSON.stringify(calendarData));
}

function renderCalendar() {
  // Implementar renderização do calendário
}`,

        assistant: `
// TEMPLATE ASSISTENTE IA FUNCIONAL:
const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

function sendMessage(message) {
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  chatHistory.push(userMessage);
  
  // Simular resposta da IA
  setTimeout(() => {
    const aiResponse = {
      id: Date.now() + 1,
      type: 'assistant',
      content: generateAIResponse(message),
      timestamp: new Date().toISOString()
    };
    chatHistory.push(aiResponse);
    saveChatHistory();
    renderChat();
  }, 1000);
  
  saveChatHistory();
  renderChat();
}

function generateAIResponse(message) {
  // Lógica de resposta baseada em palavras-chave
  if (message.toLowerCase().includes('criar')) return 'Vou ajudar você a criar isso!';
  if (message.toLowerCase().includes('editar')) return 'Claro, vamos editar juntos!';
  return 'Entendi! Como posso ajudar mais?';
}

function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}`
      };
      
      return templates;
    };

    const componentTemplates = getComponentTemplates();

    return `Você é um desenvolvedor web especialista. Crie um aplicativo web completo em UM ÚNICO ARQUIVO HTML com ABORDAGEM MOBILE-FIRST.

🚨 REGRAS OBRIGATÓRIAS - ARQUIVO ÚNICO:
- RETORNE APENAS UM ARQUIVO HTML COMPLETO E FUNCIONAL
- TODO CSS deve estar INLINE dentro de tags <style> no <head>
- TODO JavaScript deve estar INLINE dentro de tags <script> no final do <body>
- NÃO crie arquivos separados (.css, .js, .json, etc.)
- NÃO use imports ou links para arquivos externos (exceto CDNs)
- O arquivo deve ser 100% autossuficiente e funcionar offline

🎯 ESTRUTURA OBRIGATÓRIA DO HTML:
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Nome do App]</title>
    ${cssConfig.framework === 'Tailwind CSS via CDN' ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
    <style>
        /* TODO CSS CUSTOMIZADO AQUI - INLINE */
        /* Inclua estilos para scrollbar, animações, hover, etc. */
        :root {
          --primary-color: #3b82f6;
          --secondary-color: #64748b;
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --error-color: #ef4444;
        }
        
        .drag-over { border: 2px dashed var(--primary-color); }
        .task-card { transition: all 0.3s ease; }
        .task-card:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <!-- TODO HTML ESTRUTURAL AQUI -->
    
    <script>
        /* TODO JAVASCRIPT FUNCIONAL AQUI - INLINE */
        /* Use os templates abaixo como referência: */
        
        ${componentTemplates.kanban}
        
        ${componentTemplates.calendar}
        
        ${componentTemplates.assistant}
        
        // Inicialização do app
        document.addEventListener('DOMContentLoaded', function() {
          // Inicializar componentes
          initializeApp();
        });
    </script>
</body>
</html>

📱 INSTRUÇÕES MOBILE-FIRST:
- ${cssConfig.instructions}
- ${cssConfig.classes}
- Design MOBILE-FIRST com 100% de responsividade
- Elementos touch-friendly (mínimo 44px de altura para botões)
- Layout flexível que funciona em todas as telas (320px+)
- Teste mental em: mobile (320px), tablet (768px), desktop (1024px+)
- Priorize experiência mobile, depois adapte para telas maiores

⚡ FUNCIONALIDADES OBRIGATÓRIAS:
- Interface completamente funcional e interativa
- Persistência de dados com localStorage (USE OS TEMPLATES ACIMA)
- Animações suaves e transições CSS
- Componentes drag & drop se aplicável (USE TEMPLATE KANBAN)
- Validação de formulários
- Estados de loading e feedback visual
- Tratamento de erros

🎨 QUALIDADE DE CÓDIGO:
- Código limpo, organizado e comentado
- Variáveis CSS customizadas para cores e espaçamentos
- JavaScript modular com funções bem definidas
- Semântica HTML5 adequada
- Acessibilidade básica (aria-labels, alt texts)

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

${request.enableAuth ? '- Inclua sistema básico de login/registro com localStorage' : ''}
${request.enableDatabase ? '- Simule operações de banco de dados com localStorage' : ''}
${request.enablePayments ? '- Inclua interface de pagamento simulada' : ''}

🔥 IMPORTANTE: Retorne APENAS o código HTML completo, sem explicações, comentários externos ou markdown. O arquivo deve ser executável imediatamente.`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    // Prompt melhorado baseado no index_sqlite.html para gerar código de alta qualidade
    let prompt = `Crie um app web ${request.appType} chamado "${request.projectId}": ${request.customPrompt || 'aplicativo funcional'}.

🎯 REQUISITOS ESPECÍFICOS:
- Gere um aplicativo COMPLETO e FUNCIONAL em um único arquivo HTML
- Inclua TODAS as funcionalidades solicitadas (não apenas a estrutura)
- Use ${request.cssFramework} para estilização
- Implemente JavaScript vanilla para toda interatividade
- Garanta persistência de dados com localStorage
- Adicione animações e transições suaves
- Interface responsiva e mobile-first

📋 FUNCIONALIDADES OBRIGATÓRIAS:
- Navegação funcional entre seções
- Formulários com validação
- Estados de loading e feedback visual
- Drag & drop se aplicável
- Modais e popups funcionais
- Persistência de dados local
- Tratamento de erros

🎨 QUALIDADE VISUAL:
- Design moderno e profissional
- Cores harmoniosas e consistentes
- Tipografia legível e hierárquica
- Espaçamentos adequados
- Ícones e elementos visuais
- Animações sutis e elegantes

⚡ PERFORMANCE:
- Código otimizado e limpo
- Carregamento rápido
- Responsividade fluida
- Compatibilidade cross-browser

IMPORTANTE: Retorne APENAS o código HTML completo, sem explicações ou markdown. O arquivo deve funcionar perfeitamente quando aberto no navegador.`;
    
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
    
    // Validação Mobile-First
    console.log('🔍 [DEBUG] Executando validação mobile-first...');
    this.validateMobileFirst(cleanedCode);
    
    console.log('🔍 [DEBUG] Código final processado (primeiros 200 chars):', cleanedCode.slice(0, 200));
    return cleanedCode;
  }

  private validateMobileFirst(code: string): void {
    const validations = [];
    let score = 0;
    const maxScore = 10;
    
    // 1. Verificar meta viewport (2 pontos)
    if (!code.includes('viewport')) {
      validations.push('❌ Meta viewport ausente');
    } else {
      validations.push('✅ Meta viewport presente');
      score += 2;
    }
    
    // 2. Verificar classes responsivas (2 pontos)
    const responsiveClasses = ['sm:', 'md:', 'lg:', 'xl:', '@media'];
    const hasResponsive = responsiveClasses.some(cls => code.includes(cls));
    if (hasResponsive) {
      validations.push('✅ Classes responsivas detectadas');
      score += 2;
    } else {
      validations.push('⚠️ Poucas classes responsivas detectadas');
    }
    
    // 3. Verificar elementos touch-friendly (2 pontos)
    const touchFriendlyPatterns = ['44px', 'h-11', 'h-12', 'py-3', 'py-4', 'min-h-', 'touch-manipulation'];
    const hasTouchFriendly = touchFriendlyPatterns.some(pattern => code.includes(pattern));
    if (hasTouchFriendly) {
      validations.push('✅ Elementos touch-friendly detectados');
      score += 2;
    } else {
      validations.push('⚠️ Verificar se elementos são touch-friendly (≥44px)');
    }
    
    // 4. Verificar JavaScript funcional (2 pontos)
    const jsPatterns = ['addEventListener', 'localStorage', 'querySelector', 'function'];
    const hasJS = jsPatterns.some(pattern => code.includes(pattern));
    if (hasJS) {
      validations.push('✅ JavaScript funcional detectado');
      score += 2;
    } else {
      validations.push('⚠️ JavaScript funcional limitado');
    }
    
    // 5. Verificar estrutura HTML5 semântica (1 ponto)
    const semanticTags = ['<nav>', '<main>', '<section>', '<article>', '<header>', '<footer>'];
    const hasSemantic = semanticTags.some(tag => code.includes(tag));
    if (hasSemantic) {
      validations.push('✅ HTML5 semântico');
      score += 1;
    } else {
      validations.push('⚠️ Melhorar semântica HTML5');
    }
    
    // 6. Verificar CSS inline/interno (1 ponto)
    if (code.includes('<style>') || code.includes('style=')) {
      validations.push('✅ CSS inline/interno presente');
      score += 1;
    } else {
      validations.push('⚠️ CSS inline/interno ausente');
    }
    
    const percentage = Math.round((score / maxScore) * 100);
    const quality = percentage >= 80 ? '🟢 EXCELENTE' : 
                   percentage >= 60 ? '🟡 BOM' : 
                   percentage >= 40 ? '🟠 REGULAR' : '🔴 PRECISA MELHORAR';
    
    console.log(`📱 [MOBILE-FIRST VALIDATION] Score: ${score}/${maxScore} (${percentage}%) - ${quality}`);
    console.log('📋 [DETALHES]:', validations.join(' | '));
    
    // Log adicional para debugging
    if (percentage < 60) {
      console.log('⚠️ [ALERTA] Qualidade abaixo do esperado. Considere melhorar os prompts.');
    }
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
    
    // APENAS o arquivo HTML principal - arquivo único conforme especificado
    files.push({
      path: 'index.html',
      content: code,
      type: 'html'
    });

    // Não gerar arquivos adicionais para manter o conceito de arquivo único
    // O objetivo é ter tudo em um único index.html funcional

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