import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, Calendar, Clock, Code, Palette, ArrowLeft, GitBranch } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import VersionsModal from '@/components/VersionsModal';
import { useToast } from '@/hooks/useToast';
import { database, Project } from '@/services/database';

interface FormattedProject extends Project {
  name: string;
  appType: string;
  frontendStack: string;
  cssFramework: string;
  colorTheme: string;
  mainFont: string;
  layoutStyle: string;
  enableAuth: boolean;
  enableDatabase: boolean;
  enablePayments: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft' | 'compiled';
  outputPath?: string;
}

const ProjectsPage: React.FC = () => {
  // Adicionar classe CSS para permitir scroll na página Projects
  React.useEffect(() => {
    document.body.classList.add('scrollable-page');
    return () => {
      document.body.classList.remove('scrollable-page');
    };
  }, []);
  const { success, error } = useToast();
  const [projects, setProjects] = useState<FormattedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<FormattedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: FormattedProject | null }>({
    isOpen: false,
    project: null
  });
  const [versionsModal, setVersionsModal] = useState<{ isOpen: boolean; project: FormattedProject | null }>({
    isOpen: false,
    project: null
  });
  const [compilingProjects, setCompilingProjects] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projects = await database.getProjects();
      
      // Converter formato do banco local para o formato esperado pela UI
      const formattedProjects = projects.map(project => ({
        ...project,
        title: project.title,
        name: project.title,
        appType: project.config?.appType || 'web',
        frontendStack: project.config?.frontendStack || 'react',
        cssFramework: project.config?.cssFramework || 'tailwind',
        colorTheme: project.config?.colorTheme || 'blue',
        mainFont: project.config?.mainFont || 'inter',
        layoutStyle: project.config?.layoutStyle || 'modern',
        enableAuth: project.config?.enableAuth || false,
        enableDatabase: project.config?.enableDatabase || false,
        enablePayments: project.config?.enablePayments || false,
        createdAt: project.created_at,
        updatedAt: project.latest_version_created_at,
        status: project.code ? 'compiled' : 'draft' as 'active' | 'archived' | 'draft' | 'compiled',
        outputPath: project.code ? `/generated/${project.id}` : undefined
      }));
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      error('Erro inesperado', 'Ocorreu um erro inesperado ao carregar os projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.appType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleCompile = async (project: Project) => {
    setCompilingProjects(prev => new Set(prev).add(project.id));
    
    try {
      // Para projetos locais, a "compilação" é apenas mostrar o código já gerado
      const localProject = await database.getProject(project.id);
      
      if (localProject && localProject.code) {
        success('Projeto já compilado!', `O projeto "${project.title}" já possui código gerado`);
        console.log('Código do projeto:', localProject.code);
      } else {
        error('Código não encontrado', 'Este projeto não possui código gerado. Gere o app primeiro na página de criação.');
      }
      
      // Reload projects to get updated status
      await loadProjects();
    } catch (err) {
      console.error('Erro ao acessar projeto:', err);
      error('Erro inesperado', 'Ocorreu um erro inesperado ao acessar o projeto');
    } finally {
      setCompilingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.project) return;

    try {
      await database.deleteProject(deleteModal.project.id);
      
      success('Projeto excluído!', `O projeto "${deleteModal.project.title}" foi excluído com sucesso`);
      setProjects(prev => prev.filter(p => p.id !== deleteModal.project!.id));
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      error('Erro inesperado', 'Ocorreu um erro inesperado ao excluir o projeto');
    } finally {
      setDeleteModal({ isOpen: false, project: null });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compiled': return 'text-green-400';
      case 'active': return 'text-blue-400';
      case 'draft': return 'text-yellow-400';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'compiling': return 'Compilando';
      case 'error': return 'Erro';
      default: return 'Pendente';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-white text-xl">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header fixo com filtros integrados */}
      <div className="sticky top-8 z-40 bg-gray-900/95 border-b border-gray-700/50 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-2 py-1 sm:px-4 sm:py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
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
                Meus Projetos
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Gerencie seus projetos criados
              </p>
            </div>
          </div>
          
          <Link to="/create" className="self-start sm:self-auto">
            <Button 
              variant="outline"
              size="sm"
              className="group border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 text-sm text-white"
            >
              <Plus size={14} className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">Novo Projeto</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
          </div>
          
          {/* Filters integrados */}
          <div className="border-t border-gray-700/30 pt-3 mt-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} className="sm:w-5 sm:h-5" />}
                />
              </div>
              <div className="sm:w-48">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos os Status' },
                    { value: 'pending', label: 'Pendente' },
                    { value: 'compiling', label: 'Compilando' },
                    { value: 'completed', label: 'Concluído' },
                    { value: 'error', label: 'Erro' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  {projects.length === 0 ? 'Nenhum projeto encontrado' : 'Nenhum projeto corresponde aos filtros'}
                </div>
                {projects.length === 0 && (
                  <Link to="/create">
                    <Button>
                      <Plus size={20} className="mr-2" />
                      Criar Primeiro Projeto
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} hover className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{project.title}</h3>
                    <span className={`text-xs sm:text-sm font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <Code size={14} className="sm:w-4 sm:h-4" />
                    <span>{project.appType}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {/* Tech Stack */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                      <Palette size={14} className="sm:w-4 sm:h-4" />
                      <span className="truncate">{project.frontendStack} + {project.cssFramework}</span>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">Criado: {formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">Atualizado: {formatDate(project.latest_version_created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 sm:gap-2 pt-3 sm:pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVersionsModal({ isOpen: true, project })}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <GitBranch size={14} className="mr-1" />
                        <span className="hidden sm:inline">Ver Versões</span>
                        <span className="sm:hidden">Versões</span>
                      </Button>
                      
                      {project.code && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/generated/${project.id}`, '_blank')}
                          className="px-2 sm:px-3"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModal({ isOpen: true, project })}
                        className="text-red-400 hover:text-red-300 px-2 sm:px-3"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, project: null })}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Tem certeza que deseja excluir o projeto "{deleteModal.project?.title}"?
            </p>
            <p className="text-sm text-gray-400">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, project: null })}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </Modal>

        {/* Versions Modal */}
        {versionsModal.project && (
          <VersionsModal
            isOpen={versionsModal.isOpen}
            onClose={() => setVersionsModal({ isOpen: false, project: null })}
            projectId={versionsModal.project.id}
            projectTitle={versionsModal.project.title}
            onLoadVersion={(versionId, code) => {
              // Encontrar a versão específica para obter o version_number
              const loadVersion = async () => {
                try {
                  const versions = await database.getVersions(versionsModal.project!.id);
                  const version = versions.find(v => v.id === versionId);
                  
                  if (version) {
                    console.log('🔍 [PROJECTS_PAGE] Navegando para IDE com versão:', {
                      projectId: versionsModal.project!.id,
                      versionNumber: version.version_number,
                      versionId
                    });
                    
                    navigate(`/ide/${versionsModal.project!.id}/${version.version_number}`);
                  } else {
                    console.error('❌ [PROJECTS_PAGE] Versão não encontrada:', versionId);
                    error('Versão não encontrada');
                  }
                } catch (err) {
                  console.error('❌ [PROJECTS_PAGE] Erro ao carregar versão:', err);
                  error('Erro ao carregar versão');
                }
              };
              
              loadVersion();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;