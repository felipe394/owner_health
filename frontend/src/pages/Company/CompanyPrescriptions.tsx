import React, { useState, useEffect } from 'react';
import {
  FileText, Loader2, Printer, ShieldCheck, History, Eye, Search
} from 'lucide-react';
import { API_URL } from '../../config';

export const CompanyPrescriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emitir' | 'historico'>('emitir');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // History state
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [docForm, setDocForm] = useState({
    profissional_id: '',
    paciente_cpf: '',
    tipo: 'receita', // receita, atestado
    conteudo: '',
    assinado_digitalmente: true
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [issuedDoc, setIssuedDoc] = useState<any>(null);

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId') || '1';
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isDoctor = user?.tipo_profissional === 'medico';
  const profIdLocal = localStorage.getItem('profissionalId') || '';

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchHistoryDocs();
  }, [token, companyId]);

  const fetchPatients = async () => {
    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setPatients(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      if (token && companyId) {
        const res = await fetch(`${API_URL}/api/professionals?companyId=${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const medics = Array.isArray(data) ? data.filter((p: any) => p.tipo_profissional === 'medico') : [];
        setProfessionals(medics);
        
        if (isDoctor && profIdLocal) {
          setDocForm(prev => ({ ...prev, profissional_id: profIdLocal }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryDocs = async () => {
    setLoadingHistory(true);
    try {
      if (token && companyId) {
        const res = await fetch(`${API_URL}/api/companies/${companyId}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistoryDocs(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIssuedDoc(null);

    if (!docForm.paciente_cpf || !docForm.conteudo) {
      setError('Selecione o paciente e preencha o conteúdo do documento.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/${companyId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profissional_id: docForm.profissional_id ? parseInt(docForm.profissional_id) : null,
          paciente_cpf: docForm.paciente_cpf,
          tipo: docForm.tipo,
          conteudo: docForm.conteudo,
          assinado_digitalmente: docForm.assinado_digitalmente
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar documento.');
      }

      setSuccess('Documento assinado digitalmente com sucesso!');
      
      const selectedDoc = professionals.find(p => String(p.id) === docForm.profissional_id);
      
      setIssuedDoc({
        id: data.id,
        tipo: docForm.tipo,
        paciente_cpf: docForm.paciente_cpf,
        conteudo: docForm.conteudo,
        medico_nome: selectedDoc ? selectedDoc.nome : 'Médico Credenciado',
        medico_crm: selectedDoc ? selectedDoc.numero_conselho : 'CRM/UF',
        assinado: docForm.assinado_digitalmente,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ownerhealth-verify-doc-${data.id}`
      });

      setDocForm(prev => ({ ...prev, conteudo: '', paciente_cpf: '' }));
      fetchHistoryDocs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewDoc = (doc: any) => {
    const selectedDoc = professionals.find(p => String(p.id) === String(doc.profissional_id));
    const formatted = {
      id: doc.id,
      tipo: doc.tipo,
      paciente_cpf: doc.paciente_cpf,
      conteudo: doc.conteudo,
      medico_nome: doc.medico_nome || (selectedDoc ? selectedDoc.nome : 'Médico Credenciado'),
      medico_crm: doc.medico_crm || (selectedDoc ? selectedDoc.numero_conselho : 'CRM/UF'),
      assinado: !!doc.assinado_digitalmente,
      criado_em: doc.criado_em,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ownerhealth-verify-doc-${doc.id}`
    };
    setViewingDoc(formatted);
  };

  const handlePrintDocFromHistory = (doc: any) => {
    const selectedDoc = professionals.find(p => String(p.id) === String(doc.profissional_id));
    setIssuedDoc({
      id: doc.id,
      tipo: doc.tipo,
      paciente_cpf: doc.paciente_cpf,
      conteudo: doc.conteudo,
      medico_nome: doc.medico_nome || (selectedDoc ? selectedDoc.nome : 'Médico Credenciado'),
      medico_crm: doc.medico_crm || (selectedDoc ? selectedDoc.numero_conselho : 'CRM/UF'),
      assinado: !!doc.assinado_digitalmente,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ownerhealth-verify-doc-${doc.id}`
    });
    setActiveTab('emitir');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredHistory = historyDocs.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const pat = patients.find(p => p.cpf === d.paciente_cpf || p.nome === d.paciente_cpf);
    const patName = pat ? pat.nome.toLowerCase() : '';
    return (
      d.paciente_cpf.toLowerCase().includes(q) ||
      patName.includes(q) ||
      d.tipo.toLowerCase().includes(q) ||
      (d.conteudo && d.conteudo.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-prescription-document, #printable-prescription-document * {
            visibility: visible !important;
          }
          #printable-prescription-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2rem !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="space-y-6 animate-fadeIn">
        {/* Navegação de Abas */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 no-print flex-wrap">
          <button
            onClick={() => setActiveTab('emitir')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'emitir'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Emitir Novo Documento</span>
          </button>

          <button
            onClick={() => { setActiveTab('historico'); fetchHistoryDocs(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'historico'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Emissões</span>
            {historyDocs.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'historico' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {historyDocs.length}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo da Aba 1: Emitir Documento */}
        {activeTab === 'emitir' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulário de Emissão */}
            <div className="space-y-6 no-print">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span>Emitir Receita ou Atestado</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Escreva o laudo, receita médica ou atestado de repouso assinado com certificado ICP-Brasil.
                  </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold">⚠️ {error}</div>}
                {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-[11px] font-bold">✓ {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Médico Emitente</label>
                      <select
                        value={docForm.profissional_id}
                        onChange={e => setDocForm({...docForm, profissional_id: e.target.value})}
                        disabled={isDoctor}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none disabled:opacity-70 disabled:bg-slate-100"
                      >
                        <option value="">Selecione o médico...</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Selecione o Paciente *</label>
                      <select
                        required
                        value={docForm.paciente_cpf}
                        onChange={e => setDocForm({...docForm, paciente_cpf: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="">Selecione o paciente...</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.cpf || p.nome}>
                            {p.nome} {p.cpf ? `(CPF: ${p.cpf})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tipo do Documento</label>
                    <div className="flex gap-4">
                      {[
                        { id: 'receita', label: 'Receita Médica' },
                        { id: 'atestado', label: 'Atestado Médico' }
                      ].map(type => (
                        <label key={type.id} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                          <input
                            type="radio"
                            name="tipo_doc"
                            checked={docForm.tipo === type.id}
                            onChange={() => setDocForm({...docForm, tipo: type.id})}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Conteúdo do Documento *</label>
                    <textarea
                      value={docForm.conteudo}
                      onChange={e => setDocForm({...docForm, conteudo: e.target.value})}
                      required
                      rows={6}
                      placeholder={
                        docForm.tipo === 'receita'
                          ? "Ex:\n1. Amoxicilina 500mg ------ 1 caixa\nTomar 1 comprimido de 8 em 8 horas por 7 dias."
                          : "Ex:\nAtesto para os devidos fins que o paciente necessita de 3 dias de repouso por motivos médicos de saúde a partir desta data."
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.assinado_digitalmente}
                      onChange={e => setDocForm({...docForm, assinado_digitalmente: e.target.checked})}
                      className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="text-[10px] text-slate-500 font-semibold leading-normal">
                      <span className="font-bold text-slate-700">Assinar digitalmente com ICP-Brasil</span>
                      <p className="mt-0.5">Sua assinatura eletrônica e carimbo digital CRM serão anexados com criptografia de ponta.</p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Emitir e Assinar Documento'}
                  </button>
                </form>
              </div>
            </div>

            {/* Visualização e Impressão do Documento */}
            <div className="space-y-6">
              {issuedDoc ? (
                <div className="space-y-4">
                  <div className="flex justify-end no-print">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir / Salvar PDF</span>
                    </button>
                  </div>

                  {/* Documento Formatado estilo Premium A4 */}
                  <div id="printable-prescription-document" className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-xl space-y-6 relative">
                    
                    {/* Header com Logo e Dados do Médico */}
                    <div className="flex justify-between items-start pb-6 border-b-2 border-indigo-600">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                          H
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Owner Health</h4>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Centro Médico & Serviços de Saúde</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <h5 className="text-xs font-black text-slate-800">{issuedDoc.medico_nome}</h5>
                        <p className="text-[11px] font-bold text-indigo-600">{issuedDoc.medico_crm}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Documento Médico Oficial</p>
                      </div>
                    </div>

                    {/* Titulo do Documento */}
                    <div className="text-center py-1">
                      <span className="inline-block px-6 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 uppercase tracking-widest">
                        {issuedDoc.tipo === 'receita' ? 'Receituário de Medicamentos' : 'Atestado Médico de Repouso'}
                      </span>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center text-xs gap-2">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px] block">Paciente</span>
                        <span className="text-slate-800 font-black text-xs">
                          {(() => {
                            const pat = patients.find(p => p.cpf === issuedDoc.paciente_cpf || p.nome === issuedDoc.paciente_cpf);
                            return pat ? `${pat.nome}${pat.cpf ? ` (CPF: ${pat.cpf})` : ''}` : issuedDoc.paciente_cpf;
                          })()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase text-[9px] block">Data de Emissão</span>
                        <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Conteúdo do Documento */}
                    <div className="py-2 min-h-[200px]">
                      <p className="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line font-mono bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                        {issuedDoc.conteudo}
                      </p>
                    </div>

                    {/* Assinatura + Validador QR */}
                    <div className="pt-6 border-t border-slate-200 flex flex-row justify-between items-end gap-6">
                      <div className="space-y-2">
                        {issuedDoc.assinado && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-700 font-black uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Assinado Digitalmente • ICP-Brasil</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-black text-slate-800">{issuedDoc.medico_nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{issuedDoc.medico_crm}</p>
                        </div>
                      </div>

                      {/* QR Code de Validação */}
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <img
                          src={issuedDoc.qr_code}
                          alt="Validação de QR Code"
                          className="w-14 h-14 shrink-0 rounded-lg border border-slate-200"
                        />
                        <div className="text-[9px] text-slate-500 font-medium leading-normal max-w-[120px]">
                          <span className="font-bold text-slate-700 block">Assinatura Eletrônica</span>
                          Escaneie para verificar a autenticidade do documento.
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[8px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                      Documento emitido via plataforma Owner Health nos termos da MP 2.200-2/2001 e Lei 14.063/2020.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-xs text-slate-500 font-bold">Nenhum documento gerado nesta sessão.</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Insira os dados à esquerda e clique em emitir para visualizar a receita ou atestado formatado para impressão.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Conteúdo da Aba 2: Histórico de Emissões */}
        {activeTab === 'historico' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    <span>Histórico de Receitas e Atestados Emitidos</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Consulte todos os documentos oficiais gerados e assinados digitalmente no banco de dados.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente ou tipo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Nenhum documento emitido encontrado.</p>
                  <p className="text-[10px] text-slate-400">Emita uma nova receita ou atestado na aba "Nova Emissão".</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                  {filteredHistory.map(doc => {
                    const pat = patients.find(p => p.cpf === doc.paciente_cpf || p.nome === doc.paciente_cpf);
                    const patientDisplay = pat ? `${pat.nome} (${pat.cpf || 'Sem CPF'})` : doc.paciente_cpf;

                    return (
                      <div key={doc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/80 transition group">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            doc.tipo === 'receita' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <FileText className="w-5.5 h-5.5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                doc.tipo === 'receita' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {doc.tipo === 'receita' ? 'Receituário Médico' : 'Atestado Médico'}
                              </span>
                              {doc.assinado_digitalmente ? (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Assinado ICP-Brasil
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs font-bold text-slate-800">{patientDisplay}</p>
                            
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold flex-wrap">
                              <span>Emitido em: {new Date(doc.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span>{doc.medico_nome}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleViewDoc(doc)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-xs font-bold text-slate-600 transition shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar</span>
                          </button>
                          <button
                            onClick={() => handlePrintDocFromHistory(doc)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold text-indigo-700 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Visualização Detalhada do Histórico */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-black text-slate-800 text-sm">Visualizar Documento #{viewingDoc.id}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Registrado no banco de dados MySQL</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const docToPrint = viewingDoc;
                    setViewingDoc(null);
                    handlePrintDocFromHistory(docToPrint);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-indigo-600">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                      H
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Owner Health</h4>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Centro Médico & Serviços de Saúde</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h5 className="text-xs font-black text-slate-800">{viewingDoc.medico_nome}</h5>
                    <p className="text-[11px] font-bold text-indigo-600">{viewingDoc.medico_crm}</p>
                  </div>
                </div>

                {/* Titulo */}
                <div className="text-center py-1">
                  <span className="inline-block px-6 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 uppercase tracking-widest">
                    {viewingDoc.tipo === 'receita' ? 'Receituário de Medicamentos' : 'Atestado Médico de Repouso'}
                  </span>
                </div>

                {/* Dados do Paciente */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center text-xs gap-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Paciente</span>
                    <span className="text-slate-800 font-black text-xs">
                      {(() => {
                        const pat = patients.find(p => p.cpf === viewingDoc.paciente_cpf || p.nome === viewingDoc.paciente_cpf);
                        return pat ? `${pat.nome}${pat.cpf ? ` (CPF: ${pat.cpf})` : ''}` : viewingDoc.paciente_cpf;
                      })()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold uppercase text-[9px] block">Data de Emissão</span>
                    <span className="text-slate-800 font-bold">{new Date(viewingDoc.criado_em || Date.now()).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="py-2 min-h-[180px]">
                  <p className="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line font-mono bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                    {viewingDoc.conteudo}
                  </p>
                </div>

                {/* Rodapé e Autenticação */}
                <div className="pt-6 border-t border-slate-200 flex flex-row justify-between items-end gap-6">
                  <div className="space-y-2">
                    {viewingDoc.assinado && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-700 font-black uppercase">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assinado Digitalmente • ICP-Brasil</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black text-slate-800">{viewingDoc.medico_nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{viewingDoc.medico_crm}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <img
                      src={viewingDoc.qr_code}
                      alt="Validação de QR Code"
                      className="w-14 h-14 shrink-0 rounded-lg border border-slate-200"
                    />
                    <div className="text-[9px] text-slate-500 font-medium leading-normal max-w-[120px]">
                      <span className="font-bold text-slate-700 block">Assinatura Eletrônica</span>
                      Escaneie para verificar a autenticidade do documento.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
