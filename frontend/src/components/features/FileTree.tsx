import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  FileText,
  Code,
  Image,
  Settings,
  Database
} from 'lucide-react';

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'md' | 'txt' | 'png' | 'jpg' | 'svg';
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  file?: GeneratedFile;
}

interface FileTreeProps {
  files: GeneratedFile[];
  selectedFile: GeneratedFile | null;
  onFileSelect: (file: GeneratedFile) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  // Organizar arquivos em estrutura hierárquica
  const fileTree = useMemo(() => {
    console.log('🔍 [FileTree] Processando arquivos:', files);
    
    const root: FileNode = {
      name: 'root',
      path: '',
      type: 'folder',
      children: []
    };

    files.forEach((file, index) => {
      // Verificações de segurança para file.path
      if (!file || typeof file !== 'object') {
        console.warn(`⚠️ [FileTree] Arquivo inválido no índice ${index}:`, file);
        return;
      }

      if (!file.path || typeof file.path !== 'string') {
        console.warn(`⚠️ [FileTree] Path inválido no arquivo ${index}:`, file);
        // Fallback: usar nome baseado no índice se path não existir
        file.path = `arquivo-${index + 1}.txt`;
      }

      // Garantir que path não seja apenas espaços em branco
      const sanitizedPath = file.path.trim();
      if (!sanitizedPath) {
        console.warn(`⚠️ [FileTree] Path vazio no arquivo ${index}, usando fallback`);
        file.path = `arquivo-${index + 1}.txt`;
      } else {
        file.path = sanitizedPath;
      }

      console.log(`📁 [FileTree] Processando arquivo: ${file.path}`);
      
      const pathParts = file.path.split('/').filter(part => part.length > 0);
      let currentNode = root;

      // Navegar/criar estrutura de pastas
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const folderPath = pathParts.slice(0, i + 1).join('/');
        
        let folderNode = currentNode.children?.find(
          child => child.name === folderName && child.type === 'folder'
        );

        if (!folderNode) {
          folderNode = {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: []
          };
          currentNode.children = currentNode.children || [];
          currentNode.children.push(folderNode);
        }

        currentNode = folderNode;
      }

      // Adicionar arquivo
      const fileName = pathParts[pathParts.length - 1] || file.path;
      const fileNode: FileNode = {
        name: fileName,
        path: file.path,
        type: 'file',
        file
      };

      currentNode.children = currentNode.children || [];
      currentNode.children.push(fileNode);
    });

    // Ordenar: pastas primeiro, depois arquivos (ambos alfabeticamente)
    const sortNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };

    const sortRecursively = (node: FileNode) => {
      if (node.children) {
        node.children = sortNodes(node.children);
        node.children.forEach(sortRecursively);
      }
    };

    sortRecursively(root);
    return root;
  }, [files]);

  // Obter ícone baseado no tipo de arquivo
  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'html':
      case 'htm':
        return <Code size={16} className="text-orange-400" />;
      case 'css':
        return <Code size={16} className="text-blue-400" />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code size={16} className="text-yellow-400" />;
      case 'json':
        return <Settings size={16} className="text-green-400" />;
      case 'md':
      case 'txt':
        return <FileText size={16} className="text-gray-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image size={16} className="text-purple-400" />;
      case 'sql':
        return <Database size={16} className="text-cyan-400" />;
      default:
        return <File size={16} className="text-gray-400" />;
    }
  };

  // Toggle expansão de pasta
  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  // Renderizar nó da árvore
  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile?.path === node.path;
    const paddingLeft = depth * 16 + 8;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className={`
              w-full flex items-center py-1 px-2 text-left transition-all duration-200 hover:bg-gray-700/50 rounded
              ${isExpanded ? 'text-blue-400' : 'text-gray-300'}
            `}
            style={{ paddingLeft }}
          >
            {isExpanded ? (
              <ChevronDown size={14} className="mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight size={14} className="mr-1 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="mr-2 flex-shrink-0 text-blue-400" />
            ) : (
              <Folder size={16} className="mr-2 flex-shrink-0 text-blue-400" />
            )}
            <span className="text-sm font-medium truncate">{node.name}</span>
          </button>
          
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={node.path}
          onClick={() => node.file && onFileSelect(node.file)}
          className={`
            w-full flex items-center py-1 px-2 text-left transition-all duration-200 rounded
            ${isSelected 
              ? 'bg-blue-500/20 border-l-2 border-blue-500 text-blue-400' 
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }
          `}
          style={{ paddingLeft }}
        >
          {getFileIcon(node.name, node.file?.type)}
          <span className="ml-2 text-sm truncate">{node.name}</span>
        </button>
      );
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
        <p>Nenhum arquivo foi gerado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {fileTree.children?.map(node => renderNode(node, 0))}
    </div>
  );
};

export default FileTree;