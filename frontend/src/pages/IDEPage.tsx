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

interface IDEPageProps {}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'md';
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type TabType = 'copilot' | 'files' | 'editor' | 'dados' | 'memoria' | 'integracoes' | 'notas' | 'documentacao';
type CanvasTabType = 'preview' | 'canvas' | 'tarefas' | 'dashboard' | 'roadmap' | 'diagramas';
type EditorSubTabType = 'code-generator' | 'refactor-agent' | 'debug-agent' | 'test-agent';

const IDEPage: React.FC<IDEPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, versionId } = useParams<{ projectId?: string; versionId?: string }>();
  
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  
  // Sistema de abas horizontais - múltipla seleção
  const [activeTabs, setActiveTabs] = useState<Set<TabType>>(new Set(['copilot']));
  const [currentTab, setCurrentTab] = useState<TabType>('copilot');
  
  // Sistema de abas do Canvas
  const [activeCanvasTabs, setActiveCanvasTabs] = useState<Set<CanvasTabType>>(new Set(['preview']));
  const [currentCanvasTab, setCurrentCanvasTab] = useState<CanvasTabType>('preview');
  
  // Sistema de sub-abas do Editor
  const [activeEditorSubTabs, setActiveEditorSubTabs] = useState<Set<EditorSubTabType>>(new Set(['code-generator']));
  const [currentEditorSubTab, setCurrentEditorSubTab] = useState<EditorSubTabType>('code-generator');
  
  // Preview responsivo
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [inspectMode, setInspectMode] = useState(false);
  
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
  const [tabOrder, setTabOrder] = useState<TabType[]>(['copilot', 'files', 'editor', 'documentacao', 'dados', 'memoria', 'integracoes', 'notas']);
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
      console.log('🔍 [IDE_PAGE] Parâmetros da URL:', { projectId, versionId });
      console.log('🔍 [IDE_PAGE] Location state:', location.state);
      
      // Se há projectId e versionId nos parâmetros da URL, carregar versão específica
      if (projectId && versionId) {
        try {
          console.log('🔍 [IDE_PAGE] Carregando projeto:', projectId);
          const project = await database.getProject(projectId);
          
          if (!project) {
            console.error('❌ [IDE_PAGE] Projeto não encontrado:', projectId);
            navigate('/projects');
            return;
          }
          
          console.log('✅ [IDE_PAGE] Projeto carregado:', project);

          console.log('🔍 [IDE_PAGE] Carregando versões do projeto:', projectId);
          const versions = await database.getVersions(projectId);
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
            id: project.id,
            appName: project.title,
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
        const { appConfig, generatedCode, generatedFiles } = location.state;
        setAppConfig(appConfig);
        setGeneratedCode(generatedCode);
        setGeneratedFiles(generatedFiles || []);
        
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
  }, [location.state, navigate, projectId, versionId]);

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
    
    const containerHeight = window.innerHeight - 24; // Subtraindo margem inferior (pb-6 = 24px)
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

  const toggleEditorSubTab = (tabId: EditorSubTabType) => {
    const newActiveTabs = new Set(activeEditorSubTabs);
    if (newActiveTabs.has(tabId)) {
      if (newActiveTabs.size > 1) {
        newActiveTabs.delete(tabId);
        if (currentEditorSubTab === tabId) {
          const remainingTabs = Array.from(newActiveTabs);
          setCurrentEditorSubTab(remainingTabs[0]);
        }
      }
    } else {
      newActiveTabs.add(tabId);
      setCurrentEditorSubTab(tabId);
    }
    setActiveEditorSubTabs(newActiveTabs);
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
    if (appConfig?.id) {
      try {
        // Obter o número da próxima versão
        const existingVersions = await database.getVersions(appConfig.id);
        const nextVersionNumber = existingVersions.length + 1;
        
        // Criar nova versão com o prompt atual
        await database.createVersion({
          project_id: appConfig.id,
          version_number: nextVersionNumber,
          prompt: chatMessage.trim(),
          code: generatedCode || ''
        });
        
        console.log(`Versão ${nextVersionNumber} criada para o projeto ${appConfig.id}`);
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
        appConfigName: appConfig?.appName || appConfig?.name,
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
        appConfig?.appName || 
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
    <title>${appConfig?.appName || appConfig?.name || 'Canvas App'}</title>
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
        const readme = `# ${appConfig?.appName || appConfig?.name || 'Canvas App'}

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
- **${appConfig?.frontend_stack || 'Vanilla JS'}** - Framework frontend
- **${appConfig?.css_framework || 'CSS Puro'}** - Framework de estilos

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

  // Renderização do conteúdo das abas
  const renderTabContent = (tabType: TabType) => {
    switch (tabType) {
      case 'copilot':
        return (
          <div className="flex flex-col h-full">
            {/* Painel de perguntas rápidas colapsível */}
            <div className="border-b border-gray-700/50">
              <button
                onClick={() => setIsQuestionsPanelExpanded(!isQuestionsPanelExpanded)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/30 transition-all"
              >
                <span>Perguntas Rápidas</span>
                {isQuestionsPanelExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {isQuestionsPanelExpanded && (
                <div className="p-3 space-y-2 bg-gray-800/30">
                  {[
                    'Como criar um componente React?',
                    'Adicionar validação de formulário',
                    'Implementar autenticação',
                    'Configurar roteamento'
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setChatMessage(question)}
                      className="w-full text-left p-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Área de conversa */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="text-center text-gray-500 mt-8">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <p>Olá! Como posso ajudar você hoje?</p>
              </div>
            </div>

            {/* Input fixo no rodapé com botões integrados */}
            <div className="border-t border-gray-700/50 p-3 sm:p-4 bg-gray-800/30 mt-4">
              {/* Seletores de LLM e Agente */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 w-full">
                {/* Seletor de LLM */}
                <div className="relative flex-1 sm:flex-1">
                  <button
                    onClick={() => setShowLLMDropdown(!showLLMDropdown)}
                    className="flex items-center justify-between w-full space-x-1 px-2 py-1.5 bg-gray-700/70 border border-gray-600/70 rounded-md text-xs text-gray-200 hover:text-white hover:bg-gray-600/70 transition-all"
                  >
                    <span className="truncate">{selectedLLM}</span>
                    <ChevronDown size={10} className="flex-shrink-0" />
                  </button>
                  {showLLMDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 sm:right-auto bg-gray-800 border border-gray-600/50 rounded-lg shadow-lg z-10 min-w-[150px]">
                      {['Gemini 2.5 Flash', 'Claude 4 Sonet', 'Gemini Pro', 'GPT-4', 'GPT-3.5'].map((llm) => (
                        <button
                          key={llm}
                          onClick={() => {
                            setSelectedLLM(llm);
                            setShowLLMDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 first:rounded-t-lg last:rounded-b-lg transition-all"
                        >
                          {llm}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seletor de Agente */}
                <div className="relative flex-1 sm:flex-1">
                  <button
                    onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                    className="flex items-center justify-between w-full space-x-1 px-2 py-1.5 bg-gray-700/70 border border-gray-600/70 rounded-md text-xs text-gray-200 hover:text-white hover:bg-gray-600/70 transition-all"
                  >
                    <span className="truncate">{selectedAgent}</span>
                    <ChevronDown size={10} className="flex-shrink-0" />
                  </button>
                  {showAgentDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 sm:right-auto bg-gray-800 border border-gray-600/50 rounded-lg shadow-lg z-10 min-w-[180px]">
                      {['@Copiloto IA', '@Code Generator', '@Refactor Agent', '@Debug Agent', '@Test Agent'].map((agent) => (
                        <button
                          key={agent}
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowAgentDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 first:rounded-t-lg last:rounded-b-lg transition-all"
                        >
                          {agent}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Container da textarea com layout expandido */}
              <div className="relative mb-2">
                {/* Textarea expandida verticalmente */}
                <textarea
                  ref={textareaRef}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-gray-700/70 border border-gray-600/70 rounded-lg pl-3 pr-3 pt-3 pb-14 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm transition-all duration-200"
                  style={{
                    minHeight: '80px',
                    maxHeight: '110px', // Reduzido para dar espaço ao menu
                    overflowY: 'auto' // Permitir scroll quando necessário
                  }}
                  rows={3}
                />
                
                {/* Rodapé com botões de ação e enviar - com background sólido */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-700/70 border-t border-gray-600/50 rounded-b-lg px-3 py-2 flex items-center backdrop-blur-sm">
                  {/* Botões de ação expandidos horizontalmente - responsivos */}
                  <div className="flex-1 flex items-center space-x-0.5 overflow-x-auto mr-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFileUpload}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0"
                      title="Upload de arquivo"
                    >
                      <Upload size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleImageUpload}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 hidden xs:inline-flex"
                      title="Upload de imagem"
                    >
                      <Image size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 hidden xs:inline-flex"
                      title="Entrada de voz"
                    >
                      <Mic size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAgentReference}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 hidden sm:inline-flex"
                      title="Referenciar agente (@)"
                    >
                      <AtSign size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleProjectFileReference}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 hidden sm:inline-flex"
                      title="Referenciar arquivo do projeto (#)"
                    >
                      <Hash size={10} />
                    </Button>
                    {/* Botão de otimizar/voltar - condicional */}
                    {!showBackButton ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePromptOptimization}
                        className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 hidden md:inline-flex"
                        title="Otimizar prompt com IA"
                      >
                        <Sparkles size={10} />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToOriginalPrompt}
                        className="w-8 h-8 rounded-full p-0 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0 flex items-center justify-center"
                        title="Voltar ao prompt original"
                      >
                        <ArrowLeft size={12} />
                      </Button>
                    )}
                  </div>
                  
                  {/* Botões de ação principais - ordem: [Envio de Voz] [Enviar] */}
                  <div className="flex items-center space-x-1 ml-auto">
                    {/* Botão de envio de voz */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      className="p-1 text-white hover:bg-gray-600/70 hover:text-white flex-shrink-0"
                      title="Envio de voz"
                    >
                      <Mic size={12} />
                    </Button>
                    
                    {/* Botão de enviar - na extremidade direita */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Enviar mensagem"
                    >
                      <Send size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            {generatedFiles.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum arquivo foi gerado ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {generatedFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedFile?.path === file.path
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                        : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <span className="font-medium">{file.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'editor':
        return (
          <div className="flex flex-col h-full">
            {/* Sub-abas do Editor */}
            <div className="flex border-b border-gray-700/50 overflow-x-auto custom-scrollbar">
              {[
                { id: 'code-generator', icon: Code2, label: 'Gerador de Código' },
                { id: 'refactor-agent', icon: Code2, label: 'Refatoração' },
                { id: 'debug-agent', icon: Eye, label: 'Debug' },
                { id: 'test-agent', icon: Sparkles, label: 'Testes' }
              ].map(({ id, icon: Icon, label }) => (
                <div key={id} className="relative flex flex-shrink-0">
                  <button
                    onClick={() => toggleEditorSubTab(id as EditorSubTabType)}
                    className={`
                      flex items-center px-3 py-2 text-xs font-medium transition-all duration-200 border-b-2 flex-1 min-w-0
                      ${activeEditorSubTabs.has(id as EditorSubTabType)
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-transparent bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                  {activeEditorSubTabs.has(id as EditorSubTabType) && activeEditorSubTabs.size > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEditorSubTab(id as EditorSubTabType);
                      }}
                      className={`
                        px-1 py-2 text-xs font-medium transition-all duration-200 border-b-2 hover:bg-gray-600/50 flex-shrink-0
                        ${activeEditorSubTabs.has(id as EditorSubTabType)
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

            {/* Conteúdo das sub-abas */}
            <div className="flex-1 overflow-hidden">
              {activeEditorSubTabs.size === 1 ? (
                <div className="h-full">
                  {renderEditorSubTabContent(Array.from(activeEditorSubTabs)[0])}
                </div>
              ) : (
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${activeEditorSubTabs.size}, 1fr)` }}>
                  {Array.from(activeEditorSubTabs).map((subTabType, index) => (
                    <div key={subTabType} className={`border-gray-700/50 ${index < activeEditorSubTabs.size - 1 ? 'border-r' : ''}`}>
                      <div className="p-2 bg-gray-800/30 border-b border-gray-700/50">
                        <h4 className="text-xs font-medium text-gray-300">
                          {subTabType === 'code-generator' ? 'Gerador de Código' : 
                           subTabType === 'refactor-agent' ? 'Refatoração' :
                           subTabType === 'debug-agent' ? 'Debug' : 'Testes'}
                        </h4>
                      </div>
                      <div className="h-full">
                        {renderEditorSubTabContent(subTabType)}
                      </div>
                    </div>
                  ))}
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

  // Renderização do conteúdo das sub-abas do Editor
  const renderEditorSubTabContent = (subTabType: EditorSubTabType) => {
    switch (subTabType) {
      case 'code-generator':
        return (
          <div className="p-4 h-full bg-gray-900/50">
            <div className="text-center text-gray-500 mt-8">
              <Code2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Gerador de Código</p>
              <p className="text-sm mt-2">Agente especializado em gerar código automaticamente.</p>
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

  // Renderização do conteúdo das abas do Canvas
  const renderCanvasTabContent = (tabType: CanvasTabType) => {
    switch (tabType) {
      case 'preview':
        return (
          <div className="p-4 h-full bg-gray-900/50 flex flex-col pb-6">
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
            <div className="flex-1 flex items-start justify-center bg-gray-800/30 rounded-lg overflow-hidden p-2">
              <div 
                className={getDeviceStyles()}
                style={{ 
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <iframe
                  srcDoc={generatedCode || ''}
                  className="w-full h-full border-0"
                  title="Preview"
                  style={{ 
                    pointerEvents: inspectMode ? 'none' : 'auto',
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
                      if (inspectMode && iframe.contentDocument) {
                        iframe.contentDocument.addEventListener('click', (clickEvent) => {
                          if (inspectMode) {
                            clickEvent.preventDefault();
                            const target = clickEvent.target as HTMLElement;
                            console.log('Elemento inspecionado:', {
                              tagName: target.tagName,
                              className: target.className,
                              id: target.id,
                              textContent: target.textContent?.slice(0, 50)
                            });
                          }
                        });
                      }
                    } catch (error) {
                      console.log('Não foi possível acessar o conteúdo do iframe (CORS)');
                    }
                  }}
                />
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
    <div className="h-screen bg-gray-900 text-white overflow-hidden pb-6">
      {/* Layout principal */}
      <div className="flex h-full">
        {/* Painel esquerdo */}
        <div 
          className="bg-gray-800/50 border-r border-gray-700/50 flex flex-col overflow-hidden"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Abas horizontais */}
          <div className="flex border-b border-gray-700/50 overflow-x-auto custom-scrollbar">
            {tabOrder.map((id) => {
              const tabConfig = {
                'copilot': { icon: Bot, label: 'Copiloto IA' },
                'files': { icon: FolderOpen, label: 'Arquivos' },
                'editor': { icon: Code2, label: 'Editor' },
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
                        {tabType === 'copilot' ? 'Copiloto IA' :
                         tabType === 'files' ? 'Arquivos' :
                         tabType === 'editor' ? 'Editor' :
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
        <div className="flex-1 flex flex-col overflow-hidden">
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
          <div className="flex-1 bg-gray-900/50 p-4 overflow-auto custom-scrollbar">
            <div className="flex items-center justify-center h-full">
              <div 
                className={getDeviceStyles()}
                style={{ transform: `scale(${previewZoom / 100})` }}
              >
                <iframe
                  srcDoc={generatedCode || ''}
                  className="w-full h-full border-0"
                  title="Preview Fullscreen"
                  style={{ 
                    pointerEvents: inspectMode ? 'none' : 'auto',
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
                      if (inspectMode && iframe.contentDocument) {
                        iframe.contentDocument.addEventListener('click', (clickEvent) => {
                          if (inspectMode) {
                            clickEvent.preventDefault();
                            const target = clickEvent.target as HTMLElement;
                            console.log('Elemento inspecionado (Fullscreen):', {
                              tagName: target.tagName,
                              className: target.className,
                              id: target.id,
                              textContent: target.textContent?.slice(0, 50)
                            });
                          }
                        });
                      }
                    } catch (error) {
                      console.log('Não foi possível acessar o conteúdo do iframe (CORS)');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDEPage;