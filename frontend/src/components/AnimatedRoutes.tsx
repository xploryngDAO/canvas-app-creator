import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition';
import HomePage from '../pages/HomePage';
import CreateAppPage from '../pages/CreateAppPage';
import CompilationPage from '../pages/CompilationPage';
import IDEPage from '../pages/IDEPage';
import ProjectsPage from '../pages/ProjectsPage';
import SettingsPage from '../pages/SettingsPage';

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route 
        path="/" 
        element={
          <PageTransition>
            <HomePage />
          </PageTransition>
        } 
      />
      <Route 
        path="/create" 
        element={
          <PageTransition>
            <CreateAppPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/compilation" 
        element={
          <PageTransition>
            <CompilationPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/ide" 
        element={
          <PageTransition>
            <IDEPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <PageTransition>
            <ProjectsPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PageTransition>
            <SettingsPage />
          </PageTransition>
        } 
      />
    </Routes>
  );
};

export default AnimatedRoutes;