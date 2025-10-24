import React from 'react';

const ResourceTags: React.FC = () => {
  const resources = [
    { emoji: '⚡', text: 'Vite + React' },
    { emoji: '🎨', text: 'TailwindCSS' },
    { emoji: '📱', text: 'Responsivo' },
    { emoji: '🚀', text: 'Deploy Rápido' },
    { emoji: '🔧', text: 'TypeScript' },
    { emoji: '📦', text: 'Componentes' },
    { emoji: '🎯', text: 'Otimizado' },
    { emoji: '💡', text: 'Moderno' },
    { emoji: '🔥', text: 'Performance' },
    { emoji: '✨', text: 'Animações' }
  ];

  // Duplicar para animação contínua
  const duplicatedResources = [...resources, ...resources];

  return (
    <>
      <style>{`
        .system-resources-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          height: 60px;
          display: flex;
          align-items: center;
          mask: linear-gradient(90deg, transparent 0%, white 15%, white 85%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, white 15%, white 85%, transparent 100%);
        }
        
        .system-resources-scroll {
          display: flex;
          gap: 1rem;
          animation: scrollTags 20s linear infinite;
          white-space: nowrap;
          width: calc(200%);
        }
        
        .system-resources-scroll:hover {
          animation-play-state: paused;
        }
        
        @keyframes scrollTags {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .resource-tag {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          flex-shrink: 0;
          min-width: fit-content;
        }
        
        .resource-tag:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        .resource-emoji {
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        .resource-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
        }
      `}</style>
      
      <div className="system-resources-container">
        <div className="system-resources-scroll">
          {duplicatedResources.map((resource, index) => (
            <div key={index} className="resource-tag">
              <span className="resource-emoji">{resource.emoji}</span>
              <span className="resource-text">{resource.text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ResourceTags;