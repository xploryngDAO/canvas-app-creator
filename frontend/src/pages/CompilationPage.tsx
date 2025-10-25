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
      navigate('/create');
    }
  }, [location.state, navigate]);

  const handleCompilationComplete = (code: string, files?: any[], logs?: string[]) => {
    setGeneratedCode(code);
    setGeneratedFiles(files || []);
    setCompilationLogs(logs || []);
    setCompilationComplete(true);
    
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
    navigate('/create');
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