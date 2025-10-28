import initSqlJs, { Database } from 'sql.js';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  latest_version_created_at: string;
  config?: any;
  code?: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  prompt: string;
  code: string;
  created_at: string;
}

export interface User {
  id: string;
  created_at: string;
  last_active: string;
}

export interface Settings {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

class SQLiteManager {
  private db: Database | null = null;
  private _isInitialized = false;
  private SQL: any = null;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async init(): Promise<boolean> {
    try {
      // Carregar sql.js usando arquivos locais
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm/${file}`
      });

      // Tentar carregar banco existente do localStorage
      const savedDb = this.loadFromLocalStorage();
      
      if (savedDb) {
        this.db = new this.SQL.Database(savedDb);
        console.log('Banco de dados carregado do localStorage');
      } else {
        // Criar novo banco
        this.db = new this.SQL.Database();
        await this.createTables();
        console.log('Novo banco de dados criado');
      }

      this._isInitialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar SQLite:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        config TEXT,
        code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        latest_version_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    const createVersionsTable = `
      CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createUsersTable);
    this.db.run(createProjectsTable);
    this.db.run(createVersionsTable);
    this.db.run(createSettingsTable);

    // Criar usuário padrão se não existir
    const userExists = this.db.exec("SELECT COUNT(*) as count FROM users");
    if (userExists[0]?.values[0][0] === 0) {
      this.db.run("INSERT INTO users (id) VALUES ('default-user')");
    }

    this.saveToLocalStorage();
  }

  private loadFromLocalStorage(): Uint8Array | null {
    try {
      const saved = localStorage.getItem('canvas-app-creator-db');
      if (saved) {
        const buffer = new Uint8Array(JSON.parse(saved));
        return buffer;
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    return null;
  }

  private saveToLocalStorage(): void {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const serialized = JSON.stringify(Array.from(data));
      localStorage.setItem('canvas-app-creator-db', serialized);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // === PROJECTS ===
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'latest_version_created_at'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    this.db.run(
      `INSERT INTO projects (id, user_id, title, description, config, code, created_at, latest_version_created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, project.user_id, project.title, project.description || '', 
       JSON.stringify(project.config || {}), project.code || '', now, now]
    );

    this.saveToLocalStorage();
    return id;
  }

  async getProjects(): Promise<Project[]> {
    if (!this.db) return [];

    const result = this.db.exec("SELECT * FROM projects ORDER BY created_at DESC");
    if (!result[0]) return [];

    return result[0].values.map((row: any[]) => ({
      id: row[0],
      user_id: row[1],
      title: row[2],
      description: row[3],
      config: row[4] ? JSON.parse(row[4]) : {},
      code: row[5],
      created_at: row[6],
      latest_version_created_at: row[7]
    }));
  }

  async getProject(id: string): Promise<Project | null> {
    if (!this.db) return null;

    const result = this.db.exec("SELECT * FROM projects WHERE id = ?", [id]);
    if (!result[0] || !result[0].values[0]) return null;

    const row = result[0].values[0];
    return {
      id: row[0],
      user_id: row[1],
      title: row[2],
      description: row[3],
      config: row[4] ? JSON.parse(row[4]) : {},
      code: row[5],
      created_at: row[6],
      latest_version_created_at: row[7]
    };
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (!this.db) return;

    const fields = [];
    const values = [];

    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.config) {
      fields.push('config = ?');
      values.push(JSON.stringify(updates.config));
    }
    if (updates.code !== undefined) {
      fields.push('code = ?');
      values.push(updates.code);
    }

    if (fields.length > 0) {
      fields.push('latest_version_created_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      this.db.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
      this.saveToLocalStorage();
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) return;

    this.db.run("DELETE FROM versions WHERE project_id = ?", [id]);
    this.db.run("DELETE FROM projects WHERE id = ?", [id]);
    this.saveToLocalStorage();
  }

  // === SETTINGS ===
  async getSetting(key: string): Promise<{ key: string; value: string } | null> {
    if (!this.db) {
      console.error('❌ [DATABASE] Banco de dados não inicializado ao tentar buscar setting:', key);
      return null;
    }

    console.log('🔍 [DATABASE] Buscando setting no banco:', key);

    try {
      const result = this.db.exec("SELECT key, value FROM settings WHERE key = ?", [key]);
      
      console.log('📊 [DATABASE] Resultado da query:', {
        key,
        hasResult: !!result[0],
        hasValues: !!(result[0] && result[0].values[0]),
        resultLength: result[0]?.values?.length || 0
      });
      
      if (!result[0] || !result[0].values[0]) {
        console.log('⚠️ [DATABASE] Setting não encontrado:', key);
        return null;
      }

      const setting = {
        key: result[0].values[0][0] as string,
        value: result[0].values[0][1] as string
      };
      
      console.log('✅ [DATABASE] Setting encontrado:', {
        key: setting.key,
        valueLength: setting.value?.length || 0,
        valuePreview: key === 'geminiApiKey' && setting.value ? `${setting.value.substring(0, 10)}...` : setting.value
      });

      return setting;
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao buscar setting:', error);
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.db) {
      console.error('❌ [DATABASE] Banco de dados não inicializado ao tentar salvar setting:', key);
      return;
    }

    console.log('💾 [DATABASE] Salvando setting no banco:', {
      key,
      valueLength: value?.length || 0,
      valuePreview: key === 'geminiApiKey' && value ? `${value.substring(0, 10)}...` : value
    });

    const now = new Date().toISOString();
    
    try {
      // Usar REPLACE para inserir ou atualizar
      this.db.run(
        "REPLACE INTO settings (key, value, created_at, updated_at) VALUES (?, ?, COALESCE((SELECT created_at FROM settings WHERE key = ?), ?), ?)",
        [key, value, key, now, now]
      );

      console.log('✅ [DATABASE] Setting salvo com sucesso:', key);
      
      this.saveToLocalStorage();
      
      console.log('💾 [DATABASE] Banco salvo no localStorage');
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao salvar setting:', error);
      throw error;
    }
  }

  async getAllSettings(): Promise<{ key: string; value: string }[]> {
    if (!this.db) return [];

    const result = this.db.exec("SELECT key, value FROM settings");
    if (!result[0]) return [];

    return result[0].values.map((row: any[]) => ({
      key: row[0] as string,
      value: row[1] as string
    }));
  }

  async deleteSetting(key: string): Promise<void> {
    if (!this.db) return;

    this.db.run("DELETE FROM settings WHERE key = ?", [key]);
    this.saveToLocalStorage();
  }

  // === VERSIONS ===
  async createVersion(version: Omit<ProjectVersion, 'id' | 'created_at'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    console.log('🔍 [DATABASE] Criando versão:', {
      id,
      project_id: version.project_id,
      version_number: version.version_number,
      prompt: version.prompt,
      hasCode: !!version.code,
      codeLength: version.code?.length || 0,
      created_at: now
    });
    
    try {
      this.db.run(
        `INSERT INTO versions (id, project_id, version_number, prompt, code, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, version.project_id, version.version_number, version.prompt, version.code, now]
      );

      console.log('✅ [DATABASE] Versão inserida com sucesso no banco');
      
      this.saveToLocalStorage();
      console.log('✅ [DATABASE] Banco salvo no localStorage');
      
      return id;
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao inserir versão:', error);
      throw error;
    }
  }

  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    if (!this.db) {
      console.log('❌ [DATABASE] Banco não inicializado ao buscar versões');
      return [];
    }

    console.log('🔍 [DATABASE] Buscando versões para projeto:', projectId);

    try {
      const result = this.db.exec(
        "SELECT * FROM versions WHERE project_id = ? ORDER BY version_number DESC", 
        [projectId]
      );
      
      console.log('🔍 [DATABASE] Resultado da query:', result);
      
      if (!result[0]) {
        console.log('⚠️ [DATABASE] Nenhuma versão encontrada para o projeto:', projectId);
        return [];
      }

      const versions = result[0].values.map((row: any[]) => ({
        id: row[0],
        project_id: row[1],
        version_number: row[2],
        prompt: row[3],
        code: row[4],
        created_at: row[5]
      }));

      console.log('✅ [DATABASE] Versões encontradas:', versions.length);
      console.log('🔍 [DATABASE] Versões detalhadas:', versions);

      return versions;
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao buscar versões:', error);
      return [];
    }
  }

  async updateVersion(id: string, updates: Partial<Pick<ProjectVersion, 'prompt' | 'code'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔍 [DATABASE] Atualizando versão:', {
      id,
      hasPrompt: !!updates.prompt,
      hasCode: !!updates.code,
      codeLength: updates.code?.length || 0
    });

    const fields = [];
    const values = [];

    if (updates.prompt !== undefined) {
      fields.push('prompt = ?');
      values.push(updates.prompt);
    }
    if (updates.code !== undefined) {
      fields.push('code = ?');
      values.push(updates.code);
    }

    if (fields.length > 0) {
      values.push(id);

      try {
        this.db.run(`UPDATE versions SET ${fields.join(', ')} WHERE id = ?`, values);
        console.log('✅ [DATABASE] Versão atualizada com sucesso');
        this.saveToLocalStorage();
        console.log('✅ [DATABASE] Banco salvo no localStorage após atualização');
      } catch (error) {
        console.error('❌ [DATABASE] Erro ao atualizar versão:', error);
        throw error;
      }
    } else {
      console.log('⚠️ [DATABASE] Nenhum campo para atualizar na versão');
    }
  }
}

// Singleton instance
export { SQLiteManager };
export const database = new SQLiteManager();

// Initialize database on module load
database.init().catch(console.error);