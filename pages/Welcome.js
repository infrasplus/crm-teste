import React, { useState, useEffect } from 'react';
import { User } from '@/Entities/User';
import { useRouter } from 'next/router';
import { createPageUrl } from '@/utils/createPageUrl';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';


export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      await User.me();
      setIsLoggedIn(true);
      router.push(createPageUrl('crm'));
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl('crm'));
    } catch (error) {
      console.error('Erro ao iniciar login:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(194, 148, 109, 0.1)' }}>
              <Play className="w-10 h-10" style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Veja como entrar no crm</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Assista ao vídeo tutorial e aprenda como acessar e usar seu crm personalizado
            </p>
          </div>

          {/* Video */}
          <div className="mb-10">
            <div className="relative max-w-3xl mx-auto">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Como usar o crm"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <Play className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              </div>
            </div>
          </div>

          {/* Botão */}
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              size="lg"
              className="px-8 py-4 text-lg font-semibold w-full md:w-auto"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Fazer Login e Acessar crm
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500">
              Você será redirecionado para fazer login com sua conta Google
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
