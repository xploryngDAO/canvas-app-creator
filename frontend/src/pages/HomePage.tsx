import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Zap, Palette, Smartphone, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ResourceTags from '@/components/features/ResourceTags';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Desenvolvimento Rápido',
      description: 'Crie aplicações web modernas em minutos com nossa interface intuitiva'
    },
    {
      icon: Palette,
      title: 'Design Profissional',
      description: 'Templates e temas pré-configurados para resultados impressionantes'
    },
    {
      icon: Smartphone,
      title: 'Totalmente Responsivo',
      description: 'Suas aplicações funcionam perfeitamente em qualquer dispositivo'
    },
    {
      icon: Rocket,
      title: 'Deploy Instantâneo',
      description: 'Publique suas aplicações com um clique e compartilhe com o mundo'
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Floating Animation */}
          <div className="floating-animation mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent px-4">
            Canvas App Creator
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Transforme suas ideias em aplicações web modernas e responsivas. 
            Sem código complexo, apenas criatividade e resultados profissionais.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
            <Link to="/create" className="w-full sm:w-auto">
              <Button size="lg" className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                <Plus size={18} className="mr-2" />
                Criar Novo App
              </Button>
            </Link>
            
            <Link to="/projects" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50">
                <Folder size={18} className="mr-2" />
                Meus Projetos
              </Button>
            </Link>
          </div>

          {/* Resource Tags */}
          <div className="mb-20">
            <ResourceTags />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Por que escolher o Canvas App Creator?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Desenvolvido para criadores que valorizam qualidade, velocidade e simplicidade
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="fade-in hover-scale p-4 sm:p-6 text-center"
                hover
                gradient
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <feature.icon size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de desenvolvedores que já estão criando aplicações incríveis
          </p>
          
          <Link to="/create">
            <Button size="lg" className="px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg pulse-animation">
              <Plus size={18} className="mr-2" />
              Criar Meu Primeiro App
            </Button>
          </Link>
        </div>
      </section>


    </div>
  );
};

export default HomePage;