import React from 'react';
import { Phone, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadCard({
  lead,
  onClick,
  isSelected,
  onSelect,
  isDragging = false
}) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return {
          border: 'border-amber-300',
          bg: 'bg-amber-50',
          text: 'text-amber-800'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-100',
          text: 'text-gray-800'
        };
    }
  };

  const safeNome = lead?.nome || 'Sem nome';
  const safeWhatsapp = lead?.whatsapp || '---';
  const safeProcedimento = lead?.procedimento_interesse || null;
  const safeValor = typeof lead?.estimated_value === 'number' ? lead.estimated_value : null;

  return (
    <div
      className={`
    bg-white rounded-xl p-4 cursor-pointer
    transition-all duration-200 hover:shadow-sm
    group relative
    ${isSelected ? 'ring-2 ring-[#e6c39c]' : ''}
    ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
  `}
      onClick={(e) => {
        if (e.target.type === 'checkbox') return;
        onClick(lead);
      }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(lead.id);
          }}
          className={`
        absolute left-0 top-1/2 transform -translate-y-1/2
        opacity-0 group-hover:opacity-100 transition-opacity
        w-4 h-4 rounded border-gray-300
        appearance-none
        checked:bg-[#e7c39c] checked:border-[#e7c39c]
        focus:ring-0

        // Adicionando a borda no hover APENAS se o checkbox não estiver selecionado
        ${isSelected ? '' : 'group-hover:border-2 group-hover:border-[#8a8a8a]'}
      `}
        />

        <h3
          className={`
        text-sm mb-3 font-semibold pl-0 group-hover:pl-6
        transition-all duration-150
      `}
        >
          {safeNome}
        </h3>
      </div>





      {/* WhatsApp */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Phone className="w-4 h-4" />
        <span className="text-gray-400">{safeWhatsapp}</span>
      </div>

      {/* Último contato */}
      {
        lead.data_ultimo_contato && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-gray-400 font-medium transition-colors">
              {format(new Date(lead.data_ultimo_contato), "dd 'de' MMM", {
                locale: ptBR
              })}
            </span>
          </div>
        )
      }

      {/* Procedimento */}
      {
        safeProcedimento && (
          <div className="space-y-1 mb-3">
            <p className="text-sm font-medium text-gray-700">{safeProcedimento}</p>
            {safeValor !== null && (
              <p className="text-sm font-semibold" style={{ color: '#428627' }}>
                R${' '}
                {safeValor.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </p>
            )}
          </div>
        )
      }
    </div >
  );
}