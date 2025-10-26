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
          existingVersions: existingVersions.map(v => ({ id: v.id, version_number: v.version_number }))
        });
        
        if (hasVersion1) {
          console.log('⚠️ [DEBUG] Versão 1 já existe para este projeto, pulando criação');
        } else {
          const versionData = {
            project_id: location.state.projectId,
            version_number: 1,
            prompt: `Projeto inicial criado via Wizard: ${location.state.projectName || appConfig?.name || 'Sem nome'}`,
            code: code
          };

          console.log('🔍 [DEBUG] Dados da versão a serem salvos:', {
            project_id: versionData.project_id,
            version_number: versionData.version_number,
            prompt: versionData.prompt,
            hasCode: !!versionData.code,
            codeLength: versionData.code?.length || 0
          });

          const versionId = await database.createVersion(versionData);
          
          console.log('✅ [DEBUG] Versão 1 criada com sucesso:', {
            versionId,
            projectId: location.state.projectId,
            versionNumber: 1
          });

          // Verificar se a versão foi realmente salva
          const savedVersions = await database.getVersions(location.state.projectId);
          console.log('🔍 [DEBUG] Versões salvas no banco após criação:', savedVersions);
        }
      } catch (versionError) {
        console.error('❌ [DEBUG] Erro ao criar versão 1:', versionError);
        console.error('❌ [DEBUG] Stack trace:', versionError.stack);
      }
    } else {
      console.log('⚠️ [DEBUG] Não foi possível criar versão 1 - dados insuficientes:', {
        hasProjectId: !!location.state?.projectId,
        hasCode: !!code,
        locationState: location.state
      });
    }
    
    // Redirecionar para a IDE após 2 segundos
    setTimeout(() => {
      navigate('/ide', {
        state: {
          appConfig,
          generatedCode: code,
          generatedFiles: files || [],
          compilationLogs: logs || []
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
          onCompilationComplete={handleCompilationComplete}
          onError={handleCompilationError}
          logs={compilationLogs}
        />
      </div>
    </div>
  );
};

export default CompilationPage;