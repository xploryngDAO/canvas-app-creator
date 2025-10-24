import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Minimize2, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompilationTerminalProps {
  isVisible: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  compilationLogs: string[];
  isCompiling: boolean;
}

const CompilationTerminal: React.FC<CompilationTerminalProps> = ({
  isVisible,
  isCollapsed,
  onToggleCollapse,
  onClose,
  compilationLogs,
  isCompiling
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [compilationLogs]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg border border-blue-500/20 rounded-lg shadow-2xl transition-all duration-500 overflow-hidden',
        isCollapsed ? 'terminal-collapsed' : 'flex flex-col h-full'
      )}
      id="canvas-container"
    >
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-title">
          {isCollapsed ? 'Terminal' : (
            <>
              <Terminal size={20} />
              Terminal de Compilação
            </>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="terminal-toggle-btn"
              id="terminal-toggle-btn"
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="terminal-toggle-btn hover:bg-red-500/20 hover:border-red-500/50"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="terminal-toggle-btn mt-4"
          >
            <Maximize2 size={16} />
          </button>
        )}
      </div>

      {/* Terminal Content */}
      {!isCollapsed && (
        <>
          <div
            ref={terminalRef}
            className="code-simulator flex-1 overflow-y-auto"
          >
            {compilationLogs.length === 0 ? (
              <div className="code-line text-gray-400">
                Aguardando compilação...
              </div>
            ) : (
              compilationLogs.map((log, index) => (
                <div
                  key={index}
                  className="code-line"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {log}
                </div>
              ))
            )}
            
            {isCompiling && (
              <div className="code-line text-blue-400 animate-pulse">
                ⚡ Compilando projeto...
              </div>
            )}
          </div>

          <div className="text-center flex-shrink-0 p-4 border-t border-gray-700/50">
            <div className="text-sm text-gray-400">
              {isCompiling ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Processando...
                </span>
              ) : (
                'Pronto para compilar'
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .terminal-collapsed {
          width: 60px !important;
          min-width: 60px !important;
          flex: none !important;
          overflow: hidden;
        }

        .terminal-collapsed .code-simulator,
        .terminal-collapsed .text-center.flex-shrink-0 {
          display: none !important;
        }

        .terminal-collapsed .terminal-header {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          height: 100%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 1rem 0.5rem;
        }

        .terminal-collapsed .terminal-title {
          transform: rotate(180deg);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .terminal-header {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 1rem 1rem 0 0;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
        }

        .terminal-title {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .terminal-toggle-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.5rem;
          padding: 0.5rem;
          color: #93c5fd;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .terminal-toggle-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: #dbeafe;
          transform: scale(1.05);
        }

        .code-simulator {
          background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.75rem;
          padding: 1.5rem;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #e6edf3;
          overflow-y: auto;
          max-height: 400px;
          position: relative;
          backdrop-filter: blur(10px);
        }

        .code-simulator::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
        }

        .code-line {
          margin-bottom: 6px;
          opacity: 0;
          animation: codeLineAppear 0.3s ease-in forwards;
          padding-left: 1rem;
          position: relative;
        }

        .code-line::before {
          content: '▶';
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-size: 0.75rem;
        }

        @keyframes codeLineAppear {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CompilationTerminal;