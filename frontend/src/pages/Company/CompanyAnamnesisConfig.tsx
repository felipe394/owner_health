import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Settings,
  Save, Copy, Check, Send, Sparkles, Eye, ClipboardList,
  Type, AlignLeft, Circle, CheckSquare, List, BarChart3, Calendar,
  Loader2, AlertCircle, Edit3, ChevronRight
} from 'lucide-react';
import { API_URL } from '../../config';
import { CompanyAnamnesisPreviewModal } from './CompanyAnamnesisPreviewModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateEditorModal } from './TemplateEditorModal';
import { QuestionModal } from '../../components/QuestionModal';

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'scale' | 'date';

export interface Option { id?: number; texto: string; ordem: number; }
export interface Question {
  id?: number; section_id?: number; texto: string; tipo: QuestionType;
  obrigatoria: boolean; ordem: number; placeholder: string; descricao: string;
  escala_min?: number; escala_max?: number; escala_label_min?: string; escala_label_max?: string;
  parent_option_id?: number;
  options?: Option[]; _loading?: boolean;
}
export interface Section {
  id?: number; empresa_id?: number; titulo: string; descricao: string;
  ordem: number; ativo: boolean; questions?: Question[]; _open?: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'text',     label: 'Resposta curta',    icon: <Type className="w-4 h-4" />,         desc: 'Texto de uma linha' },
  { value: 'textarea', label: 'Parágrafo',         icon: <AlignLeft className="w-4 h-4" />,    desc: 'Texto longo' },
  { value: 'radio',    label: 'Múltipla escolha',  icon: <Circle className="w-4 h-4" />,       desc: 'Escolha única' },
  { value: 'checkbox', label: 'Caixas de seleção', icon: <CheckSquare className="w-4 h-4" />,  desc: 'Múltipla seleção' },
  { value: 'select',   label: 'Lista suspensa',    icon: <List className="w-4 h-4" />,         desc: 'Dropdown' },
  { value: 'scale',    label: 'Escala linear',     icon: <BarChart3 className="w-4 h-4" />,    desc: 'Ex: 1 a 10' },
  { value: 'date',     label: 'Data',              icon: <Calendar className="w-4 h-4" />,     desc: 'Seletor de data' },
];

export const QUESTION_TYPE_MAP: Record<QuestionType, { label: string; icon: React.ReactNode }> = {
  text:     { label: 'Resposta curta',    icon: <Type className="w-3.5 h-3.5" /> },
  textarea: { label: 'Parágrafo',         icon: <AlignLeft className="w-3.5 h-3.5" /> },
  radio:    { label: 'Múltipla escolha',  icon: <Circle className="w-3.5 h-3.5" /> },
  checkbox: { label: 'Caixas de seleção', icon: <CheckSquare className="w-3.5 h-3.5" /> },
  select:   { label: 'Lista suspensa',    icon: <List className="w-3.5 h-3.5" /> },
  scale:    { label: 'Escala linear',     icon: <BarChart3 className="w-3.5 h-3.5" /> },
  date:     { label: 'Data',              icon: <Calendar className="w-3.5 h-3.5" /> },
};

export const needsOptions = (tipo: QuestionType) => ['radio', 'checkbox', 'select'].includes(tipo);

// ─── Componente principal ─────────────────────────────────────────────────────

export const CompanyAnamnesisConfig: React.FC = () => {
  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId') || '1';

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'builder' | 'responses' | 'templates'>('builder');
  
  // ── Modals / States ──
  const [modalQuestion, setModalQuestion] = useState<{ question: Question | null; sectionIdx: number; parentOptionId?: number } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSectionIdx, setAddingSectionIdx] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<any | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  
  // Templates state
  const [templates, setTemplates] = useState<{ id: number; titulo?: string; nome?: string; criado_em: string; conteudo?: any; sections_data?: any }[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const nextId = useRef(1000);
  const genId = () => nextId.current++;

  // Carrega seções + perguntas + opções
  useEffect(() => { loadForm(); }, []);

  const loadForm = async () => {
    setLoading(true);
    await loadFormSilent();
    setLoading(false);
  };

  const loadFormSilent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/anamnesis/form/${companyId}`, { headers });
      if (!res.ok) throw new Error('Falha');
      const data: Section[] = await res.json();
      setSections(data.map(s => ({ ...s, _open: true, questions: s.questions || [] })));
    } catch {
      setSections([]);
    }
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/api/anamnesis-templates/${companyId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (tab === 'templates') {
      loadTemplates();
    }
  }, [tab]);

  const handleSaveTemplate = async () => {
    const title = window.prompt('Digite um nome para este modelo de formulário:', 'Meu Modelo de Anamnese');
    if (!title) return;
    
    setSavingTemplate(true);
    try {
      // Limpar IDs e dados sensíveis antes de salvar como modelo
      const cleanSections = sections.map(s => ({
        titulo: s.titulo,
        descricao: s.descricao,
        ordem: s.ordem,
        questions: (s.questions || []).map(q => ({
          texto: q.texto,
          tipo: q.tipo,
          obrigatoria: q.obrigatoria,
          ordem: q.ordem,
          placeholder: q.placeholder,
          descricao: q.descricao,
          escala_min: q.escala_min,
          escala_max: q.escala_max,
          escala_label_min: q.escala_label_min,
          escala_label_max: q.escala_label_max,
          // Guardar temporary IDs para parent_option_id mapping
          _temp_id: q.id, 
          parent_option_id: q.parent_option_id,
          options: (q.options || []).map(o => ({
            texto: o.texto,
            ordem: o.ordem,
            _temp_id: o.id
          }))
        }))
      }));

      const res = await fetch(`${API_URL}/api/anamnesis-templates`, {
        method: 'POST', headers,
        body: JSON.stringify({ empresa_id: companyId, titulo: title, conteudo: cleanSections })
      });
      if (res.ok) {
        alert('Modelo salvo com sucesso!');
        loadTemplates();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (e) {
      alert('Erro ao salvar modelo.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleLoadTemplate = async (templateId: number) => {
    if (!window.confirm('Carregar este modelo irá SOBRESCREVER o formulário atual inteiro. Deseja continuar?')) return;
    
    setLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const conteudo = template.conteudo;
      
      // Apagar tudo primeiro
      for (const s of sections) {
        if (s.id) await fetch(`${API_URL}/api/anamnesis/sections/${s.id}`, { method: 'DELETE', headers });
      }

      // Reconstruir o formulário a partir do JSON (um a um ou bulk)
      // Como o construtor permite criar no frontend e sincronizar, 
      // podemos apenas fazer as chamadas de API de criação para cada seção
      for (let si = 0; si < conteudo.length; si++) {
        const s = conteudo[si];
        const sRes = await fetch(`${API_URL}/api/anamnesis/empresa/${companyId}/sections`, {
          method: 'POST', headers, body: JSON.stringify({ titulo: s.titulo, descricao: s.descricao, ordem: s.ordem, ativo: true })
        });
        const createdS = await sRes.json();
        
        const oldToNewOptions = new Map();

        // 1. Criar perguntas parentes e suas opções
        for (const q of s.questions) {
          const qRes = await fetch(`${API_URL}/api/anamnesis/sections/${createdS.id}/questions`, {
            method: 'POST', headers, body: JSON.stringify({ ...q, parent_option_id: null })
          });
          const createdQ = await qRes.json();
          
          if (needsOptions(q.tipo) && q.options?.length) {
            const optsRes = await fetch(`${API_URL}/api/anamnesis/questions/${createdQ.id}/options/bulk`, {
              method: 'PUT', headers, body: JSON.stringify({ options: q.options })
            });
            const createdOpts = await optsRes.json();
            
            // Map old _temp_id to new option ID
            if (createdOpts && Array.isArray(createdOpts)) {
              for (let i = 0; i < q.options.length; i++) {
                if (q.options[i]._temp_id && createdOpts[i]?.id) {
                  oldToNewOptions.set(q.options[i]._temp_id, createdOpts[i].id);
                }
              }
            }
          }
          
          // Se for pergunta com parent, precisamos atualizar o parent_option_id depois
          if (q.parent_option_id) {
             const newParentOptId = oldToNewOptions.get(q.parent_option_id);
             if (newParentOptId) {
                await fetch(`${API_URL}/api/anamnesis/questions/${createdQ.id}`, {
                  method: 'PUT', headers, body: JSON.stringify({ ...q, parent_option_id: newParentOptId })
                });
             }
          }
        }
      }
      await loadFormSilent();
      alert('Modelo carregado com sucesso!');
      setTab('builder');
    } catch (e) {
      alert('Erro ao carregar modelo. O formulário pode estar incompleto.');
      await loadFormSilent();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Deseja realmente excluir este modelo?')) return;
    try {
      await fetch(`${API_URL}/api/anamnesis-templates/${templateId}`, { method: 'DELETE', headers });
      loadTemplates();
    } catch (e) {
      alert('Erro ao excluir modelo.');
    }
  };

  // ── Seções ──────────────────────────────────────────────────────────────────

  const handleAddSection = async () => {
    const titulo = newSectionTitle.trim() || 'Nova Seção';
    try {
      const res = await fetch(`${API_URL}/api/anamnesis/empresa/${companyId}/sections`, {
        method: 'POST', headers,
        body: JSON.stringify({ titulo, descricao: '', ordem: sections.length, ativo: true })
      });
      const data = await res.json();
      setSections(prev => [...prev, { ...data, _open: true, questions: [] }]);
      setNewSectionTitle('');
      setAddingSectionIdx(null);
    } catch {
      const newS: Section = { id: genId(), empresa_id: Number(companyId), titulo, descricao: '', ordem: sections.length, ativo: true, _open: true, questions: [] };
      setSections(prev => [...prev, newS]);
      setNewSectionTitle('');
      setAddingSectionIdx(null);
    }
  };

  const handleDeleteSection = async (sIdx: number) => {
    const s = sections[sIdx];
    if (s.id) {
      try { await fetch(`${API_URL}/api/anamnesis/sections/${s.id}`, { method: 'DELETE', headers }); } catch {}
    }
    setSections(prev => prev.filter((_, i) => i !== sIdx));
  };

  const handleToggleSection = (sIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, _open: !s._open } : s));
  };

  const handleSectionTitleChange = (sIdx: number, val: string) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, titulo: val } : s));
  };

  const handleSectionDescChange = (sIdx: number, val: string) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, descricao: val } : s));
  };

  // ── Perguntas ────────────────────────────────────────────────────────────────

  const handleAddQuestion = (sIdx: number, parentOptionId?: number) => {
    setModalQuestion({ question: null, sectionIdx: sIdx, parentOptionId });
  };

  const handleEditQuestion = (sIdx: number, qIdx: number) => {
    setModalQuestion({ question: sections[sIdx].questions![qIdx], sectionIdx: sIdx });
  };

  const handleDeleteQuestion = async (sIdx: number, qIdx: number) => {
    const q = sections[sIdx].questions![qIdx];
    if (q.id) {
      try { await fetch(`${API_URL}/api/anamnesis/questions/${q.id}`, { method: 'DELETE', headers }); } catch {}
    }
    setSections(prev => prev.map((s, i) => i === sIdx
      ? { ...s, questions: s.questions!.filter((_, qi) => qi !== qIdx) }
      : s
    ));
  };

  const handleModalSave = async (q: Question) => {
    if (!modalQuestion) return;
    const { sectionIdx } = modalQuestion;
    const section = sections[sectionIdx];
    const sectionId = section.id!;
    const isEdit = !!q.id;

    try {
      if (isEdit) {
        // Atualiza pergunta
        await fetch(`${API_URL}/api/anamnesis/questions/${q.id}`, {
          method: 'PUT', headers, body: JSON.stringify({ ...q, parent_option_id: modalQuestion?.parentOptionId || q.parent_option_id })
        });
        // Atualiza opções
        if (needsOptions(q.tipo)) {
          await fetch(`${API_URL}/api/anamnesis/questions/${q.id}/options/bulk`, {
            method: 'PUT', headers, body: JSON.stringify({ options: q.options })
          });
        }
        await loadFormSilent();
      } else {
        // Cria pergunta
        const res = await fetch(`${API_URL}/api/anamnesis/sections/${sectionId}/questions`, {
          method: 'POST', headers, body: JSON.stringify({ ...q, parent_option_id: modalQuestion?.parentOptionId || q.parent_option_id })
        });
        const created = await res.json();
        // Cria opções
        if (needsOptions(q.tipo) && q.options?.length) {
          await fetch(`${API_URL}/api/anamnesis/questions/${created.id}/options/bulk`, {
            method: 'PUT', headers, body: JSON.stringify({ options: q.options })
          });
        }
        await loadFormSilent();
      }
    } catch {
      // Fallback local
      const localQ = { ...q, id: q.id || genId(), section_id: sectionId, parent_option_id: modalQuestion?.parentOptionId };
      setSections(prev => prev.map((s, si) => si !== sectionIdx ? s : {
        ...s, questions: isEdit
          ? s.questions!.map(ex => String(ex.id) === String(q.id) ? localQ : ex)
          : [...(s.questions || []), localQ]
      }));
    }
    setModalQuestion(null);
  };

  // ── Salvar tudo ─────────────────────────────────────────────────────────────

  const handleSaveAll = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      for (let si = 0; si < sections.length; si++) {
        const s = sections[si];
        if (s.id) {
          await fetch(`${API_URL}/api/anamnesis/sections/${s.id}`, {
            method: 'PUT', headers, body: JSON.stringify({ titulo: s.titulo, descricao: s.descricao, ordem: si })
          });
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Erro ao salvar as configurações');
    } finally { setSaving(false); }
  };

  const handleCopyLink = () => {
    const linkBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'https://owner-health-ktsf.vercel.app' 
      : window.location.origin;
    navigator.clipboard.writeText(`${linkBase}/client/anamnesis`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#6366f1' }} />
        <p className="text-sm text-slate-400 font-medium">Carregando formulário...</p>
      </div>
    </div>
  );

  return (
    <>
      {modalQuestion !== null && (
        <QuestionModal
          question={modalQuestion.question}
          sectionId={sections[modalQuestion.sectionIdx]?.id || 0}
          onSave={handleModalSave}
          onClose={() => setModalQuestion(null)}
        />
      )}

      <div className="space-y-6 animate-fadeIn">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Formulário de Anamnese</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Crie e organize as perguntas que seus pacientes responderão antes das consultas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <Check className="w-3.5 h-3.5" /> Salvo!
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}
            <button onClick={handleSaveAll} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5 shadow-md disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { key: 'builder', label: 'Construtor', icon: <Edit3 className="w-3.5 h-3.5" /> },
            { key: 'templates', label: 'Modelos Salvos', icon: <ClipboardList className="w-3.5 h-3.5" /> },
            { key: 'responses', label: 'Compartilhar', icon: <Send className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-4">
            {tab === 'builder' ? (
              <>
                {/* Seções */}
                {sections.length === 0 && (
                  <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                      <ClipboardList className="w-8 h-8 text-violet-500" />
                    </div>
                    <h3 className="font-black text-slate-700 text-base mb-1">Formulário em branco</h3>
                    <p className="text-sm text-slate-400 mb-6">Adicione seções e perguntas para montar seu formulário de anamnese</p>
                    <button onClick={() => setAddingSectionIdx(-1)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      + Criar primeira seção
                    </button>
                  </div>
                )}

                {sections.length > 0 && (
                  <div className="flex justify-end mb-4">
                    <button onClick={handleSaveTemplate} disabled={savingTemplate}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition shadow-sm border border-violet-100 disabled:opacity-60">
                      {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar como Modelo
                    </button>
                  </div>
                )}

                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Cabeçalho da seção */}
                    <div className="p-5 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #f8f7ff, #f5f3ff)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-grab" style={{ background: '#ede9fe' }}>
                          <GripVertical className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <input
                            value={section.titulo}
                            onChange={e => handleSectionTitleChange(sIdx, e.target.value)}
                            className="w-full font-black text-slate-800 text-sm bg-transparent border-b-2 border-transparent focus:border-violet-400 focus:outline-none pb-0.5 transition"
                            placeholder="Título da seção"
                          />
                          <input
                            value={section.descricao}
                            onChange={e => handleSectionDescChange(sIdx, e.target.value)}
                            className="w-full text-xs text-slate-500 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mt-1 transition"
                            placeholder="Descrição da seção (opcional)"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-violet-500 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                            Seção {sIdx + 1} · {section.questions?.length || 0} perguntas
                          </span>
                          <button onClick={() => handleToggleSection(sIdx)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition hover:bg-slate-50">
                            {section._open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                          <button onClick={() => handleDeleteSection(sIdx)} className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center transition hover:bg-red-100">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Perguntas */}
                    {section._open && (
                      <div className="p-4 space-y-3">
                        {(() => {
                          const topLevel = (section.questions || []).filter(q => !q.parent_option_id);
                          const renderConfigQuestion = (q: Question, qIdx: number, level: number = 0) => {
                            const activeChildren = (section.questions || []).filter(c => 
                              c.parent_option_id != null && q.options?.some(o => o.id != null && String(c.parent_option_id) === String(o.id))
                            );
                            
                            return (
                              <div key={qIdx} className={`${level > 0 ? 'ml-8 mt-3 relative border-l-2 border-violet-200 pl-6' : ''}`}>
                                <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/30 transition group">
                                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 cursor-grab opacity-40 group-hover:opacity-70 transition">
                                    <GripVertical className="w-full h-full text-slate-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{q.texto}</p>
                                        {q.descricao && <p className="text-xs text-slate-400 mt-0.5">{q.descricao}</p>}
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {q.obrigatoria && (
                                          <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">obrig.</span>
                                        )}
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                                          {QUESTION_TYPE_MAP[q.tipo]?.icon}
                                          {QUESTION_TYPE_MAP[q.tipo]?.label}
                                        </span>
                                        <button onClick={() => handleEditQuestion(sIdx, section.questions!.indexOf(q))}
                                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:border-violet-400 transition">
                                          <Edit3 className="w-3 h-3 text-slate-500" />
                                        </button>
                                        <button onClick={() => handleDeleteQuestion(sIdx, section.questions!.indexOf(q))}
                                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:border-red-400 hover:bg-red-50 transition">
                                          <Trash2 className="w-3 h-3 text-slate-400" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Mostrar opções e permitir sub-pergunta */}
                                    {needsOptions(q.tipo) && q.options && q.options.length > 0 && (
                                      <div className="mt-3 space-y-1.5">
                                        {q.options.map(o => {
                                          const hasChild = (section.questions || []).some(c => c.parent_option_id != null && String(c.parent_option_id) === String(o.id));
                                          return (
                                            <div key={o.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 bg-white shadow-sm">
                                              <span className="text-xs font-medium text-slate-600 px-1">{o.texto}</span>
                                              {!hasChild ? (
                                                <button onClick={() => handleAddQuestion(sIdx, Number(o.id))} className="text-[10px] font-bold text-violet-500 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded transition flex items-center gap-1">
                                                  <Plus className="w-3 h-3" /> Step (Lógica)
                                                </button>
                                              ) : (
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded flex items-center gap-1">
                                                  <Check className="w-3 h-3" /> Step Vinculado
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {q.tipo === 'scale' && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-slate-400">{q.escala_label_min || 'Mín'}</span>
                                        <div className="flex gap-1">
                                          {Array.from({ length: Math.min((q.escala_max || 10) - (q.escala_min || 1) + 1, 10) }, (_, i) => (
                                            <div key={i} className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                              {(q.escala_min || 1) + i}
                                            </div>
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-slate-400">{q.escala_label_max || 'Máx'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {activeChildren.map(c => renderConfigQuestion(c, section.questions!.indexOf(c), level + 1))}
                              </div>
                            );
                          };
                          return topLevel.map(q => renderConfigQuestion(q, section.questions!.indexOf(q)));
                        })()}
                        <button onClick={() => handleAddQuestion(sIdx)}
                          className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-200 text-sm font-bold text-violet-500 hover:border-violet-400 hover:bg-violet-50 transition flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Adicionar pergunta principal
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Adicionar seção */}
                {addingSectionIdx !== null ? (
                  <div className="bg-white rounded-3xl border border-violet-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-600 mb-2">Nome da nova seção</p>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={newSectionTitle}
                        onChange={e => setNewSectionTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') { setAddingSectionIdx(null); setNewSectionTitle(''); } }}
                        placeholder="Ex: Histórico de Saúde"
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
                      />
                      <button onClick={handleAddSection}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        Criar
                      </button>
                      <button onClick={() => { setAddingSectionIdx(null); setNewSectionTitle(''); }}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingSectionIdx(sections.length)}
                    className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/50 transition flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Adicionar nova seção
                  </button>
                )}
              </>
            ) : tab === 'responses' ? (
              /* Aba de Compartilhamento */
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 mb-1">Enviar para pacientes</h3>
                  <p className="text-sm text-slate-500">Compartilhe o link abaixo com seus pacientes para que preencham o formulário antes da consulta.</p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Link do formulário</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-600 break-all select-all">
                    {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                      ? 'https://owner-health-ktsf.vercel.app' 
                      : window.location.origin}/client/anamnesis
                  </div>
                </div>
                <button onClick={handleCopyLink}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {copied ? <><Check className="w-4 h-4 text-emerald-300" /> Link copiado!</> : <><Copy className="w-4 h-4" /> Copiar link</>}
                </button>
                <div className="rounded-2xl p-5 flex gap-3" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                  <Sparkles className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-violet-800">Anamnese Inteligente</p>
                    <p className="text-[11px] text-violet-700 mt-0.5 leading-relaxed">
                      O preenchimento prévio reduz em até 40% o tempo gasto na consulta. As respostas ficam disponíveis imediatamente no prontuário do paciente.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Aba de Modelos Salvos */
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 mb-1">Modelos de Formulário Salvos</h3>
                  <p className="text-sm text-slate-500">Recupere estruturas de formulário prontas. Atenção: ao carregar um modelo, o formulário atual será substituído.</p>
                </div>
                {loadingTemplates ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
                ) : templates.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm text-slate-500">Nenhum modelo salvo ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition group bg-slate-50">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{t.nome || t.titulo || 'Modelo de Anamnese'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Salvo em {new Date(t.criado_em).toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPreviewingTemplate(t)}
                            className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition"
                            title="Visualizar"
                          >
                            👁️
                          </button>
                          <button onClick={() => setEditingTemplate(t)}
                            className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button onClick={() => handleLoadTemplate(t.id)}
                            className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-violet-400 hover:text-violet-600 transition">
                            Carregar no Construtor
                          </button>
                          <button onClick={() => handleDeleteTemplate(t.id)}
                            className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition">
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Estatísticas */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-violet-500" /> Resumo do Formulário
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Seções', value: sections.length, color: 'violet' },
                  { label: 'Perguntas', value: sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0), color: 'indigo' },
                  {
                    label: 'Obrigatórias',
                    value: sections.reduce((acc, s) => acc + (s.questions?.filter(q => q.obrigatoria).length || 0), 0),
                    color: 'red'
                  },
                ].map(stat => (
                  <div key={stat.label} className={`flex items-center justify-between p-3 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100`}>
                    <span className={`text-xs font-bold text-${stat.color}-700`}>{stat.label}</span>
                    <span className={`text-lg font-black text-${stat.color}-600`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos disponíveis */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-4">Tipos de pergunta</h3>
              <div className="space-y-2">
                {QUESTION_TYPES.map(t => (
                  <div key={t.value} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50">
                    <span className="text-violet-500">{t.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{t.label}</p>
                      <p className="text-[10px] text-slate-400">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview link */}
            <button onClick={() => setShowPreviewModal(true)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition group shadow-sm text-left">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-slate-700">Visualizar formulário</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition" />
            </button>
          </div>
        </div>
      </div>
      {showPreviewModal && <CompanyAnamnesisPreviewModal sections={sections as any} onClose={() => setShowPreviewModal(false)} />}
      {previewingTemplate && (
        <TemplatePreviewModal
          template={previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
        />
      )}
      {editingTemplate && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSaved={() => {
            setEditingTemplate(null);
            loadTemplates();
          }}
        />
      )}
    </>
  );
};
