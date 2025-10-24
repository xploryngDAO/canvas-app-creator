import React from 'react';

export const CUSTOM_LAYOUT_ELEMENTS = [
  { 
    value: 'header', 
    label: '✅ Header/Cabeçalho', 
    icon: '🏠',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "20", fill: "#3B82F6", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "15", y: "10", width: "30", height: "4", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "50", y: "10", width: "20", height: "4", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "75", y: "10", width: "25", height: "4", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "90", height: "35", fill: "#E5E7EB", rx: "2" })
    )
  },
  { 
    value: 'footer', 
    label: '✅ Footer/Rodapé', 
    icon: '📄',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "40", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "5", y: "60", width: "110", height: "15", fill: "#6B7280", rx: "0 0 4 4" }),
      React.createElement('rect', { x: "15", y: "63", width: "25", height: "3", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "45", y: "63", width: "20", height: "3", fill: "#FFFFFF", rx: "1" }),
      React.createElement('rect', { x: "70", y: "63", width: "30", height: "3", fill: "#FFFFFF", rx: "1" })
    )
  },
  { 
    value: 'sidebar-left', 
    label: '✅ Menu Lateral Esquerdo', 
    icon: '◀️',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "25", height: "70", fill: "#374151", rx: "4 0 0 4" }),
      React.createElement('rect', { x: "35", y: "15", width: "75", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "15", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "25", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  { 
    value: 'sidebar-right', 
    label: '✅ Menu Lateral Direito', 
    icon: '▶️',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "90", y: "5", width: "25", height: "70", fill: "#374151", rx: "0 4 4 0" }),
      React.createElement('rect', { x: "10", y: "15", width: "75", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "95", y: "15", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "95", y: "25", width: "12", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "95", y: "35", width: "18", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  { 
    value: 'navbar', 
    label: '✅ Menu Superior (Navbar)', 
    icon: '📋',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "15", fill: "#374151", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "15", y: "30", width: "90", height: "40", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "8", width: "20", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "35", y: "8", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "55", y: "8", width: "18", height: "4", fill: "#9CA3AF", rx: "1" })
    )
  },
  { 
    value: 'hamburger', 
    label: '✅ Menu Hambúrguer', 
    icon: '🍔',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "15", fill: "#3B82F6", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "10", y: "8", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "10", y: "11", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "10", y: "14", width: "3", height: "2", fill: "white", rx: "0.5" }),
      React.createElement('rect', { x: "15", y: "30", width: "90", height: "35", fill: "#E5E7EB", rx: "2" })
    )
  },
  { 
    value: 'breadcrumbs', 
    label: '✅ Breadcrumbs', 
    icon: '🍞',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "10", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "18", width: "15", height: "4", fill: "#3B82F6", rx: "1" }),
      React.createElement('text', { x: "38", y: "21", fontSize: "6", fill: "#6B7280" }, ">"),
      React.createElement('rect', { x: "42", y: "18", width: "20", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('text', { x: "65", y: "21", fontSize: "6", fill: "#6B7280" }, ">"),
      React.createElement('rect', { x: "69", y: "18", width: "25", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "90", height: "35", fill: "#F9FAFB", rx: "2" })
    )
  },
  { 
    value: 'tab-navigation', 
    label: '✅ Tab Navigation', 
    icon: '📑',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "20", height: "8", fill: "#3B82F6", rx: "2 2 0 0" }),
      React.createElement('rect', { x: "35", y: "15", width: "20", height: "8", fill: "#E5E7EB", rx: "2 2 0 0" }),
      React.createElement('rect', { x: "55", y: "15", width: "20", height: "8", fill: "#E5E7EB", rx: "2 2 0 0" }),
      React.createElement('rect', { x: "75", y: "15", width: "20", height: "8", fill: "#E5E7EB", rx: "2 2 0 0" }),
      React.createElement('rect', { x: "15", y: "23", width: "90", height: "47", fill: "#FFFFFF", rx: "0 0 2 2" }),
      React.createElement('rect', { x: "20", y: "30", width: "80", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "38", width: "60", height: "4", fill: "#6B7280", rx: "1" })
    )
  },
  { 
    value: 'sidebar-panel', 
    label: '✅ Sidebar/Painel Lateral', 
    icon: '📊',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "30", height: "70", fill: "#1F2937", rx: "4 0 0 4" }),
      React.createElement('rect', { x: "40", y: "15", width: "70", height: "55", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "10", y: "15", width: "20", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "10", y: "25", width: "15", height: "4", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "45", y: "25", width: "60", height: "15", fill: "#3B82F6", rx: "2" }),
      React.createElement('rect', { x: "45", y: "45", width: "30", height: "15", fill: "#10B981", rx: "2" })
    )
  },
  { 
    value: 'toolbar', 
    label: '✅ Toolbar/Barra de Ferramentas', 
    icon: '🔧',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "12", fill: "#6B7280", rx: "4 4 0 0" }),
      React.createElement('rect', { x: "10", y: "7", width: "8", height: "8", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "22", y: "7", width: "8", height: "8", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "34", y: "7", width: "8", height: "8", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "46", y: "7", width: "8", height: "8", fill: "#9CA3AF", rx: "1" }),
      React.createElement('rect', { x: "15", y: "25", width: "90", height: "45", fill: "#E5E7EB", rx: "2" })
    )
  },
  { 
    value: 'search-bar', 
    label: '✅ Search Bar/Barra de Pesquisa', 
    icon: '🔍',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "15", y: "15", width: "90", height: "12", fill: "#FFFFFF", rx: "6", stroke: "#D1D5DB", strokeWidth: "1" }),
      React.createElement('rect', { x: "20", y: "18", width: "60", height: "6", fill: "#F3F4F6", rx: "2" }),
      React.createElement('circle', { cx: "95", cy: "21", r: "4", fill: "#6B7280" }),
      React.createElement('circle', { cx: "95", cy: "21", r: "2", fill: "none", stroke: "#FFFFFF", strokeWidth: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "90", height: "35", fill: "#E5E7EB", rx: "2" })
    )
  },
  { 
    value: 'user-menu', 
    label: '✅ User Menu/Menu do Usuário', 
    icon: '👤',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "85", y: "10", width: "25", height: "15", fill: "#FFFFFF", rx: "2", stroke: "#D1D5DB", strokeWidth: "1" }),
      React.createElement('circle', { cx: "90", cy: "15", r: "3", fill: "#6B7280" }),
      React.createElement('rect', { x: "95", y: "13", width: "12", height: "4", fill: "#374151", rx: "1" }),
      React.createElement('rect', { x: "15", y: "35", width: "90", height: "35", fill: "#E5E7EB", rx: "2" }),
      React.createElement('rect', { x: "20", y: "45", width: "80", height: "4", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "20", y: "53", width: "60", height: "4", fill: "#6B7280", rx: "1" })
    )
  },
  { 
    value: 'notifications', 
    label: '✅ Notifications Panel/Painel de Notificações', 
    icon: '🔔',
    preview: React.createElement('svg', { viewBox: "0 0 120 80", className: "w-full h-full" },
      React.createElement('rect', { x: "5", y: "5", width: "110", height: "70", fill: "#F3F4F6", rx: "4" }),
      React.createElement('rect', { x: "85", y: "10", width: "25", height: "20", fill: "#FFFFFF", rx: "2", stroke: "#D1D5DB", strokeWidth: "1" }),
      React.createElement('circle', { cx: "105", cy: "12", r: "3", fill: "#EF4444" }),
      React.createElement('text', { x: "105", y: "14", textAnchor: "middle", fontSize: "4", fill: "#FFFFFF" }, "3"),
      React.createElement('rect', { x: "88", y: "16", width: "20", height: "3", fill: "#374151", rx: "1" }),
      React.createElement('rect', { x: "88", y: "21", width: "15", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "88", y: "26", width: "18", height: "3", fill: "#6B7280", rx: "1" }),
      React.createElement('rect', { x: "15", y: "40", width: "90", height: "30", fill: "#E5E7EB", rx: "2" })
    )
  }
];