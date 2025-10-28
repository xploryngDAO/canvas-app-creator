import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AppConfig } from '../types/app';
import JSZip from 'jszip';
import { 
  ChevronDown, 
  ChevronRight, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Bot, 
  Upload, 
  Image, 
  Mic, 
  Send, 
  AtSign, 
  Hash, 
  Wand2, 
  ArrowLeft, 
  FileText, 
  Code, 
  Code2,
  FolderOpen,
  Database, 
  Brain, 
  Plug, 
  StickyNote,
  Download, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  Map, 
  GitBranch, 
  Eye, 
  EyeOff, 
  MousePointer, 
  Layers, 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Shield, 
  CreditCard, 
  Smartphone as SmartphoneIcon, 
  Globe, 
  Menu, 
  X,
  Sparkles,
  Square,
  Plus,
  Minimize2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { database } from '@/services/database';
import AICopilot from '@/components/features/AICopilot';
import FileTree from '@/components/features/FileTree';
import { versioningService } from '@/services/versioningService';
import Editor from '@monaco-editor/react';

interface IDEPageProps {}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'md' | 'txt' | 'png' | 'jpg' | 'svg';
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

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type TabType = 'copilot' | 'files' | 'editor' | 'agentes' | 'dados' | 'memoria' | 'integracoes' | 'notas' | 'documentacao';
type CanvasTabType = 'preview' | 'canvas' | 'tarefas' | 'dashboard' | 'roadmap' | 'diagramas';
type EditorSubTabType = 'code-generator' | 'refactor-agent' | 'debug-agent' | 'test-agent';
type AgentSubTabType = 'code-generator' | 'refactor-agent' | 'debug-agent' | 'test-agent';

const IDEPage: React.FC<IDEPageProps> = () => {
  // Adicionar classe CSS para remover scroll apenas na página IDE
  useEffect(() => {
    console.log('🏠 [IDE_PAGE] Componente IDEPage montado');
    document.body.classList.add('ide-page');
    return () => {
      console.log('🏠 [IDE_PAGE] Componente IDEPage desmontado');
      document.body.classList.remove('ide-page');
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: urlProjectId, versionId } = useParams<{ projectId?: string; versionId?: string }>();
  
  // Estado para gerenciar o projectId atual (pode ser diferente do URL se for temporário)
  const [projectId, setProjectId] = useState<string | null>(urlProjectId || null);
  
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  
  // Sistema de abas horizontais - múltipla seleção
  const [activeTabs, setActiveTabs] = useState<Set<TabType>>(new Set(['copilot']));
  const [currentTab, setCurrentTab] = useState<TabType>('copilot');
  
  // Debug: Log do estado das abas
  useEffect(() => {
    console.log('📋 [IDE_PAGE] Estado das abas:', {
      activeTabs: Array.from(activeTabs),
      currentTab,
      isCurrentTabActive: activeTabs.has(currentTab)
    });
  }, [activeTabs, currentTab]);
  
  // Sistema de abas do Canvas
  const [activeCanvasTabs, setActiveCanvasTabs] = useState<Set<CanvasTabType>>(new Set(['preview']));
  const [currentCanvasTab, setCurrentCanvasTab] = useState<CanvasTabType>('preview');
  
  // Sistema de sub-abas do Editor (removido - agora só Monaco Editor)
  // const [activeEditorSubTabs, setActiveEditorSubTabs] = useState<Set<EditorSubTabType>>(new Set(['code-generator']));
  // const [currentEditorSubTab, setCurrentEditorSubTab] = useState<EditorSubTabType>('code-generator');
  
  // Sistema de sub-abas dos Agentes
  const [activeAgentSubTabs, setActiveAgentSubTabs] = useState<Set<AgentSubTabType>>(new Set(['code-generator']));
  const [currentAgentSubTab, setCurrentAgentSubTab] = useState<AgentSubTabType>('code-generator');
  
  // Preview responsivo
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectedElement, setInspectedElement] = useState<InspectedElement | null>(null);
  const [showContextButton, setShowContextButton] = useState(false);
  const [contextButtonPosition, setContextButtonPosition] = useState({ x: 0, y: 0 });
  const [currentSelectedElement, setCurrentSelectedElement] = useState<HTMLElement | null>(null);
  
  // Estados para redimensionamento
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const [canvasHeight, setCanvasHeight] = useState(40);
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  
  // Estados para o chat IA
  const [chatMessage, setChatMessage] = useState('');
  const [isQuestionsPanelExpanded, setIsQuestionsPanelExpanded] = useState(false);
  
  // Ref para textarea auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize da textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      const minHeight = 80; // Altura mínima em pixels
      const maxHeight = Math.floor(minHeight * 1.5); // 50% a mais (120px)
      
      // Reset height to calculate scrollHeight properly
      textarea.style.height = `${minHeight}px`;
      
      // Calculate new height based on content
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      
      // Apply new height
      textarea.style.height = `${newHeight}px`;
      
      // Show/hide scrollbar based on content overflow
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
        textarea.style.scrollBehavior = 'smooth';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    };
    
    // Adjust height when content changes
    adjustHeight();
    
    // Add event listener for input changes
    textarea.addEventListener('input', adjustHeight);
    
    // Cleanup
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [chatMessage]);

  // Estados para drag and drop
  const [draggedTab, setDraggedTab] = useState<TabType | null>(null);
  const [draggedCanvasTab, setDraggedCanvasTab] = useState<CanvasTabType | null>(null);
  const [tabOrder, setTabOrder] = useState<TabType[]>(['copilot', 'files', 'editor', 'agentes', 'documentacao', 'dados', 'memoria', 'integracoes', 'notas']);
  const [canvasTabOrder, setCanvasTabOrder] = useState<CanvasTabType[]>(['preview', 'canvas', 'dashboard', 'diagramas', 'tarefas', 'roadmap']);

  // Estados para LLM e agentes
  const [selectedLLM, setSelectedLLM] = useState('Gemini 2.5 Flash');
  const [selectedAgent, setSelectedAgent] = useState('@Copiloto IA');
  const [showLLMDropdown, setShowLLMDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  
  // Estado para controlar o botão de voltar do prompt
  const [showBackButton, setShowBackButton] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('');

  useEffect(() => {
    const loadProjectData = async () => {
      console.log('🔍 [IDE_PAGE] Parâmetros da URL:', { urlProjectId, versionId });
      console.log('🔍 [IDE_PAGE] Location state:', location.state);
      
      // Se há projectId e versionId nos parâmetros da URL, carregar versão específica
      if (urlProjectId && versionId) {
        try {
          console.log('🔍 [IDE_PAGE] Carregando projeto:', urlProjectId);
          const project = await database.getProject(urlProjectId);
          
          if (!project) {
            console.error('❌ [IDE_PAGE] Projeto não encontrado:', urlProjectId);
            navigate('/projects');
            return;
          }
          
          console.log('✅ [IDE_PAGE] Projeto carregado:', project);

          console.log('🔍 [IDE_PAGE] Carregando versões do projeto:', urlProjectId);
          const versions = await database.getVersions(urlProjectId);
          console.log('🔍 [IDE_PAGE] Versões encontradas:', versions);
          
          const version = versions.find(v => v.version_number === parseInt(versionId));
          console.log('🔍 [IDE_PAGE] Versão específica encontrada:', version);
          
          if (!version) {
            console.error('❌ [IDE_PAGE] Versão não encontrada:', versionId);
            navigate('/projects');
            return;
          }

          // Configurar o appConfig baseado no projeto
          const config: AppConfig = {
            name: project.title,
            description: project.description || '',
            ...project.config
          };

          console.log('✅ [IDE_PAGE] Configurando IDE com versão:', {
            config,
            codeLength: version.code?.length || 0
          });

          setAppConfig(config);
          setGeneratedCode(version.code || '');
          setGeneratedFiles([]);
          
        } catch (error) {
          console.error('❌ [IDE_PAGE] Erro ao carregar versão do projeto:', error);
          navigate('/projects');
        }
      }
      // Se há dados no location.state (vindo da criação de app)
      else if (location.state) {
        const { appConfig, generatedCode, generatedFiles, projectId: stateProjectId } = location.state;
        
        console.log('🔍 [IDE_PAGE] Carregando dados do location.state:', {
          hasAppConfig: !!appConfig,
          hasGeneratedCode: !!generatedCode,
          hasGeneratedFiles: !!generatedFiles,
          generatedFilesCount: generatedFiles?.length || 0,
          stateProjectId,
          urlProjectId
        });
        
        setAppConfig(appConfig);
        setGeneratedCode(generatedCode);
        
        // Log detalhado dos arquivos recebidos
        if (generatedFiles && generatedFiles.length > 0) {
          console.log('📁 [IDE_PAGE] Arquivos recebidos:', {
            count: generatedFiles.length,
            files: generatedFiles.map(f => ({ path: f.path, type: f.type, contentLength: f.content?.length || 0 }))
          });
          setGeneratedFiles(generatedFiles);
        } else {
          console.log('⚠️ [IDE_PAGE] Nenhum arquivo recebido no location.state');
          setGeneratedFiles([]);
        }
        
        // CORREÇÃO: Priorizar projectId real sobre temporário
        const realProjectId = stateProjectId || urlProjectId;
        if (realProjectId) {
          console.log('✅ [IDE_PAGE] Usando projectId real:', realProjectId);
          setProjectId(realProjectId);
        } else {
          console.log('⚠️ [IDE_PAGE] Nenhum projectId real disponível - será criado temporário quando necessário');
        }
        
        if (generatedFiles && generatedFiles.length > 0) {
          setSelectedFile(generatedFiles[0]);
        }
      }
      // Se não há dados, redirecionar para criar app
      else {
        navigate('/create');
      }
    };

    loadProjectData();
  }, [location.state, navigate, urlProjectId, versionId]);

  // Redimensionamento horizontal
  const handleMouseDownHorizontal = (e: React.MouseEvent) => {
    setIsResizingHorizontal(true);
    e.preventDefault();
  };

  const handleMouseMoveHorizontal = (e: MouseEvent) => {
    if (!isResizingHorizontal) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    
    if (newWidth >= 20 && newWidth <= 60) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUpHorizontal = () => {
    setIsResizingHorizontal(false);
  };

  // Redimensionamento vertical
  const handleMouseDownVertical = (e: React.MouseEvent) => {
    setIsResizingVertical(true);
    e.preventDefault();
  };

  const handleMouseMoveVertical = (e: MouseEvent) => {
    if (!isResizingVertical) return;
    
    const containerHeight = window.innerHeight; // Altura total da tela
    const newHeight = (e.clientY / containerHeight) * 100;
    
    if (newHeight >= 20 && newHeight <= 75) { // Reduzindo limite máximo para respeitar margem
      setCanvasHeight(newHeight);
    }
  };

  const handleMouseUpVertical = () => {
    setIsResizingVertical(false);
  };

  useEffect(() => {
    if (isResizingHorizontal) {
      document.addEventListener('mousemove', handleMouseMoveHorizontal);
      document.addEventListener('mouseup', handleMouseUpHorizontal);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveHorizontal);
        document.removeEventListener('mouseup', handleMouseUpHorizontal);
      };
    }
  }, [isResizingHorizontal]);

  useEffect(() => {
    if (isResizingVertical) {
      document.addEventListener('mousemove', handleMouseMoveVertical);
      document.addEventListener('mouseup', handleMouseUpVertical);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveVertical);
        document.removeEventListener('mouseup', handleMouseUpVertical);
      };
    }
  }, [isResizingVertical]);

  const toggleTab = (tabId: TabType) => {
    const newActiveTabs = new Set(activeTabs);
    if (newActiveTabs.has(tabId)) {
      if (newActiveTabs.size > 1) {
        newActiveTabs.delete(tabId);
        if (currentTab === tabId) {
          const remainingTabs = Array.from(newActiveTabs);
          setCurrentTab(remainingTabs[0]);
        }
      }
    } else {
      newActiveTabs.add(tabId);
      setCurrentTab(tabId);
    }
    setActiveTabs(newActiveTabs);
  };

  const toggleCanvasTab = (tabId: CanvasTabType) => {
    const newActiveTabs = new Set(activeCanvasTabs);
    if (newActiveTabs.has(tabId)) {
      if (newActiveTabs.size > 1) {
        newActiveTabs.delete(tabId);
        if (currentCanvasTab === tabId) {
          const remainingTabs = Array.from(newActiveTabs);
          setCurrentCanvasTab(remainingTabs[0]);
        }
      }
    } else {
      newActiveTabs.add(tabId);
      setCurrentCanvasTab(tabId);
    }
    setActiveCanvasTabs(newActiveTabs);
  };

  // Função para alternar sub-abas dos Agentes
  const toggleAgentSubTab = (tabId: AgentSubTabType) => {
    const newActiveTabs = new Set(activeAgentSubTabs);
    if (newActiveTabs.has(tabId)) {
      if (newActiveTabs.size > 1) {
        newActiveTabs.delete(tabId);
        if (currentAgentSubTab === tabId) {
          const remainingTabs = Array.from(newActiveTabs);
          setCurrentAgentSubTab(remainingTabs[0]);
        }
      }
    } else {
      newActiveTabs.add(tabId);
      setCurrentAgentSubTab(tabId);
    }
    setActiveAgentSubTabs(newActiveTabs);
  };

  const addNewTab = () => {
    console.log('Adicionar nova aba personalizada');
  };

  // Funções de drag and drop para abas principais
  const handleTabDragStart = (e: React.DragEvent, tabId: TabType) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTabDrop = (e: React.DragEvent, targetTabId: TabType) => {
    e.preventDefault();
    if (!draggedTab || draggedTab === targetTabId) return;

    const newOrder = [...tabOrder];
    const draggedIndex = newOrder.indexOf(draggedTab);
    const targetIndex = newOrder.indexOf(targetTabId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedTab);

    setTabOrder(newOrder);
    setDraggedTab(null);
  };

  // Funções de drag and drop para abas do Canvas
  const handleCanvasTabDragStart = (e: React.DragEvent, tabId: CanvasTabType) => {
    setDraggedCanvasTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasTabDrop = (e: React.DragEvent, targetTabId: CanvasTabType) => {
    e.preventDefault();
    if (!draggedCanvasTab || draggedCanvasTab === targetTabId) return;

    const newOrder = [...canvasTabOrder];
    const draggedIndex = newOrder.indexOf(draggedCanvasTab);
    const targetIndex = newOrder.indexOf(targetTabId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCanvasTab);

    setCanvasTabOrder(newOrder);
    setDraggedCanvasTab(null);
  };

  const getDeviceStyles = () => {
    const baseStyles = "bg-white shadow-2xl overflow-hidden transition-transform duration-300";
    const inspectStyle = inspectMode ? "ring-2 ring-blue-500 ring-opacity-50" : "";
    
    // Calcular dimensões responsivas considerando o zoom
    const zoomFactor = previewZoom / 100;
    
    switch (deviceType) {
      case 'desktop':
        return `${baseStyles} ${inspectStyle} w-full max-w-full h-full max-h-[85vh] rounded-lg`;
      case 'tablet':
        // Dimensões fixas para tablet (sempre portrait por padrão)
        return `${baseStyles} ${inspectStyle} w-[768px] h-[1024px] max-w-[min(768px,75vw)] max-h-[min(1024px,65vh)] rounded-xl`;
      case 'mobile':
        // Dimensões fixas para mobile (sempre portrait por padrão)
        return `${baseStyles} ${inspectStyle} w-[375px] h-[667px] max-w-[min(375px,65vw)] max-h-[min(667px,55vh)] rounded-2xl`;
      default:
        return `${baseStyles} ${inspectStyle}`;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'js': return '⚡';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    console.log('Enviando mensagem:', chatMessage);
    
    // Salvar versão se há um projeto carregado
    if (projectId) {
      try {
        // Obter o número da próxima versão
        const existingVersions = await database.getVersions(projectId!);
        const nextVersionNumber = existingVersions.length + 1;
        
        // Criar nova versão com o prompt atual
        await database.createVersion({
          project_id: projectId!,
          version_number: nextVersionNumber,
          prompt: chatMessage.trim(),
          code: generatedCode || ''
        });
        
        console.log(`Versão ${nextVersionNumber} criada para o projeto ${projectId}`);
      } catch (error) {
        console.error('Erro ao criar versão:', error);
      }
    }
    
    setChatMessage('');
    
    // Reset textarea height after sending message
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
    }
    
    // Auto-expandir o Editor quando uma mensagem é enviada
    if (!activeTabs.has('editor')) {
      setActiveTabs(prev => new Set([...prev, 'editor']));
    }
    setCurrentTab('editor');
    
    // Expandir painel esquerdo para mostrar o editor com limite mobile
    const mobilePreviewWidth = 25; // 25% para preview mobile
    const newLeftPanelWidth = 100 - mobilePreviewWidth;
    setLeftPanelWidth(newLeftPanelWidth);
  };

  const handleFileUpload = () => {
    console.log('Upload de arquivo');
  };

  const handleImageUpload = () => {
    console.log('Upload de imagem');
  };

  const handleVoiceInput = () => {
    console.log('Entrada de voz');
  };

  const handleAgentReference = () => {
    console.log('Referência de agente (@)');
  };

  const handleProjectFileReference = () => {
    console.log('Referência de arquivo do projeto (#)');
  };

  const handlePromptOptimization = () => {
    console.log('Otimização de prompt com IA');
    // Salvar o prompt original antes de otimizar
    setOriginalPrompt(chatMessage);
    setShowBackButton(true);
    // Aqui seria implementada a lógica de otimização do prompt
    setChatMessage('Prompt otimizado com IA...');
  };

  const downloadProject = async () => {
    try {
      console.log('🚀 Iniciando download do projeto...');
      console.log('📊 Estado atual:', {
        hasGeneratedCode: !!generatedCode,
        codeLength: generatedCode?.length || 0,
        filesCount: generatedFiles.length,
        appConfigName: appConfig?.name || 'Canvas App',
        projectId
      });
      
      const zip = new JSZip();
      let totalFiles = 0;
      let totalSize = 0;
      
      // Sanitizar nome do projeto para usar como nome do arquivo
      const sanitizeName = (name: string) => {
        return name
          .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .toLowerCase()
          .trim();
      };
      
      const projectName = sanitizeName(
          appConfig?.name || 
          projectId || 
          'projeto-gerado'
        );
      
      console.log('📝 Nome do projeto sanitizado:', projectName);
      
      // Processar e melhorar o código HTML principal
      if (generatedCode) {
        let processedHtml = generatedCode;
        
        // Verificar se o HTML tem estrutura básica
        if (!processedHtml.includes('<!DOCTYPE html>')) {
          processedHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${appConfig?.description || 'Aplicação gerada pelo Canvas App Creator'}">
    <title>${appConfig?.name || 'Canvas App'}</title>
</head>
<body>
${processedHtml}
</body>
</html>`;
        }
        
        // Verificar se há CSS inline ou externo e garantir que seja incluído corretamente
        const hasInlineStyles = processedHtml.includes('<style>') || processedHtml.includes('style=');
        const hasExternalCSS = generatedFiles.some(file => file.type === 'css');
        
        console.log('🎨 Análise de estilos:', {
          hasInlineStyles,
          hasExternalCSS,
          htmlLength: processedHtml.length
        });
        
        // Se há CSS externo, adicionar links no HTML
        if (hasExternalCSS && !processedHtml.includes('<link')) {
          const cssFiles = generatedFiles.filter(file => file.type === 'css');
          const cssLinks = cssFiles.map(file => 
            `    <link rel="stylesheet" href="${file.path}">`
          ).join('\n');
          
          processedHtml = processedHtml.replace(
            '</head>',
            `${cssLinks}\n</head>`
          );
        }
        
        // Se há JS externo, adicionar scripts no HTML
        const hasExternalJS = generatedFiles.some(file => file.type === 'js');
        if (hasExternalJS && !processedHtml.includes('<script src=')) {
          const jsFiles = generatedFiles.filter(file => file.type === 'js');
          const jsScripts = jsFiles.map(file => 
            `    <script src="${file.path}"></script>`
          ).join('\n');
          
          processedHtml = processedHtml.replace(
            '</body>',
            `${jsScripts}\n</body>`
          );
        }
        
        zip.file('index.html', processedHtml);
        totalFiles++;
        totalSize += processedHtml.length;
        console.log('✅ Adicionado index.html ao ZIP', {
          size: processedHtml.length,
          hasStyles: hasInlineStyles || hasExternalCSS,
          hasScripts: processedHtml.includes('<script>')
        });
      }
      
      // Adicionar todos os arquivos gerados com validação
      generatedFiles.forEach((file) => {
        if (file?.content && file?.path) {
          zip.file(file.path, file.content);
          totalFiles++;
          totalSize += file.content.length;
          console.log(`✅ Adicionado ${file.path} ao ZIP`, {
            type: file.type,
            size: file.content.length
          });
        } else {
          console.warn(`⚠️ Arquivo inválido ignorado:`, file);
        }
      });
      
      // Adicionar package.json melhorado se não existir
      const hasPackageJson = generatedFiles.some(file => file?.path === 'package.json');
      if (!hasPackageJson) {
        const packageJson = {
          name: projectName,
          version: '1.0.0',
          description: appConfig?.description || 'Aplicação gerada pelo Canvas App Creator',
          main: 'index.html',
          keywords: ['canvas-app-creator', 'webapp', appConfig?.appType || 'web'],
          author: 'Canvas App Creator',
          license: 'MIT',
          scripts: {
            start: 'npx serve . -s',
            dev: 'npx serve . -l 3000',
            build: 'echo "Build não necessário para aplicação estática"',
            preview: 'npx serve . -l 4173'
          },
          devDependencies: {
            serve: '^14.2.1'
          },
          engines: {
            node: '>=14.0.0'
          }
        };
        
        const packageJsonContent = JSON.stringify(packageJson, null, 2);
        zip.file('package.json', packageJsonContent);
        totalFiles++;
        totalSize += packageJsonContent.length;
        console.log('✅ Adicionado package.json ao ZIP', {
          name: projectName,
          size: packageJsonContent.length
        });
      }
      
      // Adicionar README.md melhorado se não existir
      const hasReadme = generatedFiles.some(file => file?.path?.toLowerCase()?.includes('readme'));
      if (!hasReadme) {
        const readme = `# ${appConfig?.name || 'Canvas App'}

${appConfig?.description || 'Aplicação gerada pelo Canvas App Creator'}

## 📋 Sobre o Projeto

Este projeto foi gerado automaticamente pelo **Canvas App Creator**, uma ferramenta de desenvolvimento visual que permite criar aplicações web de forma intuitiva e eficiente.

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação e execução

1. **Instale as dependências:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Execute o servidor local:**
   \`\`\`bash
   npm start
   \`\`\`

3. **Abra o navegador em:** http://localhost:3000

### Scripts disponíveis

- \`npm start\` - Inicia o servidor de desenvolvimento
- \`npm run dev\` - Alias para start (porta 3000)
- \`npm run preview\` - Servidor de preview (porta 4173)

## 🛠️ Tecnologias utilizadas

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e layout
- **JavaScript** - Interatividade e lógica
- **${appConfig?.frontendStack || 'Vanilla JS'}** - Framework frontend
- **${appConfig?.cssFramework || 'CSS Puro'}** - Framework de estilos

## 📁 Estrutura do projeto

\`\`\`
${projectName}/
├── index.html          # Página principal
├── package.json        # Configurações e dependências
├── README.md          # Este arquivo
${generatedFiles.map(file => `├── ${file.path}           # ${file.type.toUpperCase()} file`).join('\n')}
\`\`\`

## 🎨 Configurações do projeto

- **Tipo de aplicação:** ${appConfig?.appType || 'Web'}
- **Tema de cores:** ${appConfig?.colorTheme || 'Padrão'}
- **Fonte principal:** ${appConfig?.mainFont || 'Inter'}
- **Estilo de layout:** ${appConfig?.layoutStyle || 'Moderno'}
- **Autenticação:** ${appConfig?.enableAuth ? 'Habilitada' : 'Desabilitada'}
- **Banco de dados:** ${appConfig?.enableDatabase ? 'Habilitado' : 'Desabilitado'}
- **Pagamentos:** ${appConfig?.enablePayments ? 'Habilitados' : 'Desabilitados'}

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação do Canvas App Creator.

---

**Gerado com ❤️ pelo Canvas App Creator**  
*Data de geração: ${new Date().toLocaleDateString('pt-BR')}*
`;
        zip.file('README.md', readme);
        totalFiles++;
        totalSize += readme.length;
        console.log('✅ Adicionado README.md ao ZIP', {
          size: readme.length
        });
      }
      
      console.log('📦 Resumo do pacote:', {
        totalFiles,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        projectName
      });
      
      // Gerar o arquivo ZIP com configurações otimizadas
      console.log('🔄 Gerando arquivo ZIP...');
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
      
      console.log('✅ ZIP gerado com sucesso:', {
        originalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        compressedSize: `${(content.size / 1024).toFixed(2)} KB`,
        compressionRatio: `${((1 - content.size / totalSize) * 100).toFixed(1)}%`
      });
      
      // Criar e executar download
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}.zip`;
      link.style.display = 'none';
      
      // Adicionar ao DOM temporariamente para garantir compatibilidade
      document.body.appendChild(link);
      link.click();
      
      // Limpeza após pequeno delay para garantir que o download iniciou
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('🧹 Limpeza de memória concluída');
      }, 100);
      
      console.log('🎉 Download iniciado com sucesso!', {
        fileName: `${projectName}.zip`,
        fileSize: `${(content.size / 1024).toFixed(2)} KB`
      });
      
    } catch (error) {
      console.error('❌ Erro detalhado ao fazer download do projeto:', {
        error: error.message,
        stack: error.stack,
        appConfig,
        hasGeneratedCode: !!generatedCode,
        filesCount: generatedFiles.length
      });
      
      // Tentar mostrar uma mensagem de erro amigável para o usuário
      if (typeof window !== 'undefined' && window.alert) {
        alert(`Erro ao gerar download: ${error.message}\n\nVerifique o console para mais detalhes.`);
      }
    }
  };

  const handleBackToOriginalPrompt = () => {
    console.log('Voltando ao prompt original');
    setChatMessage(originalPrompt);
    setShowBackButton(false);
    setOriginalPrompt('');
  };

  // Função para limpar estilos do elemento anteriormente selecionado
  const clearPreviousSelection = () => {
    if (currentSelectedElement) {
      currentSelectedElement.style.outline = '';
      currentSelectedElement.style.outlineOffset = '';
      currentSelectedElement.style.backgroundColor = '';
      currentSelectedElement.classList.remove('inspect-selected');
    }
  };

  // Função para aplicar estilos de seleção ao elemento
  const applySelectionStyles = (element: HTMLElement) => {
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    element.classList.add('inspect-selected');
  };

  // Função para aplicar estilos de hover
  const applyHoverStyles = (element: HTMLElement) => {
    if (!element.classList.contains('inspect-selected')) {
      element.style.outline = '2px dashed #10b981';
      element.style.outlineOffset = '1px';
      element.style.animation = 'inspect-hover-pulse 1.5s infinite';
    }
  };

  // Função para remover estilos de hover
  const removeHoverStyles = (element: HTMLElement) => {
    if (!element.classList.contains('inspect-selected')) {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.animation = '';
    }
  };

  // Função para adicionar listeners de hover no iframe
  const addHoverListeners = (iframeDocument: Document) => {
    const handleMouseOver = (e: MouseEvent) => {
      if (inspectMode) {
        const target = e.target as HTMLElement;
        if (target && target !== iframeDocument.body && target !== iframeDocument.documentElement) {
          applyHoverStyles(target);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (inspectMode) {
        const target = e.target as HTMLElement;
        if (target && target !== iframeDocument.body && target !== iframeDocument.documentElement) {
          removeHoverStyles(target);
        }
      }
    };

    iframeDocument.addEventListener('mouseover', handleMouseOver);
    iframeDocument.addEventListener('mouseout', handleMouseOut);

    // Retornar função de limpeza
    return () => {
      iframeDocument.removeEventListener('mouseover', handleMouseOver);
      iframeDocument.removeEventListener('mouseout', handleMouseOut);
    };
  };

  // Função para injetar estilos CSS no iframe
  const injectInspectStyles = (iframeDocument: Document) => {
    const existingStyle = iframeDocument.getElementById('inspect-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = iframeDocument.createElement('style');
    style.id = 'inspect-styles';
    style.textContent = `
      @keyframes inspect-hover-pulse {
        0%, 100% { 
          outline-color: #10b981; 
          outline-width: 2px;
        }
        50% { 
          outline-color: #34d399; 
          outline-width: 3px;
        }
      }
      
      .inspect-selected {
        position: relative;
      }
      
      .inspect-selected::after {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid #3b82f6;
        border-radius: 4px;
        pointer-events: none;
        z-index: 9999;
      }
    `;
    iframeDocument.head.appendChild(style);
  };

  // Função para capturar informações detalhadas do elemento inspecionado
  const captureElementDetails = (element: HTMLElement): InspectedElement => {
    const rect = element.getBoundingClientRect();
    const computedStyles = window.getComputedStyle(element);
    
    // Capturar hierarquia do elemento
    const hierarchy: string[] = [];
    let currentElement = element;
    while (currentElement && currentElement !== document.body) {
      let selector = currentElement.tagName.toLowerCase();
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
      }
      if (currentElement.className) {
        const classes = currentElement.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }
      hierarchy.unshift(selector);
      currentElement = currentElement.parentElement;
    }

    // Capturar atributos
    const attributes: { [key: string]: string } = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // Capturar estilos computados relevantes
    const relevantStyles = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'background-color', 'color', 'font-size', 'font-family', 'border',
      'border-radius', 'box-shadow', 'z-index', 'opacity', 'transform'
    ];
    
    const computedStylesObj: { [key: string]: string } = {};
    relevantStyles.forEach(prop => {
      computedStylesObj[prop] = computedStyles.getPropertyValue(prop);
    });

    return {
      tagName: element.tagName,
      className: element.className || '',
      id: element.id || '',
      textContent: element.textContent?.slice(0, 100) || '',
      innerHTML: element.innerHTML.slice(0, 500),
      outerHTML: element.outerHTML.slice(0, 1000),
      attributes,
      computedStyles: computedStylesObj,
      hierarchy,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    };
  };

  // Função para mostrar botão de contexto
  const showContextButtonForElement = (elementInfo: InspectedElement, clickEvent: MouseEvent) => {
    // Calcular posição do botão próximo ao elemento clicado
    // Garantir que o botão não saia da tela
    const buttonX = Math.min(clickEvent.clientX + 10, window.innerWidth - 200);
    const buttonY = Math.max(clickEvent.clientY - 40, 50);
    
    setContextButtonPosition({ x: buttonX, y: buttonY });
    setShowContextButton(true);
    
    console.log('🎯 Botão de contexto posicionado:', {
      originalX: clickEvent.clientX,
      originalY: clickEvent.clientY,
      adjustedX: buttonX,
      adjustedY: buttonY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
    
    // Auto-hide após 10 segundos
    setTimeout(() => {
      setShowContextButton(false);
    }, 10000);
  };

  // Função para enviar elemento inspecionado para o copiloto
  const sendInspectedElementToCopilot = (elementInfo: InspectedElement) => {
    // Ativar a aba do copiloto se não estiver ativa
    if (!activeTabs.has('copilot')) {
      setActiveTabs(prev => new Set([...prev, 'copilot']));
    }
    setCurrentTab('copilot');
    
    // Criar tag de identificação concisa
    let componentTag = `<${elementInfo.tagName.toLowerCase()}`;
    
    if (elementInfo.id) {
      componentTag += ` id="${elementInfo.id}"`;
    }
    
    if (elementInfo.className) {
      // Pegar apenas a primeira classe principal
      const mainClass = elementInfo.className.split(' ')[0];
      componentTag += ` className="${mainClass}"`;
    }
    
    componentTag += ' />';

    // Criar objeto da tag para enviar ao copiloto
    const tagData = {
      tag: componentTag,
      elementInfo: elementInfo,
      timestamp: Date.now()
    };

    // Enviar tag diretamente para o copiloto via evento customizado
    window.dispatchEvent(new CustomEvent('addComponentTag', { detail: tagData }));
    
    // Esconder o botão após enviar
    setShowContextButton(false);
    
    console.log('📤 Tag enviada para o copiloto:', {
      componentTag,
      elementInfo,
      tagData
    });
  };

  // Função para lidar com clique no botão de contexto
  const handleAddToContext = () => {
    if (inspectedElement) {
      sendInspectedElementToCopilot(inspectedElement);
    }
  };

  // Renderização do conteúdo das abas
  const renderTabContent = (tabType: TabType) => {
    console.log('🎯 [IDE_PAGE] Renderizando conteúdo da aba:', tabType);
    switch (tabType) {
      case 'copilot':
        console.log('🤖 [IDE_PAGE] Renderizando componente AICopilot');
        return (
          <AICopilot 
            currentCode={generatedCode}
            appConfig={appConfig}
            inspectedElement={inspectedElement}
            initialMessage={chatMessage}
            onCodeUpdate={async (newCode, explanation, userPrompt) => {
              // Atualizar código na interface
              setGeneratedCode(newCode);
              console.log('🔄 [IDE_PAGE] Código atualizado via AICopilot:', explanation);
              
              // Sempre salvar versão quando há alterações via copiloto (userPrompt existe)
              if (userPrompt) {
                try {
                  // CORREÇÃO: Priorizar projectId real, criar temporário apenas como último recurso
                  let currentProjectId = projectId;
                  
                  console.log('🔍 [IDE_PAGE] Verificando projectId para versionamento:', {
                    projectId: currentProjectId,
                    hasAppConfig: !!appConfig,
                    appConfigName: appConfig?.name,
                    isTemporary: currentProjectId?.startsWith('temp_')
                  });
                  
                  if (!currentProjectId) {
                    // Só criar ID temporário se realmente não há projectId real
                    currentProjectId = appConfig?.name 
                      ? `temp_${appConfig.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
                      : `temp_project_${Date.now()}`;
                    
                    console.log('🆔 [IDE_PAGE] Criando ID temporário como último recurso:', currentProjectId);
                    
                    // Atualizar o projectId no estado para futuras operações
                    setProjectId(currentProjectId);
                  } else {
                    console.log('✅ [IDE_PAGE] Usando projectId para versionamento:', {
                      projectId: currentProjectId,
                      isTemporary: currentProjectId.startsWith('temp_'),
                      source: 'existing'
                    });
                  }
                  
                  console.log('💾 [IDE_PAGE] Salvando versão automaticamente...', {
                    projectId: currentProjectId,
                    userPrompt: userPrompt.substring(0, 50) + '...',
                    codeLength: newCode.length,
                    hasAppConfig: !!appConfig,
                    isTemporaryProject: currentProjectId.startsWith('temp_')
                  });
                  
                  const versionId = await versioningService.saveVersionAutomatically(
                    currentProjectId,
                    userPrompt,
                    newCode
                  );
                  
                  console.log('✅ [IDE_PAGE] Versão salva automaticamente com sucesso:', {
                    versionId,
                    projectId: currentProjectId,
                    isTemporaryProject: currentProjectId.startsWith('temp_'),
                    versionSaved: true,
                    promptLength: userPrompt.length,
                    codeLength: newCode.length,
                    timestamp: new Date().toISOString()
                  });

                  // Mostrar feedback visual de sucesso ao usuário
                  // TODO: Implementar toast/notificação de sucesso
                  
                } catch (error) {
                  console.error('❌ [IDE_PAGE] Erro crítico ao salvar versão automaticamente:', error);
                  
                  // Log detalhado do erro para debug
                  console.error('❌ [IDE_PAGE] Contexto completo do erro:', {
                    errorMessage: error.message,
                    errorStack: error.stack,
                    projectId: currentProjectId,
                    isTemporary: currentProjectId?.startsWith('temp_'),
                    hasUserPrompt: !!userPrompt,
                    hasNewCode: !!newCode,
                    userPromptLength: userPrompt?.length || 0,
                    newCodeLength: newCode?.length || 0,
                    timestamp: new Date().toISOString()
                  });

                  // TODO: Implementar toast/notificação de erro
                  // Não bloquear a atualização do código em caso de erro no versionamento
                }
              } else {
                console.log('⚠️ [IDE_PAGE] Versionamento não executado - sem userPrompt:', {
                  hasProjectId: !!projectId,
                  hasUserPrompt: !!userPrompt,
                  hasAppConfig: !!appConfig,
                  hasNewCode: !!newCode,
                  explanation: explanation?.substring(0, 50) + '...'
                });
              }
              
              // Aqui podemos adicionar lógica para atualizar o preview em tempo real
            }}
            onError={(error) => {
              console.error('❌ [IDE_PAGE] Erro no AICopilot:', error);
              
              // Log detalhado do erro
              console.error('❌ [IDE_PAGE] Detalhes do erro do AICopilot:', {
                errorMessage: error,
                timestamp: new Date().toISOString(),
                projectId: projectId,
                hasGeneratedCode: !!generatedCode,
                hasAppConfig: !!appConfig
              });

              // TODO: Implementar toast/notificação de erro para o usuário
            }}
          />
        );

      case 'files':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Arquivos Gerados</h3>
              <Button
                onClick={downloadProject}
                disabled={generatedFiles.length === 0 && !generatedCode}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download do projeto completo"
              >
                <Download size={16} />
              </Button>
            </div>
            {generatedFiles.length > 0 ? (
              <FileTree 
                files={generatedFiles}
                selectedFile={selectedFile}
                onFileSelect={(file) => {
                  console.log('📁 [IDE_PAGE] Arquivo selecionado:', {
                    path: file.path,
                    type: file.type,
                    contentLength: file.content?.length || 0,
                    previousSelectedFile: selectedFile?.path || 'nenhum'
                  });
                  
                  setSelectedFile(file);
                  
                  // Auto-expandir o Editor quando um arquivo é selecionado
                  if (!activeTabs.has('editor')) {
                    console.log('📋 [IDE_PAGE] Auto-expandindo aba Editor');
                    setActiveTabs(prev => new Set([...prev, 'editor']));
                  }
                  
                  // Mudar para a aba Editor se não estiver ativa
                  if (currentTab !== 'editor') {
                    console.log('📋 [IDE_PAGE] Mudando para aba Editor');
                    setCurrentTab('editor');
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-400 py-8">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum arquivo foi gerado ainda</p>
                <p className="text-sm mt-2">Use o Copilot para gerar código e criar arquivos</p>
              </div>
            )}
          </div>
        );

      case 'editor':
        return (
          <div className="flex flex-col h-full">
            {/* Barra de ferramentas do Editor */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-b border-gray-700/50">
              <div className="flex items-center space-x-2">
                {selectedFile && (
                  <span className="text-sm text-gray-300 font-medium">
                    {selectedFile.path}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // Implementar busca (Ctrl+F)
                    console.log('Buscar no código');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="Buscar (Ctrl+F)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    // Implementar salvar (Ctrl+S)
                    console.log('Salvar arquivo');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="Salvar (Ctrl+S)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    // Implementar formatar código
                    console.log('Formatar código');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="Formatar Código"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16,18 22,12 16,6"/>
                    <polyline points="8,6 2,12 8,18"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    // Implementar ir para linha
                    console.log('Ir para linha');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="Ir para Linha (Ctrl+G)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    // Implementar substituir
                    console.log('Substituir texto');
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                  title="Substituir (Ctrl+H)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              {selectedFile ? (
                <div className="h-full bg-gray-900/50 flex flex-col">
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(selectedFile.path)}
                      value={selectedFile.content}
                      onChange={(value) => updateFileContent(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderWhitespace: 'selection',
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        hover: { enabled: true },
                        contextmenu: true,
                        mouseWheelZoom: true,
                        cursorBlinking: 'blink',
                        cursorSmoothCaretAnimation: true,
                        smoothScrolling: true,
                        folding: true,
                        foldingHighlight: true,
                        showFoldingControls: 'always',
                        bracketPairColorization: { enabled: true },
                        guides: {
                          bracketPairs: true,
                          indentation: true
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full bg-gray-900/50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Code2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Selecione um arquivo para editar</p>
                    <p className="text-sm mt-2">Escolha um arquivo na aba "Arquivos" para começar a editar.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'dados':
        return (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <Database size={48} className="mx-auto mb-4 opacity-50" />
              <p>Visualização do banco de dados</p>
              <p className="text-sm mt-2">Conecte um banco de dados para visualizar os dados aqui.</p>
            </div>
          </div>
        );

      case 'memoria':
        return (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>Memória do Projeto</p>
              <p className="text-sm mt-2">Visualização em grafo das conexões do projeto (estilo Obsidian).</p>
            </div>
          </div>
        );

      case 'integracoes':
        return (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <Plug size={48} className="mx-auto mb-4 opacity-50" />
              <p>Gerenciar Integrações</p>
              <p className="text-sm mt-2">Configure e gerencie as integrações do seu projeto.</p>
            </div>
          </div>
        );

      case 'notas':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
              <p>Notas do Projeto</p>
              <p className="text-sm mt-2">Organize suas anotações e ideias do projeto.</p>
            </div>
          </div>
        );

      case 'agentes':
        return (
          <div className="flex flex-col h-full">
            {/* Sub-abas dos Agentes */}
            <div className="flex border-b border-gray-700/50 overflow-x-auto custom-scrollbar">
              {[
                { id: 'code-generator', icon: Code2, label: 'Gerador de Código' },
                { id: 'refactor-agent', icon: Code2, label: 'Refatoração' },
                { id: 'debug-agent', icon: Eye, label: 'Debug' },
                { id: 'test-agent', icon: Sparkles, label: 'Testes' }
              ].map(({ id, icon: Icon, label }) => (
                <div key={id} className="relative flex flex-shrink-0">
                  <button
                    onClick={() => toggleAgentSubTab(id as AgentSubTabType)}
                    className={`
                      flex items-center px-3 py-2 text-xs font-medium transition-all duration-200 border-b-2 flex-1 min-w-0
                      ${activeAgentSubTabs.has(id as AgentSubTabType)
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                  {activeAgentSubTabs.has(id as AgentSubTabType) && activeAgentSubTabs.size > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentSubTab(id as AgentSubTabType);
                      }}
                      className={`
                        px-1 py-2 text-xs font-medium transition-all duration-200 border-b-2 hover:bg-gray-600/50 flex-shrink-0
                        ${activeAgentSubTabs.has(id as AgentSubTabType)
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Conteúdo das sub-abas dos Agentes */}
            <div className="flex-1 overflow-hidden">
              {activeAgentSubTabs.size === 1 ? (
                <div className="h-full">
                  {renderAgentSubTabContent(Array.from(activeAgentSubTabs)[0])}
                </div>
              ) : (
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${activeAgentSubTabs.size}, 1fr)` }}>
                  {Array.from(activeAgentSubTabs).map((subTabType, index) => (
                    <div key={subTabType} className={`border-gray-700/50 ${index < activeAgentSubTabs.size - 1 ? 'border-r' : ''}`}>
                      <div className="p-2 bg-gray-800/30 border-b border-gray-700/50">
                        <h4 className="text-xs font-medium text-gray-300">
                          {subTabType === 'code-generator' ? 'Gerador de Código' : 
                           subTabType === 'refactor-agent' ? 'Refatoração' :
                           subTabType === 'debug-agent' ? 'Debug' : 'Testes'}
                        </h4>
                      </div>
                      <div className="h-full">
                        {renderAgentSubTabContent(subTabType)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'documentacao':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Documentação</p>
              <p className="text-sm mt-2">Gerencie a documentação do seu projeto.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Função para obter a linguagem do Monaco Editor baseada na extensão do arquivo
  const getMonacoLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'sql':
        return 'sql';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  };

  // Função para atualizar o conteúdo do arquivo
  const updateFileContent = (newContent: string) => {
    if (!selectedFile) return;

    console.log('📝 [IDE_PAGE] Atualizando conteúdo do arquivo:', {
      fileName: selectedFile.path,
      oldLength: selectedFile.content.length,
      newLength: newContent.length
    });

    // Atualizar o arquivo no array de arquivos gerados
    const updatedFiles = generatedFiles.map(file => 
      file.path === selectedFile.path 
        ? { ...file, content: newContent }
        : file
    );
    
    setGeneratedFiles(updatedFiles);
    
    // Atualizar o arquivo selecionado
    setSelectedFile({ ...selectedFile, content: newContent });
    
    // Se for um arquivo HTML principal, atualizar o preview
    if (selectedFile.path === 'index.html' || selectedFile.type === 'html') {
      console.log('🎯 [IDE_PAGE] Atualizando preview para arquivo HTML:', selectedFile.path);
      setGeneratedCode(newContent);
    }
  };

  // Renderização do conteúdo das sub-abas dos Agentes
  const renderAgentSubTabContent = (subTabType: AgentSubTabType) => {
    switch (subTabType) {
      case 'code-generator':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Code2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Gerador de Código</p>
              <p className="text-sm mt-2">Gera código automaticamente baseado em suas especificações.</p>
            </div>
          </div>
        );

      case 'refactor-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Code2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Refatoração</p>
              <p className="text-sm mt-2">Otimiza e melhora a estrutura do código existente.</p>
            </div>
          </div>
        );

      case 'debug-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Eye size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Debug</p>
              <p className="text-sm mt-2">Identifica e corrige bugs no código.</p>
            </div>
          </div>
        );

      case 'test-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Testes</p>
              <p className="text-sm mt-2">Cria e executa testes automatizados.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderização do conteúdo das sub-abas do Editor
  const renderEditorSubTabContent = (subTabType: EditorSubTabType) => {
    switch (subTabType) {
      case 'code-generator':
        return (
          <div className="h-full bg-gray-900/50 flex flex-col">
            {selectedFile ? (
              <>
                {/* Header do arquivo */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <Code2 size={16} className="text-blue-400" />
                    <span className="text-white font-medium">{selectedFile.path}</span>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                      {selectedFile.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {selectedFile.content.length} caracteres
                    </span>
                  </div>
                </div>
                
                {/* Monaco Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(selectedFile.path)}
                    value={selectedFile.content}
                    onChange={(value) => {
                      if (value !== undefined) {
                        updateFileContent(value);
                      }
                    }}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      lineNumbers: 'on',
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      tabSize: 2,
                      insertSpaces: true,
                      detectIndentation: true,
                      folding: true,
                      bracketMatching: 'always',
                      autoIndent: 'full',
                      formatOnPaste: true,
                      formatOnType: true,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      quickSuggestions: true,
                      parameterHints: { enabled: true },
                      hover: { enabled: true },
                      contextmenu: true,
                      mouseWheelZoom: true,
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      renderWhitespace: 'selection',
                      renderControlCharacters: false,
                      renderLineHighlight: 'line',
                      selectionHighlight: true,
                      occurrencesHighlight: 'singleFile',
                      codeLens: true,
                      colorDecorators: true,
                      lightbulb: { enabled: 'on' },
                      links: true,
                      find: {
                        addExtraSpaceOnTop: false,
                        autoFindInSelection: 'never',
                        seedSearchStringFromSelection: 'always'
                      }
                    }}
                    onMount={(editor, monaco) => {
                      console.log('🎯 [MONACO_EDITOR] Editor montado:', {
                        language: getMonacoLanguage(selectedFile.path),
                        fileName: selectedFile.path,
                        contentLength: selectedFile.content.length
                      });
                      
                      // Configurar atalhos de teclado personalizados
                      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                        console.log('💾 [MONACO_EDITOR] Salvamento manual (Ctrl+S)');
                        // O salvamento já é automático, mas podemos adicionar feedback visual
                      });
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="p-4 h-full bg-gray-900/50">
                <div className="text-center text-gray-500 mt-8">
                  <Code2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Editor de Código</p>
                  <p className="text-sm mt-2">Selecione um arquivo na aba "Arquivos" para começar a editar.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'refactor-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Code2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Refatoração</p>
              <p className="text-sm mt-2">Otimiza e melhora a estrutura do código existente.</p>
            </div>
          </div>
        );

      case 'debug-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Eye size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Debug</p>
              <p className="text-sm mt-2">Identifica e corrige bugs no código.</p>
            </div>
          </div>
        );

      case 'test-agent':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
              <p>Agente de Testes</p>
              <p className="text-sm mt-2">Cria e executa testes automatizados.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderização do conteúdo das abas do Canvas
  const renderCanvasTabContent = (tabType: CanvasTabType) => {
    switch (tabType) {
      case 'preview':
        return (
          <div className="p-4 pb-6 h-full bg-gray-900/50 flex flex-col overflow-hidden">
            {/* Controles do Preview */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <h3 className="text-white font-medium">Preview</h3>
                <div className="flex items-center space-x-2">
                  {/* Seletor de dispositivo */}
                  <div className="flex bg-gray-700/50 rounded-lg p-1">
                    {[
                      { type: 'desktop', icon: Monitor, label: 'Desktop' },
                      { type: 'tablet', icon: Tablet, label: 'Tablet' },
                      { type: 'mobile', icon: Smartphone, label: 'Mobile' }
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setDeviceType(type as DeviceType)}
                        className={`
                          flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all
                          ${deviceType === type
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                          }
                        `}
                        title={label}
                      >
                        <Icon size={12} className="mr-1" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Controles de zoom */}
                <div className="flex items-center bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded transition-all"
                    title="Diminuir zoom"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <span className="px-2 text-xs text-gray-300 min-w-[3rem] text-center">
                    {previewZoom}%
                  </span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded transition-all"
                    title="Aumentar zoom"
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>

                {/* Botão de inspeção */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectMode(!inspectMode)}
                  className={inspectMode ? 'bg-blue-500 text-white' : ''}
                  title="Modo inspeção"
                >
                  <Eye size={14} />
                </Button>



                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                  title="Tela cheia"
                >
                  <Maximize size={14} />
                </Button>
              </div>
            </div>

            {/* Preview do App */}
            <div className="flex-1 flex items-start justify-center bg-gray-800/30 rounded-lg overflow-hidden p-2 relative" style={{ height: 'calc(100% - 120px)' }}>
              <div 
                className={getDeviceStyles()}
                style={{ 
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <div className="relative w-full h-full">
                  <iframe
                    srcDoc={generatedCode || ''}
                    className="w-full h-full border-0"
                    title="Preview"
                    style={{ 
                      pointerEvents: 'auto',
                      cursor: inspectMode ? 'crosshair' : 'default'
                    }}
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      console.log('🎯 Preview carregado:', {
                        hasContent: !!generatedCode,
                        contentLength: generatedCode?.length || 0,
                        contentPreview: generatedCode?.slice(0, 100) || 'Nenhum conteúdo'
                      });
                      try {
                        if (iframe.contentDocument) {
                          // Injetar estilos CSS para inspeção
                          injectInspectStyles(iframe.contentDocument);
                          
                          // Adicionar listeners de hover
                          const cleanupHover = addHoverListeners(iframe.contentDocument);
                          
                          const handleIframeClick = (clickEvent: MouseEvent) => {
                            if (inspectMode) {
                              clickEvent.preventDefault();
                              const target = clickEvent.target as HTMLElement;
                              
                              // Limpar seleção anterior
                              clearPreviousSelection();
                              
                              // Capturar informações detalhadas do elemento
                              const elementInfo = captureElementDetails(target);
                              setInspectedElement(elementInfo);
                              
                              // Aplicar estilos de seleção ao novo elemento
                              applySelectionStyles(target);
                              setCurrentSelectedElement(target);
                              
                              // Calcular posição relativa ao iframe
                              const iframeRect = iframe.getBoundingClientRect();
                              const adjustedEvent = {
                                ...clickEvent,
                                clientX: clickEvent.clientX + iframeRect.left,
                                clientY: clickEvent.clientY + iframeRect.top
                              };
                              
                              // Mostrar botão de contexto em vez de enviar automaticamente
                              showContextButtonForElement(elementInfo, adjustedEvent);
                              
                              console.log('🔍 Elemento inspecionado:', elementInfo);
                            }
                          };
                          
                          iframe.contentDocument.addEventListener('click', handleIframeClick);
                          
                          // Cleanup quando o iframe for recarregado
                          return () => {
                            cleanupHover();
                          };
                        }
                      } catch (error) {
                        console.log('Não foi possível acessar o conteúdo do iframe (CORS)');
                      }
                    }}
                  />
                  
                  {/* Overlay transparente para capturar cliques quando em modo de inspeção */}
                  {inspectMode && (
                    <div 
                      className="absolute inset-0 z-10 cursor-crosshair"
                      style={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        pointerEvents: 'auto'
                      }}
                      onMouseMove={(e) => {
                        // Aplicar hover visual no elemento sob o mouse
                        const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                        if (iframe && iframe.contentDocument) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          
                          // Encontrar elemento no ponto do mouse dentro do iframe
                          const elementAtPoint = iframe.contentDocument.elementFromPoint(x, y) as HTMLElement;
                          
                          if (elementAtPoint && elementAtPoint !== iframe.contentDocument.body && elementAtPoint !== iframe.contentDocument.documentElement) {
                            // Remover hover de todos os outros elementos
                            const allElements = iframe.contentDocument.querySelectorAll('*');
                            allElements.forEach((el) => {
                              if (el !== elementAtPoint) {
                                removeHoverStyles(el as HTMLElement);
                              }
                            });
                            
                            // Aplicar hover ao elemento atual
                            applyHoverStyles(elementAtPoint);
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Remover hover de todos os elementos quando sair do overlay
                        const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                        if (iframe && iframe.contentDocument) {
                          const allElements = iframe.contentDocument.querySelectorAll('*');
                          allElements.forEach((el) => {
                            removeHoverStyles(el as HTMLElement);
                          });
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Simular clique no iframe
                        const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                        if (iframe && iframe.contentDocument) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          
                          // Encontrar elemento no ponto clicado dentro do iframe
                          const elementAtPoint = iframe.contentDocument.elementFromPoint(x, y) as HTMLElement;
                          
                          if (elementAtPoint) {
                            // Limpar seleção anterior
                            clearPreviousSelection();
                            
                            // Capturar informações detalhadas do elemento
                            const elementInfo = captureElementDetails(elementAtPoint);
                            setInspectedElement(elementInfo);
                            
                            // Aplicar estilos de seleção ao novo elemento
                            applySelectionStyles(elementAtPoint);
                            setCurrentSelectedElement(elementAtPoint);
                            
                            // Mostrar botão de contexto
                            showContextButtonForElement(elementInfo, e as any);
                            
                            console.log('🔍 Elemento inspecionado via overlay:', elementInfo);
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'canvas':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Square size={48} className="mx-auto mb-4 opacity-50" />
              <p>Canvas de Visualização</p>
              <p className="text-sm mt-2">Visualize as páginas criadas em modais do formato de tela selecionado.</p>
            </div>
          </div>
        );

      case 'tarefas':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Gerenciar Tarefas</p>
              <p className="text-sm mt-2">Organize e acompanhe suas tarefas do projeto.</p>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Dashboard</p>
              <p className="text-sm mt-2">Visualize métricas e estatísticas do projeto.</p>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Map size={48} className="mx-auto mb-4 opacity-50" />
              <p>Roadmap</p>
              <p className="text-sm mt-2">Planeje e acompanhe o progresso do projeto.</p>
            </div>
          </div>
        );

      case 'diagramas':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
              <p>Diagramas</p>
              <p className="text-sm mt-2">Crie e visualize diagramas de arquitetura.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!appConfig) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden pb-4">
      {/* Layout principal */}
      <div className="flex h-full">
        {/* Painel esquerdo */}
        <div 
          className="bg-gray-800/50 border-r border-gray-700/50 flex flex-col overflow-hidden pb-2"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Abas horizontais */}
          <div className="flex border-b border-gray-700/50 overflow-x-auto custom-scrollbar">
            {tabOrder.map((id) => {
              const tabConfig = {
                'copilot': { icon: Bot, label: 'Copiloto IA' },
                'files': { icon: FolderOpen, label: 'Arquivos' },
                'editor': { icon: Code2, label: 'Editor' },
                'agentes': { icon: Bot, label: 'Agentes' },
                'documentacao': { icon: FileText, label: 'Documentação' },
                'dados': { icon: Database, label: 'Dados' },
                'memoria': { icon: Brain, label: 'Memória' },
                'integracoes': { icon: Plug, label: 'Integrações' },
                'notas': { icon: StickyNote, label: 'Notas' }
              }[id];
              
              if (!tabConfig) return null;
              
              const { icon: Icon, label } = tabConfig;
              const isActive = activeTabs.has(id);
              
              return (
              <div key={id} className="relative flex flex-shrink-0">
                <button
                  draggable
                  onDragStart={(e) => handleTabDragStart(e, id)}
                  onDragOver={handleTabDragOver}
                  onDrop={(e) => handleTabDrop(e, id)}
                  onClick={() => toggleTab(id)}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex-1 min-w-0 cursor-move
                    ${isActive
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon size={14} className={isActive ? "mr-2 flex-shrink-0" : "flex-shrink-0"} />
                  {isActive && <span className="truncate">{label}</span>}
                </button>
                {isActive && activeTabs.size > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTab(id);
                    }}
                    className={`
                      px-2 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-gray-600/50 flex-shrink-0
                      ${isActive
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )})}
            
            <button
              onClick={addNewTab}
              className="flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 border-b-2 border-transparent text-gray-500 hover:text-white hover:bg-gray-700/50 flex-shrink-0"
              title="Adicionar Nova Aba"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Conteúdo das abas - dividido quando múltiplas abas ativas */}
          <div className="flex-1 overflow-hidden">
            {activeTabs.size === 1 ? (
              <div className="h-full">
                {renderTabContent(Array.from(activeTabs)[0])}
              </div>
            ) : (
              <div className="h-full flex">
                {Array.from(activeTabs).map((tabType, index) => (
                  <div 
                    key={tabType} 
                    className={`flex-1 border-gray-700/50 ${index > 0 ? 'border-l' : ''}`}
                  >
                    <div className="h-8 bg-gray-800/30 border-b border-gray-700/50 flex items-center px-3">
                      <span className="text-xs text-gray-400 truncate">
                        {tabType === 'copiloto' ? 'Copiloto IA' :
                         tabType === 'files' ? 'Arquivos' :
                         tabType === 'editor' ? 'Editor' :
                         tabType === 'agentes' ? 'Agentes' :
                         tabType === 'documentacao' ? 'Documentação' :
                         tabType === 'dados' ? 'Dados' :
                         tabType === 'memoria' ? 'Memória' :
                         tabType === 'integracoes' ? 'Integrações' :
                         tabType === 'notas' ? 'Notas' : tabType}
                      </span>
                    </div>
                    <div className="h-[calc(100%-2rem)] overflow-hidden">
                      {renderTabContent(tabType)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Redimensionador horizontal */}
        <div
          className="w-1 bg-gray-700/50 hover:bg-blue-500/50 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDownHorizontal}
        />

        {/* Painel direito */}
        <div className="flex-1 flex flex-col overflow-hidden pb-2">
          {/* Seção Canvas */}
          <div 
            className="bg-gray-800/50 flex flex-col overflow-hidden flex-1"
          >
            {/* Abas do Canvas */}
            <div className="flex border-b border-gray-700/50 overflow-x-auto custom-scrollbar">
              {canvasTabOrder.map((id) => {
                const tabConfig = {
                  'preview': { icon: Monitor, label: 'Preview' },
                  'canvas': { icon: Square, label: 'Canvas' },
                  'dashboard': { icon: BarChart3, label: 'Dashboard' },
                  'diagramas': { icon: GitBranch, label: 'Diagramas' },
                  'tarefas': { icon: CheckSquare, label: 'Tarefas' },
                  'roadmap': { icon: Map, label: 'Roadmap' }
                }[id];
                
                if (!tabConfig) return null;
                
                const { icon: Icon, label } = tabConfig;
                const isActive = activeCanvasTabs.has(id);
                
                return (
                <div key={id} className="relative flex flex-shrink-0">
                  <button
                    draggable
                    onDragStart={(e) => handleCanvasTabDragStart(e, id)}
                    onDragOver={handleCanvasTabDragOver}
                    onDrop={(e) => handleCanvasTabDrop(e, id)}
                    onClick={() => toggleCanvasTab(id)}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 border-b-2 flex-1 min-w-0 cursor-move
                      ${isActive
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon size={14} className={isActive ? "mr-2 flex-shrink-0" : "flex-shrink-0"} />
                    {isActive && <span className="truncate">{label}</span>}
                  </button>
                  {isActive && activeCanvasTabs.size > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCanvasTab(id);
                      }}
                      className={`
                        px-2 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-gray-600/50 flex-shrink-0
                        ${isActive
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )})}
            </div>

            {/* Conteúdo do Canvas */}
            <div className="flex-1 overflow-hidden">
              {activeCanvasTabs.size === 1 ? (
                <div className="h-full">
                  {renderCanvasTabContent(Array.from(activeCanvasTabs)[0])}
                </div>
              ) : (
                <div className="h-full flex">
                  {Array.from(activeCanvasTabs).map((tabType, index) => (
                    <div 
                      key={tabType} 
                      className={`flex-1 border-gray-700/50 ${index > 0 ? 'border-l' : ''}`}
                    >
                      <div className="h-8 bg-gray-800/30 border-b border-gray-700/50 flex items-center px-3">
                        <span className="text-xs text-gray-400 truncate">
                          {tabType === 'canvas' ? 'Canvas' : 
                           tabType === 'preview' ? 'Preview' :
                           tabType === 'dashboard' ? 'Dashboard' :
                           tabType === 'diagramas' ? 'Diagramas' :
                           tabType === 'tarefas' ? 'Tarefas' :
                           tabType === 'roadmap' ? 'Roadmap' : tabType}
                        </span>
                      </div>
                      <div className="h-[calc(100%-2rem)] overflow-hidden">
                        {renderCanvasTabContent(tabType)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Overlay de tela cheia */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          {/* Controles em tela cheia com menos transparência */}
          <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 p-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <h3 className="text-white font-medium">Preview - Tela Cheia</h3>
                <div className="flex items-center space-x-2">
                  {/* Seletor de dispositivo */}
                  <div className="flex bg-gray-700/80 rounded-lg p-1">
                    {[
                      { type: 'desktop', icon: Monitor, label: 'Desktop' },
                      { type: 'tablet', icon: Tablet, label: 'Tablet' },
                      { type: 'mobile', icon: Smartphone, label: 'Mobile' }
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => setDeviceType(type as DeviceType)}
                        className={`
                          flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all
                          ${deviceType === type
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-300 hover:text-white hover:bg-gray-600/70'
                          }
                        `}
                        title={label}
                      >
                        <Icon size={12} className="mr-1" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Controles de zoom */}

                <div className="flex items-center space-x-1 bg-gray-700/80 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                    disabled={previewZoom <= 25}
                    className="hover:bg-gray-600/70"
                  >
                    <ZoomOut size={14} />
                  </Button>
                  <span className="text-xs text-gray-300 px-2 min-w-[50px] text-center">
                    {previewZoom}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                    disabled={previewZoom >= 200}
                    className="hover:bg-gray-600/70"
                  >
                    <ZoomIn size={14} />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectMode(!inspectMode)}
                  title="Modo Inspeção"
                  className="bg-gray-700/50 hover:bg-gray-600/70"
                >
                  <Eye size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  title="Voltar"
                  className="bg-gray-700/50 hover:bg-gray-600/70"
                >
                  <Minimize2 size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Área do Preview em tela cheia */}
          <div className="flex-1 bg-gray-900/50 p-4 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
            <div className="flex items-center justify-center h-full">
              <div 
                className={getDeviceStyles()}
                style={{ transform: `scale(${previewZoom / 100})` }}
              >
                <div className="relative w-full h-full">
                  <iframe
                    srcDoc={generatedCode || ''}
                    className="w-full h-full border-0"
                    title="Preview Fullscreen"
                    style={{ 
                      pointerEvents: 'auto',
                      cursor: inspectMode ? 'crosshair' : 'default'
                    }}
                  onLoad={(e) => {
                    const iframe = e.target as HTMLIFrameElement;
                    console.log('🎯 Preview Fullscreen carregado:', {
                      hasContent: !!generatedCode,
                      contentLength: generatedCode?.length || 0,
                      contentPreview: generatedCode?.slice(0, 100) || 'Nenhum conteúdo'
                    });
                    try {
                      if (iframe.contentDocument) {
                        // Injetar estilos CSS para inspeção no modo fullscreen
                        injectInspectStyles(iframe.contentDocument);
                        
                        // Adicionar listeners de hover no modo fullscreen
                        const cleanupHoverFullscreen = addHoverListeners(iframe.contentDocument);
                        
                        const handleFullscreenClick = (clickEvent: MouseEvent) => {
                          if (inspectMode) {
                            clickEvent.preventDefault();
                            const target = clickEvent.target as HTMLElement;
                            
                            // Limpar seleção anterior
                            clearPreviousSelection();
                            
                            // Capturar informações detalhadas do elemento
                            const elementInfo = captureElementDetails(target);
                            setInspectedElement(elementInfo);
                            
                            // Aplicar estilos de seleção ao novo elemento
                            applySelectionStyles(target);
                            setCurrentSelectedElement(target);
                            
                            // Mostrar botão de contexto em vez de enviar automaticamente
                            showContextButtonForElement(elementInfo, clickEvent);
                            
                            console.log('🔍 Elemento inspecionado (Fullscreen):', elementInfo);
                          }
                        };
                        
                        iframe.contentDocument.addEventListener('click', handleFullscreenClick);
                      }
                    } catch (error) {
                      console.log('Não foi possível acessar o conteúdo do iframe (CORS)');
                    }
                  }}
                />
                
                {/* Overlay transparente para capturar cliques quando em modo de inspeção no fullscreen */}
                {inspectMode && (
                  <div 
                    className="absolute inset-0 z-10 cursor-crosshair"
                    style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      pointerEvents: 'auto'
                    }}
                    onMouseMove={(e) => {
                      // Aplicar hover visual no elemento sob o mouse
                      const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                      if (iframe && iframe.contentDocument) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Encontrar elemento no ponto do mouse dentro do iframe
                        const elementAtPoint = iframe.contentDocument.elementFromPoint(x, y) as HTMLElement;
                        
                        if (elementAtPoint && elementAtPoint !== iframe.contentDocument.body && elementAtPoint !== iframe.contentDocument.documentElement) {
                          // Remover hover de todos os outros elementos
                          const allElements = iframe.contentDocument.querySelectorAll('*');
                          allElements.forEach((el) => {
                            if (el !== elementAtPoint) {
                              removeHoverStyles(el as HTMLElement);
                            }
                          });
                          
                          // Aplicar hover ao elemento atual
                          applyHoverStyles(elementAtPoint);
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Remover hover de todos os elementos quando sair do overlay
                      const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                      if (iframe && iframe.contentDocument) {
                        const allElements = iframe.contentDocument.querySelectorAll('*');
                        allElements.forEach((el) => {
                          removeHoverStyles(el as HTMLElement);
                        });
                      }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Simular clique no iframe
                      const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                      if (iframe && iframe.contentDocument) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Encontrar elemento no ponto clicado dentro do iframe
                        const elementAtPoint = iframe.contentDocument.elementFromPoint(x, y) as HTMLElement;
                        
                        if (elementAtPoint) {
                          // Limpar seleção anterior
                          clearPreviousSelection();
                          
                          // Capturar informações detalhadas do elemento
                          const elementInfo = captureElementDetails(elementAtPoint);
                          setInspectedElement(elementInfo);
                          
                          // Aplicar estilos de seleção ao novo elemento
                          applySelectionStyles(elementAtPoint);
                          setCurrentSelectedElement(elementAtPoint);
                          
                          // Mostrar botão de contexto
                          showContextButtonForElement(elementInfo, e as any);
                          
                          console.log('🔍 Elemento inspecionado via overlay (Fullscreen):', elementInfo);
                        }
                      }
                    }}
                  />
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante "Adicionar ao Contexto" */}
      {showContextButton && contextButtonPosition && (
        <div
          className="fixed z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all duration-200 text-sm font-medium"
          style={{
            left: `${contextButtonPosition.x}px`,
            top: `${contextButtonPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
          onClick={handleAddToContext}
        >
          <div className="flex items-center gap-2">
            <Plus size={14} />
            Adicionar ao Contexto
          </div>
        </div>
      )}

    </div>
  );
};

export default IDEPage;