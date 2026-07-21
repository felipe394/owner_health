import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, Trash2, User, XCircle } from 'lucide-react';

interface AgendaSlot {
  id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'livre' | 'agendado' | 'cancelado';
  paciente_nome?: string;
  cliente_id?: number;
  criado_por: number;
}

interface Bloqueio {
  id: number;
  mes: number;
  ano: number;
  status: string;
}

interface CalendarProps {
  agendas: AgendaSlot[];
  bloqueios: Bloqueio[];
  onDeleteSlot: (id: number) => void;
  onBookSlot: (id: number) => void;
  onCancelBooking: (id: number) => void;
  onDeleteDaySlots?: (dateStr: string) => void;
}

export function AgendaCalendar({ agendas, bloqueios, onDeleteSlot, onBookSlot, onCancelBooking, onDeleteDaySlots }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const getMonthName = (m: number) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[m];
  };

  const isMonthBlocked = bloqueios.some(b => b.mes === month + 1 && b.ano === year && b.status === 'bloqueado');

  const getDayStatus = (day: number) => {
    if (isMonthBlocked) return 'blocked';
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySlots = agendas.filter(a => a.data.startsWith(dateStr));
    
    if (daySlots.length === 0) return 'empty';
    
    const hasBooked = daySlots.some(s => s.status === 'agendado');
    if (hasBooked) return 'booked';
    
    return 'available';
  };

  const selectedSlots = selectedDate 
    ? agendas.filter(a => a.data.startsWith(selectedDate)).sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio))
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:w-2/3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 capitalize">{getMonthName(month)} {year}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="p-2 sm:p-4"></div>;
            
            const status = getDayStatus(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isPastDate = dateStr < todayStr;
            
            let bgClass = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';
            if (status === 'blocked' || isPastDate) bgClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            else if (status === 'booked') bgClass = 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
            else if (status === 'available') bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';

            if (isSelected) {
              bgClass += ' ring-2 ring-indigo-500 ring-offset-2';
            }

            return (
              <button 
                key={day} 
                onClick={() => {
                  if (status !== 'blocked' && !isPastDate) setSelectedDate(dateStr);
                }}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border transition-all ${bgClass}`}
              >
                <span className="font-semibold text-sm sm:text-base">{day}</span>
                {status === 'booked' && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
                {status === 'available' && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div> Disponível</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></div> Reservado</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div> Bloqueado</div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:w-1/3 flex flex-col h-full min-h-[400px]">
        {selectedDate ? (
          <>
            <h3 className="font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200 flex items-center justify-between">
              Horários do Dia
              <div className="flex items-center gap-3">
                {onDeleteDaySlots && selectedSlots.some(s => s.status === 'livre') && (
                  <button 
                    onClick={() => onDeleteDaySlots(selectedDate)} 
                    className="text-xs flex items-center gap-1 font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border border-red-200"
                    title="Excluir todos os horários livres deste dia"
                  >
                    <Trash2 size={14}/> Limpar Dia
                  </button>
                )}
                <span className="text-sm font-normal text-slate-500">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {selectedSlots.length > 0 ? (
                selectedSlots.map(slot => (
                  <div key={slot.id} className={`p-3 rounded-xl border transition-all ${slot.status === 'livre' ? 'bg-white border-emerald-100 shadow-sm' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 text-sm">
                        <Clock size={14} className={slot.status === 'livre' ? 'text-emerald-500' : 'text-amber-500'} />
                        {slot.hora_inicio.substring(0, 5)} - {slot.hora_fim.substring(0, 5)}
                      </div>
                    </div>
                    
                    {slot.status === 'livre' ? (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Livre</span>
                        <div className="flex items-center gap-1">
                           <button onClick={() => onBookSlot(slot.id)} className="text-xs flex items-center gap-1 font-medium text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"><Plus size={14}/> Agendar</button>
                           <button onClick={() => onDeleteSlot(slot.id)} className="text-xs flex items-center gap-1 font-medium text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {slot.paciente_nome && (
                          <div className="flex items-center gap-1.5 text-slate-700 text-sm mb-2 bg-white/50 p-1.5 rounded-lg border border-amber-100">
                            <User size={14} className="text-slate-400" />
                            {slot.cliente_id ? (
                              <a href={`/professional/patients/${slot.cliente_id}`} className="font-semibold truncate text-indigo-600 hover:text-indigo-800 hover:underline transition">
                                {slot.paciente_nome}
                              </a>
                            ) : (
                              <span className="font-semibold truncate">{slot.paciente_nome}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-xs font-medium text-amber-700">Reservado</span>
                           <button onClick={() => onCancelBooking(slot.id)} className="text-xs flex items-center gap-1 font-medium text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"><XCircle size={14}/> Desmarcar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center gap-2">
                   <Clock size={32} className="text-slate-300" />
                   Nenhum horário cadastrado.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Plus size={32} className="text-slate-300" />
            </div>
            <p className="font-medium text-slate-600 mb-1">Selecione um dia</p>
            <p className="text-sm text-slate-400">Clique em uma data no calendário para ver e gerenciar os horários.</p>
          </div>
        )}
      </div>
    </div>
  );
}
