import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { geminiService } from '../../services/gemini';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AICopilotProps {
  currentCode: string;
  appConfig: any;
  onCodeUpdate: (newCode: string, explanation: string, userPrompt?: string) => void;
  onError: (error: string) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  currentCode,
  appConfig,
  onCodeUpdate,
  onError
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Olá! Sou seu Copiloto IA. Posso ajudar você a modificar seu app. Descreva o que você gostaria de alterar e eu farei as modificações necessárias no código.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeminiReady, setIsGeminiReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Verificar se o GeminiService está pronto
  useEffect(() => {
    const checkGeminiStatus = async () => {
      console.log('🔍 [AICOPILOT] Verificando status do GeminiService...');
      
      // Aguardar mais tempo para garantir que o init() foi executado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const apiKey = geminiService.getApiKey();
      console.log('📊 [AICOPILOT] Status inicial do GeminiService:', {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'null'
      });
      
      setIsGeminiReady(!!apiKey);
      
      if (!apiKey) {
        console.log('⚠️ [AICOPILOT] API Key não encontrada, tentando recarregar múltiplas vezes...');
        
        // Tentar recarregar até 3 vezes com intervalos
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`🔄 [AICOPILOT] Tentativa de reload ${attempt}/3...`);
            await geminiService.reload();
            
            // Aguardar um pouco após o reload
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const reloadedApiKey = geminiService.getApiKey();
            console.log(`📊 [AICOPILOT] Após reload ${attempt}:`, {
              hasApiKey: !!reloadedApiKey,
              apiKeyLength: reloadedApiKey?.length || 0,
              apiKeyPreview: reloadedApiKey ? `${reloadedApiKey.substring(0, 10)}...` : 'null'
            });
            
            if (reloadedApiKey) {
              setIsGeminiReady(true);
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
    };

    checkGeminiStatus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

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

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isProcessing) return;

    // Capturar o prompt do usuário para versionamento
    const userPrompt = message;

    // Add user message
    addMessage('user', message);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Simulate AI thinking time
      setTimeout(async () => {
        try {
          const response = await processAIRequest(userPrompt);
          addMessage('ai', response.explanation);
          
          if (response.newCode && response.newCode !== currentCode) {
            // Passar o prompt do usuário para o callback onCodeUpdate
            onCodeUpdate(response.newCode, response.explanation, userPrompt);
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Erro ao processar solicitação';
          addMessage('ai', `❌ ${errorMessage}`);
          onError(errorMessage);
        } finally {
          setIsProcessing(false);
        }
      }, 1000);
    } catch (error: any) {
      addMessage('ai', `❌ Erro: ${error?.message || 'Erro desconhecido'}`);
      onError(error?.message || 'Erro desconhecido');
      setIsProcessing(false);
    }
  };

  const buildContextPrompt = (userMessage: string): string => {
    // Construir contexto completo dos arquivos
    const filesContext = currentCode ? `
=== CÓDIGO PRINCIPAL ===
\`\`\`html
${currentCode}
\`\`\`
` : 'Nenhum código disponível ainda.';

    // Construir informações do app config
    const appContext = appConfig ? `
=== CONFIGURAÇÃO DO APLICATIVO ===
- Nome: ${appConfig.name}
- Descrição: ${appConfig.description || 'Sem descrição'}
- Tecnologias: ${appConfig.technologies?.join(', ') || 'HTML, CSS, JavaScript'}
- Funcionalidades: ${appConfig.functionalities?.join(', ') || 'Não especificadas'}
- Integrações: ${appConfig.integrations ? Object.keys(appConfig.integrations).join(', ') : 'Nenhuma'}
` : '';

    let contextPrompt = `Você é um assistente IA especializado em modificação de aplicações web. Você tem acesso ao contexto COMPLETO do aplicativo gerado e deve interpretar QUALQUER solicitação do usuário em linguagem natural, assim como o sistema do index_sqlite.html faz.

${appContext}

=== CONTEXTO COMPLETO DOS ARQUIVOS ===
${filesContext}

=== SOLICITAÇÃO DO USUÁRIO ===
${userMessage}

=== INSTRUÇÕES IMPORTANTES ===
1. **ANÁLISE COMPLETA**: Analise todo o contexto dos arquivos para entender a estrutura atual
2. **INTERPRETAÇÃO LIVRE**: Interprete a solicitação do usuário sem limitações de comandos específicos
3. **MODIFICAÇÕES INTELIGENTES**: Faça as modificações necessárias mantendo a coerência do código
4. **RESPOSTA ESTRUTURADA**: Retorne o código modificado e uma explicação clara do que foi alterado
5. **PRESERVAÇÃO**: Mantenha funcionalidades existentes que não foram mencionadas para alteração
6. **QUALIDADE**: Garanta que o código resultante seja funcional e bem estruturado

=== FORMATO DE RESPOSTA ===
Responda no seguinte formato:

**MODIFICAÇÕES REALIZADAS:**
[Explicação clara do que foi alterado]

**CÓDIGO ATUALIZADO:**
\`\`\`html
[Código HTML completo modificado]
\`\`\`

**ARQUIVOS ADICIONAIS:** (se necessário)
[Lista de arquivos CSS/JS separados, se aplicável]`;

    return contextPrompt;
  };

  const processAIRequest = async (userRequest: string) => {
    // Preparar contexto completo para o Gemini
    const context = {
      currentCode,
      appConfig,
      userRequest,
      timestamp: new Date().toISOString()
    };

    // Criar prompt inteligente para o Gemini
    const prompt = buildContextPrompt(userRequest);

    try {
      const response = await geminiService.generateWithPrompt(prompt);
      
      if (response.success && response.content) {
        // Processar resposta estruturada
        const content = response.content;
        
        // Extrair explicação das modificações
        const modificationMatch = content.match(/\*\*MODIFICAÇÕES REALIZADAS:\*\*\s*([\s\S]*?)(?=\*\*CÓDIGO ATUALIZADO:\*\*|$)/);
        const explanation = modificationMatch ? modificationMatch[1].trim() : 'Modificações realizadas conforme solicitado.';
        
        // Extrair código atualizado
        const codeMatch = content.match(/\*\*CÓDIGO ATUALIZADO:\*\*[\s\S]*?```html\s*([\s\S]*?)```/);
        const newCode = codeMatch ? codeMatch[1].trim() : currentCode;
        
        // Se encontrou código novo, usar ele; senão manter o atual
        if (newCode && newCode !== currentCode) {
          return {
            newCode,
            explanation,
            changes: [explanation]
          };
        } else {
          // Se não encontrou código estruturado, tentar parsear como JSON (fallback)
          try {
            const parsedResponse = JSON.parse(content);
            if (parsedResponse.success) {
              return {
                newCode: parsedResponse.newCode,
                explanation: parsedResponse.explanation,
                changes: parsedResponse.changes || []
              };
            }
          } catch (parseError) {
            // Usar resposta como explicação
            return {
              newCode: currentCode,
              explanation: content,
              changes: []
            };
          }
        }
        
        return {
          newCode: currentCode,
          explanation,
          changes: []
        };
      } else {
        throw new Error(response.error || 'Erro na comunicação com a IA');
      }
    } catch (error: any) {
      throw new Error(`Erro ao processar solicitação: ${error.message}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <Bot className="w-6 h-6 text-blue-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Copiloto IA</h3>
        <div className="ml-auto">
          {isProcessing && (
            <div className="flex items-center text-sm text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
              Processando...
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div 
        ref={conversationRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
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
              <div className="whitespace-pre-wrap">{message.content}</div>
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
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 pb-6">
        <div className="flex items-end space-x-3">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua solicitação... (Ex: Adicione um botão de reset, Mude a cor para azul, Crie uma seção de comentários)"
            className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[150px]"
            rows={1}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold p-3 rounded-lg transition-colors duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;