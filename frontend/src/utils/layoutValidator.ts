/**
 * Validador de Layout Responsivo
 * Verifica se o código gerado implementa corretamente os menus fixos
 */

export interface LayoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth?: number;
  maxWidth?: number;
  expectedBehavior: string;
}

export class LayoutValidator {
  private static readonly REQUIRED_BREAKPOINTS: ResponsiveBreakpoint[] = [
    {
      name: 'Extra Small (Mobile Portrait)',
      maxWidth: 575,
      expectedBehavior: 'Sidebar como overlay, header fixo, menu hambúrguer'
    },
    {
      name: 'Small (Mobile Landscape)',
      minWidth: 576,
      maxWidth: 767,
      expectedBehavior: 'Sidebar como overlay, header fixo'
    },
    {
      name: 'Medium (Tablet)',
      minWidth: 768,
      maxWidth: 991,
      expectedBehavior: 'Sidebar fixa ou colapsável, header fixo'
    },
    {
      name: 'Large (Desktop)',
      minWidth: 992,
      maxWidth: 1199,
      expectedBehavior: 'Sidebar fixa, header fixo, layout completo'
    },
    {
      name: 'Extra Large (Desktop Grande)',
      minWidth: 1200,
      expectedBehavior: 'Layout otimizado para telas grandes'
    }
  ];

  /**
   * Valida se o código HTML/CSS implementa layout fixo corretamente
   */
  static validateFixedLayout(code: string): LayoutValidationResult {
    const result: LayoutValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Verificar se contém estrutura básica de layout fixo
    this.validateBasicStructure(code, result);
    
    // Verificar CSS para position: fixed
    this.validateFixedPositioning(code, result);
    
    // Verificar overflow settings
    this.validateOverflowSettings(code, result);
    
    // Verificar media queries
    this.validateMediaQueries(code, result);
    
    // Verificar acessibilidade
    this.validateAccessibility(code, result);
    
    // Verificar se há elementos que podem causar scroll indesejado
    this.validateScrollPrevention(code, result);

    result.isValid = result.errors.length === 0;
    
    return result;
  }

  private static validateBasicStructure(code: string, result: LayoutValidationResult): void {
    const requiredElements = [
      { pattern: /<header|<nav.*class.*header|class.*app-header/, name: 'Header/Navbar' },
      { pattern: /<main|class.*main|class.*app-main/, name: 'Main content area' },
      { pattern: /<aside|class.*sidebar|class.*app-sidebar/, name: 'Sidebar (opcional)' },
      { pattern: /<footer|class.*footer|class.*app-footer/, name: 'Footer (opcional)' }
    ];

    requiredElements.forEach(element => {
      if (!element.pattern.test(code)) {
        if (element.name.includes('opcional')) {
          result.warnings.push(`${element.name} não encontrado - considere adicionar se necessário`);
        } else {
          result.errors.push(`${element.name} obrigatório não encontrado`);
        }
      }
    });
  }

  private static validateFixedPositioning(code: string, result: LayoutValidationResult): void {
    // Verificar se header/navbar usa position: fixed
    const headerFixedPattern = /position:\s*fixed.*header|header.*position:\s*fixed|\..*header.*{[^}]*position:\s*fixed/i;
    if (!headerFixedPattern.test(code)) {
      result.errors.push('Header deve usar position: fixed para permanecer fixo');
    }

    // Verificar se há elementos com position: fixed apropriados
    const fixedElements = code.match(/position:\s*fixed/gi);
    if (!fixedElements || fixedElements.length === 0) {
      result.errors.push('Nenhum elemento com position: fixed encontrado - menus devem ser fixos');
    }

    // Verificar z-index para elementos fixos
    const zIndexPattern = /z-index:\s*\d+/gi;
    const zIndexMatches = code.match(zIndexPattern);
    if (!zIndexMatches || zIndexMatches.length === 0) {
      result.warnings.push('Considere adicionar z-index para elementos fixos evitarem sobreposição');
    }
  }

  private static validateOverflowSettings(code: string, result: LayoutValidationResult): void {
    // Verificar se main content tem overflow-y: auto
    const mainOverflowPattern = /\..*main.*{[^}]*overflow-y:\s*auto|overflow-y:\s*auto.*main/i;
    if (!mainOverflowPattern.test(code)) {
      result.errors.push('Área principal deve ter overflow-y: auto para permitir scroll do conteúdo');
    }

    // Verificar se body/html não tem overflow indesejado
    const bodyOverflowPattern = /body.*{[^}]*overflow:\s*hidden|html.*{[^}]*overflow:\s*hidden/i;
    if (!bodyOverflowPattern.test(code)) {
      result.suggestions.push('Considere adicionar overflow: hidden ao body para prevenir scroll da página');
    }

    // Verificar height: 100vh
    const fullHeightPattern = /height:\s*100vh/i;
    if (!fullHeightPattern.test(code)) {
      result.warnings.push('Considere usar height: 100vh no container principal para ocupar toda a tela');
    }
  }

  private static validateMediaQueries(code: string, result: LayoutValidationResult): void {
    const mediaQueryPattern = /@media.*\([^)]+\)/gi;
    const mediaQueries = code.match(mediaQueryPattern) || [];

    if (mediaQueries.length === 0) {
      result.errors.push('Nenhuma media query encontrada - layout deve ser responsivo');
      return;
    }

    // Verificar breakpoints específicos
    const breakpointPatterns = [
      { pattern: /max-width:\s*575px|max-width:\s*576px/i, name: 'Mobile (575px)' },
      { pattern: /min-width:\s*768px/i, name: 'Tablet (768px)' },
      { pattern: /min-width:\s*992px|min-width:\s*1024px/i, name: 'Desktop (992px/1024px)' },
      { pattern: /min-width:\s*1200px/i, name: 'Desktop Grande (1200px)' }
    ];

    breakpointPatterns.forEach(bp => {
      if (!bp.pattern.test(code)) {
        result.warnings.push(`Breakpoint ${bp.name} não encontrado - considere adicionar para melhor responsividade`);
      }
    });
  }

  private static validateAccessibility(code: string, result: LayoutValidationResult): void {
    // Verificar ARIA labels
    const ariaPattern = /aria-label|aria-labelledby|aria-describedby|role=/i;
    if (!ariaPattern.test(code)) {
      result.warnings.push('Considere adicionar ARIA labels para melhor acessibilidade');
    }

    // Verificar navegação por teclado
    const keyboardPattern = /tabindex|onKeyDown|onKeyPress/i;
    if (!keyboardPattern.test(code)) {
      result.suggestions.push('Considere adicionar suporte para navegação por teclado');
    }

    // Verificar botão de menu hambúrguer
    const hamburgerPattern = /menu-toggle|hamburger|☰|≡/i;
    if (!hamburgerPattern.test(code)) {
      result.warnings.push('Menu hambúrguer não encontrado - necessário para mobile');
    }
  }

  private static validateScrollPrevention(code: string, result: LayoutValidationResult): void {
    // Verificar se há elementos que podem causar scroll horizontal
    const horizontalScrollRisks = [
      /width:\s*\d+px(?!\s*;?\s*max-width)/i, // width fixo sem max-width
      /min-width:\s*\d{4,}px/i, // min-width muito grande
      /margin-left:\s*\d{3,}px/i // margin-left muito grande
    ];

    horizontalScrollRisks.forEach((pattern, index) => {
      if (pattern.test(code)) {
        const risks = [
          'Largura fixa sem max-width pode causar scroll horizontal',
          'Min-width muito grande pode causar problemas em mobile',
          'Margin-left grande pode causar overflow'
        ];
        result.warnings.push(risks[index]);
      }
    });
  }

  /**
   * Gera relatório de validação em formato legível
   */
  static generateValidationReport(result: LayoutValidationResult): string {
    let report = '=== RELATÓRIO DE VALIDAÇÃO DE LAYOUT ===\n\n';
    
    report += `Status: ${result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n\n`;

    if (result.errors.length > 0) {
      report += '🚨 ERROS CRÍTICOS:\n';
      result.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += '⚠️ AVISOS:\n';
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    if (result.suggestions.length > 0) {
      report += '💡 SUGESTÕES:\n';
      result.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });
      report += '\n';
    }

    report += '=== BREAKPOINTS RECOMENDADOS ===\n';
    this.REQUIRED_BREAKPOINTS.forEach(bp => {
      const range = bp.minWidth && bp.maxWidth 
        ? `${bp.minWidth}px - ${bp.maxWidth}px`
        : bp.minWidth 
          ? `${bp.minWidth}px+`
          : `até ${bp.maxWidth}px`;
      
      report += `📱 ${bp.name} (${range}): ${bp.expectedBehavior}\n`;
    });

    return report;
  }

  /**
   * Testa responsividade em diferentes breakpoints
   */
  static generateResponsiveTests(): string {
    return `
// TESTES DE RESPONSIVIDADE AUTOMÁTICOS
// Cole este código no console do navegador para testar

function testResponsiveLayout() {
  const breakpoints = [
    { width: 375, name: 'Mobile Portrait' },
    { width: 576, name: 'Mobile Landscape' },
    { width: 768, name: 'Tablet' },
    { width: 1024, name: 'Desktop' },
    { width: 1200, name: 'Desktop Grande' }
  ];

  console.log('🧪 Iniciando testes de responsividade...');
  
  breakpoints.forEach(bp => {
    // Simular mudança de viewport
    window.resizeTo(bp.width, 800);
    
    setTimeout(() => {
      console.log(\`📏 Testando \${bp.name} (\${bp.width}px):\`);
      
      // Verificar se menus estão fixos
      const header = document.querySelector('header, .app-header, .mobile-header');
      const sidebar = document.querySelector('aside, .app-sidebar, .sidebar');
      const main = document.querySelector('main, .app-main, .mobile-main');
      
      if (header) {
        const headerStyle = getComputedStyle(header);
        console.log(\`  Header position: \${headerStyle.position}\`);
        console.log(\`  Header z-index: \${headerStyle.zIndex}\`);
      }
      
      if (sidebar) {
        const sidebarStyle = getComputedStyle(sidebar);
        console.log(\`  Sidebar position: \${sidebarStyle.position}\`);
        console.log(\`  Sidebar transform: \${sidebarStyle.transform}\`);
      }
      
      if (main) {
        const mainStyle = getComputedStyle(main);
        console.log(\`  Main overflow-y: \${mainStyle.overflowY}\`);
        console.log(\`  Main height: \${mainStyle.height}\`);
      }
      
      console.log('---');
    }, 100);
  });
}

// Executar teste
testResponsiveLayout();
`;
  }
}