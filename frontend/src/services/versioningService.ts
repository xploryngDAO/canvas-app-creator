import { database } from './database';
import { ProjectVersion } from '../types';

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
      // Obter próximo número de versão
      const nextVersion = await this.getNextVersionNumber(projectId);
      
      // Criar versão no banco de dados
      const versionId = await database.createVersion({
        project_id: projectId,
        version_number: nextVersion,
        prompt: userPrompt,
        code: modifiedCode
      });
      
      console.log(`✅ Versão ${nextVersion} salva automaticamente para projeto ${projectId}`);
      return versionId;
    } catch (error) {
      console.error('❌ Erro ao salvar versão automaticamente:', error);
      throw error;
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
      
      if (versions.length === 0) {
        return 1; // Primeira versão
      }
      
      // Encontrar o maior número de versão e incrementar
      const maxVersion = Math.max(...versions.map(v => v.version_number));
      return maxVersion + 1;
    } catch (error) {
      console.error('❌ Erro ao obter próximo número de versão:', error);
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
      return await database.getVersions(projectId);
    } catch (error) {
      console.error('❌ Erro ao obter versões do projeto:', error);
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
        return null;
      }
      
      // Retornar a versão com maior número
      return versions.reduce((latest, current) => 
        current.version_number > latest.version_number ? current : latest
      );
    } catch (error) {
      console.error('❌ Erro ao obter última versão:', error);
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
      return versions.length > 0;
    } catch (error) {
      console.error('❌ Erro ao verificar se projeto tem versões:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de versionamento
export const versioningService = new VersioningService();