import React from 'react';
import { Phone, Calendar, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ListView({ 
  leads, 
  onLeadClick, 
  selectedLeads, 
  onSelectLead 
}) {
  const getStatusInfo = (status) => {
    const statusMap = {
      nova_conversa: { label: 'Nova Conversa', color: 'bg-blue-100 text-blue-800', isAI: true },
      lead_interessado: { label: 'Lead Interessado', color: 'bg-green-100 text-green-800', isAI: true },
      agendado: { label: 'Agendado', color: 'bg-purple-100 text-purple-800', isAI: true },
      cancelou: { label: 'Cancelou', color: 'bg-red-100 text-red-800', isAI: true },
      reagendou: { label: 'Reagendou', color: 'bg-yellow-100 text-yellow-800', isAI: true },
      compareceu: { label: 'Compareceu', color: 'bg-indigo-100 text-indigo-800', isAI: false },
      vendeu_procedimento: { label: 'Vendeu', color: 'bg-emerald-100 text-emerald-800', isAI: false },
      relacionamento: { label: 'Relacionamento', color: 'bg-amber-100 text-amber-800', isAI: false }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', isAI: false };
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'alta') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const formatWhatsApp = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return number;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 rounded border-gray-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      leads.forEach(lead => onSelectLead(lead.id, true));
                    } else {
                      leads.forEach(lead => onSelectLead(lead.id, false));
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">WhatsApp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Procedimento</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Último Contato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => {
              const statusInfo = getStatusInfo(lead.status);
              
              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedLeads.includes(lead.id) ? 'bg-amber-50' : ''
                  }`}
                  onClick={(e) => {
                    if (e.target.type === 'checkbox') return;
                    onLeadClick(lead);
                  }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead.id);
                      }}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{lead.nome}</span>
                      {getPriorityIcon(lead.prioridade)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {formatWhatsApp(lead.whatsapp)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.isAI && <Sparkles className="w-3 h-3 mr-1" />}
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {lead.procedimento_interesse || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    {lead.valor_estimado 
                      ? `R$ ${lead.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {lead.data_ultimo_contato 
                      ? format(new Date(lead.data_ultimo_contato), "dd/MM/yyyy", { locale: ptBR })
                      : '-'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Nenhum lead encontrado</p>
        </div>
      )}
    </div>
  );
}