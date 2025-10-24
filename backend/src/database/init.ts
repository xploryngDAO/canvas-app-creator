import path from 'path';
import fs from 'fs';

export interface Database {
  projects: any[];
  settings: any[];
}

let db: Database;

export function initializeDatabase(): Database {
  const dbPath = path.join(process.cwd(), 'backend/database/app.json');
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load or create database
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
  } else {
    db = {
      projects: [],
      settings: [
        { key: 'gemini_api_key', value: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { key: 'default_theme', value: 'modern', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { key: 'auto_save', value: 'true', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]
    };
    saveDatabase();
  }

  console.log('Database initialized successfully');
  return db;
}

export function saveDatabase(): void {
  const dbPath = path.join(process.cwd(), 'backend/database/app.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function getDatabase(): Database {
  return db;
}