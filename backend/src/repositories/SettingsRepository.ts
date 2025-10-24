import { Database, saveDatabase } from '../database/init';

export interface Setting {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export class SettingsRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getAll(): Setting[] {
    return this.db.settings.sort((a, b) => a.key.localeCompare(b.key));
  }

  getByKey(key: string): Setting | null {
    const setting = this.db.settings.find(s => s.key === key);
    return setting || null;
  }

  create(key: string, value: string): Setting {
    const now = new Date().toISOString();
    const setting: Setting = {
      key,
      value,
      created_at: now,
      updated_at: now
    };
    
    this.db.settings.push(setting);
    saveDatabase();
    
    return setting;
  }

  update(key: string, value: string): boolean {
    const now = new Date().toISOString();
    const settingIndex = this.db.settings.findIndex(s => s.key === key);
    
    if (settingIndex === -1) {
      return false;
    }
    
    this.db.settings[settingIndex].value = value;
    this.db.settings[settingIndex].updated_at = now;
    saveDatabase();
    
    return true;
  }

  delete(key: string): boolean {
    const settingIndex = this.db.settings.findIndex(s => s.key === key);
    
    if (settingIndex === -1) {
      return false;
    }
    
    this.db.settings.splice(settingIndex, 1);
    saveDatabase();
    
    return true;
  }
}