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
  customPrompt?: string | undefined;
}

export interface CodeGenerationResponse {
  success: boolean;
  message: string;
  generatedCode?: string | undefined;
  files?: GeneratedFile[] | undefined;
  logs?: string[] | undefined;
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
            instructions: '- Use Tailwind CSS via CDN para estilização',
            cdnLink: '<script src="https://cdn.tailwindcss.com"></script>'
          };
        case 'bootstrap':
          return {
            framework: 'Bootstrap CSS via CDN',
            classes: 'Use classes responsivas do Bootstrap (col-sm-, col-md-, col-lg-, col-xl-)',
            instructions: '- Use Bootstrap CSS via CDN para estilização',
            cdnLink: '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">'
          };
        case 'bulma':
          return {
            framework: 'Bulma CSS via CDN',
            classes: 'Use classes responsivas do Bulma (is-mobile, is-tablet, is-desktop)',
            instructions: '- Use Bulma CSS via CDN para estilização',
            cdnLink: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">'
          };
        case 'css':
        case 'pure':
        default:
          return {
            framework: 'CSS puro',
            classes: 'Use media queries para responsividade (@media screen and (min-width: ...))',
            instructions: '- Use CSS puro com media queries para estilização',
            cdnLink: ''
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

🚨 IMAGENS - REGRA CRÍTICA:
- NUNCA use URLs do Unsplash (source.unsplash.com ou images.unsplash.com)
- SEMPRE use placeholders SVG inline para imagens
- Use data:image/svg+xml;base64,[base64] para imagens
- Exemplo: <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtPC90ZXh0Pgo8L3N2Zz4K" alt="Placeholder">

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

🚨 IMAGENS - REGRA CRÍTICA:
- NUNCA use URLs do Unsplash (source.unsplash.com ou images.unsplash.com)
- SEMPRE use placeholders SVG inline codificados em base64
- Para imagens de produtos: use SVG com ícone de produto
- Para avatares: use SVG com ícone de usuário
- Para backgrounds: use gradientes CSS ou SVG patterns

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

    let fixedCode = code;
    
    // Substituir TODAS as URLs do Unsplash (images.unsplash.com e source.unsplash.com)
    fixedCode = fixedCode.replace(/https?:\/\/images\.unsplash\.com\/[^"'\s>)]*/g, createPlaceholderSVG(400, 300, 'Produto'));
    fixedCode = fixedCode.replace(/https?:\/\/source\.unsplash\.com\/[^"'\s>)]*/g, createPlaceholderSVG(400, 300, 'Produto'));
    
    // Substituir URLs do Unsplash em atributos específicos
    fixedCode = fixedCode.replace(/(src|srcset|data-src|background-image|url)\s*[:=]\s*["']?https?:\/\/(images|source)\.unsplash\.com\/[^"'\s>)]*["']?/gi, 
      (match, attr) => `${attr}="${createPlaceholderSVG(400, 300, 'Produto')}"`);
    
    // Substituir URLs do Unsplash em CSS background-image
    fixedCode = fixedCode.replace(/background-image\s*:\s*url\s*\(\s*["']?https?:\/\/(images|source)\.unsplash\.com\/[^"'\s>)]*["']?\s*\)/gi, 
      `background-image: url("${createPlaceholderSVG(400, 300, 'Background')}")`);
    
    // Substituir URLs do Unsplash em CSS url()
    fixedCode = fixedCode.replace(/url\s*\(\s*["']?https?:\/\/(images|source)\.unsplash\.com\/[^"'\s>)]*["']?\s*\)/gi, 
      `url("${createPlaceholderSVG(400, 300, 'Imagem')}")`);
    
    console.log('🔧 [UNSPLASH_FIX] URLs do Unsplash substituídas por placeholders SVG');
    
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
    
    // Arquivo HTML principal
    files.push({
      path: 'index.html',
      content: code,
      type: 'html'
    });

    // Para demonstrar a estrutura hierárquica, vamos gerar alguns arquivos adicionais
    // baseados no tipo de aplicação
    if (request.appType.toLowerCase().includes('e-commerce') || 
        request.appType.toLowerCase().includes('loja') ||
        request.appType.toLowerCase().includes('shop')) {
      
      // Estrutura para e-commerce
      files.push({
        path: 'src/components/Header.js',
        content: '// Componente Header\nexport default function Header() {\n  return <header>Header Component</header>;\n}',
        type: 'js'
      });
      
      files.push({
        path: 'src/components/ProductCard.js',
        content: '// Componente ProductCard\nexport default function ProductCard() {\n  return <div>Product Card</div>;\n}',
        type: 'js'
      });
      
      files.push({
        path: 'src/styles/main.css',
        content: '/* Estilos principais */\nbody {\n  margin: 0;\n  font-family: Arial, sans-serif;\n}',
        type: 'css'
      });
      
      files.push({
        path: 'src/styles/components.css',
        content: '/* Estilos dos componentes */\n.header {\n  background: #333;\n  color: white;\n}',
        type: 'css'
      });
      
      files.push({
        path: 'config/database.json',
        content: '{\n  "host": "localhost",\n  "port": 5432,\n  "database": "ecommerce"\n}',
        type: 'json'
      });
      
    } else if (request.appType.toLowerCase().includes('blog') || 
               request.appType.toLowerCase().includes('portfolio')) {
      
      // Estrutura para blog/portfolio
      files.push({
        path: 'src/components/Navigation.js',
        content: '// Componente Navigation\nexport default function Navigation() {\n  return <nav>Navigation Component</nav>;\n}',
        type: 'js'
      });
      
      files.push({
        path: 'src/components/PostCard.js',
        content: '// Componente PostCard\nexport default function PostCard() {\n  return <article>Post Card</article>;\n}',
        type: 'js'
      });
      
      files.push({
        path: 'src/assets/styles/theme.css',
        content: '/* Tema do blog */\n:root {\n  --primary-color: #2563eb;\n  --secondary-color: #64748b;\n}',
        type: 'css'
      });
      
      files.push({
        path: 'content/posts/primeiro-post.md',
        content: '# Primeiro Post\n\nEste é o conteúdo do primeiro post do blog.',
        type: 'md'
      });
      
    } else {
      // Estrutura padrão para outros tipos de aplicação
      files.push({
        path: 'src/App.js',
        content: '// Componente principal da aplicação\nexport default function App() {\n  return <div>App Component</div>;\n}',
        type: 'js'
      });
      
      files.push({
        path: 'src/utils/helpers.js',
        content: '// Funções utilitárias\nexport function formatDate(date) {\n  return new Date(date).toLocaleDateString();\n}',
        type: 'js'
      });
      
      files.push({
        path: 'public/styles.css',
        content: '/* Estilos globais */\n* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0;\n}',
        type: 'css'
      });
    }
    
    // Arquivos comuns para todos os projetos
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(request),
      type: 'json'
    });
    
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