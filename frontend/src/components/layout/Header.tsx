import React, { useState } from 'react';
import { 
  Settings, 
  Folder, 
  Home, 
  Plus, 
  File, 
  Edit, 
  Eye, 
  Package, 
  HelpCircle,
  FileText,
  FolderOpen,
  Save,
  Download,
  Undo,
  Redo,
  Copy,
  Clipboard,
  ZoomIn,
  Layout,
  PanelLeft,
  ShoppingCart,
  Wrench,
  Store,
  BookOpen,
  MessageCircle,
  Info
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create', icon: Plus, label: 'Criar App' },
    { path: '/projects', icon: Folder, label: 'Projetos' },
    { path: '/settings', icon: Settings, label: 'Configurações' }
  ];

  const ideMenuItems = [
    {
      id: 'arquivo',
      label: 'Arquivo',
      icon: File,
      items: [
        { label: 'Novo', icon: FileText, action: () => console.log('Novo arquivo') },
        { label: 'Abrir', icon: FolderOpen, action: () => console.log('Abrir arquivo') },
        { label: 'Salvar', icon: Save, action: () => console.log('Salvar') },
        { label: 'Exportar', icon: Download, action: () => console.log('Exportar') }
      ]
    },
    {
      id: 'editar',
      label: 'Editar',
      icon: Edit,
      items: [
        { label: 'Desfazer', icon: Undo, action: () => console.log('Desfazer') },
        { label: 'Refazer', icon: Redo, action: () => console.log('Refazer') },
        { label: 'Copiar', icon: Copy, action: () => console.log('Copiar') },
        { label: 'Colar', icon: Clipboard, action: () => console.log('Colar') }
      ]
    },
    {
      id: 'visualizar',
      label: 'Visualizar',
      icon: Eye,
      items: [
        { label: 'Zoom', icon: ZoomIn, action: () => console.log('Zoom') },
        { label: 'Layout', icon: Layout, action: () => console.log('Layout') },
        { label: 'Painéis', icon: PanelLeft, action: () => console.log('Painéis') }
      ]
    },
    {
      id: 'extensoes',
      label: 'Extensões',
      icon: Package,
      items: [
        { label: 'Instalar', icon: ShoppingCart, action: () => console.log('Instalar extensão') },
        { label: 'Gerenciar', icon: Wrench, action: () => console.log('Gerenciar extensões') },
        { label: 'Marketplace', icon: Store, action: () => console.log('Marketplace') }
      ]
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      icon: HelpCircle,
      items: [
        { label: 'Documentação', icon: BookOpen, action: () => console.log('Documentação') },
        { label: 'Suporte', icon: MessageCircle, action: () => console.log('Suporte') },
        { label: 'Sobre', icon: Info, action: () => console.log('Sobre') }
      ]
    }
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveDropdown(activeDropdown === menuId ? null : menuId);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setActiveDropdown(null);
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2">
        <div className="flex items-center justify-between h-8">
          {/* Menu IDE na extremidade esquerda - apenas na página IDE */}
          {location.pathname === '/ide' && (
            <div className="flex items-center space-x-0 relative">
              {ideMenuItems.map((menu) => (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => handleMenuClick(menu.id)}
                    className={cn(
                      'flex items-center px-3 py-1 text-xs font-medium transition-all duration-150 hover:bg-gray-700/50',
                      activeDropdown === menu.id ? 'bg-gray-700/70 text-white' : 'text-gray-300'
                    )}
                  >
                    <menu.icon size={12} className="mr-1.5" />
                    {menu.label}
                  </button>
                  
                  {/* Dropdown */}
                  {activeDropdown === menu.id && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-gray-800/95 backdrop-blur-lg border border-gray-600/50 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {menu.items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleMenuItemClick(item.action)}
                            className="flex items-center w-full px-3 py-2 text-xs text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                          >
                            <item.icon size={12} className="mr-2" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Espaçador para empurrar navegação para direita */}
          <div className="flex-1"></div>

          {/* Navigation na extremidade direita */}
          <nav className="flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                title={label}
                className={cn(
                  'flex items-center px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  location.pathname === path
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                )}
              >
                <Icon size={12} className="mr-1.5" />
                <span className="text-xs">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Overlay para fechar dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
};

export default Header;