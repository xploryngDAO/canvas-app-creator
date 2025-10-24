import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  gradient = false
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border backdrop-filter backdrop-blur-lg transition-all duration-300',
        gradient
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-blue-500/20'
          : 'bg-gray-800/50 border-gray-600/50',
        hover && 'hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4 sm:p-6 pb-3 sm:pb-4', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4 sm:p-6 pt-0', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-600/50', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
};

export { Card, CardHeader, CardContent, CardFooter, CardTitle };