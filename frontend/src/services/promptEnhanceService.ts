import { geminiService } from './gemini';

export interface PromptEnhanceResponse {
  success: boolean;
  enhancedDescription?: string;
  error?: string;
}

export class PromptEnhanceService {
  /**
   * Aprimora a descrição do aplicativo fornecida pelo usuário
   * Analisa e expande os requisitos funcionais necessários
   */
  async enhanceAppDescription(originalDescription: string): Promise<PromptEnhanceResponse> {
    console.log('🚀 [PROMPT_ENHANCE] Iniciando aprimoramento da descrição:', {
      originalLength: originalDescription.length,
      originalPreview: originalDescription.substring(0, 100) + '...'
    });

    if (!originalDescription || originalDescription.trim().length === 0) {
      return {
        success: false,
        error: 'Descrição não pode estar vazia'
      };
    }

    // Verificar se o GeminiService está configurado
    const apiKey = geminiService.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: 'API Key do Gemini não configurada. Configure nas configurações primeiro.'
      };
    }

    try {
      const enhancePrompt = this.buildEnhancePrompt(originalDescription);
      console.log('📝 [PROMPT_ENHANCE] Prompt construído:', {
        promptLength: enhancePrompt.length
      });

      const result = await geminiService.generateWithPrompt(enhancePrompt);
      
      if (result.success && result.content) {
        console.log('✅ [PROMPT_ENHANCE] Descrição aprimorada com sucesso:', {
          originalLength: originalDescription.length,
          enhancedLength: result.content.length
        });

        return {
          success: true,
          enhancedDescription: result.content.trim()
        };
      } else {
        console.error('❌ [PROMPT_ENHANCE] Erro ao aprimorar descrição:', result.error);
        return {
          success: false,
          error: result.error || 'Erro desconhecido ao aprimorar descrição'
        };
      }
    } catch (error) {
      console.error('❌ [PROMPT_ENHANCE] Erro inesperado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado'
      };
    }
  }

  /**
   * Constrói o prompt para aprimoramento da descrição
   */
  private buildEnhancePrompt(originalDescription: string): string {
    return `Você é um especialista em análise de requisitos de software e desenvolvimento de aplicações web. Sua tarefa é analisar a descrição de um aplicativo fornecida pelo usuário e aprimorá-la significativamente.

DESCRIÇÃO ORIGINAL DO USUÁRIO:
"${originalDescription}"

INSTRUÇÕES PARA APRIMORAMENTO:

1. **ANÁLISE PROFUNDA**: Analise a descrição original e identifique:
   - Funcionalidades explícitas mencionadas
   - Funcionalidades implícitas necessárias
   - Requisitos técnicos que serão necessários
   - Integrações que podem ser úteis

2. **EXPANSÃO DETALHADA**: Expanda a descrição incluindo:
   - Funcionalidades de autenticação e autorização (se aplicável)
   - Sistema de gerenciamento de dados
   - Interface de usuário intuitiva
   - Funcionalidades de busca e filtros (se relevante)
   - Sistema de notificações (se apropriado)
   - Painel administrativo (se necessário)
   - Relatórios e analytics (se útil)
   - Integração com APIs externas (se relevante)
   - Funcionalidades mobile-first e responsivas

3. **MELHORIA DA CLAREZA**: Reescreva a descrição de forma:
   - Clara e objetiva
   - Técnica mas compreensível
   - Estruturada e organizada
   - Completa mas concisa

4. **REQUISITOS TÉCNICOS**: Inclua considerações sobre:
   - Experiência do usuário (UX/UI)
   - Performance e otimização
   - Segurança e privacidade
   - Acessibilidade
   - Responsividade mobile-first

FORMATO DA RESPOSTA:
Forneça APENAS a descrição aprimorada, sem explicações adicionais, comentários ou formatação markdown. A resposta deve ser um texto corrido que substitua completamente a descrição original.

EXEMPLO DE TRANSFORMAÇÃO:
Original: "Um e-commerce simples"
Aprimorada: "Uma plataforma de e-commerce completa com catálogo de produtos organizados por categorias, sistema de carrinho de compras com cálculo automático de frete, integração com gateways de pagamento (PIX, cartão, boleto), gerenciamento de pedidos com acompanhamento em tempo real, área do cliente para histórico de compras e dados pessoais, painel administrativo para gestão de produtos, estoque e vendas, sistema de avaliações e comentários de produtos, funcionalidades de busca avançada com filtros por preço, categoria e marca, sistema de cupons de desconto, notificações por email para confirmação de pedidos, e design responsivo otimizado para dispositivos móveis."

Agora apimore a descrição fornecida seguindo todas essas diretrizes:`;
  }
}

export const promptEnhanceService = new PromptEnhanceService();