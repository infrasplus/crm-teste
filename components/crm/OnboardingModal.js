import React from 'react';
import { Sparkles } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(194, 148, 109, 0.1)'}}>
          <Sparkles className="w-8 h-8" style={{color: '#C2946D'}} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo ao seu novo crm!
        </h2>
        
        <p className="text-gray-600 leading-relaxed mb-6">
          Sua área de trabalho inteligente para organizar contatos do WhatsApp.
        </p>
        
        <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 mr-3 mt-1 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-800">IA</span>
            <span>As etapas marcadas com <strong className="font-semibold">"IA"</strong> são atualizadas automaticamente.</span>
          </p>
          <p className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 mr-3 mt-1 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-800">M</span>
            <span>As etapas <strong className="font-semibold">"Manual"</strong> são para você arrastar e organizar os leads.</span>
          </p>
        </div>
        
        <div className="mt-8">
          <button
            onClick={onClose}
            className="px-8 py-3 w-full sm:w-auto text-base bg-[#C2946D] text-white rounded-md hover:bg-[#B08356] transition-colors font-medium"
          >
            Começar a usar
          </button>
        </div>
      </div>
    </div>
  );
}