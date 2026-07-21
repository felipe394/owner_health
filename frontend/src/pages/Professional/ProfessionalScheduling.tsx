import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle2, RefreshCcw, Lock, Unlock, AlertCircle, Users, ArrowLeft } from 'lucide-react';
import { AgendaCalendar } from '../../components/AgendaCalendar';
import { API_URL } from '../../config';

interface AgendaSlot {
  id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'livre' | 'agendado' | 'cancelado';
  paciente_nome?: string;
  criado_por: number;
}

interface Bloqueio {
  id: number;
  mes: number;
  ano: number;
  status: string;
  criado_por: number;
}

export function ProfessionalScheduling() {
  const [agendas, setAgendas] = useState<AgendaSlot[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Perfil e Seleção de Médico
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isSecretary = user?.tipo_profissional !== 'medico';
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(isSecretary ? null : 0);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Form State para criação em massa
  const [diasSemana, setDiasSemana] = useState<number[]>([]); // 0 (Domingo) a 6 (Sábado)
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('11:00');
  const [duracaoConsulta, setDuracaoConsulta] = useState('30'); // em minutos
  const [semanasGerar, setSemanasGerar] = useState('4');

  const diasOptions = [
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
  ];

  const mesesOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (isSecretary && user?.empresa_id) {
      fetch(`${API_URL}/api/companies/${user.empresa_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.professionals) {
          setDoctors(data.professionals.filter((p: any) => p.tipo_profissional === 'medico'));
        }
      })
      .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctorId !== null) {
      fetchData();
    }
  }, [selectedDoctorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Adicionando profissional_id para buscar os dados corretos
      const [resAgendas, resBloqueios] = await Promise.all([
        fetch(`${API_URL}/api/agendas?profissional_id=${selectedDoctorId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/bloqueios?profissional_id=${selectedDoctorId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (resAgendas.ok) setAgendas(await resAgendas.json());
      if (resBloqueios.ok) setBloqueios(await resBloqueios.json());
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDia = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia]);
    }
  };

  const isDateBlocked = (date: Date) => {
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return bloqueios.some(b => b.mes === m && b.ano === y && b.status === 'bloqueado');
  };

  // Helper para mostrar as próximas datas daquele dia da semana (que não tenham horários já criados)
  const getUpcomingDates = (dayOfWeek: number) => {
    const dates = [];
    let current = new Date();
    const limit = parseInt(semanasGerar);
    
    let count = 0;
    let iterations = 0;
    while (count < limit && iterations < 365) {
      if (current.getDay() === dayOfWeek) {
        const localDateStr = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
        const hasSlots = agendas.some(a => a.data.startsWith(localDateStr));
        if (!hasSlots && !isDateBlocked(current)) {
          dates.push(new Date(current));
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    return dates;
  };

  const generateSlots = () => {
    const slots: any[] = [];
    const hoje = new Date();
    const currentDateStr = hoje.toLocaleDateString('en-CA');
    const currentTimeStr = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;
    hoje.setHours(0,0,0,0);

    diasSemana.forEach(dia => {
      const validDates = getUpcomingDates(dia);
      
      validDates.forEach(dataAtual => {
        // Garantir uso da string local para o banco
        const localDateStr = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth()+1).padStart(2,'0')}-${String(dataAtual.getDate()).padStart(2,'0')}`;

        let horaAtualStr = horaInicio;
        while (horaAtualStr < horaFim) {
           const [h, m] = horaAtualStr.split(':').map(Number);
           const inicioData = new Date();
           inicioData.setHours(h, m, 0);
           
           const fimData = new Date(inicioData.getTime() + parseInt(duracaoConsulta) * 60000);
           const horaFimStr = `${String(fimData.getHours()).padStart(2, '0')}:${String(fimData.getMinutes()).padStart(2, '0')}`;
           
           const isPast = localDateStr === currentDateStr && horaAtualStr <= currentTimeStr;

           if (horaFimStr <= horaFim && !isPast) {
             slots.push({
               data: localDateStr,
               hora_inicio: horaAtualStr,
               hora_fim: horaFimStr
             });
           }
           horaAtualStr = horaFimStr;
        }
      });
    });

    return slots;
  };

  const handleCreateAgendas = async () => {
    if (diasSemana.length === 0) {
      alert('Selecione pelo menos um dia da semana.');
      return;
    }
    if (horaInicio >= horaFim) {
      alert('A hora de início deve ser menor que a hora de fim.');
      return;
    }

    const slotsToCreate = generateSlots();
    if (slotsToCreate.length === 0) {
      alert('Nenhum horário gerado. Verifique se as datas escolhidas não estão bloqueadas ou se o intervalo de tempo é válido.');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const profIdLocal = localStorage.getItem('profissional_id') || '0'; 
      
      const response = await fetch(`${API_URL}/api/agendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ profissional_id: profIdLocal, slots: slotsToCreate })
      });

      if (response.ok) {
        setSuccessMsg(`✅ ${slotsToCreate.length} horários criados com sucesso!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchData();
        setDiasSemana([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este horário?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/agendas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDaySlots = async (dateStr: string) => {
    const slotsToDelete = agendas.filter(a => a.data.startsWith(dateStr) && a.status === 'livre');
    if (slotsToDelete.length === 0) return;
    if (!window.confirm(`Excluir todos os ${slotsToDelete.length} horários livres do dia?`)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        slotsToDelete.map(slot => 
          fetch(`${API_URL}/api/agendas/${slot.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }})
        )
      );
      fetchData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleBookPatient = async (id: number) => {
    const pacienteNome = window.prompt('Digite o nome do paciente para agendar:');
    if (!pacienteNome || pacienteNome.trim() === '') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/agendas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'agendado', paciente_nome: pacienteNome })
      });
      
      if (response.ok) {
        fetchData();
      } else {
        alert('Erro ao agendar paciente.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao agendar paciente.');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/agendas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'livre', paciente_nome: null })
      });
      
      if (response.ok) {
        fetchData();
      } else {
        alert('Erro ao cancelar agendamento.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao cancelar agendamento.');
    }
  };

  const toggleMonthLock = async (mes: number, ano: number, bloqueioExistente?: Bloqueio) => {
    try {
      const token = localStorage.getItem('token');
      const profIdLocal = localStorage.getItem('profissional_id') || '0';

      if (bloqueioExistente) {
        if (!window.confirm(`Deseja ABRIR a agenda de ${mesesOptions[mes-1]}/${ano}?`)) return;
        await fetch(`${API_URL}/api/bloqueios/${bloqueioExistente.id}/abrir`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        if (!window.confirm(`Deseja FECHAR a agenda de ${mesesOptions[mes-1]}/${ano}?`)) return;
        await fetch(`${API_URL}/api/bloqueios/fechar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ profissional_id: profIdLocal, mes, ano })
        });
      }
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Geração da lista de meses futuros para bloqueio
  const futureMonths = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    futureMonths.push({ mes: currentDate.getMonth() + 1, ano: currentDate.getFullYear() });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  if (isSecretary && selectedDoctorId === null) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Selecione o Médico</h1>
          <p className="text-slate-500">Escolha um médico da clínica para gerenciar a agenda.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoctorId(doc.id)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col items-center text-center gap-4 group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{doc.nome}</h3>
                <p className="text-slate-500 text-sm">{doc.especialidade || 'Clínico Geral'} - CRM: {doc.crm}</p>
              </div>
              <button className="mt-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                Gerenciar Agenda
              </button>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-500">Nenhum médico vinculado à sua clínica.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <div className="flex items-center gap-4 mb-2">
          {isSecretary && (
            <button onClick={() => setSelectedDoctorId(null)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-slate-800">
            {isSecretary ? `Agenda de ${selectedDoctor?.nome}` : 'Minha Agenda Profissional'}
          </h1>
        </div>
        <p className="text-slate-500 ml-12">Configure seus horários de atendimento e bloqueios mensais.</p>
      </div>

      {/* PAINEL DE BLOQUEIOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Controle de Abertura de Agenda</h2>
            <p className="text-sm text-slate-500">Feche ou abra meses inteiros para novas marcações</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {futureMonths.map((fm, idx) => {
            const bloqueio = bloqueios.find(b => b.mes === fm.mes && b.ano === fm.ano);
            const isBlocked = !!bloqueio;
            const isRequested = bloqueio?.status === 'desbloqueio_solicitado';

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isBlocked ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-bold text-slate-700">{mesesOptions[fm.mes - 1]}</span>
                <span className="text-xs text-slate-400 font-medium">{fm.ano}</span>
                
                <button
                  onClick={() => toggleMonthLock(fm.mes, fm.ano, bloqueio)}
                  className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold w-full flex items-center justify-center gap-1.5 ${
                    isBlocked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {isBlocked ? (
                    isRequested ? <><AlertCircle size={14}/> Solicitado</> : <><Lock size={14} /> Fechado</>
                  ) : (
                    <><Unlock size={14} /> Aberto</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* GERADOR DE HORÁRIOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Gerar Horários em Lote</h2>
            <p className="text-sm text-slate-500">Crie regras de repetição para automatizar sua agenda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Selecione os Dias da Semana</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {diasOptions.map(dia => {
                const isSelected = diasSemana.includes(dia.value);
                const upcoming = getUpcomingDates(dia.value);
                
                return (
                  <button
                    key={dia.value}
                    onClick={() => handleToggleDia(dia.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="font-bold mb-1.5">{dia.label}</div>
                    <div className="space-y-1">
                      {upcoming.map((date, idx) => {
                        const blocked = isDateBlocked(date);
                        return (
                          <div 
                            key={idx} 
                            className={`text-[10px] font-medium flex items-center justify-between px-1.5 py-0.5 rounded ${
                              blocked 
                                ? 'line-through text-red-300 bg-red-500/10' 
                                : isSelected ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            {blocked && <Lock size={10} />}
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hora Início</label>
              <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hora Fim</label>
              <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duração (min)</label>
              <select value={duracaoConsulta} onChange={e => setDuracaoConsulta(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Período</label>
              <select value={semanasGerar} onChange={e => setSemanasGerar(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                <option value="1">1 semana</option>
                <option value="4">4 semanas (1 mês)</option>
                <option value="12">12 semanas (3 meses)</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleCreateAgendas} disabled={creating} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
          {creating ? 'Salvando...' : <><Plus size={20} /> Gerar Disponibilidade (Horários Livres)</>}
        </button>
        {successMsg && <p className="mt-4 text-emerald-600 font-medium flex items-center gap-2"><CheckCircle2 size={18} /> {successMsg}</p>}
      </div>

      {/* LISTA DE HORÁRIOS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Próximos Horários</h2>
            <p className="text-sm text-slate-500">Acompanhe sua disponibilidade e marcações</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Carregando agenda...</div>
        ) : (
          <AgendaCalendar 
            agendas={agendas} 
            bloqueios={bloqueios} 
            onDeleteSlot={handleDelete}
            onBookSlot={handleBookPatient}
            onCancelBooking={handleCancelBooking}
            onDeleteDaySlots={handleDeleteDaySlots}
          />
        )}
      </div>
    </div>
  );
}
