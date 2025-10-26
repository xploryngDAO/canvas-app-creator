import React from 'react';

// Expanded options for settings page with visual previews
export const APP_TYPES_EXPANDED = [
  {
    value: 'web-spa',
    title: '🌐 Web App (SPA)',
    description: 'Single Page Application',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "12", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "8", y: "20", width: "104", height: "50", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "27", width: "90", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "70", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "15", y: "43", width: "80", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "15", y: "55", width: "40", height: "8", fill: "#3B82F6", rx: "2" })
    )
  },
  {
    value: 'mobile-app',
    title: '📱 Mobile App',
    description: 'React Native/Flutter',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "35", y: "5", width: "50", height: "70", fill: "#1F2937", rx: "8" }),
      React.createElement('rect', { x: "38", y: "12", width: "44", height: "56", fill: "#F3F4F6", rx: "4" }),
      React.createElement('circle', { cx: "60", cy: "75", r: "3", fill: "#6B7280" }),
      React.createElement('rect', { x: "42", y: "18", width: "36", height: "4", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "42", y: "26", width: "20", height: "20", fill: "#EF4444", rx: "2" }),
      React.createElement('rect', { x: "66", y: "26", width: "12", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "66", y: "32", width: "8", height: "4", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'desktop-app',
    title: '🖥️ Desktop App',
    description: 'Electron/Native',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#1F2937", rx: "4" }),
      React.createElement('rect', { x: "12", y: "12", width: "96", height: "8", fill: "#374151", rx: "2" }),
      React.createElement('circle', { cx: "18", cy: "16", r: "2", fill: "#EF4444" }),
      React.createElement('circle', { cx: "26", cy: "16", r: "2", fill: "#F59E0B" }),
      React.createElement('circle', { cx: "34", cy: "16", r: "2", fill: "#10B981" }),
      React.createElement('rect', { x: "20", y: "28", width: "80", height: "32", fill: "#F9FAFB", rx: "2" })
    )
  },
  {
    value: 'browser-extension',
    title: '🧩 Extensão de Navegador',
    description: 'Chrome/Firefox Extension',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "20", y: "15", width: "80", height: "50", fill: "#3B82F6", rx: "6" }),
      React.createElement('rect', { x: "25", y: "20", width: "70", height: "40", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "30", y: "25", width: "60", height: "4", fill: "#1F2937", rx: "1" }),
      React.createElement('rect', { x: "30", y: "33", width: "40", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "30", y: "41", width: "50", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "30", y: "50", width: "25", height: "6", fill: "#3B82F6", rx: "2" })
    )
  },
  {
    value: 'pwa',
    title: '📊 Progressive Web App',
    description: 'PWA com Service Workers',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "15", y: "10", width: "90", height: "60", fill: "#10B981", rx: "4" }),
      React.createElement('rect', { x: "20", y: "15", width: "80", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "25", y: "20", width: "70", height: "4", fill: "#1F2937", rx: "1" }),
      React.createElement('rect', { x: "25", y: "28", width: "50", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('circle', { cx: "85", cy: "25", r: "8", fill: "#10B981", opacity: "0.3" }),
      React.createElement('rect', { x: "25", y: "40", width: "70", height: "20", fill: "#E5E7EB", rx: "2" })
    )
  },
  {
    value: 'api-backend',
    title: '🔗 API/Backend Only',
    description: 'REST/GraphQL API',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "20", y: "20", width: "80", height: "40", fill: "#1F2937", rx: "4" }),
      React.createElement('rect', { x: "25", y: "25", width: "70", height: "30", fill: "#0F172A", rx: "2" }),
      React.createElement('rect', { x: "30", y: "30", width: "15", height: "4", fill: "#10B981", rx: "1" }),
      React.createElement('rect', { x: "50", y: "30", width: "25", height: "4", fill: "#F59E0B", rx: "1" }),
      React.createElement('rect', { x: "30", y: "38", width: "20", height: "4", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "55", y: "38", width: "30", height: "4", fill: "#EF4444", rx: "1" }),
      React.createElement('rect', { x: "30", y: "46", width: "40", height: "4", fill: "#8B5CF6", rx: "1" })
    )
  },
  {
    value: 'game-interactive',
    title: '🎮 Game/Interactive',
    description: 'Jogos e Apps Interativos',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "15", width: "100", height: "50", fill: "#8B5CF6", rx: "6" }),
      React.createElement('rect', { x: "15", y: "20", width: "90", height: "40", fill: "#1F2937", rx: "4" }),
      React.createElement('circle', { cx: "35", cy: "35", r: "8", fill: "#10B981" }),
      React.createElement('circle', { cx: "55", cy: "35", r: "8", fill: "#EF4444" }),
      React.createElement('circle', { cx: "75", cy: "35", r: "8", fill: "#F59E0B" }),
      React.createElement('rect', { x: "85", y: "30", width: "20", height: "10", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "25", y: "50", width: "70", height: "4", fill: "#F3F4F6", rx: "1" })
    )
  },
  {
    value: 'elearning',
    title: '📚 E-learning Platform',
    description: 'Plataforma de Ensino',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "15", y: "10", width: "90", height: "60", fill: "#F59E0B", rx: "4" }),
      React.createElement('rect', { x: "20", y: "15", width: "80", height: "50", fill: "#FEF3C7", rx: "3" }),
      React.createElement('rect', { x: "25", y: "20", width: "70", height: "4", fill: "#92400E", rx: "1" }),
      React.createElement('rect', { x: "25", y: "30", width: "30", height: "20", fill: "#FBBF24", rx: "2" }),
      React.createElement('rect', { x: "60", y: "30", width: "30", height: "4", fill: "#92400E", rx: "1" }),
      React.createElement('rect', { x: "60", y: "38", width: "25", height: "4", fill: "#92400E", rx: "1" }),
      React.createElement('rect', { x: "60", y: "46", width: "20", height: "4", fill: "#92400E", rx: "1" }),
      React.createElement('rect', { x: "25", y: "55", width: "70", height: "6", fill: "#F59E0B", rx: "2" })
    )
  },
  {
    value: 'ecommerce',
    title: '🛒 E-commerce App',
    description: 'Loja Virtual',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#10B981", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "20", width: "25", height: "20", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "50", y: "20", width: "25", height: "20", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "80", y: "20", width: "25", height: "20", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "45", width: "85", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "53", width: "60", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "85", y: "50", width: "20", height: "8", fill: "#10B981", rx: "2" })
    )
  },
  {
    value: 'dashboard-analytics',
    title: '📊 Dashboard/Analytics',
    description: 'Painel de Controle',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#1F2937", rx: "4" }),
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "8", fill: "#374151", rx: "2" }),
      React.createElement('rect', { x: "15", y: "25", width: "25", height: "20", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "45", y: "30", width: "25", height: "15", fill: "#10B981", rx: "2" }),
      React.createElement('rect', { x: "75", y: "20", width: "25", height: "25", fill: "#EF4444", rx: "2" }),
      React.createElement('rect', { x: "15", y: "50", width: "85", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "15", y: "58", width: "60", height: "4", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'chat-messaging',
    title: '💬 Chat/Messaging',
    description: 'App de Mensagens',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "15", y: "10", width: "90", height: "60", fill: "#3B82F6", rx: "4" }),
      React.createElement('rect', { x: "20", y: "15", width: "80", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "25", y: "20", width: "40", height: "8", fill: "#DBEAFE", rx: "4" }),
      React.createElement('rect', { x: "55", y: "32", width: "35", height: "8", fill: "#3B82F6", rx: "4" }),
      React.createElement('rect', { x: "25", y: "44", width: "45", height: "8", fill: "#DBEAFE", rx: "4" }),
      React.createElement('rect', { x: "25", y: "56", width: "70", height: "4", fill: "#E5E7EB", rx: "2" }),
      React.createElement('circle', { cx: "95", cy: "58", r: "3", fill: "#10B981" })
    )
  },
  {
    value: 'cms-blog',
    title: '📝 CMS/Blog Platform',
    description: 'Sistema de Conteúdo',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#6366F1", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "20", width: "80", height: "6", fill: "#1F2937", rx: "2" }),
      React.createElement('rect', { x: "20", y: "30", width: "35", height: "25", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "60", y: "30", width: "40", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "60", y: "38", width: "35", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "60", y: "46", width: "30", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "60", width: "80", height: "3", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'social-media',
    title: '📱 Social Media App',
    description: 'Rede Social',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#EC4899", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "20", width: "80", height: "8", fill: "#1F2937", rx: "2" }),
      React.createElement('circle', { cx: "30", cy: "40", r: "6", fill: "#EC4899" }),
      React.createElement('rect', { x: "40", y: "35", width: "50", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "40", y: "43", width: "35", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "55", width: "15", height: "6", fill: "#EC4899", rx: "2" }),
      React.createElement('rect', { x: "40", y: "55", width: "15", height: "6", fill: "#6B7280", rx: "2" }),
      React.createElement('rect', { x: "60", y: "55", width: "15", height: "6", fill: "#6B7280", rx: "2" })
    )
  },
  {
    value: 'portfolio-showcase',
    title: '🎨 Portfolio/Showcase',
    description: 'Portfólio Criativo',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#7C3AED", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "20", width: "35", height: "20", fill: "#A855F7", rx: "2" }),
      React.createElement('rect', { x: "60", y: "20", width: "40", height: "8", fill: "#1F2937", rx: "2" }),
      React.createElement('rect', { x: "60", y: "32", width: "30", height: "8", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "45", width: "25", height: "15", fill: "#C084FC", rx: "2" }),
      React.createElement('rect', { x: "50", y: "45", width: "25", height: "15", fill: "#DDD6FE", rx: "2" }),
      React.createElement('rect', { x: "80", y: "45", width: "20", height: "15", fill: "#EDE9FE", rx: "2" })
    )
  },
  {
    value: 'landing-page',
    title: '🚀 Landing Page',
    description: 'Página de Aterrissagem',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "#059669", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "20", width: "80", height: "8", fill: "#1F2937", rx: "2" }),
      React.createElement('rect', { x: "20", y: "35", width: "60", height: "6", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "45", width: "50", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "55", width: "30", height: "8", fill: "#059669", rx: "2" }),
      React.createElement('rect', { x: "85", y: "30", width: "15", height: "25", fill: "#D1FAE5", rx: "2" })
    )
  }
];

// Platform types with visual previews
export const PLATFORM_TYPES_EXPANDED = [
  {
    value: 'web',
    title: '🌐 Web',
    description: 'Aplicação web moderna',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "10", y: "15", width: "100", height: "50", fill: "#3B82F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "20", width: "90", height: "40", fill: "#F3F4F6", rx: "3" }),
      React.createElement('rect', { x: "20", y: "25", width: "80", height: "4", fill: "#1F2937", rx: "1" }),
      React.createElement('rect', { x: "20", y: "33", width: "60", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "41", width: "70", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "50", width: "40", height: "6", fill: "#3B82F6", rx: "2" })
    )
  },
  {
    value: 'mobile',
    title: '📱 Mobile',
    description: 'App nativo mobile',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "40", y: "10", width: "40", height: "60", fill: "#1F2937", rx: "6" }),
      React.createElement('rect', { x: "43", y: "15", width: "34", height: "50", fill: "#F3F4F6", rx: "3" }),
      React.createElement('circle', { cx: "60", cy: "70", r: "2", fill: "#6B7280" }),
      React.createElement('rect', { x: "47", y: "20", width: "26", height: "3", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "47", y: "27", width: "15", height: "15", fill: "#EF4444", rx: "2" }),
      React.createElement('rect', { x: "65", y: "27", width: "8", height: "3", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'desktop',
    title: '🖥️ Desktop',
    description: 'Aplicação desktop',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#1F2937", rx: "4" }),
      React.createElement('rect', { x: "17", y: "17", width: "86", height: "6", fill: "#374151", rx: "2" }),
      React.createElement('circle', { cx: "22", cy: "20", r: "1.5", fill: "#EF4444" }),
      React.createElement('circle', { cx: "28", cy: "20", r: "1.5", fill: "#F59E0B" }),
      React.createElement('circle', { cx: "34", cy: "20", r: "1.5", fill: "#10B981" }),
      React.createElement('rect', { x: "20", y: "28", width: "80", height: "32", fill: "#F9FAFB", rx: "2" })
    )
  },
  {
    value: 'extension',
    title: '🧩 Extension',
    description: 'Extensão de navegador',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "25", y: "20", width: "70", height: "40", fill: "#3B82F6", rx: "6" }),
      React.createElement('rect', { x: "30", y: "25", width: "60", height: "30", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "35", y: "30", width: "50", height: "3", fill: "#1F2937", rx: "1" }),
      React.createElement('rect', { x: "35", y: "37", width: "35", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "35", y: "44", width: "40", height: "3", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'pwa',
    title: '📊 PWA',
    description: 'Progressive Web App',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "20", y: "15", width: "80", height: "50", fill: "#10B981", rx: "4" }),
      React.createElement('rect', { x: "25", y: "20", width: "70", height: "40", fill: "#F3F4F6", rx: "3" }),
      React.createElement('circle', { cx: "85", cy: "25", r: "6", fill: "#10B981", opacity: "0.4" }),
      React.createElement('rect', { x: "30", y: "25", width: "50", height: "3", fill: "#1F2937", rx: "1" }),
      React.createElement('rect', { x: "30", y: "32", width: "40", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "30", y: "45", width: "50", height: "12", fill: "#E5E7EB", rx: "2" })
    )
  },
  {
    value: 'api',
    title: '🔗 API',
    description: 'Backend/API apenas',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "25", y: "25", width: "70", height: "30", fill: "#1F2937", rx: "4" }),
      React.createElement('rect', { x: "30", y: "30", width: "60", height: "20", fill: "#0F172A", rx: "2" }),
      React.createElement('rect', { x: "35", y: "35", width: "12", height: "3", fill: "#10B981", rx: "1" }),
      React.createElement('rect', { x: "50", y: "35", width: "20", height: "3", fill: "#F59E0B", rx: "1" }),
      React.createElement('rect', { x: "35", y: "42", width: "15", height: "3", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "55", y: "42", width: "25", height: "3", fill: "#EF4444", rx: "1" })
    )
  }
];

// Frontend stacks with visual previews
export const FRONTEND_STACKS_EXPANDED = [
  {
    value: 'React',
    title: '⚛️ React',
    description: 'Biblioteca JavaScript popular',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-blue-400" },
      React.createElement('circle', { cx: "12", cy: "12", r: "2", fill: "currentColor" }),
      React.createElement('path', { 
        d: "M12 1c-6.628 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
        fill: "currentColor",
        opacity: "0.3"
      }),
      React.createElement('ellipse', { cx: "12", cy: "12", rx: "11", ry: "4.2", fill: "none", stroke: "currentColor", strokeWidth: "1" }),
      React.createElement('ellipse', { cx: "12", cy: "12", rx: "11", ry: "4.2", fill: "none", stroke: "currentColor", strokeWidth: "1", transform: "rotate(60 12 12)" }),
      React.createElement('ellipse', { cx: "12", cy: "12", rx: "11", ry: "4.2", fill: "none", stroke: "currentColor", strokeWidth: "1", transform: "rotate(120 12 12)" })
    )
  },
  {
    value: 'Vue',
    title: '💚 Vue.js',
    description: 'Framework progressivo',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-green-400" },
      React.createElement('path', { 
        d: "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Angular',
    title: '🔺 Angular',
    description: 'Framework completo',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-red-500" },
      React.createElement('path', { 
        d: "M12 2L2 7l1.5 13L12 22l8.5-2L22 7 12 2zm0 2.18l6.26 2.25-.54 4.89L12 16.18 6.28 11.32l-.54-4.89L12 4.18z",
        fill: "currentColor"
      }),
      React.createElement('path', { 
        d: "M12 4.18v12L6.28 11.32l-.54-4.89L12 4.18z",
        fill: "currentColor",
        opacity: "0.7"
      })
    )
  },
  {
    value: 'Svelte',
    title: '🧡 Svelte',
    description: 'Compilador moderno',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-orange-500" },
      React.createElement('path', { 
        d: "M10.354 21.125a2.847 2.847 0 0 0 4.539-.827L17.5 14.33c.545-1.026.4-2.319-.36-3.204l-6.676-7.764c-1.17-1.361-3.21-1.361-4.38 0a3.027 3.027 0 0 0 0 4.332l6.676 7.764c.76.885.905 2.178.36 3.204l-2.607 5.968a2.847 2.847 0 0 0 .841 3.495z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Next.js',
    title: '▲ Next.js',
    description: 'React com SSR',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-gray-900 dark:text-white" },
      React.createElement('circle', { cx: "12", cy: "12", r: "10", fill: "currentColor" }),
      React.createElement('path', { 
        d: "M9.5 8.5v7l5.5-3.5-5.5-3.5z",
        fill: "white",
        className: "dark:fill-black"
      })
    )
  },
  {
    value: 'Nuxt.js',
    title: '💚 Nuxt.js',
    description: 'Vue com SSR',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-green-500" },
      React.createElement('path', { 
        d: "M6.61 21h10.78c.78 0 1.44-.37 1.87-.94.43-.57.43-1.28 0-1.85L13.87 5.79c-.43-.57-1.09-.94-1.87-.94s-1.44.37-1.87.94L4.74 18.21c-.43.57-.43 1.28 0 1.85.43.57 1.09.94 1.87.94z",
        fill: "currentColor"
      }),
      React.createElement('path', { 
        d: "M12 8.5L8.5 15h7L12 8.5z",
        fill: "white"
      })
    )
  },
  {
    value: 'html-vanilla',
    title: '🌐 HTML + CSS + JS',
    description: 'HTML puro com CSS e JavaScript',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-orange-400" },
      React.createElement('path', { 
        d: "M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z",
        fill: "currentColor"
      })
    )
  }
];

// CSS frameworks with visual previews
export const CSS_FRAMEWORKS_EXPANDED = [
  {
    value: 'TailwindCSS',
    title: '🎨 TailwindCSS',
    description: 'Utility-first CSS',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-cyan-400" },
      React.createElement('path', { 
        d: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C7.666,17.818,9.027,19.2,12.001,19.2c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Bootstrap',
    title: '🅱️ Bootstrap',
    description: 'Framework CSS popular',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-purple-500" },
      React.createElement('path', { 
        d: "M20 0H4a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4zM9 13v-2h4.5c.828 0 1.5.672 1.5 1.5S14.328 14 13.5 14H9zm0-5V6h4c.828 0 1.5.672 1.5 1.5S13.828 9 13 9H9zm4.5 7c1.381 0 2.5-1.119 2.5-2.5 0-.717-.304-1.363-.792-1.818A2.49 2.49 0 0 0 15.5 8.5c0-1.381-1.119-2.5-2.5-2.5H7v12h6.5z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Material-UI',
    title: '🎯 Material-UI',
    description: 'Design system Google',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-blue-500" },
      React.createElement('path', { 
        d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Chakra UI',
    title: '⚡ Chakra UI',
    description: 'Componentes modulares',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-teal-400" },
      React.createElement('circle', { cx: "12", cy: "12", r: "10", fill: "none", stroke: "currentColor", strokeWidth: "2" }),
      React.createElement('path', { 
        d: "M12 6v6l4 2",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    )
  },
  {
    value: 'Ant Design',
    title: '🐜 Ant Design',
    description: 'Enterprise UI library',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-blue-600" },
      React.createElement('path', { 
        d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'Styled Components',
    title: '💅 Styled Components',
    description: 'CSS-in-JS library',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-pink-400" },
      React.createElement('path', { 
        d: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z",
        fill: "currentColor"
      })
    )
  },
  {
    value: 'TailwindCSS-CDN',
    title: '🎨 Tailwind CSS (CDN)',
    description: 'Tailwind via CDN',
    preview: React.createElement('svg', { viewBox: "0 0 24 24", className: "w-8 h-8 text-cyan-400" },
      React.createElement('path', { 
        d: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C7.666,17.818,9.027,19.2,12.001,19.2c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z",
        fill: "currentColor"
      }),
      React.createElement('circle', { cx: "20", cy: "4", r: "2", fill: "#10B981", opacity: "0.8" })
    )
  }
];

// Color themes with visual previews
export const COLOR_THEMES_EXPANDED = [
  {
    value: 'blue-professional',
    title: '🔵 Azul Profissional',
    description: 'Confiável e corporativo',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-blue-900" }),
      React.createElement('div', { className: "flex-1 bg-blue-700" }),
      React.createElement('div', { className: "flex-1 bg-blue-500" }),
      React.createElement('div', { className: "flex-1 bg-blue-300" }),
      React.createElement('div', { className: "flex-1 bg-blue-100" })
    )
  },
  {
    value: 'green-nature',
    title: '🟢 Verde Natureza',
    description: 'Sustentável e orgânico',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-green-900" }),
      React.createElement('div', { className: "flex-1 bg-green-700" }),
      React.createElement('div', { className: "flex-1 bg-green-500" }),
      React.createElement('div', { className: "flex-1 bg-green-300" }),
      React.createElement('div', { className: "flex-1 bg-green-100" })
    )
  },
  {
    value: 'purple-creative',
    title: '🟣 Roxo Criativo',
    description: 'Inovador e artístico',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-purple-900" }),
      React.createElement('div', { className: "flex-1 bg-purple-700" }),
      React.createElement('div', { className: "flex-1 bg-purple-500" }),
      React.createElement('div', { className: "flex-1 bg-purple-300" }),
      React.createElement('div', { className: "flex-1 bg-purple-100" })
    )
  },
  {
    value: 'red-energy',
    title: '🔴 Vermelho Energia',
    description: 'Dinâmico e impactante',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-red-900" }),
      React.createElement('div', { className: "flex-1 bg-red-700" }),
      React.createElement('div', { className: "flex-1 bg-red-500" }),
      React.createElement('div', { className: "flex-1 bg-red-300" }),
      React.createElement('div', { className: "flex-1 bg-red-100" })
    )
  },
  {
    value: 'orange-vibrant',
    title: '🟠 Laranja Vibrante',
    description: 'Energético e caloroso',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-orange-900" }),
      React.createElement('div', { className: "flex-1 bg-orange-700" }),
      React.createElement('div', { className: "flex-1 bg-orange-500" }),
      React.createElement('div', { className: "flex-1 bg-orange-300" }),
      React.createElement('div', { className: "flex-1 bg-orange-100" })
    )
  },
  {
    value: 'yellow-cheerful',
    title: '🟡 Amarelo Alegre',
    description: 'Otimista e luminoso',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-yellow-900" }),
      React.createElement('div', { className: "flex-1 bg-yellow-700" }),
      React.createElement('div', { className: "flex-1 bg-yellow-500" }),
      React.createElement('div', { className: "flex-1 bg-yellow-300" }),
      React.createElement('div', { className: "flex-1 bg-yellow-100" })
    )
  },
  {
    value: 'dark-mode',
    title: '⚫ Dark Mode',
    description: 'Elegante e moderno',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-gray-900" }),
      React.createElement('div', { className: "flex-1 bg-gray-800" }),
      React.createElement('div', { className: "flex-1 bg-gray-700" }),
      React.createElement('div', { className: "flex-1 bg-gray-600" }),
      React.createElement('div', { className: "flex-1 bg-gray-500" })
    )
  },
  {
    value: 'light-minimal',
    title: '⚪ Light Minimal',
    description: 'Limpo e minimalista',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden" },
      React.createElement('div', { className: "flex-1 bg-gray-100" }),
      React.createElement('div', { className: "flex-1 bg-gray-200" }),
      React.createElement('div', { className: "flex-1 bg-gray-300" }),
      React.createElement('div', { className: "flex-1 bg-gray-400" }),
      React.createElement('div', { className: "flex-1 bg-gray-500" })
    )
  },
  {
    value: 'gradient-modern',
    title: '🌈 Gradiente Moderno',
    description: 'Contemporâneo e dinâmico',
    preview: React.createElement('div', { className: "h-8 w-full rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" })
  },
  {
    value: 'custom',
    title: '🎨 Personalizado',
    description: 'Defina suas próprias cores',
    preview: React.createElement('div', { className: "flex h-8 w-full rounded overflow-hidden border-2 border-dashed border-gray-400" },
      React.createElement('div', { className: "flex-1 bg-gradient-to-r from-gray-200 to-gray-300" })
    )
  }
];

// Font families with visual previews
export const FONT_FAMILIES_EXPANDED = [
  {
    value: 'Inter',
    title: 'Inter',
    description: 'Moderna e legível',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full font-sans" },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Roboto',
    title: 'Roboto',
    description: 'Google Material Design',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Roboto, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Poppins',
    title: 'Poppins',
    description: 'Geométrica e amigável',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Poppins, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Montserrat',
    title: 'Montserrat',
    description: 'Elegante e versátil',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Montserrat, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Open Sans',
    title: 'Open Sans',
    description: 'Humanista e clara',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Open Sans, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Lato',
    title: 'Lato',
    description: 'Profissional e limpa',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Lato, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Nunito',
    title: 'Nunito',
    description: 'Arredondada e amigável',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Nunito, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Source Sans Pro',
    title: 'Source Sans Pro',
    description: 'Adobe Sans limpa',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Source Sans Pro, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'Raleway',
    title: 'Raleway',
    description: 'Elegante e sofisticada',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full", style: { fontFamily: 'Raleway, sans-serif' } },
      React.createElement('div', { className: "text-xl font-semibold mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-600" }, 'The quick brown fox')
    )
  },
  {
    value: 'custom',
    title: 'Personalizada',
    description: 'Defina sua própria fonte',
    preview: React.createElement('div', { className: "flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-400 rounded p-2" },
      React.createElement('div', { className: "text-xl font-semibold text-gray-500 mb-1" }, 'Aa Bb Cc'),
      React.createElement('div', { className: "text-xs text-gray-400" }, 'Custom font')
    )
  }
];

// Layout styles with visual previews
export const LAYOUT_STYLES_EXPANDED = [
  {
    value: 'modern',
    title: 'Moderno',
    description: 'Cards & Gradientes',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('linearGradient', { id: "modernGrad", x1: "0%", y1: "0%", x2: "100%", y2: "0%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: '#3B82F6', stopOpacity: 1 } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: '#8B5CF6', stopOpacity: 1 } })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "15", fill: "url(#modernGrad)", rx: "2" }),
      React.createElement('rect', { x: "8", y: "22", width: "25", height: "20", fill: "#4F46E5", rx: "4", opacity: "0.9" }),
      React.createElement('rect', { x: "38", y: "25", width: "25", height: "20", fill: "#7C3AED", rx: "4", opacity: "0.8" }),
      React.createElement('rect', { x: "68", y: "20", width: "25", height: "20", fill: "#2563EB", rx: "4", opacity: "0.9" }),
      React.createElement('circle', { cx: "105", cy: "30", r: "8", fill: "#F59E0B", opacity: "0.7" }),
      React.createElement('rect', { x: "8", y: "50", width: "104", height: "4", fill: "#6B7280", rx: "2" }),
      React.createElement('rect', { x: "8", y: "58", width: "80", height: "4", fill: "#6B7280", rx: "2" })
    )
  },
  {
    value: 'minimal',
    title: 'Minimalista',
    description: 'Clean & Simples',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "12", fill: "#F9FAFB" }),
      React.createElement('rect', { x: "10", y: "3", width: "30", height: "6", fill: "#374151", rx: "1" }),
      React.createElement('rect', { x: "20", y: "25", width: "80", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "32", width: "60", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "39", width: "70", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "35", y: "50", width: "50", height: "20", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "45", y: "58", width: "30", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'classic',
    title: 'Clássico',
    description: 'Tradicional',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "15", fill: "#1F2937" }),
      React.createElement('rect', { x: "8", y: "4", width: "20", height: "7", fill: "#F3F4F6", rx: "1" }),
      React.createElement('rect', { x: "90", y: "4", width: "25", height: "7", fill: "#F3F4F6", rx: "1" }),
      React.createElement('rect', { x: "0", y: "15", width: "25", height: "65", fill: "#374151" }),
      React.createElement('rect', { x: "3", y: "20", width: "19", height: "3", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "3", y: "26", width: "19", height: "3", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "3", y: "32", width: "19", height: "3", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "30", y: "20", width: "85", height: "55", fill: "#F9FAFB" }),
      React.createElement('rect', { x: "35", y: "25", width: "75", height: "4", fill: "#374151", rx: "1" }),
      React.createElement('rect', { x: "35", y: "33", width: "50", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "35", y: "40", width: "60", height: "3", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'creative',
    title: 'Criativo',
    description: 'Ousado',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('polygon', { points: "0,0 120,0 100,15 0,12", fill: "#EC4899" }),
      React.createElement('rect', { x: "8", y: "3", width: "15", height: "6", fill: "#FFFFFF", rx: "1" }),
      React.createElement('circle', { cx: "25", cy: "35", r: "12", fill: "#F59E0B", opacity: "0.8" }),
      React.createElement('rect', { x: "45", y: "25", width: "30", height: "20", fill: "#8B5CF6", rx: "3", transform: "rotate(15 60 35)" }),
      React.createElement('polygon', { points: "80,20 100,25 95,45 75,40", fill: "#10B981" }),
      React.createElement('circle', { cx: "15", cy: "60", r: "6", fill: "#EF4444", opacity: "0.7" }),
      React.createElement('rect', { x: "70", y: "55", width: "40", height: "15", fill: "#3B82F6", rx: "2", transform: "rotate(-10 90 62)" }),
      React.createElement('polygon', { points: "105,50 115,55 110,70 100,65", fill: "#F59E0B" })
    )
  },
  {
    value: 'skeuomorphism',
    title: 'Skeumorfismo',
    description: 'Objetos Reais',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('linearGradient', { id: "skeuGrad1", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: '#E5E7EB', stopOpacity: 1 } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: '#9CA3AF', stopOpacity: 1 } })
        ),
        React.createElement('linearGradient', { id: "skeuGrad2", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: '#FFFFFF', stopOpacity: 1 } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: '#D1D5DB', stopOpacity: 1 } })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "12", fill: "url(#skeuGrad1)", rx: "2" }),
      React.createElement('rect', { x: "8", y: "20", width: "30", height: "25", fill: "url(#skeuGrad2)", rx: "4", stroke: "#9CA3AF", strokeWidth: "1" }),
      React.createElement('rect', { x: "10", y: "22", width: "26", height: "21", fill: "#F9FAFB", rx: "2" }),
      React.createElement('circle', { cx: "23", cy: "32", r: "6", fill: "#3B82F6", stroke: "#1E40AF", strokeWidth: "2" }),
      React.createElement('rect', { x: "45", y: "25", width: "25", height: "15", fill: "url(#skeuGrad2)", rx: "3", stroke: "#6B7280", strokeWidth: "1" }),
      React.createElement('rect', { x: "80", y: "22", width: "30", height: "20", fill: "url(#skeuGrad1)", rx: "4", stroke: "#4B5563", strokeWidth: "1" }),
      React.createElement('rect', { x: "15", y: "55", width: "90", height: "8", fill: "url(#skeuGrad2)", rx: "4", stroke: "#D1D5DB", strokeWidth: "1" })
    )
  },
  {
    value: 'neumorphism',
    title: 'Neumorfismo',
    description: 'Soft UI',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('filter', { id: "neuShadow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
          React.createElement('feDropShadow', { dx: "2", dy: "2", stdDeviation: "3", floodColor: "#D1D5DB", floodOpacity: "0.5" }),
          React.createElement('feDropShadow', { dx: "-2", dy: "-2", stdDeviation: "3", floodColor: "#FFFFFF", floodOpacity: "0.8" })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#E5E7EB" }),
      React.createElement('rect', { x: "15", y: "15", width: "25", height: "20", fill: "#E5E7EB", rx: "8", filter: "url(#neuShadow)" }),
      React.createElement('rect', { x: "50", y: "18", width: "25", height: "15", fill: "#E5E7EB", rx: "6", filter: "url(#neuShadow)" }),
      React.createElement('rect', { x: "85", y: "12", width: "25", height: "25", fill: "#E5E7EB", rx: "10", filter: "url(#neuShadow)" }),
      React.createElement('circle', { cx: "25", cy: "55", r: "12", fill: "#E5E7EB", filter: "url(#neuShadow)" }),
      React.createElement('rect', { x: "45", y: "50", width: "50", height: "12", fill: "#E5E7EB", rx: "6", filter: "url(#neuShadow)" })
    )
  },
  {
    value: 'glassmorphism',
    title: 'Glassmorphism',
    description: 'Efeito Vidro',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('linearGradient', { id: "glassGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: '#3B82F6', stopOpacity: 0.8 } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: '#8B5CF6', stopOpacity: 0.6 } })
        ),
        React.createElement('filter', { id: "blur", x: "-50%", y: "-50%", width: "200%", height: "200%" },
          React.createElement('feGaussianBlur', { in: "SourceGraphic", stdDeviation: "1" })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "url(#glassGrad)" }),
      React.createElement('rect', { x: "10", y: "10", width: "100", height: "60", fill: "rgba(255,255,255,0.1)", rx: "8", stroke: "rgba(255,255,255,0.2)", strokeWidth: "1", filter: "url(#blur)" }),
      React.createElement('rect', { x: "20", y: "20", width: "30", height: "20", fill: "rgba(255,255,255,0.15)", rx: "4", stroke: "rgba(255,255,255,0.3)", strokeWidth: "1" }),
      React.createElement('rect', { x: "60", y: "25", width: "40", height: "15", fill: "rgba(255,255,255,0.1)", rx: "3", stroke: "rgba(255,255,255,0.25)", strokeWidth: "1" }),
      React.createElement('circle', { cx: "30", cy: "55", r: "8", fill: "rgba(255,255,255,0.2)", stroke: "rgba(255,255,255,0.4)", strokeWidth: "1" }),
      React.createElement('rect', { x: "50", y: "50", width: "50", height: "8", fill: "rgba(255,255,255,0.12)", rx: "4", stroke: "rgba(255,255,255,0.3)", strokeWidth: "1" })
    )
  },
  {
    value: 'brutalism',
    title: 'Brutalism',
    description: 'Bold & Angular',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#000000" }),
      React.createElement('rect', { x: "5", y: "5", width: "35", height: "25", fill: "#FF0000", stroke: "#FFFFFF", strokeWidth: "3" }),
      React.createElement('rect', { x: "45", y: "10", width: "30", height: "15", fill: "#00FF00", stroke: "#000000", strokeWidth: "2" }),
      React.createElement('rect', { x: "80", y: "0", width: "40", height: "35", fill: "#0000FF", stroke: "#FFFFFF", strokeWidth: "4" }),
      React.createElement('polygon', { points: "0,40 40,35 35,70 5,75", fill: "#FFFF00", stroke: "#000000", strokeWidth: "3" }),
      React.createElement('rect', { x: "50", y: "45", width: "25", height: "25", fill: "#FF00FF", stroke: "#FFFFFF", strokeWidth: "2" }),
      React.createElement('polygon', { points: "85,50 120,45 115,80 80,75", fill: "#00FFFF", stroke: "#000000", strokeWidth: "3" }),
      React.createElement('rect', { x: "20", y: "60", width: "80", height: "8", fill: "#FFFFFF", stroke: "#000000", strokeWidth: "2" })
    )
  },
  {
    value: 'material',
    title: 'Material Design',
    description: 'Google Guidelines',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('filter', { id: "matShadow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
          React.createElement('feDropShadow', { dx: "0", dy: "2", stdDeviation: "4", floodColor: "#000000", floodOpacity: "0.2" })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#FAFAFA" }),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "15", fill: "#2196F3", filter: "url(#matShadow)" }),
      React.createElement('rect', { x: "10", y: "5", width: "20", height: "5", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "25", width: "90", height: "40", fill: "#FFFFFF", rx: "4", filter: "url(#matShadow)" }),
      React.createElement('rect', { x: "25", y: "35", width: "70", height: "4", fill: "#757575", rx: "2" }),
      React.createElement('rect', { x: "25", y: "43", width: "50", height: "4", fill: "#BDBDBD", rx: "2" }),
      React.createElement('rect', { x: "25", y: "51", width: "60", height: "4", fill: "#BDBDBD", rx: "2" }),
      React.createElement('circle', { cx: "95", cy: "65", r: "8", fill: "#FF4081", filter: "url(#matShadow)" })
    )
  },
  {
    value: 'flat',
    title: 'Flat Design',
    description: 'Sem Sombras',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#ECF0F1" }),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "12", fill: "#3498DB" }),
      React.createElement('rect', { x: "10", y: "3", width: "25", height: "6", fill: "#FFFFFF" }),
      React.createElement('rect', { x: "15", y: "20", width: "25", height: "20", fill: "#E74C3C" }),
      React.createElement('rect', { x: "50", y: "25", width: "25", height: "15", fill: "#2ECC71" }),
      React.createElement('rect', { x: "85", y: "22", width: "25", height: "18", fill: "#F39C12" }),
      React.createElement('rect', { x: "20", y: "50", width: "80", height: "4", fill: "#34495E" }),
      React.createElement('rect', { x: "20", y: "58", width: "60", height: "4", fill: "#7F8C8D" }),
      React.createElement('rect', { x: "20", y: "66", width: "70", height: "4", fill: "#95A5A6" })
    )
  },
  {
    value: 'dark',
    title: 'Dark Mode',
    description: 'Tema Escuro',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#0F172A" }),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "12", fill: "#1E293B" }),
      React.createElement('rect', { x: "10", y: "3", width: "25", height: "6", fill: "#64748B" }),
      React.createElement('rect', { x: "15", y: "20", width: "25", height: "20", fill: "#334155", stroke: "#475569", strokeWidth: "1" }),
      React.createElement('rect', { x: "50", y: "25", width: "25", height: "15", fill: "#1E293B", stroke: "#334155", strokeWidth: "1" }),
      React.createElement('rect', { x: "85", y: "22", width: "25", height: "18", fill: "#0F172A", stroke: "#1E293B", strokeWidth: "1" }),
      React.createElement('rect', { x: "20", y: "50", width: "80", height: "4", fill: "#475569" }),
      React.createElement('rect', { x: "20", y: "58", width: "60", height: "4", fill: "#64748B" }),
      React.createElement('circle', { cx: "25", cy: "65", r: "3", fill: "#3B82F6" }),
      React.createElement('circle', { cx: "35", cy: "65", r: "3", fill: "#10B981" }),
      React.createElement('circle', { cx: "45", cy: "65", r: "3", fill: "#F59E0B" })
    )
  },
  {
    value: 'retro',
    title: 'Retro/Vintage',
    description: 'Anos 80/90',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('defs', {},
        React.createElement('linearGradient', { id: "retroGrad", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: '#FF00FF', stopOpacity: 1 } }),
          React.createElement('stop', { offset: "50%", style: { stopColor: '#00FFFF', stopOpacity: 1 } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: '#FFFF00', stopOpacity: 1 } })
        )
      ),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "80", fill: "#000080" }),
      React.createElement('rect', { x: "0", y: "0", width: "120", height: "15", fill: "url(#retroGrad)" }),
      React.createElement('rect', { x: "10", y: "3", width: "30", height: "9", fill: "#000000", stroke: "#FFFFFF", strokeWidth: "2" }),
      React.createElement('rect', { x: "15", y: "25", width: "20", height: "15", fill: "#FF00FF", stroke: "#FFFF00", strokeWidth: "2" }),
      React.createElement('rect', { x: "45", y: "28", width: "20", height: "12", fill: "#00FFFF", stroke: "#FF00FF", strokeWidth: "2" }),
      React.createElement('rect', { x: "75", y: "22", width: "20", height: "18", fill: "#FFFF00", stroke: "#00FFFF", strokeWidth: "2" }),
      React.createElement('polygon', { points: "20,50 40,45 35,65 15,70", fill: "#FF00FF", stroke: "#FFFFFF", strokeWidth: "2" }),
      React.createElement('polygon', { points: "60,55 80,50 75,70 55,75", fill: "#00FFFF", stroke: "#FFFFFF", strokeWidth: "2" }),
      React.createElement('polygon', { points: "90,52 110,47 105,67 85,72", fill: "#FFFF00", stroke: "#FFFFFF", strokeWidth: "2" })
    )
  }
];

// Menu structures with visual previews
export const MENU_STRUCTURES_EXPANDED = [
  {
    value: 'header-footer',
    title: '📋 Header + Footer Tradicional',
    description: 'Layout clássico com cabeçalho e rodapé',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "12", fill: "#3B82F6", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "5", y: "63", width: "110", height: "12", fill: "#6B7280", rx: "0 0 4 4" }),
      React.createElement('rect', { x: "15", y: "25", width: "90", height: "30", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "30", width: "80", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "38", width: "60", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "46", width: "70", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'sidebar-left',
    title: '📱 Menu Lateral Esquerdo',
    description: 'Sidebar fixa à esquerda',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "25", height: "70", fill: "#374151", rx: "4 0 0 4" }),
      React.createElement('rect', { x: "35", y: "15", width: "75", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "15", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "25", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "40", y: "25", width: "60", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "40", y: "35", width: "45", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'sidebar-right',
    title: '📱 Menu Lateral Direito',
    description: 'Sidebar fixa à direita',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "90", y: "5", width: "25", height: "70", fill: "#374151", rx: "0 4 4 0" }),
      React.createElement('rect', { x: "10", y: "15", width: "75", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "95", y: "15", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "95", y: "25", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "95", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "25", width: "60", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "45", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'hamburger',
    title: '🍔 Menu Hambúrguer',
    description: 'Menu colapsável com ícone hambúrguer',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "15", fill: "#3B82F6", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "10", y: "8", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "10", y: "11", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "10", y: "14", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "15", y: "30", width: "90", height: "35", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "40", width: "80", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "50", width: "60", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'dashboard',
    title: '📊 Dashboard com Sidebar',
    description: 'Layout de dashboard com painel lateral',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "30", height: "70", fill: "#1F2937", rx: "4 0 0 4" }),
      React.createElement('rect', { x: "40", y: "5", width: "75", height: "15", fill: "#374151", rx: "0 4 0 0" }),
      React.createElement('rect', { x: "40", y: "25", width: "35", height: "20", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "80", y: "25", width: "30", height: "20", fill: "#10B981", rx: "2" }),
      React.createElement('rect', { x: "40", y: "50", width: "70", height: "20", fill: "#EF4444", rx: "2" }),
      React.createElement('rect', { x: "10", y: "15", width: "20", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "25", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'expandable',
    title: '🔄 Menu Expansível/Retrátil',
    description: 'Menu que pode expandir e retrair',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "15", height: "70", fill: "#374151", rx: "4 0 0 4" }),
      React.createElement('rect', { x: "25", y: "15", width: "85", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "8", y: "15", width: "9", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "8", y: "25", width: "6", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "8", y: "35", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "30", y: "25", width: "70", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "30", y: "35", width: "50", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "18", y: "30", width: "2", height: "8", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'tab-bar',
    title: '📱 Tab Bar (Bottom Navigation)',
    description: 'Navegação por abas na parte inferior',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "60", width: "110", height: "15", fill: "#374151", rx: "0 0 4 4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "40", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "25", width: "80", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "35", width: "60", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "63", width: "15", height: "8", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "35", y: "63", width: "15", height: "8", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "55", y: "63", width: "15", height: "8", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "75", y: "63", width: "15", height: "8", fill: "#6B7280", rx: "1" })
    )
  },
  {
    value: 'drawer',
    title: '📱 Menu Lateral (Drawer)',
    description: 'Menu deslizante lateral para mobile',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "35", height: "70", fill: "#374151", rx: "4 0 0 4", opacity: "0.9" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "15", width: "20", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "25", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "50", y: "25", width: "50", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "50", y: "35", width: "40", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'single-page',
    title: '🎯 Single Page (sem menu)',
    description: 'Página única sem navegação',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "25", y: "25", width: "80", height: "6", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "25", y: "35", width: "70", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "25", y: "43", width: "60", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "25", y: "51", width: "50", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'menu-toolbar',
    title: '📋 Menu Bar + Toolbar',
    description: 'Menu tradicional com barra de ferramentas',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "10", fill: "#374151", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "5", y: "15", width: "110", height: "8", fill: "#6B7280" }),
      React.createElement('rect', { x: "15", y: "30", width: "90", height: "40", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "7", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "30", y: "7", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "17", width: "8", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "22", y: "17", width: "8", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "20", y: "40", width: "80", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'ribbon',
    title: '🔄 Menu Ribbon (Office-style)',
    description: 'Interface estilo Microsoft Office',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "25", fill: "#E5E7EB", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "15", y: "35", width: "90", height: "35", fill: "#F9FAFB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "10", width: "20", height: "4", fill: "#3B82F6", rx: "1" }),
      React.createElement('rect', { x: "35", y: "10", width: "15", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "55", y: "10", width: "18", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "10", y: "18", width: "25", height: "8", fill: "#374151", rx: "2" }),
      React.createElement('rect', { x: "40", y: "18", width: "20", height: "8", fill: "#374151", rx: "2" }),
      React.createElement('rect', { x: "20", y: "45", width: "80", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  {
    value: 'custom',
    title: '🎨 Layout Personalizado',
    description: 'Defina elementos customizados',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4", stroke: "#6B7280", strokeWidth: "2", strokeDasharray: "5,5" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "50", fill: "#E5E7EB", rx: "2", opacity: "0.5" }),
      React.createElement('text', { x: "60", y: "45", textAnchor: "middle", fontSize: "12", fill: "#6B7280" }, 'Custom'),
      React.createElement('circle', { cx: "30", cy: "30", r: "4", fill: "#3B82F6", opacity: "0.7" }),
      React.createElement('rect', { x: "80", y: "25", width: "20", height: "10", fill: "#10B981", rx: "2", opacity: "0.7" }),
      React.createElement('polygon', { points: "50,55 60,55 55,65", fill: "#EF4444", opacity: "0.7" })
    )
  }
];