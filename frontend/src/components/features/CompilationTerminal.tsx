import React, { useState, useEffect, useRef } from 'react';
import { AppConfig } from '../../types/app';
import { geminiService } from '../../services/gemini';
import { apiLock } from '../../services/apiLock';

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
  // Usar a instância global do geminiService

  const compilationLines: CodeLine[] = [
    { text: '// Iniciando Gemini Dev Environment v2.5 (Canvas Edition)...', delay: 400 },
    { text: '// Tarefa: Geração de aplicativo baseado em configurações...', delay: 400 },
    { text: '// Analisando configurações do Canvas App Creator...', delay: 500 },
    { text: `const projectName = "${appConfig.name}";`, delay: 300 },
    { text: `const appType = "${appConfig.appType}";`, delay: 300 },
    { text: `const theme = "${appConfig.colorTheme}";`, delay: 300 },
    { text: '// Conectando com Gemini API...', delay: 600 },
    { text: '// Processando estrutura base (HTML)...', delay: 600 },
    { text: '// Aplicando tema e estilos (Tailwind CSS)...', delay: 500 },
    { text: '// Configurando funcionalidades específicas...', delay: 500 },
    { text: '// Implementando lógica de negócio (JavaScript)...', delay: 600 },
    { text: '// Otimizando responsividade mobile-first...', delay: 400 },
    { text: '// Verificando compatibilidade e performance...', delay: 500 },
    { text: '// Finalizando integração de componentes...', delay: 400 },
    { text: '// Compilação concluída com sucesso!', delay: 300 }
  ];

  useEffect(() => {
    const initializeGemini = async () => {
      try {
        await geminiService.init();
        startCompilation();
      } catch (error) {
        console.error('Erro ao inicializar Gemini:', error);
        onError('Erro ao inicializar serviço de IA');
      }
    };

    initializeGemini();
  }, []);

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

  const generateApp = async (retryCount = 0) => {
    const operationId = `generateApp_${appConfig.name}_${Date.now()}`;
    
    try {
      setLoadingText('Gerando código com Gemini AI...');
      
      // Sistema global de lock para prevenir múltiplas chamadas
      if (!apiLock.acquireLock(operationId)) {
        console.log('⚠️ [FEATURES_TERMINAL] Geração já em andamento, ignorando chamada duplicada');
        return;
      }
      
      // Manter compatibilidade com sistema antigo
      if (generateApp.isRunning) {
        console.log('⚠️ [FEATURES_TERMINAL] Sistema antigo detectou geração em andamento');
        apiLock.releaseLock(operationId);
        return;
      }
      generateApp.isRunning = true;
      
      // Recarregar a API key antes de gerar o código
      await geminiService.reload();
      
      // Usar o serviço Gemini para gerar o código
      console.log(`🚀 [FEATURES_TERMINAL] Iniciando chamada à API Gemini para: ${operationId}`);
      const response = await geminiService.generateApp(appConfig);
      
      console.log(`✅ [FEATURES_TERMINAL] Resposta recebida da API Gemini para: ${operationId}`, {
        success: response.success,
        hasCode: !!response.code,
        codeLength: response.code?.length || 0,
        error: response.error
      });
      
      if (response.success && response.code) {
        setLoadingText('Código gerado com sucesso!');
        
        // Simular arquivos gerados
        const generatedFiles = [
          {
            name: 'index.html',
            content: response.code,
            type: 'html'
          }
        ];

        // Logs de compilação
        const compilationLogs = [
          ...codeLines,
          '// Código gerado pela Gemini AI',
          '// Aplicativo pronto para uso!'
        ];

        onCompilationComplete(response.code, generatedFiles, compilationLogs);
      } else {
        const errorMessage = response.error || 'Nenhum código foi gerado';
        console.error('Erro na resposta do Gemini:', errorMessage);
        
        // Melhorar mensagens de erro de quota
        let userFriendlyError = errorMessage;
        let shouldRetry = false;
        
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          if (retryCount < 3) {
            shouldRetry = true;
            const waitTime = Math.min(30 + (retryCount * 30), 120); // 30s, 60s, 90s
            userFriendlyError = `⏳ Limite de requisições atingido. Tentando novamente em ${waitTime} segundos... (Tentativa ${retryCount + 1}/3)`;
            setLoadingText(userFriendlyError);
            
            setTimeout(() => {
              generateApp(retryCount + 1);
            }, waitTime * 1000);
            return;
          } else {
            userFriendlyError = '⏳ Limite de requisições da API atingido. Tente novamente em alguns minutos ou use uma API Key diferente.';
          }
        } else if (errorMessage.includes('API Key')) {
          userFriendlyError = '🔑 Problema com a API Key. Verifique se está configurada corretamente nas configurações.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyError = '🌐 Erro de conexão. Verifique sua internet e tente novamente.';
        }
        
        if (!shouldRetry) {
          throw new Error(userFriendlyError);
        }
      }
    } catch (error) {
      console.error('Erro na geração:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na geração';
      setLoadingText(`Erro: ${errorMessage}`);
      onError(errorMessage);
    } finally {
      // Liberar flag de execução e lock global
      generateApp.isRunning = false;
      apiLock.releaseLock(operationId);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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