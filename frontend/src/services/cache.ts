interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number;    // Maximum number of items in cache
}

class CacheService {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig = {
    defaultTTL: 60 * 60 * 1000, // 1 hora (aumentado para reduzir chamadas à API)
    maxSize: 200 // Aumentado para armazenar mais resultados
  };

  /**
   * Gera uma chave de cache baseada na configuração do app
   */
  private generateKey(config: any): string {
    // Garantir que features e integrations sejam arrays válidos antes de usar sort()
    const features = Array.isArray(config.features) ? config.features.slice().sort() : [];
    const integrations = Array.isArray(config.integrations) ? config.integrations.slice().sort() : [];
    
    const keyData = {
      name: config.name,
      type: config.type,
      frontend: config.frontend,
      css: config.css,
      features,
      integrations
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Verifica se um item do cache ainda é válido
   */
  private isValid(item: CacheItem): boolean {
    return Date.now() < item.expiresAt;
  }

  /**
   * Remove itens expirados do cache
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove o item mais antigo se o cache estiver cheio
   */
  private evictOldest(): void {
    if (this.cache.size >= this.config.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [key, item] of this.cache.entries()) {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Armazena um item no cache
   */
  set(config: any, data: any, ttl?: number): void {
    this.cleanup();
    this.evictOldest();
    
    const key = this.generateKey(config);
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
    
    console.log('💾 [CACHE] Item armazenado:', {
      key: key.substring(0, 16) + '...',
      size: this.cache.size,
      expiresIn: Math.round((expiresAt - now) / 1000 / 60) + ' minutos',
      dataSize: JSON.stringify(data).length + ' chars'
    });
  }

  /**
   * Recupera um item do cache
   */
  get(config: any): any | null {
    this.cleanup();
    
    const key = this.generateKey(config);
    const item = this.cache.get(key);
    
    if (!item) {
      console.log('🔍 [CACHE] Miss - item não encontrado');
      return null;
    }
    
    if (!this.isValid(item)) {
      this.cache.delete(key);
      console.log('⏰ [CACHE] Miss - item expirado');
      return null;
    }
    
    console.log('✅ [CACHE] Hit - item encontrado:', {
      key: key.substring(0, 16) + '...',
      age: Math.round((Date.now() - item.timestamp) / 1000 / 60) + ' minutos',
      dataSize: JSON.stringify(item.data).length + ' chars'
    });
    
    return item.data;
  }

  /**
   * Remove um item específico do cache
   */
  delete(config: any): boolean {
    const key = this.generateKey(config);
    return this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ [CACHE] Cache limpo');
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize
    };
  }

  /**
   * Verifica se existe um item no cache para a configuração
   */
  has(config: any): boolean {
    const key = this.generateKey(config);
    const item = this.cache.get(key);
    return item ? this.isValid(item) : false;
  }
}

export const cacheService = new CacheService();