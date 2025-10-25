import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Páginas que devem ter altura fixa sem scroll
  const fixedHeightPages = ['/ide', '/compilation'];
  const isFixedHeightPage = fixedHeightPages.includes(location.pathname);
  
  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${
      isFixedHeightPage 
        ? 'h-screen flex flex-col overflow-hidden' 
        : 'min-h-screen'
    }`}>
      <Header />
      <main className={isFixedHeightPage ? 'flex-1 overflow-hidden' : 'flex-1'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;