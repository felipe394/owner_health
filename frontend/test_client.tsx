import React, { useState, useEffect } from 'react';
import {
  ClipboardList, CheckCircle, Loader2, ChevronRight, ChevronLeft,
  Send, AlertCircle, Circle, CheckSquare, Type, AlignLeft,
  BarChart3, Calendar, List, RotateCcw, FileText
} from 'lucide-react';
import { API_URL } from '../../config';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'scale' | 'date';

interface Option { id: number; texto: string; ordem: number; }
interface Question {
  id: number; section_id: number; texto: string; tipo: QuestionType;
  obrigatoria: boolean; ordem: number; placeholder: string; descricao: string;
  escala_min?: number; escala_max?: number;
  escala_label_min?: string; escala_label_max?: string;
  parent_option_id?: number;
  options?: Option[];
}
interface Section {
  id: number; titulo: string; descricao: string; ordem: number;
  questions: Question[];
}
interface AnamnesisRequest {
  id: number; empresa_id: number; cliente_id: number;
  medico_id?: number; status: 'aguardando' | 'concluido';
  criado_em: string; respondido_em?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────



const TIPO_ICON: Record<QuestionType, React.ReactNode> = {
  text:     <Type className="w-3.5 h-3.5" />,
  textarea: <AlignLeft className="w-3.5 h-3.5" />,
  radio:    <Circle className="w-3.5 h-3.5" />,
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  select:   <List className="w-3.5 h-3.5" />,
  scale:    <BarChart3 className="w-3.5 h-3.5" />,
  date:     <Calendar className="w-3.5 h-3.5" />,
};

// ─── Question Renderer ────────────────────────────────────────────────────────

interface QuestionFieldProps {
  question: Question;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  error?: boolean;
}

const QuestionField: React.FC<QuestionFieldProps> = ({ question, value, onChange, error }) => {
  const inputBase = `w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition ${
    error ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-500/10' : 'border-slate-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10'
  }`;

  switch (question.tipo) {
    case 'text':
      return (
        <input
          type="text"
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Sua resposta...'}
          className={inputBase}
        />
      );

    case 'textarea':
      return (
        <textarea
          rows={4}
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Sua resposta detalhada...'}
          className={`${inputBase} resize-none`}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value as string}
          onChange={e => onChange(e.target.value)}
          className={inputBase}
        />
      );

    case 'radio':
      return (
        <div className="space-y-2.5">
          {(question.options || []).map(opt => {
            const selected = value === opt.texto;
            return (
              <button
                key={opt.id}
                onClick={() => onChange(opt.texto)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-violet-500 bg-violet-50'
                    : error ? 'border-red-200 bg-red-50/30 hover:border-red-300' : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                  selected ? 'border-violet-500 bg-violet-500' : 'border-slate-300'
                }`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-semibold ${selected ? 'text-violet-700' : 'text-slate-700'}`}>
                  {opt.texto}
                </span>
              </button>
            );
          })}
        </div>
      );

    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2.5">
          {(question.options || []).map(opt => {
            const checked = selected.includes(opt.texto);
            return (
              <button
                key={opt.id}
                onClick={() => {
                  const newVal = checked
                    ? selected.filter(v => v !== opt.texto)
                    : [...selected, opt.texto];
                  onChange(newVal);
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  checked
                    ? 'border-violet-500 bg-violet-50'
                    : error ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                  checked ? 'border-violet-500 bg-violet-500' : 'border-slate-300'
                }`}>
                  {checked && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <span className={`text-sm font-semibold ${checked ? 'text-violet-700' : 'text-slate-700'}`}>
                  {opt.texto}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case 'select':
      return (
        <select
          value={value as string}
          onChange={e => onChange(e.target.value)}
          className={`${inputBase} cursor-pointer`}
        >
          <option value="">Selecione uma opção...</option>
          {(question.options || []).map(opt => (
            <option key={opt.id} value={opt.texto}>{opt.texto}</option>
          ))}
        </select>
      );

    case 'scale': {
      const min = question.escala_min || 1;
      const max = question.escala_max || 10;
      const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      const currentVal = Number(value) || 0;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {nums.map(n => (
              <button
                key={n}
                onClick={() => onChange(String(n))}
                className={`flex-1 min-w-[36px] h-11 rounded-xl text-sm font-black transition-all border-2 ${
                  currentVal === n
                    ? 'border-violet-500 bg-violet-500 text-white shadow-md scale-105'
                    : error ? 'border-red-200 text-red-400 bg-red-50 hover:border-red-400' : 'border-slate-200 text-slate-600 bg-white hover:border-violet-400 hover:bg-violet-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>{question.escala_label_min || 'Mínimo'}</span>
            <span>{question.escala_label_max || 'Máximo'}</span>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
    <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
      <ClipboardList className="w-10 h-10 text-violet-400" />
    </div>
    <h3 className="font-black text-slate-700 text-lg mb-2">Nenhuma Anamnese</h3>
    <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
      Nenhuma solicitação de anamnese foi enviada para você ainda.
    </p>
    <button onClick={onRefresh} className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
      <RotateCcw className="w-4 h-4" /> Tentar novamente
    </button>
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────

export const ClientAnamnesis: React.FC = () => {
  const clienteId = localStorage.getItem('activeProfileId') || '1';
  // const companyId = localStorage.getItem('companyId') || '1';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Estado geral
  const [mode, setMode] = useState<'history' | 'form' | 'done'>('history');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [requests, setRequests] = useState<AnamnesisRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null); console.log(activeRequestId);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/patient-anamnesis/client/${clienteId}/requests`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch {
      setRequests([]);
    } finally { setLoading(false); }
  };

  // We keep startForm but no longer use it in the history mode because
  // we rely on requests now. Let's comment it out or remove it if not needed.
  const startForm = async (reqId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/patient-anamnesis/requests/${reqId}`, { headers });
      if (res.ok) {
        const data: Section[] = await res.json();
        setSections(data.filter(s => s.questions && s.questions.length > 0));
        setActiveRequestId(reqId);
        setAnswers({});
        setErrors({});
        setCurrentSection(0);
        setSubmitError('');
        setMode('form');
      }
    } catch (err) {
      alert('Erro ao carregar o formulário da solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    setErrors(prev => ({ ...prev, [questionId]: false }));
  };

  const getActiveQuestions = (sectionIdx: number): Question[] => {
    const section = sections[sectionIdx];
    const active: Question[] = [];

    const checkQuestion = (q: Question) => {
      active.push(q);
      // Verify if it has children that are active
      const val = answers[q.id];
      if (['radio', 'checkbox', 'select'].includes(q.tipo) && q.options) {
        let selectedTexts: string[] = [];
        if (Array.isArray(val)) selectedTexts = val;
        else if (val) selectedTexts = [val as string];
        
        const selectedOptionIds = q.options
          .filter(o => selectedTexts.includes(o.texto))
          .map(o => String(o.id));
          
        const children = section.questions.filter(child => 
          child.parent_option_id && selectedOptionIds.includes(String(child.parent_option_id))
        );
        children.forEach(checkQuestion);
      }
    };

    section.questions.filter(q => !q.parent_option_id).forEach(checkQuestion);
    return active;
  };

  const validateSection = (sectionIdx: number): boolean => {
    const activeQuestions = getActiveQuestions(sectionIdx);
    const newErrors: Record<number, boolean> = {};
    let valid = true;
    for (const q of activeQuestions) {
      if (q.obrigatoria) {
        const val = answers[q.id];
        const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : val.trim() === '');
        if (isEmpty) { newErrors[q.id] = true; valid = false; }
      }
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handleNext = () => {
    if (!validateSection(currentSection)) return;
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch(`${API_URL}/api/patient-anamnesis/requests/${activeRequestId}/submit`, {
        method: 'POST', headers,
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      setMode('done');
      loadData();
    } catch (e) {
      setSubmitError('Erro ao enviar as respostas. Tente novamente.');
    } finally { setSubmitting(false); }
  };

  const progress = sections.length > 0 ? ((currentSection) / sections.length) * 100 : 0;
  const section = sections[currentSection];
  const isLast = currentSection === sections.length - 1;

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#6366f1' }} />
        <p className="text-sm text-slate-400 font-medium">Carregando formulário...</p>
      </div>
    </div>
  );

  // ─── Done ──────────────────────────────────────────────────────────────────

  if (mode === 'done') return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md space-y-5 animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Respostas enviadas!</h2>
          <p className="text-sm text-slate-500 mt-2">
            Seu formulário de anamnese foi salvo com sucesso. O médico terá acesso às suas respostas antes da consulta.
          </p>
        </div>
        <button onClick={() => setMode('history')}
          className="px-8 py-3 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5 shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          Ver meu histórico
        </button>
      </div>
    </div>
  );

  // ─── Form ──────────────────────────────────────────────────────────────────

  if (mode === 'form' && section) return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Barra de progresso */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seção {currentSection + 1} de {sections.length}</p>
            <h2 className="text-base font-black text-slate-800 mt-0.5">{section.titulo}</h2>
            {section.descricao && <p className="text-xs text-slate-400 mt-0.5">{section.descricao}</p>}
          </div>
          <span className="text-2xl font-black text-violet-600">{Math.round(progress + (100 / sections.length))}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress + (100 / sections.length), 100)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          />
        </div>
        {/* Breadcrumb de seções */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {sections.map((s, i) => (
            <React.Fragment key={i}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                i === currentSection ? 'bg-violet-100 text-violet-700 border border-violet-200' :
                i < currentSection ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                'text-slate-400'
              }`}>
                {i < currentSection ? '✓ ' : ''}{s.titulo.length > 20 ? s.titulo.slice(0, 20) + '...' : s.titulo}
              </span>
              {i < sections.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Perguntas da seção atual */}
      <div className="space-y-4">
        {(() => {
          const topLevel = section.questions.filter(q => !q.parent_option_id);
          
          const renderQuestion = (q: Question, level: number = 0) => {
            const hasError = errors[q.id];
            const val = answers[q.id] ?? (q.tipo === 'checkbox' ? [] : '');
            
            let activeChildQuestions: Question[] = [];
            if (['radio', 'checkbox', 'select'].includes(q.tipo) && q.options) {
              let selectedTexts: string[] = [];
              if (Array.isArray(val)) selectedTexts = val;
              else if (val) selectedTexts = [val as string];
              
              const selectedOptionIds = q.options
                .filter(o => selectedTexts.includes(o.texto))
                .map(o => String(o.id));
                
              activeChildQuestions = section.questions.filter(child => 
                child.parent_option_id && selectedOptionIds.includes(String(child.parent_option_id))
              );
            }

            return (
              <div key={q.id} className={`${level > 0 ? 'ml-8 mt-4 relative border-l-2 border-violet-200 pl-6' : ''}`}>
                <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
                  hasError ? 'border-red-300 shadow-red-50' : 'border-slate-200 hover:border-violet-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {level === 0 && (
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black"
                          style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#6d28d9' }}>
                          <CheckCircle className="w-4 h-4 text-violet-600" />
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-snug">
                          {q.texto}
                          {q.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        {q.descricao && <p className="text-xs text-slate-400 mt-1 font-medium">{q.descricao}</p>}
                      </div>
                    </div>
                  </div>
                  <QuestionField
                    question={q}
                    value={val}
                    onChange={v => handleAnswer(q.id, v)}
                    error={hasError}
                  />
                  {hasError && (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 mt-2">
                      <AlertCircle className="w-3.5 h-3.5" /> Esta pergunta é obrigatória
                    </p>
                  )}
                </div>
                
                {activeChildQuestions.length > 0 && (
                  <div className="space-y-4 animate-fadeIn">
                    {activeChildQuestions.map(child => renderQuestion(child, level + 1))}
                  </div>
                )}
              </div>
            );
          };

          return topLevel.map(q => renderQuestion(q));
        })()}
      </div>

      {/* Erro de submit */}
      {submitError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
          <AlertCircle className="w-4 h-4" /> {submitError}
        </div>
      )}

      {/* Navegação */}
      <div className="flex gap-3">
        {currentSection > 0 && (
          <button onClick={handlePrev}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        )}
        <button onClick={handleNext} disabled={submitting}
          className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:-translate-y-0.5 shadow-md disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : isLast ? (
            <><Send className="w-4 h-4" /> Enviar respostas</>
          ) : (
            <>Próxima seção <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );

  // ─── History / Overview ────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Formulários de Anamnese</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Acompanhe e responda às solicitações do seu médico.
          </p>
        </div>
      </div>

      {requests.filter(r => r.status === 'aguardando').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {requests.filter(r => r.status === 'concluido').length === 0 ? (
              <div className="rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 bg-slate-50">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-black text-slate-700">Nenhum formulário respondido</h2>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  Você ainda não respondeu nenhuma anamnese. Suas respostas ficarão salvas aqui para consulta futura.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Formulários Respondidos
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                    {requests.filter(r => r.status === 'concluido').length} registro(s)
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {requests.filter(r => r.status === 'concluido').map((r: any, ri: number) => (
                    <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Anamnese #{r.id}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Respondido em: {new Date(r.respondido_em || r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => {}} className="px-4 py-2 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 rounded-xl text-xs font-bold text-slate-600 transition shadow-sm">
                        Visualizar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: histórico */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-500" /> Histórico de Respostas
              </h3>
              <div className="text-center p-4">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Aqui você poderá visualizar o histórico consolidado de todas as anamneses enviadas à clínica.
                </p>
              </div>
            </div>

            {/* Info card */}
            <div className="rounded-2xl p-5 space-y-2" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
              <Sparkles className="w-5 h-5 text-violet-600" />
              <p className="text-xs font-black text-violet-800">Por que preencher?</p>
              <p className="text-[11px] text-violet-700 leading-relaxed font-medium">
                A anamnese prévia permite que seu médico se prepare para a consulta, tornando o atendimento mais ágil e preciso.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Importação faltante
const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
