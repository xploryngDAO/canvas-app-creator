import React, { useState, useEffect, useRef } from 'react';
import { AppConfig } from '../../types/app';

interface CompilationTerminalProps {
  appConfig: AppConfig;
  onCompilationComplete: (generatedCode: string, files?: any[], logs?: string[]) => void;
  onError: (error: string) => void;
  logs?: string[];
}

interface CodeLine {
  text: string;
  delay: number;
}

export const CompilationTerminal: React.FC<CompilationTerminalProps> = ({
  appConfig,
  onCompilationComplete,
  onError,
  logs
}) => {
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [loadingText, setLoadingText] = useState('Iniciando compilação...');
  const [progress, setProgress] = useState(0);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const compilationLines: CodeLine[] = [
    { text: '// Iniciando Gemini Dev Environment v2.5 (Canvas Edition)...', delay: 400 },
    { text: '// Tarefa: Geração de aplicativo baseado em configurações...', delay: 400 },
    { text: '// Analisando configurações do Canvas App Creator...', delay: 500 },
    { text: `const projectName = "${appConfig.name}";`, delay: 300 },
    { text: `const appType = "${appConfig.type}";`, delay: 300 },
    { text: `const theme = "${appConfig.theme}";`, delay: 300 },
    { text: '// Processando estrutura base (HTML)...', delay: 600 },
    { text: '// Aplicando tema e estilos (Tailwind CSS)...', delay: 500 },
    { text: '// Configurando funcionalidades específicas...', delay: 500 },
    { text: '// Implementando lógica de negócio (JavaScript)...', delay: 600 },
    { text: '// Otimizando responsividade mobile-first...', delay: 400 },
    { text: '// Verificando compatibilidade e performance...', delay: 500 },
    { text: '// Finalizando integração de componentes...', delay: 400 },
    { text: '// Compilação concluída com sucesso!', delay: 300 }
  ];

  const startCompilation = async () => {
    setIsCompiling(true);
    setCodeLines([]);
    setCurrentLineIndex(0);
    setProgress(0);
    setLoadingText('Compilação em andamento...');

    // Simular animação de linhas de código
    intervalRef.current = setInterval(() => {
      setCurrentLineIndex(prevIndex => {
        if (prevIndex < compilationLines.length) {
          const newLine = compilationLines[prevIndex];
          setCodeLines(prevLines => [...prevLines, newLine.text]);
          
          // Atualizar progresso
          const newProgress = ((prevIndex + 1) / compilationLines.length) * 100;
          setProgress(newProgress);
          
          // Scroll para baixo
          if (simulatorRef.current) {
            simulatorRef.current.scrollTop = simulatorRef.current.scrollHeight;
          }
          
          // Atualizar texto de loading
          if (prevIndex === compilationLines.length - 3) {
            setLoadingText('Compilação quase concluída. Finalizando...');
          }
          
          return prevIndex + 1;
        } else {
          // Compilação concluída
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setLoadingText('App gerado com sucesso!');
          setTimeout(() => {
            generateApp();
          }, 1000);
          return prevIndex;
        }
      });
    }, 400);
  };

  const generateApp = async () => {
    try {
      // Construir prompt baseado nas configurações
      const systemPrompt = `Você é um desenvolvedor web especialista. Crie um aplicativo web completo usando HTML, CSS (Tailwind) e JavaScript vanilla com ABORDAGEM MOBILE-FIRST.

CONFIGURAÇÕES DO PROJETO:
- Nome: ${appConfig.name}
- Tipo: ${appConfig.type}
- Tema: ${appConfig.theme}
- Descrição: ${appConfig.description}
- Funcionalidades: ${appConfig.features?.join(', ') || 'Básicas'}

INSTRUÇÕES IMPORTANTES:
- Retorne APENAS o código HTML completo, sem explicações
- Use Tailwind CSS via CDN para estilização
- Inclua JavaScript inline no HTML
- OBRIGATÓRIO: Design MOBILE-FIRST com 100% de responsividade
- Use classes responsivas do Tailwind (sm:, md:, lg:, xl:)
- Inclua meta viewport: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Elementos touch-friendly (mínimo 44px de altura para botões)
- Layout flexível que funciona em todas as telas (320px+)
- Aplique o tema ${appConfig.theme} consistentemente
- Implemente as funcionalidades solicitadas de forma funcional
- Garanta que o código seja completamente responsivo e funcional`;

      const userPrompt = `Crie um ${appConfig.type} chamado "${appConfig.name}" com tema ${appConfig.theme}. ${appConfig.description}`;

      // Usar logs reais da compilação se disponíveis
      const generatedCode = await simulateCodeGeneration(systemPrompt, userPrompt);
      
      setIsCompiling(false);
      onCompilationComplete(generatedCode);
    } catch (error) {
      setIsCompiling(false);
      onError(error instanceof Error ? error.message : 'Erro desconhecido na compilação');
    }
  };

  const simulateCodeGeneration = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Código HTML básico baseado nas configurações
    const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appConfig.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Estilos customizados para ${appConfig.theme} */
        .theme-${appConfig.theme?.toLowerCase() || 'default'} {
            ${getThemeStyles(appConfig.theme || 'default')}
        }
    </style>
</head>
<body class="theme-${appConfig.theme?.toLowerCase() || 'default'} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">${appConfig.name}</h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">${appConfig.description}</p>
        </header>
        
        <main class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h2 class="text-2xl font-semibold mb-6 text-gray-800">Funcionalidades Principais</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${generateFeatureCards(appConfig.features || [])}
                </div>
                
                <div class="mt-8 text-center">
                    <button onclick="showAlert('${appConfig.name} está funcionando!')" 
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
                        Testar Aplicativo
                    </button>
                </div>
            </div>
        </main>
    </div>
    
    <script>
        function showAlert(message) {
            alert(message);
        }
        
        // Funcionalidades específicas do ${appConfig.type}
        ${getTypeSpecificScript(appConfig.type)}
    </script>
</body>
</html>`;

    return htmlTemplate;
  };

  const getThemeStyles = (theme: string): string => {
    const themes: Record<string, string> = {
      'Moderno': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
      'Clássico': 'background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);',
      'Escuro': 'background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);',
      'Colorido': 'background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);'
    };
    return themes[theme] || themes['Moderno'];
  };

  const generateFeatureCards = (features: string[]): string => {
    return features.map(feature => `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-semibold text-gray-800 mb-2">${feature}</h3>
        <p class="text-gray-600 text-sm">Funcionalidade implementada e pronta para uso.</p>
      </div>
    `).join('');
  };

  const getTypeSpecificScript = (type: string): string => {
    const scripts: Record<string, string> = {
      'Website': `
        console.log('Website ${appConfig.name} carregado com sucesso!');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado - Website pronto!');
        });
      `,
      'E-commerce': `
        let cart = [];
        function addToCart(item) {
            cart.push(item);
            console.log('Item adicionado ao carrinho:', item);
        }
      `,
      'Blog': `
        function formatDate(date) {
            return new Date(date).toLocaleDateString('pt-BR');
        }
        console.log('Blog ${appConfig.name} inicializado!');
      `
    };
    return scripts[type] || scripts['Website'];
  };

  useEffect(() => {
    startCompilation();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appConfig]);

  return (
    <div className="bg-gray-900 h-full w-full flex flex-col overflow-hidden">
      {/* Header minimalista */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/50 bg-gray-800/50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-medium text-gray-200">Compilando: {appConfig.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-400/60 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-400/60 rounded-full"></div>
          <div className="w-2 h-2 bg-green-400/60 rounded-full"></div>
        </div>
      </div>
      
      {/* Terminal de código */}
      <div 
        ref={simulatorRef}
        className="code-simulator flex-1 overflow-y-auto bg-gray-900 p-6 font-mono text-sm min-h-0"
      >
        {codeLines.map((line, index) => (
          <div 
            key={index} 
            className="code-line text-green-400 mb-1 opacity-0 animate-fade-in"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'forwards'
            }}
          >
            <span className="text-gray-500 mr-2">$</span>
            {line}
          </div>
        ))}
      </div>
      
      {/* Barra de progresso minimalista */}
      <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">{loadingText}</div>
          <div className="text-sm text-gray-400 font-mono">{Math.round(progress)}%</div>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in forwards;
        }
        
        .code-simulator::-webkit-scrollbar {
          width: 4px;
        }
        
        .code-simulator::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        
        .code-simulator::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.6);
          border-radius: 2px;
        }
        
        .code-simulator::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
};