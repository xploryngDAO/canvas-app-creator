import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface EnhanceButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const EnhanceButton: React.FC<EnhanceButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
        bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700
        text-white rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
        hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25
        ${className}
      `}
      title="Usar IA para aprimorar a descrição do aplicativo"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Aprimorando...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>✨ Aprimorar Descrição</span>
        </>
      )}
    </button>
  );
};