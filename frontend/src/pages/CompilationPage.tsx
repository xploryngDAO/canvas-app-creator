import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CompilationTerminal } from '../components/features/CompilationTerminal';
import { AppConfig } from '../types/app';

const CompilationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [compilationComplete, setCompilationComplete] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);

  useEffect(() => {
    // Recuperar configuração do app do state da navegação
    if (location.state && location.state.appConfig) {
      setAppConfig(location.state.appConfig);
    } else {
      // Se não há configuração, redirecionar de volta para criar app
      navigate('/create-app');
    }
  }, [location.state, navigate]);

  const handleCompilationComplete = async (code: string, files?: any[], logs?: string[]) => {
    console.log('🔍 [DEBUG] CompilationPage - handleCompilationComplete iniciado');
    console.log('🔍 [DEBUG] Código recebido:', code ? `${code.length} caracteres` : 'VAZIO');
    console.log('🔍 [DEBUG] Estado da localização:', location.state);
    
    setGeneratedCode(code);
    setGeneratedFiles(files || []);
    setCompilationLogs(logs || []);
    setCompilationComplete(true);
    
    // Criar versão 1 se temos projectId do estado
    if (location.state?.projectId && code) {
      try {
        console.log('🔍 [DEBUG] Criando versão 1 para projeto:', location.state.projectId);
        
        // Importar database dinamicamente para evitar problemas de importação
        const { database } = await import('../services/database');
        
        // Verificar se já existe versão 1 para este projeto
        const existingVersions = await database.getVersions(location.state.projectId);
        const hasVersion1 = existingVersions.some(v => v.version_number === 1);
        
        console.log('🔍 [DEBUG] Verificando versões existentes:', {
          projectId: location.state.projectId,
          existingVersionsCount: existingVersions.length,
          hasVersion1,
          isNewProject: location.state.isNewProject,
          existingVersions: existingVersions.map(v => ({ id: v.id, version_number: v.version_number }))
        });
        
        // CORREÇÃO: Lógica corrigida para criação da versão 1
        // Só pular se é um projeto existente E já tem versão 1
        if (hasVersion1 && !location.state.isNewProject) {
          console.log('⚠️ [DEBUG] Versão 1 já existe para projeto existente, pulando criação');
        } else {
          console.log('✅ [DEBUG] Criando/atualizando versão 1:', {
            hasVersion1,
            isNewProject: location.state.isNewProject,
            reason: hasVersion1 ? 'Novo projeto com versão 1 existente - atualizando' : 'Primeira versão do projeto'
          });
          const versionData = {
            project_id: location.state.projectId,
            version_number: hasVersion1 ? 1 : 1, // Sempre versão 1 para compilação inicial
            prompt: `Projeto inicial criado via Wizard: ${location.state.projectName || appConfig?.name || 'Sem nome'}`,
            code: code
          };

          console.log('🔍 [DEBUG] Dados da versão a serem salvos:', {
            project_id: versionData.project_id,
            version_number: versionData.version_number,
            prompt: versionData.prompt,
            hasCode: !!versionData.code,
            codeLength: versionData.code?.length || 0,
            isNewProject: location.state.isNewProject,
            willOverwrite: hasVersion1
          });

          // Se já existe versão 1 e é um novo projeto, atualizar em vez de criar
          if (hasVersion1 && location.state.isNewProject) {
            console.log('🔄 [DEBUG] Atualizando versão 1 existente para novo projeto');
            const existingVersion1 = existingVersions.find(v => v.version_number === 1);
            if (existingVersion1) {
              await database.updateVersion(existingVersion1.id, {
                prompt: versionData.prompt,
                code: versionData.code
              });
              console.log('✅ [DEBUG] Versão 1 atualizada com sucesso:', existingVersion1.id);
            }
          } else {
            const versionId = await database.createVersion(versionData);
            console.log('✅ [DEBUG] Versão 1 criada com sucesso:', {
              versionId,
              projectId: location.state.projectId,
              versionNumber: 1
            });
          }

          // Verificar se a versão foi realmente salva/atualizada
          const savedVersions = await database.getVersions(location.state.projectId);
          console.log('🔍 [DEBUG] Versões salvas no banco após operação:', {
            count: savedVersions.length,
            versions: savedVersions.map(v => ({ 
              id: v.id, 
              version_number: v.version_number,
              hasCode: !!v.code,
              codeLength: v.code?.length || 0
            }))
          });
        }
      } catch (versionError) {
        console.error('❌ [DEBUG] Erro ao criar/atualizar versão 1:', versionError);
        console.error('❌ [DEBUG] Stack trace:', versionError.stack);
        console.error('❌ [DEBUG] Contexto do erro:', {
          projectId: location.state.projectId,
          hasCode: !!code,
          codeLength: code?.length || 0,
          locationState: location.state
        });
      }
    } else {
      console.log('⚠️ [DEBUG] Não foi possível criar versão 1 - dados insuficientes:', {
        hasProjectId: !!location.state?.projectId,
        hasCode: !!code,
        locationState: location.state
      });
    }
    
    // Redirecionar para a IDE após 2 segundos, passando o projectId
    setTimeout(() => {
      navigate('/ide', {
        state: {
          appConfig,
          generatedCode: code,
          generatedFiles: files || [],
          compilationLogs: logs || [],
          projectId: location.state?.projectId // CORREÇÃO: Passar o projectId para a IDE
        }
      });
    }, 2000);
  };

  const handleCompilationError = (error: string) => {
    console.error('Erro na compilação:', error);
    // Aqui você pode adicionar tratamento de erro mais sofisticado
  };

  const handleBackToCreate = () => {
    navigate('/create-app');
  };

  const handleDownloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appConfig?.name || 'app'}-code.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!appConfig) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Terminal de compilação em tela cheia */}
      <div className="flex-1 min-h-0">
        <CompilationTerminal
          appConfig={appConfig}
          onComplete={handleCompilationComplete}
          onError={handleCompilationError}
          logs={compilationLogs}
        />
      </div>
    </div>
  );
};

export default CompilationPage;