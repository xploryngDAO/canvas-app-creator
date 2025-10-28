import { database, ProjectVersion } from './database';

/**
 * Serviço responsável pelo versionamento automático de projetos
 * Salva automaticamente cada alteração feita pelo AICopilot como uma nova versão
 */
export class VersioningService {
  /**
   * Salva uma nova versão automaticamente no banco de dados
   * @param projectId ID do projeto atual
   * @param userPrompt Prompt original do usuário
   * @param modifiedCode Código HTML modificado pela IA
   * @returns ID da versão criada
   */
  async saveVersionAutomatically(
    projectId: string,
    userPrompt: string,
    modifiedCode: string
  ): Promise<string> {
    try {
      console.log('🔍 [VERSIONING] Iniciando salvamento de versão:', {
        projectId,
        userPrompt: userPrompt.substring(0, 50) + '...',
        codeLength: modifiedCode.length
      });

      // Verificar se o projeto existe no banco de dados
      const projectExists = await this.ensureProjectExists(projectId, modifiedCode);
      
      if (!projectExists) {
        throw new Error(`Não foi possível criar ou encontrar o projeto: ${projectId}`);
      }

      // Obter próximo número de versão
      const nextVersion = await this.getNextVersionNumber(projectId);
      
      console.log('🔍 [VERSIONING] Criando versão:', {
        projectId,
        versionNumber: nextVersion,
        promptLength: userPrompt.length,
        codeLength: modifiedCode.length
      });

      // Criar versão no banco de dados
      const versionId = await database.createVersion({
        project_id: projectId,
        version_number: nextVersion,
        prompt: userPrompt,
        code: modifiedCode
      });
      
      console.log(`✅ [VERSIONING] Versão ${nextVersion} salva automaticamente para projeto ${projectId}:`, {
        versionId,
        projectId,
        versionNumber: nextVersion
      });
      
      return versionId;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao salvar versão automaticamente:', error);
      throw new Error(`Falha ao salvar versão: ${error.message}`);
    }
  }

  /**
   * Garante que o projeto existe no banco de dados
   * Se não existir, cria um projeto temporário
   * @param projectId ID do projeto
   * @param code Código atual do projeto
   * @returns true se o projeto existe ou foi criado com sucesso
   */
  private async ensureProjectExists(projectId: string, code: string): Promise<boolean> {
    try {
      console.log('🔍 [VERSIONING] Verificando se projeto existe:', projectId);
      
      // Tentar buscar o projeto
      const project = await database.getProject(projectId);
      
      if (project) {
        console.log('✅ [VERSIONING] Projeto encontrado no banco:', projectId);
        return true;
      }

      console.log('⚠️ [VERSIONING] Projeto não encontrado, criando projeto temporário:', projectId);

      // Se o projeto não existe, criar um projeto temporário
      const isTemporary = projectId.startsWith('temp_');
      const projectTitle = isTemporary 
        ? `Projeto Temporário - ${new Date().toLocaleString()}`
        : `Projeto ${projectId}`;

      const newProjectId = await database.createProject({
        user_id: 'default_user', // ID padrão para projetos temporários
        title: projectTitle,
        description: isTemporary 
          ? 'Projeto criado automaticamente pelo AICopilot'
          : 'Projeto criado durante versionamento',
        config: {},
        code: code
      });

      console.log('✅ [VERSIONING] Projeto temporário criado:', {
        originalId: projectId,
        newProjectId,
        title: projectTitle
      });

      return true;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao verificar/criar projeto:', error);
      return false;
    }
  }

  /**
   * Obtém o próximo número de versão para um projeto
   * @param projectId ID do projeto
   * @returns Próximo número de versão (incrementado)
   */
  private async getNextVersionNumber(projectId: string): Promise<number> {
    try {
      const versions = await database.getVersions(projectId);
      
      console.log('🔍 [VERSIONING] Versões existentes:', {
        projectId,
        count: versions.length,
        versions: versions.map(v => ({ id: v.id, version: v.version_number }))
      });
      
      if (versions.length === 0) {
        console.log('🔍 [VERSIONING] Primeira versão para o projeto');
        return 1; // Primeira versão
      }
      
      // Encontrar o maior número de versão e incrementar
      const maxVersion = Math.max(...versions.map(v => v.version_number));
      const nextVersion = maxVersion + 1;
      
      console.log('🔍 [VERSIONING] Próxima versão calculada:', {
        maxVersion,
        nextVersion
      });
      
      return nextVersion;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao obter próximo número de versão:', error);
      console.log('🔄 [VERSIONING] Usando versão 1 como fallback');
      return 1; // Fallback para primeira versão
    }
  }

  /**
   * Obtém todas as versões de um projeto
   * @param projectId ID do projeto
   * @returns Lista de versões do projeto
   */
  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    try {
      console.log('🔍 [VERSIONING] Buscando versões do projeto:', projectId);
      const versions = await database.getVersions(projectId);
      
      console.log('✅ [VERSIONING] Versões encontradas:', {
        projectId,
        count: versions.length
      });
      
      return versions;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao obter versões do projeto:', error);
      return [];
    }
  }

  /**
   * Obtém a última versão de um projeto
   * @param projectId ID do projeto
   * @returns Última versão do projeto ou null se não houver versões
   */
  async getLatestVersion(projectId: string): Promise<ProjectVersion | null> {
    try {
      const versions = await this.getProjectVersions(projectId);
      
      if (versions.length === 0) {
        console.log('⚠️ [VERSIONING] Nenhuma versão encontrada para o projeto:', projectId);
        return null;
      }
      
      // Retornar a versão com maior número
      const latestVersion = versions.reduce((latest, current) => 
        current.version_number > latest.version_number ? current : latest
      );
      
      console.log('✅ [VERSIONING] Última versão encontrada:', {
        projectId,
        versionId: latestVersion.id,
        versionNumber: latestVersion.version_number
      });
      
      return latestVersion;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao obter última versão:', error);
      return null;
    }
  }

  /**
   * Verifica se um projeto tem versões
   * @param projectId ID do projeto
   * @returns true se o projeto tem versões, false caso contrário
   */
  async hasVersions(projectId: string): Promise<boolean> {
    try {
      const versions = await this.getProjectVersions(projectId);
      const hasVersions = versions.length > 0;
      
      console.log('🔍 [VERSIONING] Verificação de versões:', {
        projectId,
        hasVersions,
        count: versions.length
      });
      
      return hasVersions;
    } catch (error) {
      console.error('❌ [VERSIONING] Erro ao verificar se projeto tem versões:', error);
      return false;
    }
  }

  /**
   * Valida se os dados necessários estão presentes para criar uma versão
   * @param projectId ID do projeto
   * @param userPrompt Prompt do usuário
   * @param code Código do projeto
   * @returns true se os dados são válidos
   */
  private validateVersionData(projectId: string, userPrompt: string, code: string): boolean {
    const isValid = !!(projectId && userPrompt && code);
    
    if (!isValid) {
      console.error('❌ [VERSIONING] Dados inválidos para criação de versão:', {
        hasProjectId: !!projectId,
        hasUserPrompt: !!userPrompt,
        hasCode: !!code,
        projectId,
        promptLength: userPrompt?.length || 0,
        codeLength: code?.length || 0
      });
    }
    
    return isValid;
  }
}

// Instância singleton do serviço de versionamento
export const versioningService = new VersioningService();