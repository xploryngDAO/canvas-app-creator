import React, { useState, useEffect, useRef } from 'react';
import { AppConfig } from '../../types/app';
import { geminiService } from '../../services/gemini';
import { apiLock } from '../../services/apiLock';

interface CompilationTerminalProps {
  appConfig: AppConfig;
  onComplete: (generatedCode: string, files?: any[], logs?: string[]) => void;
  onError: (error: string) => void;
  isModifying?: boolean;
  customPrompt?: string;
  logs?: string[];
}

interface CodeLine {
  text: string;
  delay: number;
}

export const CompilationTerminal: React.FC<CompilationTerminalProps> = ({
  appConfig,
  onComplete,
  onError,
  isModifying,
  customPrompt,
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
      if ((generateApp as any).isRunning) {
        console.log('⚠️ [FEATURES_TERMINAL] Sistema antigo detectou geração em andamento');
        apiLock.releaseLock(operationId);
        return;
      }
      (generateApp as any).isRunning = true;
      
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
        
        // Simular logs de compilação
        const compilationLogs = [
          '✅ Estrutura HTML criada',
          '✅ Estilos CSS aplicados',
          '✅ JavaScript configurado',
          '✅ Responsividade implementada',
          '✅ Otimizações aplicadas'
        ];
        
        // Chamar callback de sucesso
        onComplete(response.code, generatedFiles, compilationLogs);
        
      } else {
        const errorMessage = response.error || 'Erro desconhecido na geração';
        setLoadingText(`Erro: ${errorMessage}`);
        
        // Melhorar mensagens de erro
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          onError('⏳ Limite de requisições da API atingido. Tente novamente em alguns minutos ou use uma API Key diferente.');
        } else if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
          onError('🔑 API Key inválida ou não configurada. Verifique suas configurações.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          onError('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
        } else {
          onError(`❌ Erro na geração: ${errorMessage}`);
        }
      }
      
    } catch (error: any) {
      console.error(`❌ [FEATURES_TERMINAL] Erro na geração para: ${operationId}`, error);
      
      const errorMessage = error?.message || 'Erro desconhecido';
      setLoadingText(`Erro: ${errorMessage}`);
      
      // Retry logic para erros temporários
      if (retryCount < 2 && (
        errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch')
      )) {
        console.log(`🔄 [FEATURES_TERMINAL] Tentativa ${retryCount + 1} de retry para: ${operationId}`);
        setTimeout(() => {
          generateApp(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Backoff exponencial
        return;
      }
      
      // Melhorar mensagens de erro
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        onError('⏳ Limite de requisições da API atingido. Tente novamente em alguns minutos ou use uma API Key diferente.');
      } else if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
        onError('🔑 API Key inválida ou não configurada. Verifique suas configurações.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        onError('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        onError(`❌ Erro na geração: ${errorMessage}`);
      }
      
    } finally {
      // Sempre liberar o lock e resetar flags
      apiLock.releaseLock(operationId);
      (generateApp as any).isRunning = false;
    }
  };

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono text-sm overflow-hidden flex flex-col">
      {/* Header do Terminal */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 ml-4">Canvas App Creator - Terminal de Compilação</span>
        </div>
        <div className="text-gray-400 text-xs">
          {isCompiling ? `${Math.round(progress)}%` : 'Pronto'}
        </div>
      </div>

      {/* Área do Terminal */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {/* Simulador de código */}
        <div 
          ref={simulatorRef}
          className="flex-1 overflow-y-auto space-y-1 mb-4"
          style={{ maxHeight: 'calc(100% - 100px)' }}
        >
          {codeLines.map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-500 text-xs w-8 text-right">{index + 1}</span>
              <span className="text-green-400">{line}</span>
            </div>
          ))}
          {isCompiling && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-xs w-8 text-right">{codeLines.length + 1}</span>
              <span className="text-yellow-400 animate-pulse">█</span>
            </div>
          )}
        </div>

        {/* Status e Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-400">{loadingText}</span>
            {isCompiling && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};