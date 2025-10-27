import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AnimatedRoutes from '@/components/AnimatedRoutes';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';

const App: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <Layout>
        <AnimatedRoutes />
        
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </Layout>
    </Router>
  );
};

export default App;
