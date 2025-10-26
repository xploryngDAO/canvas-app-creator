import React, { useState, useEffect, useRef } from 'react';
import { AppConfig } from '../types/app';
import { apiLock } from '../services/apiLock';

interface CompilationTerminalProps {
  appConfig: AppConfig;
  onComplete: (code: string) => void;
  onError: (error: string) => void;
  isModifying?: boolean;
  customPrompt?: string;
}

interface CompilationStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  error?: string;
}

const CompilationTerminal: React.FC<CompilationTerminalProps> = ({
  appConfig,
  onComplete,
  onError,
  isModifying = false,
  customPrompt
}) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [compilationSteps, setCompilationSteps] = useState<CompilationStep[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false); // Prevenir múltiplas chamadas

  // Gerar steps de compilação baseados na configuração do app
  const generateCompilationSteps = (config: AppConfig): CompilationStep[] => {
    const steps: CompilationStep[] = [
      {
        id: 'init',
        name: 'Inicializando projeto',
        description: `Configurando projeto ${config.name}`,
        completed: false
      },
      {
        id: 'structure',
        name: 'Criando estrutura',
        description: `Estrutura para ${config.appType} com ${config.frontendStack}`,
        completed: false
      },
      {
        id: 'styling',
        name: 'Configurando estilos',
        description: `Aplicando ${config.cssFramework} com tema ${config.colorTheme}`,
        completed: false
      },
      {
        id: 'layout',
        name: 'Implementando layout',
        description: `Layout ${config.layoutStyle} com fonte ${config.mainFont}`,
        completed: false
      }
    ];

    // Adicionar steps condicionais baseados nas features
    if (config.enableAuth) {
      steps.push({
        id: 'auth',
        name: 'Configurando autenticação',
        description: `Implementando ${config.authProvider || 'sistema de auth'}`,
        completed: false
      });
    }

    if (config.enableDatabase) {
      steps.push({
        id: 'database',
        name: 'Configurando banco de dados',
        description: `Configurando ${config.databaseType || 'banco de dados'}`,
        completed: false
      });
    }

    if (config.enablePayments) {
      steps.push({
        id: 'payments',
        name: 'Integrando pagamentos',
        description: `Configurando ${config.paymentProvider || 'sistema de pagamentos'}`,
        completed: false
      });
    }

    steps.push({
      id: 'finalize',
      name: 'Finalizando build',
      description: 'Otimizando e preparando para produção',
      completed: false
    });

    return steps;
  };

  // Gerar código usando o serviço Gemini real com debounce
  const generateAppCode = async (config: AppConfig): Promise<string> => {
    const operationId = `generateAppCode_${config.name}_${Date.now()}`;
    
    // Sistema global de lock para prevenir múltiplas chamadas
    if (!apiLock.acquireLock(operationId)) {
      console.log('⚠️ [MAIN_TERMINAL] Geração já em andamento via lock global, ignorando chamada duplicada');
      throw new Error('Geração já em andamento');
    }
    
    // Manter compatibilidade com sistema local
    if (isGenerating) {
      console.log('⚠️ [MAIN_TERMINAL] Sistema local detectou geração em andamento');
      apiLock.releaseLock(operationId);
      throw new Error('Geração já em andamento');
    }

    setIsGenerating(true);
    
    try {
      addTerminalLine('🤖 Conectando com Gemini AI...');
      
      // Importar e usar o serviço Gemini
      const { geminiService } = await import('../services/gemini');
      await geminiService.reload();
      
      addTerminalLine('🚀 Enviando configuração para Gemini...');
      console.log(`🚀 [MAIN_TERMINAL] Iniciando chamada à API Gemini para: ${operationId}`);
      const response = await geminiService.generateApp(config, customPrompt);
      
      console.log(`✅ [MAIN_TERMINAL] Resposta recebida da API Gemini para: ${operationId}`, {
        success: response.success,
        hasCode: !!response.code,
        codeLength: response.code?.length || 0,
        error: response.error
      });
      
      if (response.success && response.code) {
        addTerminalLine('✅ Código gerado pela Gemini AI!', 'success');
        return response.code;
      } else {
        const errorMessage = response.error || 'Erro desconhecido na geração';
        addTerminalLine(`❌ Erro na Gemini AI: ${errorMessage}`, 'error');
        
        // Melhorar mensagens de erro
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          throw new Error('⏳ Limite de requisições da API atingido. Tente novamente em alguns minutos ou use uma API Key diferente.');
        } else if (errorMessage.includes('API Key')) {
          throw new Error('🔑 Problema com a API Key. Verifique se está configurada corretamente nas configurações.');
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addTerminalLine(`❌ Falha na geração: ${errorMessage}`, 'error');
      
      // Logs detalhados para debug
      console.error('🔍 [MAIN_TERMINAL] Erro detalhado na geração:', {
        error,
        config,
        operationId,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
      apiLock.releaseLock(operationId);
    }
  };

  // Adicionar linha ao terminal
  const addTerminalLine = (line: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔧';
    setTerminalOutput(prev => [...prev, `[${timestamp}] ${prefix} ${line}`]);
  };

  // Executar step de compilação
  const executeStep = async (step: CompilationStep, index: number): Promise<void> => {
    return new Promise((resolve) => {
      addTerminalLine(`Iniciando: ${step.name}`);
      addTerminalLine(step.description, 'info');
      
      // Simular tempo de processamento
      const duration = Math.random() * 2000 + 1000; // 1-3 segundos
      
      setTimeout(() => {
        setCompilationSteps(prev => 
          prev.map((s, i) => 
            i === index ? { ...s, completed: true } : s
          )
        );
        
        addTerminalLine(`✓ Concluído: ${step.name}`, 'success');
        setProgress(((index + 1) / compilationSteps.length) * 100);
        resolve();
      }, duration);
    });
  };

  // Iniciar compilação
  const startCompilation = async () => {
    setIsCompiling(true);
    setCurrentStep(0);
    setProgress(0);
    setTerminalOutput([]);
    
    const steps = generateCompilationSteps(appConfig);
    setCompilationSteps(steps);
    
    addTerminalLine(`🚀 Iniciando ${isModifying ? 'modificação' : 'geração'} do app: ${appConfig.name}`);
    addTerminalLine(`Configuração: ${appConfig.frontendStack} + ${appConfig.cssFramework}`);
    
    try {
      // Executar cada step sequencialmente
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        await executeStep(steps[i], i);
      }
      
      // Gerar código final usando Gemini AI
      addTerminalLine('🎨 Gerando código do aplicativo...');
      const code = await generateAppCode(appConfig);
      setGeneratedCode(code);
      
      addTerminalLine('🎉 App gerado com sucesso!', 'success');
      addTerminalLine(`📦 Código gerado: ${code.split('\n').length} linhas`, 'success');
      
      setTimeout(() => {
        setIsCompiling(false);
        onComplete(code);
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido durante a compilação';
      addTerminalLine(`❌ Erro durante a compilação: ${errorMessage}`, 'error');
      
      // Logs detalhados para debug
      console.error('🔍 [DEBUG] Erro detalhado na compilação:', {
        error,
        appConfig,
        currentStep,
        compilationSteps: compilationSteps.map(s => ({ id: s.id, completed: s.completed })),
        timestamp: new Date().toISOString()
      });
      
      setIsCompiling(false);
      onError(errorMessage);
    }
  };

  // Auto-scroll do terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Iniciar compilação automaticamente
  useEffect(() => {
    startCompilation();
  }, [appConfig]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      {/* Header do Terminal */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h2 className="text-white font-semibold text-lg">
            Terminal de Compilação
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-400">
            {isModifying ? 'Modificando' : 'Gerando'}: {appConfig.name}
          </div>
          {isCompiling && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-400 text-sm">Processando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">Progresso da Compilação</span>
          <span className="text-blue-400 text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Steps de Compilação */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {compilationSteps.map((step, index) => (
          <div 
            key={step.id}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              step.completed 
                ? 'bg-green-900/30 border-green-500/50 text-green-300'
                : currentStep === index && isCompiling
                ? 'bg-blue-900/30 border-blue-500/50 text-blue-300 animate-pulse'
                : 'bg-gray-800/50 border-gray-600/50 text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                step.completed ? 'bg-green-500' : 
                currentStep === index && isCompiling ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <span className="font-medium text-sm">{step.name}</span>
            </div>
            <p className="text-xs mt-1 opacity-75">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Terminal Output */}
      <div className="bg-black/50 rounded-lg p-4 flex-1 overflow-y-auto font-mono text-sm" ref={terminalRef}>
        {terminalOutput.map((line, index) => (
          <div key={index} className="text-green-400 mb-1 whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {isCompiling && (
          <div className="text-blue-400 animate-pulse">
            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>
          </div>
        )}
      </div>

      {/* Código Gerado (Preview) */}
      {generatedCode && !isCompiling && (
        <div className="mt-6">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Código Gerado (Preview)
          </h3>
          <div className="bg-gray-900/80 rounded-lg p-4 max-h-48 overflow-y-auto">
            <pre className="text-gray-300 text-xs whitespace-pre-wrap">
              {generatedCode.substring(0, 500)}
              {generatedCode.length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompilationTerminal;