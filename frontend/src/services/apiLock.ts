/**
 * Sistema global de lock para prevenir múltiplas chamadas simultâneas à API
 */

interface ApiLockState {
  isLocked: boolean;
  lockId: string | null;
  startTime: number | null;
  timeout: NodeJS.Timeout | null;
}

class ApiLockManager {
  private state: ApiLockState = {
    isLocked: false,
    lockId: null,
    startTime: null,
    timeout: null
  };

  private readonly LOCK_TIMEOUT = 120000; // 2 minutos timeout

  /**
   * Tenta adquirir o lock para uma operação
   */
  acquireLock(operationId: string): boolean {
    console.log(`🔒 [API_LOCK] Tentando adquirir lock para: ${operationId}`);
    
    if (this.state.isLocked) {
      console.warn(`⚠️ [API_LOCK] Lock já ativo para: ${this.state.lockId}, rejeitando: ${operationId}`);
      return false;
    }

    this.state.isLocked = true;
    this.state.lockId = operationId;
    this.state.startTime = Date.now();

    // Timeout automático para evitar locks infinitos
    this.state.timeout = setTimeout(() => {
      console.warn(`⏰ [API_LOCK] Timeout do lock para: ${operationId}`);
      this.releaseLock(operationId);
    }, this.LOCK_TIMEOUT);

    console.log(`✅ [API_LOCK] Lock adquirido para: ${operationId}`);
    return true;
  }

  /**
   * Libera o lock
   */
  releaseLock(operationId: string): void {
    if (!this.state.isLocked) {
      console.warn(`⚠️ [API_LOCK] Tentativa de liberar lock inexistente: ${operationId}`);
      return;
    }

    if (this.state.lockId !== operationId) {
      console.warn(`⚠️ [API_LOCK] Tentativa de liberar lock de outro processo: ${operationId} vs ${this.state.lockId}`);
      return;
    }

    const duration = this.state.startTime ? Date.now() - this.state.startTime : 0;
    console.log(`🔓 [API_LOCK] Lock liberado para: ${operationId} (duração: ${duration}ms)`);

    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }

    this.state = {
      isLocked: false,
      lockId: null,
      startTime: null,
      timeout: null
    };
  }

  /**
   * Verifica se há um lock ativo
   */
  isLocked(): boolean {
    return this.state.isLocked;
  }

  /**
   * Obtém informações do lock atual
   */
  getLockInfo(): { isLocked: boolean; lockId: string | null; duration: number | null } {
    return {
      isLocked: this.state.isLocked,
      lockId: this.state.lockId,
      duration: this.state.startTime ? Date.now() - this.state.startTime : null
    };
  }

  /**
   * Força a liberação do lock (usar apenas em emergências)
   */
  forceClear(): void {
    console.warn(`🚨 [API_LOCK] Forçando limpeza do lock: ${this.state.lockId}`);
    
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }

    this.state = {
      isLocked: false,
      lockId: null,
      startTime: null,
      timeout: null
    };
  }
}

// Instância singleton
export const apiLock = new ApiLockManager();

// Hook para usar o lock em componentes React
export const useApiLock = () => {
  return {
    acquireLock: (operationId: string) => apiLock.acquireLock(operationId),
    releaseLock: (operationId: string) => apiLock.releaseLock(operationId),
    isLocked: () => apiLock.isLocked(),
    getLockInfo: () => apiLock.getLockInfo(),
    forceClear: () => apiLock.forceClear()
  };
};