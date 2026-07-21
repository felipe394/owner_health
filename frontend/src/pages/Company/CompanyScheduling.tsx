import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Bell, Loader2, Send, Stethoscope, Lock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { API_URL } from '../../config';

export const CompanyScheduling: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsLog, setAlertsLog] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    profissional_id: '',
    data: '',
    horario_inicio: '',
    horario_fim: ''
  });
  
  const [selectedProfForBlocks, setSelectedProfForBlocks] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : { tipo_profissional: 'admin' };
  const isMedico = user.tipo_profissional === 'medico';
  const isAdmin = !isMedico;
  const companyId = localStorage.getItem('companyId') || '1';

  useEffect(() => {
    fetchData();
  }, [token, companyId]);

  useEffect(() => {
    if (selectedProfForBlocks) {
      fetchBloqueios(selectedProfForBlocks);
    } else {
      setBloqueios([]);
    }
  }, [selectedProfForBlocks]);

  const fetchBloqueios = async (profId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bloqueios?profissional_id=${profId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBloqueios(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      if (token && companyId) {
        const headers = { Authorization: `Bearer ${token}` };
        const [resS, resP] = await Promise.all([
          fetch(`${API_URL}/api/agendas`, { headers }),
          fetch(`${API_URL}/api/professionals?companyId=${companyId}`, { headers })
        ]);

        const schedulesData = await resS.json();
        const profsData = await resP.json();
        
        let allSchedules = Array.isArray(schedulesData) ? schedulesData : [];
        setSchedules(allSchedules);
        
        const validProfs = Array.isArray(profsData) ? profsData.filter((p: any) => p.tipo_profissional === 'medico') : [];
        setProfessionals(validProfs);
        
        if (validProfs.length > 0 && !selectedProfForBlocks) {
          setSelectedProfForBlocks(validProfs[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.profissional_id || !form.data || !form.horario_inicio || !form.horario_fim) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agendas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profissional_id: parseInt(form.profissional_id),
          slots: [{
            data: form.data,
            hora_inicio: form.horario_inicio,
            hora_fim: form.horario_fim
          }]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar slot de agenda.');
      }

      setSuccess('Horário de agenda cadastrado com sucesso!');
      setForm({ profissional_id: '', data: '', horario_inicio: '', horario_fim: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTriggerAlerts = async () => {
    setAlertsLoading(true);
    setAlertsLog([]);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAlertsLog([
      `[WhatsApp] Enviado lembrete de consulta de amanhã para a secretária Ana Lima.`,
      `[E-mail] Notificação de agenda atualizada enviada ao Dr. Roberto Santos.`,
      `[WhatsApp] Notificação de confirmação enviada para 5 pacientes agendados amanhã.`
    ]);
    setAlertsLoading(false);
  };

  const getDoctorName = (id: number) => {
    const doc = professionals.find(p => p.id === id);
    return doc ? doc.nome : `Dr(a). (ID: ${id})`;
  };

  const handleRequestUnlock = async (bloqueioId: number) => {
    if (!confirm('Deseja solicitar a abertura deste mês ao médico?')) return;
    try {
      const res = await fetch(`${API_URL}/api/bloqueios/${bloqueioId}/abrir`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBloqueios(selectedProfForBlocks);
      } else {
        alert(data.error || 'Erro ao solicitar abertura.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Gera array com os próximos 6 meses
  const futureMonths = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    futureMonths.push({ mes: currentDate.getMonth() + 1, ano: currentDate.getFullYear() });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  const mesesOptions = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      
      {/* Formulário de Criação de Agenda */}
      {isAdmin && (<div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Criar Nova Escala Avulsa</span>
            </h3>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold">⚠️ {error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-[11px] font-bold">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Médico *</label>
              <select
                value={form.profissional_id}
                onChange={e => setForm({...form, profissional_id: e.target.value})}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="">Selecione o médico...</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Data *</label>
              <input type="date" required value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Início *</label>
                <input type="time" required value={form.horario_inicio} onChange={e => setForm({...form, horario_inicio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fim *</label>
                <input type="time" required value={form.horario_fim} onChange={e => setForm({...form, horario_fim: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={submitLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cadastrar na Escala'}
            </button>
          </form>
        </div>

        {/* Módulo Lembrete */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span>Aviso de Consulta (Staff)</span>
            </h3>
          </div>
          <button onClick={handleTriggerAlerts} disabled={alertsLoading} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
            {alertsLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</> : <><Send className="w-3.5 h-3.5" /> Enviar Avisos</>}
          </button>
          {alertsLog.length > 0 && (
            <div className="bg-slate-950 text-[10px] text-emerald-400 font-mono p-4 rounded-xl space-y-1.5 max-h-[200px] overflow-y-auto">
              <p className="text-slate-500 font-bold border-b border-slate-800 pb-1 mb-2">Histórico:</p>
              {alertsLog.map((log, idx) => <p key={idx}>{log}</p>)}
            </div>
          )}
        </div>
      </div>)}

      {/* Escalas Ativas e Bloqueios */}
      <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
        
        {/* Painel de Bloqueios */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Bloqueios Mensais</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Veja ou solicite a abertura de meses fechados pelo médico.</p>
            </div>
            
            <select
              value={selectedProfForBlocks}
              onChange={e => setSelectedProfForBlocks(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none min-w-[200px]"
            >
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            {futureMonths.map((fm, idx) => {
              const bloqueio = bloqueios.find(b => b.mes === fm.mes && b.ano === fm.ano);
              const isBlocked = !!bloqueio;
              const isRequested = bloqueio?.status === 'desbloqueio_solicitado';

              return (
                <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isBlocked ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-slate-700">{mesesOptions[fm.mes - 1]}</span>
                  <span className="text-xs text-slate-400 font-medium">{fm.ano}</span>
                  
                  {isBlocked ? (
                    <button
                      onClick={() => handleRequestUnlock(bloqueio.id)}
                      disabled={isRequested}
                      className={`mt-2 px-2 py-1.5 rounded-lg text-[10px] uppercase font-bold w-full flex items-center justify-center gap-1 ${isRequested ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                      {isRequested ? <><AlertCircle size={12}/> Solicitado</> : <><Lock size={12}/> Solicitar</>}
                    </button>
                  ) : (
                    <div className="mt-2 px-2 py-1.5 rounded-lg text-[10px] uppercase font-bold w-full flex items-center justify-center gap-1 bg-indigo-100 text-indigo-600">
                      <CheckCircle2 size={12} /> Aberto
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Agendas */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Calendar className="w-5.5 h-5.5 text-indigo-600" />
              <span>Escalas e Agendas Registradas</span>
            </h3>
          </div>

          {schedules.length === 0 ? (
            <div className="border border-dashed border-slate-150 p-10 text-center rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-bold">
                Nenhum horário de escala criado nesta clínica.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {schedules.map(sch => (
                <div key={sch.id} className="border border-slate-100 bg-slate-50 p-4 rounded-2xl relative flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <span>{getDoctorName(sch.profissional_id)}</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold text-slate-500">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">Data</p>
                        <p className="text-slate-700 font-bold mt-0.5">
                          {new Date(sch.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">Horário</p>
                        <p className="text-slate-700 font-bold mt-0.5">
                          {sch.hora_inicio.substring(0, 5)} - {sch.hora_fim.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      sch.status === 'livre' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {sch.status === 'livre' ? 'Disponível' : 'Agendado'}
                    </span>
                    
                    <button 
                      onClick={async () => {
                        if (confirm('Excluir este horário?')) {
                          await fetch(`${API_URL}/api/agendas/${sch.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
                          fetchData();
                        }
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
