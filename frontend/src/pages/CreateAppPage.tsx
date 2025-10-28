import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CompilationTerminal } from '@/components/features/CompilationTerminal';
import { APP_TYPES, FRONTEND_STACKS, CSS_FRAMEWORKS, COLOR_THEMES, FONT_FAMILIES, LAYOUT_STYLES } from '../../../shared/types';
import { APP_TYPES_EXPANDED, FRONTEND_STACKS_EXPANDED, CSS_FRAMEWORKS_EXPANDED } from '@/constants/settingsOptions';
import { useToast } from '@/hooks/useToast';
import { projectService, CreateProjectRequest } from '@/services/projectService';
import { AppConfig } from '@/types/app';
import { database } from '@/services/database';
import { geminiService } from '@/services/gemini';
import { settingsService } from '@/services/settingsService';
import { LayoutValidator, LayoutValidationResult } from '@/utils/layoutValidator';

// Mapeamento de opções de layout por plataforma
const LAYOUT_OPTIONS_BY_PLATFORM = {
  web: [
    { value: 'header-footer', label: '📋 Header + Footer Tradicional' },
    { value: 'sidebar-left', label: '📱 Menu Lateral Esquerdo' },
    { value: 'sidebar-right', label: '📱 Menu Lateral Direito' },
    { value: 'hamburger', label: '🍔 Menu Hambúrguer' },
    { value: 'dashboard', label: '📊 Dashboard com Sidebar' },
    { value: 'expandable', label: '🔄 Menu Expansível/Retrátil' },
    { value: 'single-page', label: '🎯 Single Page (sem menu)' },
    { value: 'custom', label: '🎨 Layout Personalizado' }
  ],
  mobile: [
    { value: 'tab-bar', label: '📱 Tab Bar (Bottom Navigation)' },
    { value: 'hamburger', label: '🍔 Menu Hambúrguer' },
    { value: 'drawer', label: '📱 Menu Lateral (Drawer)' },
    { value: 'expandable', label: '🔄 Menu Expansível' },
    { value: 'single-screen', label: '🎯 Single Screen' },
    { value: 'custom', label: '🎨 Layout Personalizado' }
  ],
  desktop: [
    { value: 'menu-toolbar', label: '📋 Menu Bar + Toolbar' },
    { value: 'sidebar-multi', label: '📱 Menu Lateral com Sidebar' },
    { value: 'dashboard-multi', label: '📊 Dashboard Multi-painel' },
    { value: 'ribbon', label: '🔄 Menu Ribbon (Office-style)' },
    { value: 'single-window', label: '🎯 Single Window' },
    { value: 'custom', label: '🎨 Layout Personalizado' }
  ],
  extension: [
    { value: 'popup', label: '🎯 Popup Simples' },
    { value: 'sidebar-ext', label: '📱 Sidebar Extension' },
    { value: 'overlay', label: '📋 Content Script Overlay' },
    { value: 'custom', label: '🎨 Layout Personalizado' }
  ],
  pwa: [
    { value: 'header-footer', label: '📋 Header + Footer' },
    { value: 'tab-bar', label: '📱 Tab Bar (Bottom)' },
    { value: 'hamburger', label: '🍔 Menu Hambúrguer' },
    { value: 'dashboard', label: '📊 Dashboard' },
    { value: 'custom', label: '🎨 Layout Personalizado' }
  ],
  api: [
    { value: 'no-interface', label: '🔗 Sem Interface (API Only)' }
  ]
};

// Removido APP_TYPES_EXPANDED duplicado - usando o importado de settingsOptions

// Temas de cores expandidos com previews
const COLOR_THEMES_EXPANDED = [
  {
    value: 'blue-professional',
    title: '🔵 Azul Profissional',
    description: 'Confiável e corporativo',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-blue-900"></div>
        <div className="flex-1 bg-blue-700"></div>
        <div className="flex-1 bg-blue-500"></div>
        <div className="flex-1 bg-blue-300"></div>
        <div className="flex-1 bg-blue-100"></div>
      </div>
    )
  },
  {
    value: 'green-nature',
    title: '🟢 Verde Natureza',
    description: 'Sustentável e orgânico',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-green-900"></div>
        <div className="flex-1 bg-green-700"></div>
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-green-300"></div>
        <div className="flex-1 bg-green-100"></div>
      </div>
    )
  },
  {
    value: 'purple-creative',
    title: '🟣 Roxo Criativo',
    description: 'Inovador e artístico',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-purple-900"></div>
        <div className="flex-1 bg-purple-700"></div>
        <div className="flex-1 bg-purple-500"></div>
        <div className="flex-1 bg-purple-300"></div>
        <div className="flex-1 bg-purple-100"></div>
      </div>
    )
  },
  {
    value: 'red-energy',
    title: '🔴 Vermelho Energia',
    description: 'Dinâmico e impactante',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-red-900"></div>
        <div className="flex-1 bg-red-700"></div>
        <div className="flex-1 bg-red-500"></div>
        <div className="flex-1 bg-red-300"></div>
        <div className="flex-1 bg-red-100"></div>
      </div>
    )
  },
  {
    value: 'orange-vibrant',
    title: '🟠 Laranja Vibrante',
    description: 'Energético e caloroso',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-orange-900"></div>
        <div className="flex-1 bg-orange-700"></div>
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-orange-300"></div>
        <div className="flex-1 bg-orange-100"></div>
      </div>
    )
  },
  {
    value: 'yellow-cheerful',
    title: '🟡 Amarelo Alegre',
    description: 'Otimista e luminoso',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-yellow-900"></div>
        <div className="flex-1 bg-yellow-700"></div>
        <div className="flex-1 bg-yellow-500"></div>
        <div className="flex-1 bg-yellow-300"></div>
        <div className="flex-1 bg-yellow-100"></div>
      </div>
    )
  },
  {
    value: 'dark-mode',
    title: '⚫ Dark Mode',
    description: 'Elegante e moderno',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-gray-900"></div>
        <div className="flex-1 bg-gray-800"></div>
        <div className="flex-1 bg-gray-700"></div>
        <div className="flex-1 bg-gray-600"></div>
        <div className="flex-1 bg-gray-500"></div>
      </div>
    )
  },
  {
    value: 'light-minimal',
    title: '⚪ Light Minimal',
    description: 'Limpo e minimalista',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden">
        <div className="flex-1 bg-gray-100"></div>
        <div className="flex-1 bg-gray-200"></div>
        <div className="flex-1 bg-gray-300"></div>
        <div className="flex-1 bg-gray-400"></div>
        <div className="flex-1 bg-gray-500"></div>
      </div>
    )
  },
  {
    value: 'gradient-modern',
    title: '🌈 Gradiente Moderno',
    description: 'Contemporâneo e dinâmico',
    preview: (
      <div className="h-8 w-full rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    )
  },
  {
    value: 'custom',
    title: '🎨 Personalizado',
    description: 'Defina suas próprias cores',
    preview: (
      <div className="flex h-8 w-full rounded overflow-hidden border-2 border-dashed border-gray-400">
        <div className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      </div>
    )
  }
];

// Fontes principais expandidas com preview
const FONT_FAMILIES_EXPANDED = [
  {
    value: 'inter',
    title: 'Inter',
    description: 'Sans-serif moderna',
    preview: (
      <div className="font-sans">
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'roboto',
    title: 'Roboto',
    description: 'Google Sans',
    preview: (
      <div style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'poppins',
    title: 'Poppins',
    description: 'Friendly',
    preview: (
      <div style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'montserrat',
    title: 'Montserrat',
    description: 'Elegante',
    preview: (
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'opensans',
    title: 'Open Sans',
    description: 'Legível',
    preview: (
      <div style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'lato',
    title: 'Lato',
    description: 'Profissional',
    preview: (
      <div style={{ fontFamily: 'Lato, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'nunito',
    title: 'Nunito',
    description: 'Arredondada',
    preview: (
      <div style={{ fontFamily: 'Nunito, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'source-sans-pro',
    title: 'Source Sans Pro',
    description: 'Clean',
    preview: (
      <div style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'raleway',
    title: 'Raleway',
    description: 'Sofisticada',
    preview: (
      <div style={{ fontFamily: 'Raleway, sans-serif' }}>
        <div className="text-lg font-semibold">Aa Bb Cc</div>
        <div className="text-sm text-gray-600">The quick brown fox</div>
      </div>
    )
  },
  {
    value: 'custom',
    title: 'Personalizada',
    description: 'Defina sua própria fonte',
    preview: (
      <div className="border-2 border-dashed border-gray-400 p-2 rounded">
        <div className="text-lg font-semibold text-gray-500">Aa Bb Cc</div>
        <div className="text-sm text-gray-400">Custom font</div>
      </div>
    )
  }
];

// Elementos disponíveis para layout personalizado
// Estruturas de Navegação expandidas com wireframes visuais
const NAVIGATION_STRUCTURES_EXPANDED = [
  {
    value: 'header-footer',
    title: '📋 Header + Footer Tradicional',
    description: 'Layout clássico com cabeçalho e rodapé',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="12" fill="#3B82F6" rx="4 4 0 0"/>
        <rect x="5" y="63" width="110" height="12" fill="#6B7280" rx="0 0 4 4"/>
        <rect x="15" y="25" width="90" height="30" fill="#E5E7EB" rx="2"/>
        <rect x="20" y="30" width="80" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="38" width="60" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="46" width="70" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'sidebar-left',
    title: '📱 Menu Lateral Esquerdo',
    description: 'Sidebar fixa à esquerda',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="25" height="70" fill="#374151" rx="4 0 0 4"/>
        <rect x="35" y="15" width="75" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="15" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="25" width="12" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="40" y="25" width="60" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="40" y="35" width="45" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'sidebar-right',
    title: '📱 Menu Lateral Direito',
    description: 'Sidebar fixa à direita',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="90" y="5" width="25" height="70" fill="#374151" rx="0 4 4 0"/>
        <rect x="10" y="15" width="75" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="95" y="15" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="95" y="25" width="12" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="95" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="15" y="25" width="60" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="15" y="35" width="45" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'hamburger',
    title: '🍔 Menu Hambúrguer',
    description: 'Menu colapsável com ícone hambúrguer',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="15" fill="#3B82F6" rx="4 4 0 0"/>
        <rect x="10" y="8" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="10" y="11" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="10" y="14" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="15" y="30" width="90" height="35" fill="#E5E7EB" rx="2"/>
        <rect x="20" y="40" width="80" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="50" width="60" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'dashboard',
    title: '📊 Dashboard com Sidebar',
    description: 'Layout de dashboard com painel lateral',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="30" height="70" fill="#1F2937" rx="4 0 0 4"/>
        <rect x="40" y="5" width="75" height="15" fill="#374151" rx="0 4 0 0"/>
        <rect x="40" y="25" width="35" height="20" fill="#3B82F6" rx="2"/>
        <rect x="80" y="25" width="30" height="20" fill="#10B981" rx="2"/>
        <rect x="40" y="50" width="70" height="20" fill="#EF4444" rx="2"/>
        <rect x="10" y="15" width="20" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="25" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'expandable',
    title: '🔄 Menu Expansível/Retrátil',
    description: 'Menu que pode expandir e retrair',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="15" height="70" fill="#374151" rx="4 0 0 4"/>
        <rect x="25" y="15" width="85" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="8" y="15" width="2" height="2" fill="#9CA3AF" rx="0.5"/>
        <rect x="8" y="25" width="2" height="2" fill="#9CA3AF" rx="0.5"/>
        <rect x="8" y="35" width="2" height="2" fill="#9CA3AF" rx="0.5"/>
        <rect x="30" y="25" width="70" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="30" y="35" width="50" height="4" fill="#9CA3AF" rx="1"/>
        <polygon points="12,10 16,13 12,16" fill="#9CA3AF"/>
      </svg>
    )
  },
  {
    value: 'single-page',
    title: '🎯 Single Page (sem menu)',
    description: 'Página única sem navegação',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="15" y="15" width="90" height="50" fill="#E5E7EB" rx="2"/>
        <rect x="25" y="25" width="80" height="6" fill="#3B82F6" rx="2"/>
        <rect x="25" y="35" width="70" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="25" y="43" width="60" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="25" y="51" width="75" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'tab-bar',
    title: '📱 Tab Bar (Bottom Navigation)',
    description: 'Navegação por abas na parte inferior',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="60" width="110" height="15" fill="#374151" rx="0 0 4 4"/>
        <rect x="15" y="15" width="90" height="40" fill="#E5E7EB" rx="2"/>
        <rect x="20" y="25" width="80" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="35" width="60" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="15" y="63" width="15" height="8" fill="#3B82F6" rx="1"/>
        <rect x="35" y="63" width="15" height="8" fill="#6B7280" rx="1"/>
        <rect x="55" y="63" width="15" height="8" fill="#6B7280" rx="1"/>
        <rect x="75" y="63" width="15" height="8" fill="#6B7280" rx="1"/>
      </svg>
    )
  },
  {
    value: 'drawer',
    title: '📱 Menu Lateral (Drawer)',
    description: 'Menu deslizante lateral para mobile',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="35" height="70" fill="#374151" rx="4 0 0 4" opacity="0.9"/>
        <rect x="15" y="15" width="90" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="15" width="20" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="25" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="25" width="70" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="35" width="50" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'menu-toolbar',
    title: '📋 Menu Bar + Toolbar',
    description: 'Menu tradicional com barra de ferramentas',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="10" fill="#374151" rx="4 4 0 0"/>
        <rect x="5" y="15" width="110" height="8" fill="#6B7280"/>
        <rect x="15" y="30" width="90" height="40" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="7" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="30" y="7" width="12" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="17" width="8" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="22" y="17" width="8" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="20" y="40" width="80" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'ribbon',
    title: '🔄 Menu Ribbon (Office-style)',
    description: 'Interface estilo Microsoft Office',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="25" fill="#E5E7EB" rx="4 4 0 0"/>
        <rect x="15" y="35" width="90" height="35" fill="#F9FAFB" rx="2"/>
        <rect x="10" y="10" width="20" height="4" fill="#3B82F6" rx="1"/>
        <rect x="35" y="10" width="15" height="4" fill="#6B7280" rx="1"/>
        <rect x="55" y="10" width="18" height="4" fill="#6B7280" rx="1"/>
        <rect x="10" y="18" width="25" height="8" fill="#374151" rx="2"/>
        <rect x="40" y="18" width="20" height="8" fill="#374151" rx="2"/>
        <rect x="20" y="45" width="80" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  {
    value: 'custom',
    title: '🎨 Layout Personalizado',
    description: 'Defina sua própria estrutura',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
        <rect x="15" y="15" width="90" height="50" fill="#E5E7EB" rx="2" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3"/>
        <circle cx="60" cy="40" r="15" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3"/>
        <rect x="50" y="35" width="20" height="10" fill="#3B82F6" opacity="0.3" rx="2"/>
        <text x="60" y="42" textAnchor="middle" fontSize="8" fill="#3B82F6">?</text>
      </svg>
    )
  }
];

const CUSTOM_LAYOUT_ELEMENTS = [
  { 
    value: 'header', 
    label: '✅ Header/Cabeçalho', 
    icon: '🏠',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="20" fill="#3B82F6" rx="4 4 0 0"/>
        <rect x="15" y="10" width="30" height="4" fill="#FFFFFF" rx="1"/>
        <rect x="50" y="10" width="20" height="4" fill="#FFFFFF" rx="1"/>
        <rect x="75" y="10" width="25" height="4" fill="#FFFFFF" rx="1"/>
        <rect x="15" y="35" width="90" height="35" fill="#E5E7EB" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'footer', 
    label: '✅ Footer/Rodapé', 
    icon: '📄',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="15" y="15" width="90" height="40" fill="#E5E7EB" rx="2"/>
        <rect x="5" y="60" width="110" height="15" fill="#6B7280" rx="0 0 4 4"/>
        <rect x="15" y="63" width="25" height="3" fill="#FFFFFF" rx="1"/>
        <rect x="45" y="63" width="20" height="3" fill="#FFFFFF" rx="1"/>
        <rect x="70" y="63" width="30" height="3" fill="#FFFFFF" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'sidebar-left', 
    label: '✅ Menu Lateral Esquerdo', 
    icon: '◀️',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="25" height="70" fill="#374151" rx="4 0 0 4"/>
        <rect x="35" y="15" width="75" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="15" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="25" width="12" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'sidebar-right', 
    label: '✅ Menu Lateral Direito', 
    icon: '▶️',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="90" y="5" width="25" height="70" fill="#374151" rx="0 4 4 0"/>
        <rect x="10" y="15" width="75" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="95" y="15" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="95" y="25" width="12" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="95" y="35" width="18" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'navbar', 
    label: '✅ Menu Superior (Navbar)', 
    icon: '📋',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="15" fill="#374151" rx="4 4 0 0"/>
        <rect x="15" y="30" width="90" height="40" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="8" width="20" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="35" y="8" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="55" y="8" width="18" height="4" fill="#9CA3AF" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'hamburger', 
    label: '✅ Menu Hambúrguer', 
    icon: '🍔',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="15" fill="#3B82F6" rx="4 4 0 0"/>
        <rect x="10" y="8" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="10" y="11" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="10" y="14" width="3" height="2" fill="white" rx="0.5"/>
        <rect x="15" y="30" width="90" height="35" fill="#E5E7EB" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'breadcrumbs', 
    label: '✅ Breadcrumbs', 
    icon: '🍞',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="15" y="15" width="90" height="10" fill="#E5E7EB" rx="2"/>
        <rect x="20" y="18" width="15" height="4" fill="#3B82F6" rx="1"/>
        <text x="38" y="21" fontSize="6" fill="#6B7280">&gt;</text>
        <rect x="42" y="18" width="20" height="4" fill="#6B7280" rx="1"/>
        <text x="65" y="21" fontSize="6" fill="#6B7280">&gt;</text>
        <rect x="69" y="18" width="25" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="15" y="35" width="90" height="35" fill="#F9FAFB" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'tab-navigation', 
    label: '✅ Tab Navigation', 
    icon: '📑',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="15" y="15" width="20" height="8" fill="#3B82F6" rx="2 2 0 0"/>
        <rect x="35" y="15" width="20" height="8" fill="#E5E7EB" rx="2 2 0 0"/>
        <rect x="55" y="15" width="20" height="8" fill="#E5E7EB" rx="2 2 0 0"/>
        <rect x="75" y="15" width="20" height="8" fill="#E5E7EB" rx="2 2 0 0"/>
        <rect x="15" y="23" width="90" height="47" fill="#FFFFFF" rx="0 0 2 2"/>
        <rect x="20" y="30" width="80" height="4" fill="#6B7280" rx="1"/>
        <rect x="20" y="38" width="60" height="4" fill="#6B7280" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'sidebar-panel', 
    label: '✅ Sidebar/Painel Lateral', 
    icon: '📊',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="30" height="70" fill="#1F2937" rx="4 0 0 4"/>
        <rect x="40" y="15" width="70" height="55" fill="#E5E7EB" rx="2"/>
        <rect x="10" y="15" width="20" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="10" y="25" width="15" height="4" fill="#9CA3AF" rx="1"/>
        <rect x="45" y="25" width="60" height="15" fill="#3B82F6" rx="2"/>
        <rect x="45" y="45" width="30" height="15" fill="#10B981" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'toolbar', 
    label: '✅ Toolbar/Barra de Ferramentas', 
    icon: '🔧',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="5" y="5" width="110" height="12" fill="#6B7280" rx="4 4 0 0"/>
        <rect x="10" y="7" width="8" height="8" fill="#9CA3AF" rx="1"/>
        <rect x="22" y="7" width="8" height="8" fill="#9CA3AF" rx="1"/>
        <rect x="34" y="7" width="8" height="8" fill="#9CA3AF" rx="1"/>
        <rect x="46" y="7" width="8" height="8" fill="#9CA3AF" rx="1"/>
        <rect x="15" y="25" width="90" height="45" fill="#E5E7EB" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'search-bar', 
    label: '✅ Search Bar/Barra de Pesquisa', 
    icon: '🔍',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="15" y="15" width="90" height="12" fill="#FFFFFF" rx="6" stroke="#D1D5DB" strokeWidth="1"/>
        <rect x="20" y="18" width="60" height="6" fill="#F3F4F6" rx="2"/>
        <circle cx="95" cy="21" r="4" fill="#6B7280"/>
        <circle cx="95" cy="21" r="2" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
        <rect x="15" y="35" width="90" height="35" fill="#E5E7EB" rx="2"/>
      </svg>
    )
  },
  { 
    value: 'user-menu', 
    label: '✅ User Menu/Menu do Usuário', 
    icon: '👤',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="85" y="10" width="25" height="15" fill="#FFFFFF" rx="2" stroke="#D1D5DB" strokeWidth="1"/>
        <circle cx="90" cy="15" r="3" fill="#6B7280"/>
        <rect x="95" y="13" width="12" height="4" fill="#374151" rx="1"/>
        <rect x="15" y="35" width="90" height="35" fill="#E5E7EB" rx="2"/>
        <rect x="20" y="45" width="80" height="4" fill="#6B7280" rx="1"/>
        <rect x="20" y="53" width="60" height="4" fill="#6B7280" rx="1"/>
      </svg>
    )
  },
  { 
    value: 'notifications', 
    label: '✅ Notifications Panel/Painel de Notificações', 
    icon: '🔔',
    preview: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="#F3F4F6" rx="4"/>
        <rect x="85" y="10" width="25" height="20" fill="#FFFFFF" rx="2" stroke="#D1D5DB" strokeWidth="1"/>
        <circle cx="105" cy="12" r="3" fill="#EF4444"/>
        <text x="105" y="14" textAnchor="middle" fontSize="4" fill="#FFFFFF">3</text>
        <rect x="88" y="16" width="20" height="3" fill="#374151" rx="1"/>
        <rect x="88" y="21" width="15" height="3" fill="#6B7280" rx="1"/>
        <rect x="88" y="26" width="18" height="3" fill="#6B7280" rx="1"/>
        <rect x="15" y="40" width="90" height="30" fill="#E5E7EB" rx="2"/>
      </svg>
    )
  }
];

// Definição das etapas do wizard
const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Informações Básicas',
    description: 'Nome, descrição e funcionalidades do app'
  },
  {
    id: 2,
    title: 'Configurações do Projeto',
    description: 'Escolha entre configurações padrão ou personalizar'
  },
  {
    id: 3,
    title: 'Tipo de Aplicação',
    description: 'Selecione o tipo de aplicação que deseja criar'
  },
  {
    id: 4,
    title: 'Stack Frontend + Framework CSS',
    description: 'Selecione o stack frontend e framework CSS'
  },
  {
    id: 5,
    title: 'Tema de Cores + Fonte Principal',
    description: 'Defina o tema de cores e fonte principal'
  },
  {
    id: 6,
    title: 'Estilo de Layout',
    description: 'Configure o estilo de layout da aplicação'
  },
  {
    id: 7,
    title: 'Estrutura de Menu',
    description: 'Defina a estrutura de navegação e menu'
  },
  {
    id: 8,
    title: 'Funcionalidades',
    description: 'Configure autenticação, banco de dados e pagamentos'
  },
  {
    id: 9,
    title: 'Integrações',
    description: 'Configurar APIs e MCP Servers'
  },
  {
    id: 10,
    title: 'Revisão das Configurações',
    description: 'Revisão das configurações e criação da aplicação'
  }
];

const CreateAppPage: React.FC = () => {
  // Adicionar classe CSS para permitir scroll na página Create
  React.useEffect(() => {
    document.body.classList.add('scrollable-page');
    return () => {
      document.body.classList.remove('scrollable-page');
    };
  }, []);
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    appType: 'Landing Page',
    frontendStack: 'React',
    cssFramework: 'TailwindCSS',
    colorTheme: 'blue',
    mainFont: 'Inter',
    layoutStyle: 'modern',
    enableAuth: false,
    enableDatabase: false,
    enablePayments: false,
    authProvider: '',
    databaseType: '',
    paymentProvider: '',
    // Novos campos
    platformType: 'web',
    menuStructure: 'header-footer',
    adminUsername: '',
    adminPassword: '',
    authType: 'simple',
    customLayoutElements: [], // Para elementos do layout personalizado
    useDefaultSettings: null, // Nova propriedade para configurações padrão vs personalizar
    integrations: {} as Record<string, any> // Para armazenar integrações selecionadas e suas API keys
  });

  // Nova variável de estado para preview das configurações padrão
  const [defaultSettingsPreview, setDefaultSettingsPreview] = useState({
    appType: 'Landing Page',
    frontendStack: 'React',
    cssFramework: 'TailwindCSS',
    colorTheme: 'blue-professional',
    mainFont: 'Inter',
    layoutStyle: 'modern',
    menuStructure: 'header-footer',
    customLayoutElements: []
  });

  const [isCreating, setIsCreating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // Estados para o terminal de compilação
  const [showCompilationTerminal, setShowCompilationTerminal] = useState(false);
  const [compilationCompleted, setCompilationCompleted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [compilationError, setCompilationError] = useState('');

  // Estado para controlar se os serviços foram inicializados
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Auto-fill prompt based on form data using useMemo to prevent infinite re-renders
  const generatedPromptMemo = useMemo(() => {
    const { 
      name, description, appType, frontendStack, cssFramework, colorTheme, 
      mainFont, layoutStyle, enableAuth, authType, adminUsername, adminPassword,
      databaseType, paymentProvider, platformType, menuStructure, integrations,
      enableDatabase, enablePayments, authProvider, customLayoutElements, useDefaultSettings
    } = formData;
    
    // Função para garantir que o valor seja uma string válida
    const ensureString = (value: any, fallback: string = ""): string => {
      if (typeof value === 'string') return value;
      if (value === null || value === undefined) return fallback;
      return String(value);
    };

    // Identificar integrações selecionadas
    const selectedIntegrations = Object.entries(integrations || {})
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key);

    const promptStructure = {
      project_info: {
        name: ensureString(name, "Minha Aplicação"),
        description: ensureString(description, "Uma aplicação moderna e funcional"),
        app_type: ensureString(appType, "web"),
        platform_type: ensureString(platformType, "web")
      },
      design_system: {
        frontend_stack: ensureString(frontendStack, "react"),
        cssFramework: ensureString(cssFramework, "tailwind"),
        color_theme: ensureString(colorTheme, "blue-professional"),
        main_font: ensureString(mainFont, "inter"),
        layout_style: ensureString(layoutStyle, "header-footer")
      },
      features: {
        authentication: {
          enabled: Boolean(enableAuth),
          type: ensureString(authType, "email"),
          provider: ensureString(authProvider, "supabase"),
          admin_credentials: enableAuth ? {
            username: ensureString(adminUsername, "admin"),
            password: ensureString(adminPassword, "admin123")
          } : null
        },
        database: {
          enabled: Boolean(enableDatabase),
          type: ensureString(databaseType, "supabase")
        },
        payments: {
          enabled: Boolean(enablePayments),
          provider: ensureString(paymentProvider, "stripe")
        }
      },
      integrations: selectedIntegrations.length > 0 ? selectedIntegrations : [],
      requirements: {
        menu_structure: Array.isArray(menuStructure) ? menuStructure : [],
        custom_layout_elements: Array.isArray(customLayoutElements) ? customLayoutElements : [],
        responsive_design: true,
        accessibility: true,
        performance_optimization: true
      },
      deliverables: [
        "Complete functional application",
        "Responsive design for all devices",
        "Clean and maintainable code structure",
        "Documentation and setup instructions"
      ]
    };

    return JSON.stringify(promptStructure, null, 2);
  }, [
    formData.name,
    formData.description,
    formData.appType,
    formData.frontendStack,
    formData.cssFramework,
    formData.colorTheme,
    formData.mainFont,
    formData.layoutStyle,
    formData.enableAuth,
    formData.authType,
    formData.adminUsername,
    formData.adminPassword,
    formData.databaseType,
    formData.paymentProvider,
    formData.platformType,
    formData.menuStructure,
    formData.integrations,
    formData.enableDatabase,
    formData.enablePayments,
    formData.authProvider,
    formData.customLayoutElements,
    formData.useDefaultSettings
  ]);

  // Estado para controlar se o usuário editou manualmente o prompt
  const [isPromptManuallyEdited, setIsPromptManuallyEdited] = useState(false);

  // Sincronizar generatedPromptMemo com generatedPrompt
  useEffect(() => {
    console.log('🔄 Sincronizando prompt JSON estruturado...');
    console.log('generatedPromptMemo:', generatedPromptMemo);
    console.log('isPromptManuallyEdited:', isPromptManuallyEdited);
    
    // Só atualiza se o prompt gerado for diferente do atual, não estiver vazio
    // e o usuário não tiver editado manualmente
    if (generatedPromptMemo && generatedPromptMemo !== generatedPrompt && !isPromptManuallyEdited) {
      console.log('✅ Atualizando generatedPrompt com novo valor');
      setGeneratedPrompt(generatedPromptMemo);
    }
  }, [generatedPromptMemo, generatedPrompt, isPromptManuallyEdited]);

  // Inicializar serviços e carregar configurações padrão para preview
  useEffect(() => {
    const initServices = async () => {
      try {
        // O database já é inicializado automaticamente no módulo
        await geminiService.init();
        setServicesInitialized(true);
        
        // Carregar configurações padrão para preview independentemente de useDefaultSettings
        await loadDefaultSettingsForPreview();
      } catch (err) {
        console.error('Erro ao inicializar serviços:', err);
        setInitializationError('Erro ao inicializar serviços. Verifique as configurações.');
      }
    };
    
    initServices();
  }, []);

  // Nova função para carregar configurações padrão apenas para preview
  const loadDefaultSettingsForPreview = async () => {
    try {
      console.log('🔄 Carregando configurações padrão para preview...');
      
      // Carregar configurações padrão do SettingsService
      const defaultAppTypeResult = await settingsService.getSetting('defaultAppType');
      const defaultFrontendStackResult = await settingsService.getSetting('defaultFrontendStack');
      const defaultCssFrameworkResult = await settingsService.getSetting('defaultCssFramework');
      const defaultColorThemeResult = await settingsService.getSetting('defaultColorTheme');
      const defaultMainFontResult = await settingsService.getSetting('defaultFontFamily');
      const defaultLayoutStyleResult = await settingsService.getSetting('defaultLayoutStyle');
      const defaultMenuStructureResult = await settingsService.getSetting('defaultMenuStructure');
      const defaultCustomLayoutElementsResult = await settingsService.getSetting('defaultCustomLayoutElements');

      console.log('🔍 [DEBUG] Resultados para preview:', {
        defaultAppTypeResult,
        defaultFrontendStackResult,
        defaultCssFrameworkResult,
        defaultColorThemeResult,
        defaultMainFontResult,
        defaultLayoutStyleResult,
        defaultMenuStructureResult,
        defaultCustomLayoutElementsResult
      });

      // Extrair valores com fallbacks
      const defaultAppType = (defaultAppTypeResult?.success && defaultAppTypeResult?.data?.value) 
        ? defaultAppTypeResult.data.value 
        : 'Landing Page';
      
      const defaultFrontendStack = (defaultFrontendStackResult?.success && defaultFrontendStackResult?.data?.value) 
        ? defaultFrontendStackResult.data.value 
        : 'React';
      
      const defaultCssFramework = (defaultCssFrameworkResult?.success && defaultCssFrameworkResult?.data?.value) 
        ? defaultCssFrameworkResult.data.value 
        : 'TailwindCSS';
      
      const defaultColorTheme = (defaultColorThemeResult?.success && defaultColorThemeResult?.data?.value) 
        ? defaultColorThemeResult.data.value 
        : 'blue-professional';
      
      const defaultMainFont = (defaultMainFontResult?.success && defaultMainFontResult?.data?.value) 
        ? defaultMainFontResult.data.value 
        : 'Inter';
      
      const defaultLayoutStyle = (defaultLayoutStyleResult?.success && defaultLayoutStyleResult?.data?.value) 
        ? defaultLayoutStyleResult.data.value 
        : 'modern';
      
      const defaultMenuStructure = (defaultMenuStructureResult?.success && defaultMenuStructureResult?.data?.value) 
        ? defaultMenuStructureResult.data.value 
        : 'header-footer';
      
      const defaultCustomLayoutElements = (defaultCustomLayoutElementsResult?.success && defaultCustomLayoutElementsResult?.data?.value) 
        ? JSON.parse(defaultCustomLayoutElementsResult.data.value) 
        : [];

      console.log('✅ Configurações padrão para preview carregadas:', {
        defaultAppType,
        defaultFrontendStack,
        defaultCssFramework,
        defaultColorTheme,
        defaultMainFont,
        defaultLayoutStyle,
        defaultMenuStructure,
        defaultCustomLayoutElements
      });

      // Atualizar o preview das configurações padrão
      setDefaultSettingsPreview({
        appType: String(defaultAppType),
        frontendStack: String(defaultFrontendStack),
        cssFramework: String(defaultCssFramework),
        colorTheme: String(defaultColorTheme),
        mainFont: String(defaultMainFont),
        layoutStyle: String(defaultLayoutStyle),
        menuStructure: String(defaultMenuStructure),
        customLayoutElements: Array.isArray(defaultCustomLayoutElements) ? defaultCustomLayoutElements : []
      });

      console.log('✅ Preview das configurações padrão atualizado');
    } catch (error) {
      console.error('❌ Erro ao carregar configurações padrão para preview:', error);
    }
  };

  // Carregar configurações padrão quando useDefaultSettings é true
  useEffect(() => {
    const loadDefaultSettings = async () => {
      if (formData.useDefaultSettings === true) {
        try {
          console.log('🔄 Carregando configurações padrão do Settings...');
          
          // Carregar configurações padrão do SettingsService
          const defaultAppTypeResult = await settingsService.getSetting('defaultAppType');
          const defaultFrontendStackResult = await settingsService.getSetting('defaultFrontendStack');
          const defaultCssFrameworkResult = await settingsService.getSetting('defaultCssFramework');
          const defaultColorThemeResult = await settingsService.getSetting('defaultColorTheme');
          const defaultMainFontResult = await settingsService.getSetting('defaultFontFamily');
          const defaultLayoutStyleResult = await settingsService.getSetting('defaultLayoutStyle');
          const defaultMenuStructureResult = await settingsService.getSetting('defaultMenuStructure');
          const defaultCustomLayoutElementsResult = await settingsService.getSetting('defaultCustomLayoutElements');

          console.log('🔍 [DEBUG] Resultados brutos do settingsService:', {
            defaultAppTypeResult,
            defaultFrontendStackResult,
            defaultCssFrameworkResult,
            defaultColorThemeResult,
            defaultMainFontResult,
            defaultLayoutStyleResult,
            defaultMenuStructureResult,
            defaultCustomLayoutElementsResult
          });

          // Extrair valores corretamente da estrutura { success, data: { key, value } }
          const defaultAppType = (defaultAppTypeResult?.success && defaultAppTypeResult?.data?.value) 
            ? defaultAppTypeResult.data.value 
            : 'Progressive Web App';
          
          const defaultFrontendStack = (defaultFrontendStackResult?.success && defaultFrontendStackResult?.data?.value) 
            ? defaultFrontendStackResult.data.value 
            : 'React';
          
          const defaultCssFramework = (defaultCssFrameworkResult?.success && defaultCssFrameworkResult?.data?.value) 
            ? defaultCssFrameworkResult.data.value 
            : 'TailwindCSS';
          
          const defaultColorTheme = (defaultColorThemeResult?.success && defaultColorThemeResult?.data?.value) 
            ? defaultColorThemeResult.data.value 
            : 'blue-professional';
          
          const defaultMainFont = (defaultMainFontResult?.success && defaultMainFontResult?.data?.value) 
            ? defaultMainFontResult.data.value 
            : 'inter';
          
          const defaultLayoutStyle = (defaultLayoutStyleResult?.success && defaultLayoutStyleResult?.data?.value) 
            ? defaultLayoutStyleResult.data.value 
            : 'modern';
          
          const defaultMenuStructure = (defaultMenuStructureResult?.success && defaultMenuStructureResult?.data?.value) 
            ? defaultMenuStructureResult.data.value 
            : 'header-footer';
          
          const defaultCustomLayoutElements = (defaultCustomLayoutElementsResult?.success && defaultCustomLayoutElementsResult?.data?.value) 
            ? JSON.parse(defaultCustomLayoutElementsResult.data.value) 
            : [];

          console.log('✅ Configurações padrão carregadas:', {
            defaultAppType,
            defaultFrontendStack,
            defaultCssFramework,
            defaultColorTheme,
            defaultMainFont,
            defaultLayoutStyle,
            defaultMenuStructure,
            defaultCustomLayoutElements
          });

          // Debug: Verificar tipos dos valores
          console.log('🔍 [DEBUG] Tipos das configurações:', {
            defaultAppType: typeof defaultAppType,
            defaultFrontendStack: typeof defaultFrontendStack,
            defaultCssFramework: typeof defaultCssFramework,
            defaultColorTheme: typeof defaultColorTheme,
            defaultMainFont: typeof defaultMainFont,
            defaultLayoutStyle: typeof defaultLayoutStyle
          });

          // Aplicar configurações padrão no formData
          setFormData(prevData => {
            const newData = {
              ...prevData,
              appType: String(defaultAppType),
              frontendStack: String(defaultFrontendStack),
              cssFramework: String(defaultCssFramework),
              colorTheme: String(defaultColorTheme),
              mainFont: String(defaultMainFont),
              layoutStyle: String(defaultLayoutStyle),
              menuStructure: String(defaultMenuStructure),
              customLayoutElements: Array.isArray(defaultCustomLayoutElements) ? defaultCustomLayoutElements : []
            };
            
            console.log('🔍 [DEBUG] Novo formData sendo aplicado:', {
              frontendStack: newData.frontendStack,
              cssFramework: newData.cssFramework,
              colorTheme: newData.colorTheme,
              layoutStyle: newData.layoutStyle,
              tipos: {
                frontendStack: typeof newData.frontendStack,
                cssFramework: typeof newData.cssFramework,
                colorTheme: typeof newData.colorTheme,
                layoutStyle: typeof newData.layoutStyle
              }
            });
            
            return newData;
          });

          console.log('✅ Configurações padrão aplicadas no formData');
          
          // Debug: Verificar formData após aplicação (usando setTimeout para aguardar o setState)
          setTimeout(() => {
            console.log('🔍 [DEBUG] FormData após aplicação das configurações padrão:', {
              frontendStack: formData.frontendStack,
              cssFramework: formData.cssFramework,
              colorTheme: formData.colorTheme,
              layoutStyle: formData.layoutStyle
            });
          }, 100);
        } catch (error) {
          console.error('❌ Erro ao carregar configurações padrão:', error);
        }
      }
    };

    loadDefaultSettings();
  }, [formData.useDefaultSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLayoutChange = (layoutValue: string) => {
    setFormData(prev => ({ ...prev, layoutStyle: layoutValue }));
  };

  // Funções específicas para evitar loop infinito
  const handleUseDefaultSettingsChange = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, useDefaultSettings: value }));
  }, []);

  const handleFrontendStackChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, frontendStack: value }));
  }, []);

  const handleCssFrameworkChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, cssFramework: value }));
  }, []);

  const handleMainFontChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, mainFont: value }));
  }, []);

  // Validação de campos obrigatórios por etapa
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Etapa 1: Informações Básicas
        if (!formData.name?.trim()) {
          error('Campo obrigatório', 'Por favor, preencha o nome do app.');
          return false;
        }
        if (!formData.description?.trim()) {
          error('Campo obrigatório', 'Por favor, preencha a descrição do app.');
          return false;
        }
        return true;
      
      case 2:
        // Etapa 2: Configurações do Projeto
        if (formData.useDefaultSettings === null) {
          error('Campo obrigatório', 'Por favor, escolha entre configurações padrão ou personalizar.');
          return false;
        }
        return true;
      
      case 3:
        // Etapa 3: Tipo de Aplicação (apenas se personalizar)
        if (formData.useDefaultSettings === false && !formData.appType) {
          error('Campo obrigatório', 'Por favor, selecione o tipo de aplicação.');
          return false;
        }
        return true;
      
      case 4:
        // Etapa 4: Tipo e Plataforma
        if (!formData.platformType) {
          error('Campo obrigatório', 'Por favor, selecione o tipo de plataforma.');
          return false;
        }
        return true;
      
      case 5:
        // Etapa 5: Design e Aparência
        if (!formData.frontendStack) {
          error('Campo obrigatório', 'Por favor, selecione o stack frontend.');
          return false;
        }
        if (!formData.cssFramework) {
          error('Campo obrigatório', 'Por favor, selecione o framework CSS.');
          return false;
        }
        if (!formData.colorTheme) {
          error('Campo obrigatório', 'Por favor, selecione um tema de cores.');
          return false;
        }
        if (!formData.mainFont) {
          error('Campo obrigatório', 'Por favor, selecione uma fonte principal.');
          return false;
        }
        return true;
      
      case 6:
        // Etapa 6: Estilo de Layout
        if (!formData.layoutStyle) {
          error('Campo obrigatório', 'Por favor, selecione um estilo de layout.');
          return false;
        }
        return true;
      
      case 7:
        // Etapa 7: Estrutura de Menu
        if (!formData.menuStructure) {
          error('Campo obrigatório', 'Por favor, selecione uma estrutura de navegação.');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Navegação entre etapas
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < WIZARD_STEPS.length) {
        // Se estamos na etapa 2 (Configurações do Projeto) e o usuário escolheu configurações padrão
        if (currentStep === 2 && formData.useDefaultSettings === true) {
          // Pula direto para a etapa 10 (Revisão das Configurações) - ajustado para nova numeração
          setCurrentStep(10);
        } else {
          setCurrentStep(currentStep + 1);
        }
      }
    }
    // A validação já mostra o erro específico, não precisa de erro genérico
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Se estamos na etapa 10 (Revisão das Configurações) e viemos das configurações padrão
      if (currentStep === 10 && formData.useDefaultSettings === true) {
        // Volta para a etapa 2 (Configurações do Projeto)
        setCurrentStep(2);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [DEBUG] handleSubmit iniciado');
    
    if (!formData.name.trim()) {
      error('Nome obrigatório', 'Por favor, insira um nome para o projeto');
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('🔍 [DEBUG] Verificando inicialização dos serviços...');
      
      // Verificar se os serviços foram inicializados
      if (!servicesInitialized) {
        console.log('❌ [DEBUG] Serviços não inicializados');
        error('Serviços não inicializados', 'Aguarde a inicialização dos serviços antes de criar o projeto.');
        setIsCreating(false);
        return;
      }

      console.log('✅ [DEBUG] Serviços inicializados, criando projeto...');

      // Criar um user_id padrão se não existir
      const userId = 'default-user';

      const projectData = {
        user_id: userId,
        title: formData.name,
        description: formData.description || '',
        config: {
          appType: formData.appType,
          frontendStack: formData.frontendStack,
          cssFramework: formData.cssFramework,
          colorTheme: formData.colorTheme,
          mainFont: formData.mainFont,
          layoutStyle: formData.layoutStyle,
          enableAuth: formData.enableAuth,
          enableDatabase: formData.enableDatabase,
          enablePayments: formData.enablePayments,
          authProvider: formData.authProvider,
          databaseType: formData.databaseType,
          paymentProvider: formData.paymentProvider,
          platformType: formData.platformType,
          menuStructure: formData.menuStructure,
          adminUsername: formData.adminUsername,
          adminPassword: formData.adminPassword,
          authType: formData.authType,
          customLayoutElements: formData.customLayoutElements
        }
      };

      console.log('🔍 [DEBUG] Dados do projeto a serem salvos:', {
        title: projectData.title,
        description: projectData.description,
        configKeys: Object.keys(projectData.config)
      });

      // Salvar projeto no SQLite local com a estrutura correta
      const projectId = await database.createProject(projectData);

      console.log('✅ [DEBUG] Projeto criado com ID:', projectId);

      success('Projeto criado!', `O projeto "${formData.name}" foi criado com sucesso!`);
      
      console.log('🔍 [DEBUG] Navegando para página de compilação...');
      
      // Navegar para a página de compilação com os dados do projeto
      navigate('/compilation', {
        state: {
          projectId,
          projectName: formData.name,
          appConfig: formData,
          isNewProject: true
        }
      });
      
    } catch (err) {
      console.error('❌ [DEBUG] Erro ao criar projeto:', err);
      console.error('❌ [DEBUG] Stack trace:', err.stack);
      error('Erro na criação', 'Não foi possível criar o app. Verifique se a API Gemini está configurada.');
      setIsCreating(false);
    }
  };

  const handleCompilationComplete = async (code: string) => {
    setGeneratedCode(code);
    setCompilationCompleted(true);
    setIsCreating(false);
    
    // Validar layout responsivo no código gerado
    const validationResult = LayoutValidator.validateFixedLayout(code);
    
    if (!validationResult.isValid) {
      console.warn('⚠️ Layout validation warnings:', validationResult);
      
      // Mostrar avisos de validação se houver erros críticos
      if (validationResult.errors.length > 0) {
        const errorMessage = `Layout pode não estar totalmente responsivo:\n${validationResult.errors.slice(0, 3).join('\n')}`;
        error('Validação de Layout', errorMessage);
      }
      
      // Log do relatório completo para debug
      console.log('📋 Relatório de Validação de Layout:\n', LayoutValidator.generateValidationReport(validationResult));
    } else {
      console.log('✅ Layout validation passed successfully');
    }
    
    // Não criar projeto aqui - ele já foi criado no handleSubmit
    // Apenas criar a versão 1 com o código gerado
    success('App gerado!', `O app "${formData.name}" foi gerado com sucesso!`);
  };

  const handleCompilationError = (errorMessage: string) => {
    setCompilationError(errorMessage);
    setIsCreating(false);
    error('Erro na compilação', errorMessage);
  };

  const handleModifyApp = () => {
    // Reiniciar o processo de compilação para modificar o app
    setCompilationCompleted(false);
    setGeneratedCode('');
    setCompilationError('');
    setIsCreating(true);
    // O terminal irá reiniciar automaticamente
  };

  // Renderização das etapas do wizard
  const renderStep1 = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Informações Básicas</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Input
            label="Nome do App *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Minha Loja Virtual"
            required
          />
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Descrição do App *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva brevemente o que sua aplicação fará..."
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white resize-none text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card gradient>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Configurações do Projeto</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-300 text-lg mb-2">Como você gostaria de configurar seu projeto?</p>
              <p className="text-gray-400 text-sm">Escolha entre usar configurações padrão ou personalizar cada aspecto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações Padrão */}
              <div
                onClick={() => handleUseDefaultSettingsChange(true)}
                className={`group relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-h-[200px] flex flex-col ${
                  formData.useDefaultSettings === true
                    ? 'border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-lg shadow-green-500/25'
                    : 'border-gray-600/50 bg-gradient-to-br from-gray-800/60 to-gray-900/40 hover:border-gray-500/70 hover:from-gray-700/60 hover:to-gray-800/40 backdrop-blur-sm'
                }`}
              >
                {formData.useDefaultSettings === true && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-green-300 transition-colors duration-300">
                    ⚡ Configurações Padrão
                  </h3>
                </div>
                
                <div className="flex-grow">
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
                    Use configurações otimizadas e testadas para começar rapidamente
                  </p>
                  <ul className="text-gray-500 text-xs space-y-2">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                      {(() => {
                        const stack = defaultSettingsPreview.frontendStack;
                        console.log('🔍 [DEBUG] Card UL - frontendStack (preview):', stack, typeof stack);
                        return stack;
                      })()} + TypeScript
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                      {(() => {
                        const framework = defaultSettingsPreview.cssFramework;
                        console.log('🔍 [DEBUG] Card UL - cssFramework (preview):', framework, typeof framework);
                        return framework;
                      })()}
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                      {(() => {
                        const theme = defaultSettingsPreview.colorTheme;
                        console.log('🔍 [DEBUG] Card UL - colorTheme (preview):', theme, typeof theme);
                        return theme;
                      })()}
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                      {(() => {
                        const layout = defaultSettingsPreview.layoutStyle;
                        console.log('🔍 [DEBUG] Card UL - layoutStyle:', layout, typeof layout);
                        return layout;
                      })()}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Personalizar */}
              <div
                onClick={() => handleUseDefaultSettingsChange(false)}
                className={`group relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-h-[200px] flex flex-col ${
                  formData.useDefaultSettings === false
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/25'
                    : 'border-gray-600/50 bg-gradient-to-br from-gray-800/60 to-gray-900/40 hover:border-gray-500/70 hover:from-gray-700/60 hover:to-gray-800/40 backdrop-blur-sm'
                }`}
              >
                {formData.useDefaultSettings === false && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    🎨 Personalizar
                  </h3>
                </div>
                
                <div className="flex-grow">
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
                    Configure cada aspecto do seu projeto de acordo com suas necessidades
                  </p>
                  <ul className="text-gray-500 text-xs space-y-2">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Escolha o stack frontend
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Selecione framework CSS
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Defina tema e cores
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      Configure layout e navegação
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepApplicationType = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Tipo de Aplicação</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Selecione o tipo de aplicação que deseja criar *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {APP_TYPES_EXPANDED.map((appType) => (
                <div
                  key={appType.value}
                  onClick={() => setFormData(prev => ({ ...prev, appType: appType.value }))}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                    ${formData.appType === appType.value
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    <div className="h-16 mb-3 flex items-center justify-center bg-gray-900/50 rounded-lg">
                      {appType.preview}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-1">{appType.title}</h4>
                      <p className="text-xs text-gray-400">{appType.description}</p>
                    </div>
                    {formData.appType === appType.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Nova etapa 4: Stack Frontend + Framework CSS
  const renderStepFrontendAndCSS = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Stack Frontend + Framework CSS</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Frontend Stack com Cards Visuais */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Stack Frontend *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRONTEND_STACKS_EXPANDED.map((stack) => (
                <div
                  key={stack.value}
                  onClick={() => handleFrontendStackChange(stack.value)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.frontendStack === stack.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{stack.title}</h4>
                    <div className="flex-shrink-0">
                      {stack.preview}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{stack.description}</p>
                  {formData.frontendStack === stack.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Framework CSS com Cards Visuais */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Framework CSS *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CSS_FRAMEWORKS_EXPANDED.map((framework) => (
                <div
                  key={framework.value}
                  onClick={() => handleCssFrameworkChange(framework.value)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.cssFramework === framework.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{framework.title}</h4>
                    <div className="flex-shrink-0">
                      {framework.preview}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{framework.description}</p>
                  {formData.cssFramework === framework.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Nova etapa 5: Tema de Cores + Fonte Principal
  const renderStepThemeAndFont = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Tema de Cores + Fonte Principal</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          {/* Tema de Cores com Visualizações */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tema de Cores *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_THEMES_EXPANDED.map((theme) => (
                <div
                  key={theme.value}
                  onClick={() => handleInputChange({ target: { name: 'colorTheme', value: theme.value } } as React.ChangeEvent<HTMLInputElement>)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.colorTheme === theme.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  {formData.colorTheme === theme.value && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="h-16 mb-3 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                    {theme.preview}
                  </div>
                  
                  <h3 className="text-white font-medium text-sm mb-1">
                    {theme.title}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {theme.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Fonte Principal com Visualizações */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Fonte Principal *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FONT_FAMILIES_EXPANDED.map((font) => (
                <div
                  key={font.value}
                  onClick={() => handleMainFontChange(font.value)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.mainFont === font.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  {formData.mainFont === font.value && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="h-16 mb-3 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                    {font.preview}
                  </div>
                  
                  <h3 className="text-white font-medium text-sm mb-1">
                    {font.title}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {font.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Nova etapa 6: Estilo de Layout
  const renderStepLayoutStyle = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Estilo de Layout</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Layout Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Estilo de Layout *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layoutOptions.map((layout) => (
                <div
                  key={layout.value}
                  className={`group cursor-pointer p-3 sm:p-4 border-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg min-h-[180px] flex flex-col ${
                    formData.layoutStyle === layout.value
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/25'
                      : 'border-gray-600/50 bg-gradient-to-br from-gray-800/60 to-gray-900/40 hover:border-gray-500/70 hover:from-gray-700/60 hover:to-gray-800/40 backdrop-blur-sm'
                  }`}
                  onClick={() => handleLayoutChange(layout.value)}
                >
                  <div className="h-12 sm:h-16 bg-gradient-to-br from-gray-700/80 to-gray-800/60 rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-inner border border-gray-600/30 flex-shrink-0">
                    {layout.preview}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="text-xs text-center text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {layout.title}
                    </div>
                    <div className="text-xs text-center text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {layout.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Nova etapa 7: Estrutura de Menu
  const renderStepMenuStructure = () => (
    <Card gradient>
      <CardHeader>
        <h2 className="text-xl font-semibold text-white">Estrutura de Menu</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          {/* Estrutura de Navegação com Wireframes Visuais */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-4">
              Estrutura de Navegação *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NAVIGATION_STRUCTURES_EXPANDED
                .filter(structure => 
                  LAYOUT_OPTIONS_BY_PLATFORM[formData.platformType]?.some(option => option.value === structure.value)
                )
                .map((structure) => (
                <div
                  key={structure.value}
                  onClick={() => setFormData(prev => ({ ...prev, menuStructure: structure.value }))}
                  className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-h-[180px] flex flex-col ${
                    formData.menuStructure === structure.value
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg shadow-blue-500/25'
                      : 'border-gray-600/50 bg-gradient-to-br from-gray-800/60 to-gray-900/40 hover:border-gray-500/70 hover:from-gray-700/60 hover:to-gray-800/40 backdrop-blur-sm'
                  }`}
                >
                  {formData.menuStructure === structure.value && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="h-20 mb-4 bg-gradient-to-br from-gray-700/80 to-gray-800/60 rounded-xl overflow-hidden shadow-inner border border-gray-600/30 flex-shrink-0">
                    {structure.preview}
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {structure.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {structure.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {formData.menuStructure === 'custom' && (
            <div className="mt-6 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Elementos do Layout Personalizado</h3>
              <p className="text-gray-300 text-sm mb-4">Selecione os elementos que deseja incluir na sua aplicação:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CUSTOM_LAYOUT_ELEMENTS.map((element) => (
                  <div 
                    key={element.value} 
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 min-h-[180px] flex flex-col ${
                      formData.customLayoutElements.includes(element.value)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                    onClick={() => {
                      const isSelected = formData.customLayoutElements.includes(element.value);
                      const newElements = isSelected
                        ? formData.customLayoutElements.filter(el => el !== element.value)
                        : [...formData.customLayoutElements, element.value];
                      
                      setFormData(prev => ({
                        ...prev,
                        customLayoutElements: newElements
                      }));
                    }}
                  >
                    {formData.customLayoutElements.includes(element.value) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="h-16 mb-3 bg-gray-700 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                      {element.preview}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <h3 className="text-white font-medium text-sm mb-1">
                        {element.label.replace('✅ ', '')}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        Componente de {element.label.replace('✅ ', '').toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.customLayoutElements.length > 0 && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">Elementos selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.customLayoutElements.map((elementValue) => {
                      const element = CUSTOM_LAYOUT_ELEMENTS.find(el => el.value === elementValue);
                      return (
                        <span 
                          key={elementValue}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                        >
                          {element?.label.replace('✅ ', '')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Nova etapa 8: Funcionalidades
  const renderStepFeatures = () => (
    <div className="space-y-6">
      <Card gradient>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Funcionalidades</h2>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="enableAuth"
                name="enableAuth"
                checked={formData.enableAuth}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableAuth" className="ml-2 text-white font-medium">
                Incluir Sistema de Autenticação
              </label>
            </div>
            
            {formData.enableAuth && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Usuário Admin"
                    name="adminUsername"
                    value={formData.adminUsername}
                    onChange={handleInputChange}
                    placeholder="admin"
                  />
                  <Input
                    label="Senha Admin"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
                <Select
                  label="Tipo de Autenticação"
                  name="authType"
                  value={formData.authType}
                  onChange={handleInputChange}
                  options={[
                    { value: 'simple', label: 'Simples (Local)' },
                    { value: 'jwt', label: 'JWT Token' },
                    { value: 'oauth', label: 'OAuth (Google/Facebook)' }
                  ]}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card gradient>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Recursos Adicionais</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Database */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="enableDatabase"
                  name="enableDatabase"
                  checked={formData.enableDatabase}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enableDatabase" className="ml-2 text-white font-medium">
                  Banco de Dados
                </label>
              </div>
              {formData.enableDatabase && (
                <Select
                  label="Tipo de Banco"
                  name="databaseType"
                  value={formData.databaseType}
                  onChange={handleInputChange}
                  options={[
                    { value: 'sqlite', label: 'SQLite (Local)' },
                    { value: 'postgresql', label: 'PostgreSQL' },
                    { value: 'mysql', label: 'MySQL' },
                    { value: 'mongodb', label: 'MongoDB' }
                  ]}
                />
              )}
            </div>

            {/* Payments */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="enablePayments"
                  name="enablePayments"
                  checked={formData.enablePayments}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enablePayments" className="ml-2 text-white font-medium">
                  Sistema de Pagamentos
                </label>
              </div>
              {formData.enablePayments && (
                <Select
                  label="Provedor de Pagamento"
                  name="paymentProvider"
                  value={formData.paymentProvider}
                  onChange={handleInputChange}
                  options={[
                    { value: 'stripe', label: 'Stripe' },
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'mercadopago', label: 'Mercado Pago' },
                    { value: 'pagseguro', label: 'PagSeguro' }
                  ]}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepIntegrations = () => {
    const availableIntegrations = [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4, ChatGPT, DALL-E',
        icon: '🤖',
        category: 'AI/ML'
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        description: 'Claude AI Assistant',
        icon: '🧠',
        category: 'AI/ML'
      },
      {
        id: 'google-ai',
        name: 'Google AI',
        description: 'Gemini, PaLM, Bard',
        icon: '🔍',
        category: 'AI/ML'
      },
      {
        id: 'github',
        name: 'GitHub API',
        description: 'Repositórios, Issues, Actions',
        icon: '🐙',
        category: 'Development'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Pagamentos e Checkout',
        icon: '💳',
        category: 'Payment'
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        description: 'Email Marketing',
        icon: '📧',
        category: 'Communication'
      },
      {
        id: 'twilio',
        name: 'Twilio',
        description: 'SMS e WhatsApp',
        icon: '📱',
        category: 'Communication'
      },
      {
        id: 'firebase',
        name: 'Firebase',
        description: 'Database, Auth, Storage',
        icon: '🔥',
        category: 'Backend'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        description: 'Database, Auth, Storage',
        icon: '⚡',
        category: 'Backend'
      },
      {
        id: 'aws',
        name: 'AWS Services',
        description: 'S3, Lambda, DynamoDB',
        icon: '☁️',
        category: 'Cloud'
      }
    ];

    const categories = [...new Set(availableIntegrations.map(i => i.category))];

    const toggleIntegration = (integrationId: string) => {
      setFormData(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          [integrationId]: prev.integrations[integrationId] 
            ? undefined 
            : { enabled: true, apiKey: '' }
        }
      }));
    };

    const updateApiKey = (integrationId: string, apiKey: string) => {
      setFormData(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          [integrationId]: {
            ...prev.integrations[integrationId],
            apiKey
          }
        }
      }));
    };

    return (
      <div className="space-y-6">
        <Card gradient>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">Integrações</h2>
            <p className="text-gray-300">Configure APIs e MCP Servers para seu aplicativo</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableIntegrations
                      .filter(integration => integration.category === category)
                      .map(integration => {
                        const isSelected = !!formData.integrations[integration.id];
                        return (
                          <div key={integration.id} className="space-y-3">
                            <div
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                              onClick={() => toggleIntegration(integration.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{integration.icon}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-white">{integration.name}</h4>
                                  <p className="text-sm text-gray-400">{integration.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="ml-4 space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  API Key / Token
                                </label>
                                <Input
                                  type="password"
                                  placeholder={`Digite sua ${integration.name} API key`}
                                  value={formData.integrations[integration.id]?.apiKey || ''}
                                  onChange={(e) => updateApiKey(integration.id, e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                />
                                <p className="text-xs text-gray-500">
                                  Esta chave será usada para autenticar com a API do {integration.name}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
              
              {Object.keys(formData.integrations).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔌</div>
                  <p className="text-gray-400">
                    Nenhuma integração selecionada. Você pode adicionar integrações mais tarde.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="space-y-6">
      <Card gradient>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Revisão das Configurações</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Nome:</span>
                <span className="text-white ml-2">{formData.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white ml-2">{formData.appType}</span>
              </div>
              <div>
                <span className="text-gray-400">Plataforma:</span>
                <span className="text-white ml-2">{formData.platformType}</span>
              </div>
              <div>
                <span className="text-gray-400">Frontend:</span>
                <span className="text-white ml-2">{formData.frontendStack}</span>
              </div>
              <div>
                <span className="text-gray-400">CSS:</span>
                <span className="text-white ml-2">{formData.cssFramework}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Tema:</span>
                <span className="text-white ml-2">{formData.colorTheme}</span>
              </div>
              <div>
                <span className="text-gray-400">Fonte:</span>
                <span className="text-white ml-2">{formData.mainFont}</span>
              </div>
              <div>
                <span className="text-gray-400">Layout:</span>
                <span className="text-white ml-2">{formData.layoutStyle}</span>
              </div>
              <div>
                <span className="text-gray-400">Navegação:</span>
                <span className="text-white ml-2">{formData.menuStructure}</span>
              </div>
              <div>
                <span className="text-gray-400">Autenticação:</span>
                <span className="text-white ml-2">{formData.enableAuth ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card gradient>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Comando Gemini - Finalização
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Revise todas as configurações e finalize a criação do seu app. O comando será gerado automaticamente com base nas suas escolhas.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tags das Escolhas Principais */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Suas Escolhas
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.name && (
                  <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                    📱 {formData.name}
                  </span>
                )}
                {formData.appType && typeof formData.appType === 'string' && (
                  <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                    🎯 {formData.appType}
                  </span>
                )}
                {formData.frontendStack && typeof formData.frontendStack === 'string' && (
                  <span className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs rounded-full">
                    ⚛️ {formData.frontendStack}
                  </span>
                )}
                {formData.cssFramework && typeof formData.cssFramework === 'string' && (
                  <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-300 text-xs rounded-full">
                    🎨 {formData.cssFramework}
                  </span>
                )}
                {formData.colorTheme && typeof formData.colorTheme === 'string' && (
                  <span className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs rounded-full">
                    🌈 {formData.colorTheme}
                  </span>
                )}
                {formData.layoutStyle && typeof formData.layoutStyle === 'string' && (
                  <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 text-xs rounded-full">
                    📐 {formData.layoutStyle}
                  </span>
                )}
                {formData.enableAuth && (
                  <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-300 text-xs rounded-full">
                    🔐 Autenticação
                  </span>
                )}
                {formData.integrations && Object.keys(formData.integrations).filter(key => formData.integrations[key]?.enabled).map(integration => (
                  <span key={integration} className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full">
                    🔗 {integration}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="generatedPrompt" className="block text-sm font-medium text-gray-300 mb-2">
                Prompt JSON Estruturado (Editável)
              </label>
              <textarea
                id="generatedPrompt"
                rows={12}
                value={generatedPrompt}
                onChange={(e) => {
                  setGeneratedPrompt(e.target.value);
                  setIsPromptManuallyEdited(true);
                }}
                className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white resize-y text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="O prompt JSON será gerado automaticamente com base nas suas escolhas..."
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Este prompt está em formato JSON estruturado seguindo melhores práticas de engenharia de prompt. Você pode editá-lo conforme necessário.
              </p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-400 font-medium text-sm">Pronto para criar!</h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Todas as configurações foram definidas. Clique em "Criar Aplicação" para gerar seu projeto com as especificações escolhidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const layoutOptions = [
    {
      value: 'modern',
      title: 'Moderno',
      description: 'Cards & Gradientes',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <linearGradient id="modernGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="120" height="15" fill="url(#modernGrad)" rx="2"/>
          <rect x="8" y="22" width="25" height="20" fill="#4F46E5" rx="4" opacity="0.9"/>
          <rect x="38" y="25" width="25" height="20" fill="#7C3AED" rx="4" opacity="0.8"/>
          <rect x="68" y="20" width="25" height="20" fill="#2563EB" rx="4" opacity="0.9"/>
          <circle cx="105" cy="30" r="8" fill="#F59E0B" opacity="0.7"/>
          <rect x="8" y="50" width="104" height="4" fill="#6B7280" rx="2"/>
          <rect x="8" y="58" width="80" height="4" fill="#6B7280" rx="2"/>
        </svg>
      )
    },
    {
      value: 'minimal',
      title: 'Minimalista',
      description: 'Clean & Simples',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <rect x="0" y="0" width="120" height="12" fill="#F9FAFB"/>
          <rect x="10" y="3" width="30" height="6" fill="#374151" rx="1"/>
          <rect x="20" y="25" width="80" height="3" fill="#6B7280" rx="1"/>
          <rect x="20" y="32" width="60" height="3" fill="#6B7280" rx="1"/>
          <rect x="20" y="39" width="70" height="3" fill="#6B7280" rx="1"/>
          <rect x="35" y="50" width="50" height="20" fill="#E5E7EB" rx="2"/>
          <rect x="45" y="58" width="30" height="4" fill="#9CA3AF" rx="1"/>
        </svg>
      )
    },
    {
      value: 'classic',
      title: 'Clássico',
      description: 'Tradicional',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <rect x="0" y="0" width="120" height="15" fill="#1F2937"/>
          <rect x="8" y="4" width="20" height="7" fill="#F3F4F6" rx="1"/>
          <rect x="90" y="4" width="25" height="7" fill="#F3F4F6" rx="1"/>
          <rect x="0" y="15" width="25" height="65" fill="#374151"/>
          <rect x="3" y="20" width="19" height="3" fill="#9CA3AF" rx="1"/>
          <rect x="3" y="26" width="19" height="3" fill="#9CA3AF" rx="1"/>
          <rect x="3" y="32" width="19" height="3" fill="#9CA3AF" rx="1"/>
          <rect x="30" y="20" width="85" height="55" fill="#F9FAFB"/>
          <rect x="35" y="25" width="75" height="4" fill="#374151" rx="1"/>
          <rect x="35" y="33" width="50" height="3" fill="#6B7280" rx="1"/>
          <rect x="35" y="40" width="60" height="3" fill="#6B7280" rx="1"/>
        </svg>
      )
    },
    {
      value: 'creative',
      title: 'Criativo',
      description: 'Ousado',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <polygon points="0,0 120,0 100,15 0,12" fill="#EC4899"/>
          <rect x="8" y="3" width="15" height="6" fill="#FFFFFF" rx="1"/>
          <circle cx="25" cy="35" r="12" fill="#F59E0B" opacity="0.8"/>
          <rect x="45" y="25" width="30" height="20" fill="#8B5CF6" rx="3" transform="rotate(15 60 35)"/>
          <polygon points="80,20 100,25 95,45 75,40" fill="#10B981"/>
          <circle cx="15" cy="60" r="6" fill="#EF4444" opacity="0.7"/>
          <rect x="70" y="55" width="40" height="15" fill="#3B82F6" rx="2" transform="rotate(-10 90 62)"/>
          <polygon points="105,50 115,55 110,70 100,65" fill="#F59E0B"/>
        </svg>
      )
    },
    {
      value: 'skeuomorphism',
      title: 'Skeumorfismo',
      description: 'Objetos Reais',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <linearGradient id="skeuGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#E5E7EB', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#9CA3AF', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="skeuGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#D1D5DB', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="120" height="12" fill="url(#skeuGrad1)" rx="2"/>
          <rect x="8" y="20" width="30" height="25" fill="url(#skeuGrad2)" rx="4" stroke="#9CA3AF" strokeWidth="1"/>
          <rect x="10" y="22" width="26" height="21" fill="#F9FAFB" rx="2"/>
          <circle cx="23" cy="32" r="6" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
          <rect x="45" y="25" width="25" height="15" fill="url(#skeuGrad2)" rx="3" stroke="#6B7280" strokeWidth="1"/>
          <rect x="80" y="22" width="30" height="20" fill="url(#skeuGrad1)" rx="4" stroke="#4B5563" strokeWidth="1"/>
          <rect x="15" y="55" width="90" height="8" fill="url(#skeuGrad2)" rx="4" stroke="#D1D5DB" strokeWidth="1"/>
        </svg>
      )
    },
    {
      value: 'neumorphism',
      title: 'Neumorfismo',
      description: 'Soft UI',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <filter id="neuShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#D1D5DB" floodOpacity="0.5"/>
              <feDropShadow dx="-2" dy="-2" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.8"/>
            </filter>
          </defs>
          <rect x="0" y="0" width="120" height="80" fill="#E5E7EB"/>
          <rect x="15" y="15" width="25" height="20" fill="#E5E7EB" rx="8" filter="url(#neuShadow)"/>
          <rect x="50" y="18" width="25" height="15" fill="#E5E7EB" rx="6" filter="url(#neuShadow)"/>
          <rect x="85" y="12" width="25" height="25" fill="#E5E7EB" rx="10" filter="url(#neuShadow)"/>
          <circle cx="25" cy="55" r="12" fill="#E5E7EB" filter="url(#neuShadow)"/>
          <rect x="45" y="50" width="50" height="12" fill="#E5E7EB" rx="6" filter="url(#neuShadow)"/>
        </svg>
      )
    },
    {
      value: 'glassmorphism',
      title: 'Glassmorphism',
      description: 'Efeito Vidro',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.6 }} />
            </linearGradient>
            <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
            </filter>
          </defs>
          <rect x="0" y="0" width="120" height="80" fill="url(#glassGrad)"/>
          <rect x="10" y="10" width="100" height="60" fill="rgba(255,255,255,0.1)" rx="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1" filter="url(#blur)"/>
          <rect x="20" y="20" width="30" height="20" fill="rgba(255,255,255,0.15)" rx="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <rect x="60" y="25" width="40" height="15" fill="rgba(255,255,255,0.1)" rx="3" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
          <circle cx="30" cy="55" r="8" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          <rect x="50" y="50" width="50" height="8" fill="rgba(255,255,255,0.12)" rx="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        </svg>
      )
    },
    {
      value: 'brutalism',
      title: 'Brutalism',
      description: 'Bold & Angular',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <rect x="0" y="0" width="120" height="80" fill="#000000"/>
          <rect x="5" y="5" width="35" height="25" fill="#FF0000" stroke="#FFFFFF" strokeWidth="3"/>
          <rect x="45" y="10" width="30" height="15" fill="#00FF00" stroke="#000000" strokeWidth="2"/>
          <rect x="80" y="0" width="40" height="35" fill="#0000FF" stroke="#FFFFFF" strokeWidth="4"/>
          <polygon points="0,40 40,35 35,70 5,75" fill="#FFFF00" stroke="#000000" strokeWidth="3"/>
          <rect x="50" y="45" width="25" height="25" fill="#FF00FF" stroke="#FFFFFF" strokeWidth="2"/>
          <polygon points="85,50 120,45 115,80 80,75" fill="#00FFFF" stroke="#000000" strokeWidth="3"/>
          <rect x="20" y="60" width="80" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2"/>
        </svg>
      )
    },
    {
      value: 'material',
      title: 'Material Design',
      description: 'Google Guidelines',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <filter id="matShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
          </defs>
          <rect x="0" y="0" width="120" height="80" fill="#FAFAFA"/>
          <rect x="0" y="0" width="120" height="15" fill="#2196F3" filter="url(#matShadow)"/>
          <rect x="10" y="5" width="20" height="5" fill="#FFFFFF" rx="1"/>
          <rect x="15" y="25" width="90" height="40" fill="#FFFFFF" rx="4" filter="url(#matShadow)"/>
          <rect x="25" y="35" width="70" height="4" fill="#757575" rx="2"/>
          <rect x="25" y="43" width="50" height="4" fill="#BDBDBD" rx="2"/>
          <rect x="25" y="51" width="60" height="4" fill="#BDBDBD" rx="2"/>
          <circle cx="95" cy="65" r="8" fill="#FF4081" filter="url(#matShadow)"/>
        </svg>
      )
    },
    {
      value: 'flat',
      title: 'Flat Design',
      description: 'Sem Sombras',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <rect x="0" y="0" width="120" height="80" fill="#ECF0F1"/>
          <rect x="0" y="0" width="120" height="12" fill="#3498DB"/>
          <rect x="10" y="3" width="25" height="6" fill="#FFFFFF"/>
          <rect x="15" y="20" width="25" height="20" fill="#E74C3C"/>
          <rect x="50" y="25" width="25" height="15" fill="#2ECC71"/>
          <rect x="85" y="22" width="25" height="18" fill="#F39C12"/>
          <rect x="20" y="50" width="80" height="4" fill="#34495E"/>
          <rect x="20" y="58" width="60" height="4" fill="#7F8C8D"/>
          <rect x="20" y="66" width="70" height="4" fill="#95A5A6"/>
        </svg>
      )
    },
    {
      value: 'dark',
      title: 'Dark Mode',
      description: 'Tema Escuro',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <rect x="0" y="0" width="120" height="80" fill="#0F172A"/>
          <rect x="0" y="0" width="120" height="12" fill="#1E293B"/>
          <rect x="10" y="3" width="25" height="6" fill="#64748B"/>
          <rect x="15" y="20" width="25" height="20" fill="#334155" stroke="#475569" strokeWidth="1"/>
          <rect x="50" y="25" width="25" height="15" fill="#1E293B" stroke="#334155" strokeWidth="1"/>
          <rect x="85" y="22" width="25" height="18" fill="#0F172A" stroke="#1E293B" strokeWidth="1"/>
          <rect x="20" y="50" width="80" height="4" fill="#475569"/>
          <rect x="20" y="58" width="60" height="4" fill="#64748B"/>
          <circle cx="25" cy="65" r="3" fill="#3B82F6"/>
          <circle cx="35" cy="65" r="3" fill="#10B981"/>
          <circle cx="45" cy="65" r="3" fill="#F59E0B"/>
        </svg>
      )
    },
    {
      value: 'retro',
      title: 'Retro/Vintage',
      description: 'Anos 80/90',
      preview: (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <linearGradient id="retroGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF00FF', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#00FFFF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFFF00', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="120" height="80" fill="#000080"/>
          <rect x="0" y="0" width="120" height="15" fill="url(#retroGrad)"/>
          <rect x="10" y="3" width="30" height="9" fill="#000000" stroke="#FFFFFF" strokeWidth="2"/>
          <rect x="15" y="25" width="20" height="15" fill="#FF00FF" stroke="#FFFF00" strokeWidth="2"/>
          <rect x="45" y="28" width="20" height="12" fill="#00FFFF" stroke="#FF00FF" strokeWidth="2"/>
          <rect x="75" y="22" width="20" height="18" fill="#FFFF00" stroke="#00FFFF" strokeWidth="2"/>
          <polygon points="20,50 40,45 35,65 15,70" fill="#FF00FF" stroke="#FFFFFF" strokeWidth="2"/>
          <polygon points="60,55 80,50 75,70 55,75" fill="#00FFFF" stroke="#FFFFFF" strokeWidth="2"/>
          <polygon points="90,52 110,47 105,67 85,72" fill="#FFFF00" stroke="#FFFFFF" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header + Progress Bar - Unified Sticky Component */}
      <div className="sticky top-8 z-40 bg-gray-900/95 border-b border-gray-700/50 backdrop-blur-lg">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto px-2 py-1 sm:px-4 sm:py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              to="/" 
              className="p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group"
            >
              <ArrowLeft 
                size={18} 
                className="sm:w-5 sm:h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-200" 
              />
            </Link>
            <div className="h-6 sm:h-8 w-px bg-gray-700"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Configurar Novo App
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Configure seu app passo a passo
              </p>
            </div>
          </div>
          
          <Link to="/settings" className="self-start sm:self-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="group border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 text-sm text-white"
            >
              <Settings size={14} className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </Button>
          </Link>
          </div>
          
          {/* Service Initialization Status */}
          {!servicesInitialized && !initializationError && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                <span className="text-sm text-blue-300">Inicializando serviços...</span>
              </div>
            </div>
          )}
          
          {initializationError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <span className="text-sm text-red-300">Erro na inicialização dos serviços</span>
                  <p className="text-xs text-red-400 mt-1">{initializationError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Progress Bar Section - Directly attached */}
        <div className="max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-3">
          {/* Modern Progress Bar */}
          <div className="space-y-2 sm:space-y-3">
            {/* Main Progress Bar */}
            <div className="relative">
              <div className="w-full h-2 sm:h-3 bg-gray-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Progress Percentage */}
              <div className="flex justify-between items-center mt-1 sm:mt-2">
                <span className="text-xs text-gray-500 font-medium">
                  Progresso
                </span>
                <span className="text-xs sm:text-sm font-semibold text-blue-400">
                  {Math.round((currentStep / WIZARD_STEPS.length) * 100)}% concluído
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 pt-4 sm:pt-6">
        {/* Instructions Card - Scrollable */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-xl p-4 sm:p-5 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-1">
                Instruções da Etapa
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {WIZARD_STEPS[currentStep - 1]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do wizard */}

        {/* Wizard Steps Content ou Terminal de Compilação */}
        <div className="mb-6 sm:mb-8 relative">
          <AnimatePresence mode="wait">
            {showCompilationTerminal ? (
              <motion.div
                key="compilation-terminal"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <CompilationTerminal
                  appConfig={{
                    // Informações básicas
                    name: formData.name,
                    description: formData.description,
                    appType: formData.appType,
                    
                    // Stack tecnológico
                    frontendStack: formData.frontendStack,
                    cssFramework: formData.cssFramework,
                    
                    // Design e aparência
                    colorTheme: formData.colorTheme,
                    mainFont: formData.mainFont,
                    layoutStyle: formData.layoutStyle,
                    
                    // Estrutura e navegação
                    menuStructure: formData.menuStructure,
                    customLayoutElements: formData.customLayoutElements || [],
                    
                    // Funcionalidades
                    enableAuth: formData.enableAuth,
                    enableDatabase: formData.enableDatabase,
                    enablePayments: formData.enablePayments,
                    
                    // Provedores de serviços
                    authProvider: formData.authProvider || '',
                    databaseType: formData.databaseType || '',
                    paymentProvider: formData.paymentProvider || '',
                    
                    // Configurações de plataforma
                    platformType: formData.platformType,
                    
                    // Autenticação específica
                    authType: formData.authType,
                    adminUsername: formData.adminUsername || '',
                    adminPassword: formData.adminPassword || '',
                    
                    // Integrações
                    integrations: formData.integrations || {},
                    
                    // Arrays de funcionalidades (processados corretamente)
                    features: [
                      ...(formData.enableAuth ? ['authentication'] : []),
                      ...(formData.enableDatabase ? ['database'] : []),
                      ...(formData.enablePayments ? ['payments'] : []),
                      // Adicionar outras features baseadas nas configurações
                      ...(formData.customLayoutElements && formData.customLayoutElements.length > 0 ? ['custom-layout'] : [])
                    ]
                  }}
                  onComplete={handleCompilationComplete}
                  onError={handleCompilationError}
                  isModifying={compilationCompleted}
                  customPrompt={generatedPrompt}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`wizard-step-${currentStep}`}
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStepApplicationType()}
                {currentStep === 4 && renderStepFrontendAndCSS()}
                {currentStep === 5 && renderStepThemeAndFont()}
                {currentStep === 6 && renderStepLayoutStyle()}
                {currentStep === 7 && renderStepMenuStructure()}
                {currentStep === 8 && renderStepFeatures()}
                {currentStep === 9 && renderStepIntegrations()}
                {currentStep === 10 && renderStep6()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-2xl p-4 sm:p-6 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="w-full sm:w-auto group px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-300 text-white"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600/50 transition-all duration-300">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-sm sm:text-base">Anterior</span>
            </Button>
            

            
            {!showCompilationTerminal && currentStep < WIZARD_STEPS.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto group px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/25"
              >
                <span className="font-medium text-sm sm:text-base">Próximo</span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Button>
            ) : !showCompilationTerminal ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || !formData.name || !formData.description}
                className="w-full sm:w-auto group px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-600/25"
              >
                {isCreating ? (
                  <>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span className="font-medium text-sm sm:text-base">Gerando App...</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-sm sm:text-base">Gerar App</span>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </>
                )}
              </Button>
            ) : compilationCompleted ? (
              <Button
                type="button"
                onClick={handleModifyApp}
                className="w-full sm:w-auto group px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-600/25"
              >
                <span className="font-medium text-sm sm:text-base">Modificar (Nova Versão)</span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppPage;

// Adicionar estilos CSS para animações personalizadas