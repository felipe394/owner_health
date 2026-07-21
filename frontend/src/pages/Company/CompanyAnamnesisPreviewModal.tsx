import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'scale' | 'date';

interface Option { id?: number; texto: string; }
interface Question {
  id?: number; section_id?: number; texto: string; tipo: QuestionType;
  obrigatoria: boolean; ordem: number; placeholder: string; descricao: string;
  escala_min?: number; escala_max?: number;
  escala_label_min?: string; escala_label_max?: string;
  parent_option_id?: number;
  options?: Option[];
}
interface Section {
  id?: number; titulo: string; descricao: string; ordem: number;
  questions: Question[];
}



interface QuestionFieldProps {
  question: Question;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}

const QuestionField: React.FC<QuestionFieldProps> = ({ question, value, onChange }) => {
  const inputBase = `w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition border-slate-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10`;

  switch (question.tipo) {
    case 'text':
      return <input type="text" value={value as string} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || 'Sua resposta...'} className={inputBase} />;
    case 'textarea':
      return <textarea rows={4} value={value as string} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || 'Sua resposta detalhada...'} className={`${inputBase} resize-none`} />;
    case 'date':
      return <input type="date" value={value as string} onChange={e => onChange(e.target.value)} className={inputBase} />;
    case 'radio':
      return (
        <div className="space-y-2.5">
          {(question.options || []).map((opt, idx) => {
            const selected = value === opt.texto;
            return (
              <button key={opt.id || idx} onClick={() => onChange(opt.texto)} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${selected ? 'border-violet-500 bg-violet-500' : 'border-slate-300'}`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-semibold ${selected ? 'text-violet-700' : 'text-slate-700'}`}>{opt.texto}</span>
              </button>
            );
          })}
        </div>
      );
    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2.5">
          {(question.options || []).map((opt, idx) => {
            const checked = selected.includes(opt.texto);
            return (
              <button key={opt.id || idx} onClick={() => onChange(checked ? selected.filter(v => v !== opt.texto) : [...selected, opt.texto])} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checked ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${checked ? 'border-violet-500 bg-violet-500' : 'border-slate-300'}`}>
                  {checked && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <span className={`text-sm font-semibold ${checked ? 'text-violet-700' : 'text-slate-700'}`}>{opt.texto}</span>
              </button>
            );
          })}
        </div>
      );
    }
    case 'select':
      return (
        <div className="relative">
          <select value={value as string} onChange={e => onChange(e.target.value)} className={`${inputBase} appearance-none pr-10 cursor-pointer`}>
            <option value="" disabled>{question.placeholder || 'Selecione...'}</option>
            {(question.options || []).map((opt, idx) => <option key={opt.id || idx} value={opt.texto}>{opt.texto}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronRight className="w-4 h-4 text-slate-400 rotate-90" /></div>
        </div>
      );
    case 'scale': {
      const min = question.escala_min || 1;
      const max = question.escala_max || 10;
      const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 px-1">
            <span>{question.escala_label_min || 'Mínimo'}</span>
            <span>{question.escala_label_max || 'Máximo'}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
            {range.map(num => {
              const selected = String(value) === String(num);
              return (
                <button key={num} onClick={() => onChange(String(num))} className={`flex-1 min-w-[40px] h-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${selected ? 'border-violet-500 bg-violet-500 text-white shadow-md shadow-violet-500/20 scale-105' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    default: return null;
  }
};

interface Props {
  sections: Section[];
  onClose: () => void;
}

export const CompanyAnamnesisPreviewModal: React.FC<Props> = ({ sections, onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const section = sections[currentSection];

  const handleAnswer = (qId: number | string, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 h-48 bg-violet-600 rounded-t-3xl" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-xl font-black text-white">Preview do Formulário</h1>
              <p className="text-sm font-medium text-white/70 mt-1">É assim que o paciente verá a anamnese</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition backdrop-blur-md border border-white/10">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
            {sections.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-slate-100">
                <p className="text-slate-500">Nenhuma seção configurada.</p>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                <div>
                  <h2 className="text-xl font-black text-slate-800">{section.titulo}</h2>
                  {section.descricao && <p className="text-sm text-slate-500 mt-2 font-medium">{section.descricao}</p>}
                </div>

                <div className="space-y-4">
                  {(() => {
                    const topLevel = section.questions.filter(q => !q.parent_option_id);
                    const renderQuestion = (q: Question, level: number = 0) => {
                      const qId = q.id || `temp-${q.texto}`;
                      const val = answers[qId] ?? (q.tipo === 'checkbox' ? [] : '');
                      
                      let activeChildQuestions: Question[] = [];
                      if (['radio', 'checkbox', 'select'].includes(q.tipo) && q.options) {
                        let selectedTexts: string[] = [];
                        if (Array.isArray(val)) selectedTexts = val;
                        else if (val) selectedTexts = [val as string];
                        
                        const selectedOptionIds = q.options
                          .filter(o => selectedTexts.includes(o.texto))
                          .map(o => o.id);
                          
                        activeChildQuestions = section.questions.filter(child => 
                          child.parent_option_id && selectedOptionIds.includes(child.parent_option_id)
                        );
                      }

                      return (
                        <div key={qId} className={`${level > 0 ? 'ml-8 mt-4 relative border-l-2 border-violet-200 pl-6' : ''}`}>
                          <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all border-slate-200 hover:border-violet-200`}>
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-start gap-3 flex-1">
                                {level === 0 && (
                                  <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#6d28d9' }}>
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
                            <QuestionField question={q} value={val} onChange={v => handleAnswer(qId, v)} />
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

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button onClick={() => setCurrentSection(c => Math.max(0, c - 1))} disabled={currentSection === 0} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  {currentSection < sections.length - 1 ? (
                    <button onClick={() => setCurrentSection(c => c + 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition shadow-lg shadow-violet-500/20">
                      Próxima <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-slate-300 cursor-not-allowed">
                      Finalizar Anamnese
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
