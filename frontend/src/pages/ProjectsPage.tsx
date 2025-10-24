import React, { useState, useEffect } from 'react';
import { Search, Plus, Play, Eye, Trash2, Calendar, Clock, Code, Palette, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { projectService, Project } from '@/services/projectService';

const ProjectsPage: React.FC = () => {
  const { success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: Project | null }>({
    isOpen: false,
    project: null
  });
  const [compilingProjects, setCompilingProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getAllProjects();
      
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        error('Erro ao carregar projetos', response.error || 'Não foi possível carregar os projetos');
      }
    } catch (err) {
      error('Erro inesperado', 'Ocorreu um erro inesperado ao carregar os projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const response = await projectService.compileProject(project.id);
      
      if (response.success) {
        success('Compilação iniciada!', `O projeto "${project.name}" está sendo compilado`);
        // Reload projects to get updated status
        await loadProjects();
      } else {
        error('Erro na compilação', response.error || 'Não foi possível compilar o projeto');
      }
    } catch (err) {
      error('Erro inesperado', 'Ocorreu um erro inesperado durante a compilação');
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
      const response = await projectService.deleteProject(deleteModal.project.id);
      
      if (response.success) {
        success('Projeto excluído!', `O projeto "${deleteModal.project.name}" foi excluído com sucesso`);
        setProjects(prev => prev.filter(p => p.id !== deleteModal.project!.id));
      } else {
        error('Erro ao excluir', response.error || 'Não foi possível excluir o projeto');
      }
    } catch (err) {
      error('Erro inesperado', 'Ocorreu um erro inesperado ao excluir o projeto');
    } finally {
      setDeleteModal({ isOpen: false, project: null });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'compiling': return 'text-yellow-400';
      case 'error': return 'text-red-400';
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
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              to="/" 
              className="group p-2 sm:p-3 text-gray-400 hover:text-white transition-all duration-300 hover:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-700/50"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" />
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
              className="group border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 text-sm"
            >
              <Plus size={14} className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">Novo Projeto</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent>
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
          </CardContent>
        </Card>

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
                    <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{project.name}</h3>
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
                        <span className="truncate">Atualizado: {formatDate(project.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 sm:gap-2 pt-3 sm:pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompile(project)}
                        disabled={compilingProjects.has(project.id) || project.status === 'compiling'}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <Play size={14} className="mr-1" />
                        <span className="hidden sm:inline">
                          {compilingProjects.has(project.id) ? 'Compilando...' : 'Compilar'}
                        </span>
                        <span className="sm:hidden">
                          {compilingProjects.has(project.id) ? '...' : 'Play'}
                        </span>
                      </Button>
                      
                      {project.outputPath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(project.outputPath, '_blank')}
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
              Tem certeza que deseja excluir o projeto "{deleteModal.project?.name}"?
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
      </div>
    </div>
  );
};

export default ProjectsPage;