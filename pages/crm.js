'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import OnboardingModal from '../components/crm/OnboardingModal';
import FilterBar from '../components/crm/FilterBar';
import KanbanBoard from '../components/crm/KanbanBoard';
import ListView from '../components/crm/ListView';
import LeadDetailModal from '../components/crm/LeadDetailModal';
import SidebarToggleIcon from '../components/crm/icons/SidebarToggleIcon';
import { useToggleSidebar } from '../Layout';

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [isLoading, setIsLoading] = useState(true);

  const { toggleSidebar } = useToggleSidebar();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.email) {
      loadLeads(storedUser.email);
    }
    checkFirstVisit();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, priorityFilter]);

  const loadLeads = async (email) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (email !== 'admin@admin.com') {
        query = query.eq('owner_email', email);
      }

      const { data, error } = await query;

      if (error) throw error;

      const leadsFormatados = data.map((lead) => ({
        ...lead,
        nome: lead.full_name,
        procedimento_interesse: lead.interest_procedure,
        prioridade: lead.priority,
        updated_date: lead.updated_at,
        historico_atividades: lead.activity_history,
      }));

      setLeads(leadsFormatados);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirstVisit = () => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('crm_visited_v2');
      if (!hasVisited) {
        setShowOnboarding(true);
        localStorage.setItem('crm_visited_v2', 'true');
      }
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((lead) =>
        lead.nome.toLowerCase().includes(search) ||
        lead.whatsapp?.includes(search) ||
        (lead.procedimento_interesse?.toLowerCase().includes(search))
      );
    }

    if (priorityFilter !== 'todas') {
      filtered = filtered.filter((lead) => lead.prioridade === priorityFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleLeadClick = async (lead) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead.id)
        .single();

      if (error) throw error;

      const leadAtualizado = {
        ...data,
        nome: data.full_name,
        procedimento_interesse: data.interest_procedure,
        prioridade: data.priority,
        updated_date: data.updated_at,
        historico_atividades: data.activity_history,
      };

      setSelectedLead(leadAtualizado);
    } catch (err) {
      console.error('Erro ao buscar lead:', err);
      setSelectedLead(lead);
    }
  };


  const handleSelectLead = (leadId, forceValue = null) => {
    setSelectedLeads((prev) => {
      const isSelected = prev.includes(leadId);
      const shouldSelect = forceValue !== null ? forceValue : !isSelected;

      if (shouldSelect && !isSelected) {
        return [...prev, leadId];
      } else if (!shouldSelect && isSelected) {
        return prev.filter((id) => id !== leadId);
      }
      return prev;
    });
  };

  const handleUpdateLead = async (updatedLead) => {
    try {
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );
      setSelectedLead(updatedLead);
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  const handleMoveLeads = async (leadIds, newStatus) => {
    try {
      console.log('Leads a mover:', leadIds);
      console.log('Novo status:', newStatus);

      const updatedLeads = await Promise.all(
        leads.map(async (lead) => {
          const deveAtualizar = leadIds.includes(lead.id) && lead.status !== newStatus;
          console.log(`Verificando lead ${lead.id} - atualizar?`, deveAtualizar);

          if (deveAtualizar) {
            const novaAtividade = {
              tipo: 'mudanca_status',
              data_hora: new Date().toISOString(),
              status_anterior: lead.status,
              status_novo: newStatus,
              usuario: 'Sistema'
            };

            const historico = [...(lead.historico_atividades || []), novaAtividade];

            console.log(`Atualizando lead ${lead.id} no Supabase...`);

            const { error } = await supabase
              .from('leads')
              .update({
                status: newStatus,
                activity_history: historico
              })
              .eq('id', lead.id);

            console.log('Resultado do update:', {
              id: lead.id,
              status: newStatus,
              historico,
              error
            });


            if (error) {
              console.error(`Erro ao atualizar lead ${lead.id}:`, error);
              throw error;
            }

            return {
              ...lead,
              status: newStatus,
              historico_atividades: historico
            };
          }

          return lead;
        })
      );

      setLeads(updatedLeads);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Erro geral ao mover leads:', error);
    }
  };


  const handleBulkMove = (leadIds, newStatus) => {
    handleMoveLeads(leadIds, newStatus);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#fbfbfb] p-4 md:p-6 flex-1 overflow-auto">
        <div className="max-w-full mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={toggleSidebar}
              className="rounded-full text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
              style={{ margin: '0 15px' }}
              title="Abrir/Fechar Menu"
            >
              <SidebarToggleIcon className="w-6 h-6" />
            </button>
            <div className="bg-[#C1C1C1]" style={{ width: '2px', height: '26px', fontSize: '18px' }}></div>
            <h1 className="h5 fw-medium mb-0" style={{ color: '#374151', fontSize: '1.125rem' }}>CRM</h1>
          </div>
          
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedLeads={selectedLeads}
            onBulkMove={handleBulkMove}
            leads={filteredLeads}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C2946D]"></div>
                <p className="text-gray-500 mt-4">Carregando leads...</p>
              </div>
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              leads={leads}
              filteredLeads={filteredLeads || []}
              onLeadClick={handleLeadClick}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
              onMoveLeads={handleMoveLeads}
            />

          ) : (
            <ListView
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
            />
          )}

          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />

          <LeadDetailModal
            lead={selectedLead}
            isOpen={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
          />
        </div>
      </div>
    </div>
  );
}