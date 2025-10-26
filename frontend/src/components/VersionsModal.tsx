import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { database, ProjectVersion } from '@/services/database';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface VersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onLoadVersion: (versionId: string, code: string) => void;
}

const VersionsModal: React.FC<VersionsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onLoadVersion
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && projectId) {
      loadVersions();
    }
  }, [isOpen, projectId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      console.log('🔍 [VERSIONS_MODAL] Carregando versões para projeto:', projectId);
      
      const projectVersions = await database.getVersions(projectId);
      
      console.log('🔍 [VERSIONS_MODAL] Versões carregadas:', projectVersions);
      console.log('🔍 [VERSIONS_MODAL] Número de versões:', projectVersions.length);
      
      setVersions(projectVersions);
    } catch (error) {
      console.error('❌ [VERSIONS_MODAL] Erro ao carregar versões:', error);
      showToast('Erro ao carregar versões do projeto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadVersion = (version: ProjectVersion) => {
    onLoadVersion(version.id, version.code);
    onClose();
    showToast(`Versão ${version.version_number} carregada com sucesso!`, 'success');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Versões: ${projectTitle}`}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Carregando versões...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma versão encontrada para este projeto.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Versões Disponíveis</h3>
              <span className="text-sm text-gray-500">({versions.length})</span>
            </div>
            
            {versions.map((version) => (
              <div 
                key={version.id}
                className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/70 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-white">
                    Versão {version.version_number}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(version.created_at)} às {formatTime(version.created_at)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {version.prompt}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(version.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTime(version.created_at)}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleLoadVersion(version)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VersionsModal;