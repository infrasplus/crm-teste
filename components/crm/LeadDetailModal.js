import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Phone, Calendar, FileText, User, AlertCircle, MessageSquare, History, Plus, Copy, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LeadDetailModal({ lead, isOpen, onClose, onUpdate }) {
  const [editedLead, setEditedLead] = useState(lead || {});
  const [isEditing, setIsEditing] = useState(false);
  const [novaObservacao, setNovaObservacao] = useState('');
  const [isAddingObservacao, setIsAddingObservacao] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    if (lead) setEditedLead(lead);
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSave = async () => {
    if (!editedLead?.id) return;

    console.log('Valores que serão salvos:', editedLead);

    let novoHistorico = editedLead.activity_history || [];

    if (editedLead.status !== lead.status) {
      novoHistorico = [
        ...novoHistorico,
        {
          tipo: 'mudanca_status',
          data_hora: new Date().toISOString(),
          status_anterior: lead.status,
          status_novo: editedLead.status,
          usuario: currentUser?.email || 'Sistema'
        }
      ];
    }

    const { error } = await supabase
      .from('leads')
      .update({
        status: editedLead.status,
        priority: editedLead.priority,
        last_contact_date: editedLead.last_contact_date,
        interest_procedure: editedLead.interest_procedure,
        estimated_value: editedLead.estimated_value,
        source: editedLead.source,
        whatsapp: editedLead.whatsapp,
        activity_history: novoHistorico
      })
      .eq('id', editedLead.id);

    if (error) {
      console.error('Erro ao atualizar lead:', error);
      return;
    }

    onUpdate({ ...editedLead, activity_history: novoHistorico });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
  };

  const handleAddObservacao = async () => {
    if (!novaObservacao.trim()) return;

    const novaAtividade = {
      tipo: 'observacao_manual',
      data_hora: new Date().toISOString(),
      observacao: novaObservacao,
      usuario: currentUser?.email || 'Sistema'
    };

    const novoHistorico = [
      ...(editedLead.activity_history || []),
      novaAtividade
    ];

    const { error } = await supabase
      .from('leads')
      .update({ activity_history: novoHistorico })
      .eq('id', editedLead.id);

    if (error) {
      console.error('Erro ao salvar observação:', error);
      return;
    }

    const updatedLead = { ...editedLead, activity_history: novoHistorico };
    setEditedLead(updatedLead);
    onUpdate(updatedLead);
    setNovaObservacao('');
    setIsAddingObservacao(false);
  };

  const openWhatsApp = (number) => {
    if (!number) return;
    const clean = number.replace(/\D/g, '');
    const formatted = clean.startsWith('55') ? clean : `55${clean}`;
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  const copyNumberToClipboard = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      console.error('Erro ao copiar número');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      new_conversation: { label: 'Nova Conversa', color: 'bg-blue-100 text-blue-800' },
      interested_lead: { label: 'Lead Interessado', color: 'bg-green-100 text-green-800' },
      scheduled: { label: 'Agendado', color: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelou', color: 'bg-red-100 text-red-800' },
      rescheduled: { label: 'Reagendou', color: 'bg-yellow-100 text-yellow-800' },
      showed_up: { label: 'Compareceu', color: 'bg-indigo-100 text-indigo-800' },
      sold_procedure: { label: 'Vendeu Procedimento', color: 'bg-emerald-100 text-emerald-800' },
      relationship: { label: 'Relacionamento', color: 'bg-amber-100 text-amber-800' }
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return { ...info, isAI: Object.keys(statusMap).includes(status) };
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      high: { label: 'Alta Prioridade', color: 'bg-red-50 text-red-800', icon: AlertCircle },
      medium: { label: 'Prioridade Média', color: 'bg-yellow-50 text-yellow-800', icon: null },
      low: { label: 'Baixa Prioridade', color: 'bg-gray-50 text-gray-800', icon: null }
    };
    return priorityMap[priority] || { label: 'Prioridade Desconhecida', color: 'bg-gray-50 text-gray-800', icon: null };
  };

  const statusInfo = getStatusInfo(editedLead.status);
  const priorityInfo = getPriorityInfo(editedLead.priority);
  const historico = editedLead.activity_history || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex">

        {/* Sidebar - Informações Fixas */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{lead.full_name}</h2>
              <div className="flex flex-col gap-1 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${statusInfo.color}`}>
                  {statusInfo.isAI && <span className="mr-1">✨</span>}
                  {statusInfo.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${priorityInfo.color}`}>
                  {priorityInfo.icon && <priorityInfo.icon className="w-3 h-3" />}
                  {priorityInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Data de Criação */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Criação
            </h4>
            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
              {lead.created_at ? (
                format(parseISO(lead.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              ) : (
                "Data não disponível"
              )}
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </h4>
            {isEditing ? (
              <input
                type="text"
                value={editedLead.whatsapp || ''}
                onChange={(e) => setEditedLead({ ...editedLead, whatsapp: e.target.value })}
                placeholder="(XX) XXXXX-XXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            ) : (
              <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.whatsapp}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyNumberToClipboard(lead.whatsapp)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar número"
                  >
                    {copiedNumber ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => openWhatsApp(lead.whatsapp)}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    title="Abrir no WhatsApp">

                    <img
                      src="https://img.icons8.com/?size=256&id=85088&format=png"
                      alt="WhatsApp"
                      className="w-4 h-4" />

                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Detalhes do Lead</h3>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Campos Editáveis */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações Editáveis
              </h4>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procedimento de Interesse
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedLead.interest_procedure || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, interest_procedure: e.target.value })}
                      placeholder="Ex: Botox, Preenchimento labial..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {editedLead.interest_procedure || 'Não informado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Estimado
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedLead.estimated_value || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, estimated_value: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {editedLead.estimated_value ?
                        `R$ ${editedLead.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                        'Não informado'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Priority and Status */}
              {isEditing && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={editedLead.priority || 'medium'}
                      onChange={(e) => setEditedLead({ ...editedLead, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editedLead.status || 'new_conversation'}
                      onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new_conversation">Nova Conversa</option>
                      <option value="interested_lead">Lead Interessado</option>
                      <option value="scheduled">Agendado</option>
                      <option value="cancelled">Cancelou</option>
                      <option value="rescheduled">Reagendou</option>
                      <option value="showed_up">Compareceu</option>
                      <option value="sold_procedure">Vendeu Procedimento</option>
                      <option value="relationship">Relacionamento</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de Atividades */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Atividades
                </h4>
                <button
                  onClick={() => setIsAddingObservacao(true)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Observação
                </button>
              </div>

              {/* Form para nova observação */}
              {isAddingObservacao && (
                <div className="bg-gray-50 p-4 rounded-lg border border-blue-100">
                  <textarea
                    value={novaObservacao}
                    onChange={(e) => setNovaObservacao(e.target.value)}
                    placeholder="Digite sua observação sobre este lead..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddObservacao}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Salvar Observação
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingObservacao(false);
                        setNovaObservacao('');
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista do histórico */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historico.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma atividade registrada ainda</p>
                  </div>
                ) : (
                  historico
                    .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
                    .map((atividade, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {atividade.tipo === 'mudanca_status' ? (
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <History className="w-3 h-3 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-3 h-3 text-green-600" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {atividade.tipo === 'mudanca_status' ? 'Mudança de Status' : 'Observação Manual'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(atividade.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        {atividade.tipo === 'mudanca_status' ? (
                          <p className="text-sm text-gray-600">
                            Status alterado de <span className="font-medium">{getStatusInfo(atividade.status_anterior).label}</span> para{' '}
                            <span className="font-medium">{getStatusInfo(atividade.status_novo).label}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-700">{atividade.observacao}</p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          Por: {atividade.usuario}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {isEditing && (
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}