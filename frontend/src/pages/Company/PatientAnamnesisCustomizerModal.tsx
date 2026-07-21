import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'scale' | 'date';

interface Option { id?: number | string; texto: string; ordem?: number; }
interface Question {
  id?: number | string; section_id?: number; texto: string; tipo: QuestionType;
  obrigatoria: boolean; ordem: number; placeholder: string; descricao: string;
  escala_min?: number; escala_max?: number; escala_label_min?: string; escala_label_max?: string;
  parent_option_id?: number | string; options?: Option[]; _loading?: boolean; new_id?: number;
}
interface Section {
  id?: number | string; titulo: string; descricao: string; ordem: number;
  questions: Question[];
}

const QUESTION_TYPE_MAP: Record<QuestionType, { label: string }> = {
  text: { label: 'Resposta curta' },
  textarea: { label: 'Parágrafo' },
  radio: { label: 'Múltipla escolha' },
  checkbox: { label: 'Caixas de seleção' },
  select: { label: 'Lista suspensa' },
  scale: { label: 'Escala linear' },
  date: { label: 'Data' }
};

interface Props {
  companyId: string | number;
  patientId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientAnamnesisCustomizerModal: React.FC<Props> = ({ companyId, patientId, onClose, onSuccess }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/anamnesis/form/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((s: any, si: number) => ({
            ...s, id: s.id || `s_${si}`,
            questions: (s.questions || []).map((q: any, qi: number) => ({
              ...q, id: q.id || `q_${si}_${qi}`,
              options: (q.options || []).map((o: any, oi: number) => ({ ...o, id: o.id || `o_${si}_${qi}_${oi}` }))
            }))
          }));
          setSections(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [companyId]);

  const handleDeleteSection = (sIdx: number) => {
    setSections(prev => prev.filter((_, i) => i !== sIdx));
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      const qId = s.questions[qIdx].id;
      return {
        ...s,
        questions: s.questions.filter((q, qi) => qi !== qIdx && q.parent_option_id !== qId)
      };
    }));
  };

  const handleSend = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/patient-anamnesis/empresa/${companyId}/request/custom`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: patientId,
          sections,
          medico_id: localStorage.getItem('profissionalId')
        })
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Erro ao enviar solicitação.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar solicitação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-black text-slate-800">Personalizar Anamnese para o Paciente</h2>
            <p className="text-sm text-slate-500">Remova as perguntas que não são necessárias para este caso específico.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
          ) : sections.length === 0 ? (
            <p className="text-center text-slate-500">O template da clínica está vazio.</p>
          ) : (
            sections.map((sec, sIdx) => (
              <div key={sec.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800">{sec.titulo}</h3>
                    {sec.descricao && <p className="text-xs text-slate-500 mt-1">{sec.descricao}</p>}
                  </div>
                  <button onClick={() => handleDeleteSection(sIdx)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(() => {
                    const topLevel = sec.questions.filter(q => !q.parent_option_id);
                    const renderQ = (q: Question, level: number = 0) => {
                      const activeChildren = sec.questions.filter(c => c.parent_option_id != null && q.options?.some(o => o.id != null && String(c.parent_option_id) === String(o.id)));
                      return (
                        <div key={q.id} className={`flex flex-col gap-2 ${level > 0 ? 'ml-6 mt-2 border-l-2 border-violet-200 pl-4' : ''}`}>
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-violet-200 transition">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{q.texto} {q.obrigatoria && <span className="text-red-500">*</span>}</p>
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                {QUESTION_TYPE_MAP[q.tipo]?.label}
                              </span>
                            </div>
                            <button onClick={() => handleDeleteQuestion(sIdx, sec.questions.indexOf(q))} className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {activeChildren.map(c => renderQ(c, level + 1))}
                        </div>
                      );
                    };
                    return topLevel.map(q => renderQ(q));
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-200 rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
            Cancelar
          </button>
          <button onClick={handleSend} disabled={saving || loading || sections.length === 0} className="px-6 py-3 font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition flex items-center gap-2">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
            Enviar para o Paciente
          </button>
        </div>
      </div>
    </div>
  );
};
