import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, X } from 'lucide-react';
import { geminiService } from '../../services/gemini';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface InspectedElement {
  tagName: string;
  className: string;
  id: string;
  textContent: string;
  innerHTML: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  computedStyles: { [key: string]: string };
  hierarchy: string[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ComponentTag {
  id: string;
  tag: string;
  timestamp: number;
}

interface AICopilotProps {
  currentCode: string;
  appConfig: any;
  onCodeUpdate: (newCode: string, explanation: string, userPrompt?: string) => void;
  onError: (error: string) => void;
  inspectedElement?: InspectedElement | null;
  initialMessage?: string;
}

// Componente de indicador de digitação
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gray-700 text-gray-200 p-3 rounded-lg text-sm max-w-[80%]">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AICopilot: React.FC<AICopilotProps> = ({
  currentCode,
  appConfig,
  onCodeUpdate,
  onError,
  inspectedElement,
  initialMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [componentTags, setComponentTags] = useState<ComponentTag[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeminiReady, setIsGeminiReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'online' | 'offline' | 'reconnecting'>('connecting');
  
  // Log detalhado para monitorar mudanças no estado do botão
  useEffect(() => {
    console.log('🔄 [AI_COPILOT] Estado isGeminiReady alterado:', {
      isGeminiReady,
      connectionStatus,
      isProcessing,
      buttonWillBeEnabled: isGeminiReady && !isProcessing,
      timestamp: new Date().toISOString()
    });
  }, [isGeminiReady, connectionStatus, isProcessing]);

  // Log específico para mudanças no isGeminiReady
  useEffect(() => {
    console.log('🎯 [AI_COPILOT] isGeminiReady mudou para:', {
      value: isGeminiReady,
      type: typeof isGeminiReady,
      timestamp: new Date().toISOString()
    });
    
    // Forçar re-render do botão quando isGeminiReady mudar
    if (isGeminiReady) {
      console.log('✅ [AI_COPILOT] Forçando re-render - botão deve ser habilitado agora');
    }
  }, [isGeminiReady]);

  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoReconnectEnabled, setAutoReconnectEnabled] = useState(true);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Verificar estado do botão a cada render (após declarar as refs)
  const hasContent = !!(inputRef.current?.textContent?.trim() || componentTags.length > 0);
  const buttonDisabled = !hasContent || isProcessing || !isGeminiReady;
  
  useEffect(() => {
    console.log('🔘 [AI_COPILOT] Estado do botão calculado:', {
      hasContent,
      textContent: inputRef.current?.textContent?.trim(),
      componentTagsCount: componentTags.length,
      isProcessing,
      isGeminiReady,
      buttonDisabled,
      timestamp: new Date().toISOString()
    });
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const reconnectIntervals = [5000, 10000, 20000, 40000, 60000]; // 5s, 10s, 20s, 40s, 60s (máximo)

  // Função para calcular delay de reconexão com backoff exponencial
  const getReconnectDelay = (attempt: number): number => {
    const index = Math.min(attempt, reconnectIntervals.length - 1);
    return reconnectIntervals[index];
  };

  // Função para limpar timeout de reconexão
  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Função para agendar reconexão automática
  const scheduleReconnect = (attempt: number) => {
    if (!autoReconnectEnabled || attempt >= maxReconnectAttempts) {
      console.log('🚫 [AICOPILOT] Reconexão automática desabilitada ou máximo de tentativas atingido');
      setConnectionStatus('offline');
      setIsRetrying(false);
      return;
    }

    const delay = getReconnectDelay(attempt);
    console.log(`⏰ [AICOPILOT] Agendando reconexão em ${delay}ms (tentativa ${attempt + 1}/${maxReconnectAttempts})`);
    
    setConnectionStatus('reconnecting');
    setIsRetrying(true);
    
    clearReconnectTimeout();
    reconnectTimeoutRef.current = setTimeout(() => {
      checkGeminiStatus(true, attempt + 1);
    }, delay);
  };

  // Verificar se o GeminiService está pronto
  const checkGeminiStatus = async (isReconnect: boolean = false, attemptNumber: number = 0) => {
    try {
      if (!isReconnect) {
        console.log('🔍 [AICOPILOT] Verificando status do Gemini...');
        setConnectionStatus('connecting');
      } else {
        console.log(`🔄 [AICOPILOT] Tentativa de reconexão ${attemptNumber}/${maxReconnectAttempts}...`);
        setRetryAttempt(attemptNumber);
      }
      
      // Primeiro, tentar obter a API key atual
      const currentApiKey = geminiService.getApiKey();
      console.log('🔑 [AICOPILOT] API Key atual:', {
        hasKey: !!currentApiKey,
        keyLength: currentApiKey?.length || 0
      });
      
      if (!currentApiKey) {
        // Se não tem API key, tentar recarregar
        console.log('🔄 [AICOPILOT] Tentando recarregar configurações...');
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`🔄 [AICOPILOT] Tentativa ${attempt} de reload...`);
            
            await geminiService.reload();
            
            const reloadedApiKey = geminiService.getApiKey();
            console.log(`🔑 [AICOPILOT] API Key após reload ${attempt}:`, {
              hasKey: !!reloadedApiKey,
              keyLength: reloadedApiKey?.length || 0,
              keyPreview: reloadedApiKey ? `${reloadedApiKey.substring(0, 10)}...` : 'null'
            });
            
            if (reloadedApiKey) {
              console.log('✅ [AICOPILOT] API Key carregada com sucesso!');
              break;
            }
            
            // Aguardar antes da próxima tentativa
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.error(`❌ [AICOPILOT] Erro no reload ${attempt}:`, error);
          }
        }
      }
      
      // Verificar status da API usando o novo método
      const apiStatus = await geminiService.checkApiStatus();
      console.log('🔍 [AICOPILOT] Status da API verificado:', {
        apiStatus,
        isGeminiReady: isGeminiReady,
        willUpdateTo: apiStatus
      });
      
      setIsGeminiReady(apiStatus);
      
      if (apiStatus) {
        console.log('✅ [AICOPILOT] API Gemini está disponível! Botão será habilitado.');
        setConnectionStatus('online');
        setRetryAttempt(0);
        setIsRetrying(false);
        clearReconnectTimeout();
        
        // Se era uma reconexão bem-sucedida, mostrar mensagem
        if (isReconnect && attemptNumber > 0) {
          addMessage('ai', '✅ Conexão restaurada! A API está funcionando novamente.');
        }
      } else {
        console.log('⚠️ [AICOPILOT] API Gemini indisponível - modo offline ativo');
        setConnectionStatus('offline');
        
        // Agendar reconexão automática se habilitada
        if (autoReconnectEnabled && !isReconnect) {
          scheduleReconnect(0);
        } else if (isReconnect && attemptNumber < maxReconnectAttempts) {
          scheduleReconnect(attemptNumber);
        } else {
          setIsRetrying(false);
        }
      }
      
    } catch (error) {
      console.error('❌ [AICOPILOT] Erro ao verificar status do Gemini:', error);
      setIsGeminiReady(false);
      setConnectionStatus('offline');
      
      // Agendar reconexão automática em caso de erro
      if (autoReconnectEnabled) {
        if (!isReconnect) {
          scheduleReconnect(0);
        } else if (attemptNumber < maxReconnectAttempts) {
          scheduleReconnect(attemptNumber);
        } else {
          setIsRetrying(false);
        }
      }
    }
  };

  // Inicializar conexão automaticamente
  useEffect(() => {
    console.log('🚀 [AI_COPILOT] Componente montado - iniciando conexão automática...');
    console.log('🔍 [AI_COPILOT] Estado inicial:', {
      isGeminiReady,
      connectionStatus
    });
    checkGeminiStatus();
    
    // Verificar status periodicamente (apenas se não estiver em processo de reconexão)
    const statusInterval = setInterval(() => {
      if (connectionStatus !== 'reconnecting' && !isRetrying) {
        console.log('⏰ [AI_COPILOT] Verificação periódica de status...');
        checkGeminiStatus();
      }
    }, 60000); // A cada 60 segundos (reduzido a frequência para não interferir com reconexão)
    
    return () => {
      console.log('🧹 [AI_COPILOT] Limpando intervalos e timeouts...');
      clearInterval(statusInterval);
      clearReconnectTimeout();
    };
  }, []);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  // Atualizar textarea quando initialMessage mudar
  useEffect(() => {
    if (initialMessage && initialMessage !== inputValue) {
      setInputValue(initialMessage);
    }
  }, [initialMessage]);

  // Listener para eventos de adição de tags de componente
  useEffect(() => {
    const handleAddComponentTag = (event: CustomEvent) => {
      const { tag } = event.detail;
      
      // Garantir que a tag não tenha escape HTML
      const cleanTag = tag.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      
      // Criar nova tag de componente
      const newTag: ComponentTag = {
        id: `tag_${Date.now()}`,
        tag: cleanTag,
        timestamp: Date.now()
      };
      
      setComponentTags(prev => [...prev, newTag]);
      
      console.log('🏷️ [AICOPILOT] Tag adicionada como cápsula:', cleanTag);
    };

    window.addEventListener('addComponentTag', handleAddComponentTag as EventListener);
    
    return () => {
      window.removeEventListener('addComponentTag', handleAddComponentTag as EventListener);
    };
  }, []);

  // Função para remover uma tag de forma segura
  const removeTag = (tagId: string) => {
    try {
      setComponentTags(prev => prev.filter(tag => tag.id !== tagId));
      
      // Aguardar um tick para que o React processe a remoção
      setTimeout(() => {
        if (inputRef.current) {
          // Focar no input após remoção para manter a experiência do usuário
          inputRef.current.focus();
        }
      }, 0);
    } catch (error) {
      console.error('❌ [AICOPILOT] Erro ao remover tag:', error);
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Função para obter o conteúdo completo (texto + tags)
  const getFullInputContent = () => {
    try {
      if (!inputRef.current) return '';
      
      // Combinar texto do contentEditable com as tags do estado
      let content = '';
      
      // Primeiro, extrair o texto puro do contentEditable (ignorando as tags renderizadas)
      const textContent = inputRef.current.textContent || '';
      
      // Adicionar as tags do estado no formato correto
      const tagTexts = componentTags.map(tag => `[Componente: ${tag.tag}]`).join(' ');
      
      // Combinar tags e texto
      if (tagTexts && textContent.trim()) {
        content = `${tagTexts} ${textContent.trim()}`;
      } else if (tagTexts) {
        content = tagTexts;
      } else {
        content = textContent.trim();
      }
      
      return content.trim();
    } catch (error) {
      console.error('❌ [AICOPILOT] Erro ao extrair conteúdo:', error);
      return '';
    }
  };

  // Função para lidar com input no contentEditable
  const handleInputChange = () => {
    // Forçar re-render para atualizar o estado do botão
    // Usar um estado dummy para disparar re-render
    setInputValue(inputRef.current?.textContent || '');
    
    console.log('📝 [AI_COPILOT] Input mudou:', {
      textContent: inputRef.current?.textContent?.trim(),
      hasContent: !!(inputRef.current?.textContent?.trim() || componentTags.length > 0),
      componentTagsCount: componentTags.length,
      isGeminiReady,
      isProcessing,
      timestamp: new Date().toISOString()
    });
  };

  // Função para lidar com teclas pressionadas
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const fullContent = getFullInputContent();
    const message = fullContent.trim();
    if (!message || isProcessing) return;

    // Capturar o prompt do usuário para versionamento (agora inclui as tags no próprio texto)
    const userPrompt = message;

    // Adicionar mensagem do usuário
    addMessage('user', message);
    
    // Limpar input e tags de forma segura
    setInputValue('');
    // Primeiro limpar o array de tags para evitar conflitos de renderização
    setComponentTags([]);
    
    // Aguardar um tick para que o React processe a remoção das tags
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.innerHTML = '';
        inputRef.current.focus();
      }
    }, 0);
    
    setIsProcessing(true);
    setIsRetrying(false);

    try {
      console.log('🤖 [AICOPILOT] Enviando mensagem para Gemini:', {
        message: message.substring(0, 100) + '...',
        hasCurrentCode: !!currentCode,
        hasAppConfig: !!appConfig,
        hasInspectedElement: !!inspectedElement,
        messageLength: message.length
      });

      // Preparar contexto da aplicação
      const appContext = appConfig ? `
=== CONFIGURAÇÃO DA APLICAÇÃO ===
Nome: ${appConfig.name || 'Aplicação Web'}
Descrição: ${appConfig.description || 'Aplicação web interativa'}
Tipo: ${appConfig.type || 'web-app'}
Estilo: ${appConfig.style || 'moderno'}
Funcionalidades: ${appConfig.features ? appConfig.features.join(', ') : 'Funcionalidades básicas'}
` : '';

      // Preparar contexto do elemento inspecionado
      const inspectedContext = inspectedElement ? `
=== ELEMENTO INSPECIONADO ===
- Tag: ${inspectedElement.tagName}
- ID: ${inspectedElement.id || 'Nenhum'}
- Classes: ${inspectedElement.className || 'Nenhuma'}
- Texto: ${inspectedElement.textContent || 'Nenhum'}
- Atributos: ${Object.keys(inspectedElement.attributes).length > 0 ? Object.entries(inspectedElement.attributes).map(([k, v]) => `${k}="${v}"`).join(', ') : 'Nenhum'}

HTML do elemento:
\`\`\`html
${inspectedElement.outerHTML}
\`\`\`
` : '';

    let contextPrompt = `Você é um assistente IA especializado em modificação de aplicações web. Você tem acesso ao contexto COMPLETO do aplicativo gerado e deve interpretar QUALQUER solicitação do usuário em linguagem natural, assim como o sistema do index_sqlite.html faz.

${appContext}

${inspectedContext}

=== CÓDIGO ATUAL COMPLETO ===
\`\`\`html
${currentCode}
\`\`\`

INSTRUÇÕES CRÍTICAS:
1. SEMPRE retorne o código HTML COMPLETO e FUNCIONAL
2. Mantenha TODA a estrutura, estilos e funcionalidades existentes
3. Aplique APENAS as modificações solicitadas pelo usuário
4. Se o usuário mencionar um elemento específico, localize-o no código e modifique-o
5. Mantenha a consistência visual e funcional
6. Use classes CSS inline ou estilos embutidos quando necessário
7. Certifique-se de que o código seja válido e executável
8. NUNCA remova funcionalidades existentes a menos que explicitamente solicitado

Solicitação do usuário: ${message}

Responda APENAS com o código HTML modificado, sem explicações adicionais.`;

      const result = await geminiService.generateWithPrompt(contextPrompt);
      
      console.log('✅ [AICOPILOT] Resposta recebida do Gemini:', {
        success: result.success,
        hasContent: !!result.content,
        contentLength: result.content?.length || 0,
        error: result.error,
        isOffline: result.isOffline,
        queueId: result.queueId
      });

      if (result.success && result.content) {
        // Verificar se está em modo offline
        if (result.isOffline) {
          addMessage('ai', `🔌 Modo Offline Ativo\n\n${result.content}\n\n⚠️ Esta é uma resposta simulada. Suas mensagens foram salvas e serão processadas quando a API voltar ao ar.`);
        } else {
          // Adicionar resposta da IA
          addMessage('ai', 'Código atualizado com sucesso! As modificações foram aplicadas.');
          
          // Atualizar código
          onCodeUpdate(result.content, 'Modificações aplicadas via AICopilot', userPrompt);
        }
      } else {
        throw new Error(result.error || 'Erro desconhecido ao gerar código');
      }
      
    } catch (error) {
      console.error('❌ [AICOPILOT] Erro ao processar mensagem:', error);
      
      // Incrementar contador de tentativas se for erro de API
      if (error.message.includes('503') || error.message.includes('indisponível')) {
        setRetryAttempt(prev => prev + 1);
        setIsRetrying(true);
        
        // Tentar novamente automaticamente após alguns segundos
        setTimeout(() => {
          setIsRetrying(false);
        }, 3000);
      }
      
      addMessage('ai', `Erro ao processar solicitação: ${error.message}`);
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para renderizar conteúdo da mensagem
  const renderMessageContent = (content: string) => {
    // Verificar se há tags de componente no formato [Componente: <tag>]
    const tagRegex = /\[Componente: ([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      // Adicionar texto antes da tag
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push(
            <span key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words">
              {textBefore}
            </span>
          );
        }
      }

      // Adicionar a tag como cápsula
      const tag = match[1];
      parts.push(
        <span
          key={`tag-${match.index}`}
          className="inline-flex items-center bg-blue-500/20 border border-blue-500/30 rounded-full px-2 py-1 text-xs font-medium text-blue-300 mx-1 my-0.5"
        >
          <Code className="w-3 h-3 mr-1" />
          <span className="font-mono">{tag}</span>
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Adicionar texto restante após a última tag
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      if (textAfter.trim()) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words">
            {textAfter}
          </span>
        );
      }
    }

    // Se não há tags, retornar o conteúdo normal
    if (parts.length === 0) {
      return (
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
      );
    }

    // Retornar as partes combinadas
    return (
      <div className="whitespace-pre-wrap break-words">
        {parts}
      </div>
    );
  };

  // Função para focar no input
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Se não há conteúdo, apenas focar
      if (!inputRef.current.hasChildNodes()) {
        return;
      }
      
      // Mover cursor para o final do último nó de texto
      const range = document.createRange();
      const selection = window.getSelection();
      
      // Encontrar o último nó de texto ou posicionar após as tags
      const lastChild = inputRef.current.lastChild;
      if (lastChild) {
        if (lastChild.nodeType === Node.TEXT_NODE) {
          range.setStart(lastChild, lastChild.textContent?.length || 0);
        } else {
          range.setStartAfter(lastChild);
        }
        range.collapse(true);
      } else {
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
      }
      
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Copilot</h3>
              <p className="text-xs text-gray-400">Assistente para modificação de código</p>
            </div>
          </div>
          
          {/* Indicador de Status da API */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-green-400' : 
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-400 animate-pulse' : 
              'bg-red-400'
            }`}></div>
            <span className={`text-xs ${
              connectionStatus === 'online' ? 'text-green-400' :
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {
                connectionStatus === 'online' ? 'Online' :
                connectionStatus === 'connecting' ? 'Conectando...' :
                connectionStatus === 'reconnecting' ? `Reconectando... (${retryAttempt}/${maxReconnectAttempts})` :
                'Offline'
              }
            </span>
            
            {/* Botão de Reload da API */}
            <button
              onClick={async () => {
                console.log('🔄 [AICOPILOT] Reload manual solicitado...');
                
                // Limpar qualquer reconexão automática em andamento
                clearReconnectTimeout();
                setIsRetrying(false);
                
                // Executar verificação de status (que inclui reload se necessário)
                await checkGeminiStatus();
              }}
              disabled={isRetrying}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1 rounded transition-colors duration-200"
              title="Forçar reload da API"
            >
              <svg className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={conversationRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Olá! Sou seu assistente de código.</p>
            <p className="text-xs mt-2">Descreva as modificações que deseja fazer no seu aplicativo.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {renderMessageContent(message.content)}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center ml-3 flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Indicador de digitação quando processando */}
        {isProcessing && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 pb-6">
        {/* Botão Tentar Novamente (quando offline) */}
        {!isGeminiReady && retryAttempt > 0 && (
          <div className="mb-3 flex justify-center">
            <button
              onClick={async () => {
                setIsRetrying(true);
                try {
                  const status = await geminiService.checkApiStatus();
                  setIsGeminiReady(status);
                  if (status) {
                    setRetryAttempt(0);
                    addMessage('ai', '✅ Conexão restaurada! A API está funcionando novamente.');
                  }
                } catch (error) {
                  console.error('Erro ao tentar reconectar:', error);
                } finally {
                  setIsRetrying(false);
                }
              }}
              disabled={isRetrying}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              {isRetrying ? 'Verificando...' : 'Tentar Novamente'}
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-3">
          <div
            ref={inputRef}
            contentEditable
            onInput={handleInputChange}
            onKeyDown={handleKeyPress}
            onClick={focusInput}
            className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[150px] overflow-y-auto"
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            data-placeholder="Digite sua solicitação... (Ex: Adicione um botão de reset, Mude a cor para azul, Crie uma seção de comentários)"
            suppressContentEditableWarning
          >
            {/* Renderizar tags inline dentro do contentEditable */}
            {componentTags.map((tag, index) => (
              <span
                key={`${tag.id}-${index}`}
                contentEditable={false}
                className="inline-flex items-center bg-blue-500/20 border border-blue-500/30 rounded-full px-2 py-1 text-xs font-medium text-blue-300 mx-1 my-0.5"
                style={{ userSelect: 'none' }}
              >
                <Code className="w-3 h-3 mr-1" />
                <span className="font-mono">{tag.tag}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                  title="Remover tag"
                  tabIndex={-1}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              console.log('🚀 [AI_COPILOT] Botão de envio clicado:', {
                isGeminiReady,
                isProcessing,
                hasContent: !!(inputRef.current?.textContent?.trim() || componentTags.length > 0),
                disabled: (!inputRef.current?.textContent?.trim() && componentTags.length === 0) || isProcessing || !isGeminiReady,
                timestamp: new Date().toISOString()
              });
              handleSendMessage();
            }}
            disabled={buttonDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold p-3 rounded-lg transition-colors duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]"
            title={!isGeminiReady ? "Aguardando conexão com a API..." : "Enviar mensagem"}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable]:focus:before {
          content: '';
        }
        [contenteditable] span[contenteditable="false"] {
          display: inline-flex;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default AICopilot;