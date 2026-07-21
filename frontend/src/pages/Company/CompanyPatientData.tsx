import React, { useState } from 'react';
import {
  Search, FlaskConical, Pill, Scale, FileText,
  Loader2, ShieldAlert, ShieldCheck, Download, Calendar, Users, Plus
} from 'lucide-react';
import { API_URL } from '../../config';
import { PatientRegistrationModal } from '../../components/PatientRegistrationModal';
import { PatientAnamnesisCustomizerModal } from './PatientAnamnesisCustomizerModal';

const formatDatePtBr = (dateStr?: string | null) => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return 'Não informada';
  const str = dateStr.trim();
  if (str.includes('/')) return str;
  const rawDate = str.split('T')[0];
  const parts = rawDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y && m && d && y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  } catch {}
  return 'Não informada';
};

export const CompanyPatientData: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('anamnesis'); // anamnesis, exams, prescriptions, bioimpedance
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = user.empresa_id || user.id;

  const fetchPatients = () => {
    fetch(`${API_URL}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPatientsList(data);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setError('');
    setPatientData(null);

    try {
      const res = await fetch(`${API_URL}/api/companies/${companyId}/patient-data/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível encontrar o paciente ou o acesso não foi compartilhado.');
      }
      setPatientData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientByCpf = async (cpf: string) => {
    setSearchQuery(cpf);
    setLoading(true);
    setError('');
    setPatientData(null);
    try {
      const res = await fetch(`${API_URL}/api/companies/${companyId}/patient-data/${cpf}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar prontuário.');
      setPatientData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <span>Gerenciamento de Pacientes</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Lista de pacientes da clínica e acesso a prontuários e exames.
        </p>
      </div>

      {/* Barra de Busca de Paciente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              required
              placeholder="Digite o CPF ou o código temporário do paciente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar Prontuário'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-bold mt-4 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {!patientData && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Pacientes Vinculados</h3>
            {user.tipo_profissional !== 'medico' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold transition"
              >
                <Plus className="w-4 h-4" />
                Novo Paciente
              </button>
            )}
          </div>
          
          {patientsList.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Nenhum paciente vinculado à clínica no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientsList.map(p => (
                <div key={p.id} className="border border-slate-150 p-4 rounded-xl hover:shadow-md transition bg-slate-50 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{p.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">CPF: {p.cpf}</p>
                    <p className="text-xs text-slate-500">Cel: {p.celular}</p>
                  </div>
                  <button 
                    onClick={() => loadPatientByCpf(p.cpf)}
                    className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition"
                  >
                    Ver Prontuário
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Novo Paciente */}
      {showModal && (
        <PatientRegistrationModal 
          companyId={companyId} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); fetchPatients(); }} 
        />
      )}

      {/* Prontuário do Paciente */}
      {patientData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lado Esquerdo: Ficha do Paciente */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-indigo-150 flex items-center justify-center text-indigo-600 font-black">
                  {patientData.patient.nome[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{patientData.patient.nome}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Paciente</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CPF</p>
                  <p className="text-slate-800 font-bold mt-0.5">{patientData.patient.cpf}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nascimento</p>
                  <p className="text-slate-800 font-bold mt-0.5">
                    {formatDatePtBr(patientData.patient.data_nascimento)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Contatos</p>
                  <p className="text-slate-800 font-bold mt-0.5">{patientData.patient.celular} | {patientData.patient.email}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Endereço</p>
                  <p className="text-slate-800 font-bold mt-0.5 leading-relaxed">{patientData.patient.endereco}</p>
                </div>
                
                {patientData.patient.plano_empresa && (
                  <div className="border-t border-slate-100 pt-3.5 space-y-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Convênio Ativo</p>
                    <p className="text-slate-800 font-bold">{patientData.patient.plano_empresa} - {patientData.patient.plano_nome}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Carteirinha: {patientData.patient.plano_numero_carteirinha}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-5 flex gap-3 text-emerald-800">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="text-xs font-black">Acesso Consentido</p>
                <p className="text-[10px] leading-relaxed font-semibold opacity-95 mt-0.5">
                  Este acesso foi gerado com o consentimento do paciente em conformidade com a LGPD. As ações de leitura são registradas para auditoria de segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Lado Direito: Tabs com Informações */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 gap-6 overflow-x-auto pb-1">
                {[
                  { id: 'anamnesis', label: 'Anamnese', icon: FileText },
                  { id: 'exams', label: 'Exames', icon: FlaskConical },
                  { id: 'prescriptions', label: 'Receitas', icon: Pill },
                  { id: 'bioimpedance', label: 'Bioimpedância', icon: Scale }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 pb-3.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                
                {/* Tab: Anamnese */}
                {activeTab === 'anamnesis' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800">Histórico de Anamnese</h3>
                      <button 
                        onClick={() => setShowAnamnesisModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        Nova Solicitação de Anamnese
                      </button>
                    </div>

                    {patientData.anamnesis.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-10">O paciente ainda não possui formulários de anamnese preenchidos.</p>
                    ) : (
                      <div className="space-y-6">
                        {patientData.anamnesis.map((a: any) => (
                          <div key={a.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4 shadow-sm">
                            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                {a.tipo === 'estruturada' ? 'Formulário de Anamnese Preenchido' : 'Anamnese Geral'}
                              </span>
                              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                {formatDatePtBr(a.criado_em)}
                              </span>
                            </div>

                            {a.tipo === 'estruturada' && Array.isArray(a.respostas) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {a.respostas.map((r: any, idx: number) => (
                                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{r.pergunta}</p>
                                    <p className="text-xs font-black text-slate-800 mt-1">{r.resposta || 'Sem resposta'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                                <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-100">
                                  <p className="text-[10px] text-indigo-600 font-black uppercase">Queixa Principal</p>
                                  <p className="text-slate-800 font-bold mt-1">{a.queixa_principal || 'Não informada'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Histórico de Doenças</p>
                                  <p className="text-slate-800 font-bold mt-1">{a.historico_doencas || 'Nenhum'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Alergias</p>
                                  <p className="text-slate-800 font-bold mt-1">{a.alergias || 'Nenhuma'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Exames */}
                {activeTab === 'exams' && (
                  <div className="space-y-4">
                    {patientData.exams.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-10">Nenhum exame compartilhado disponível.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {patientData.exams.map((ex: any) => (
                          <div key={ex.id} className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">{ex.tipo}</span>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {new Date(ex.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mt-1">{ex.laboratorio || 'Laboratório N/I'}</p>
                              {ex.observacoes && (
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5 font-semibold bg-white p-3 rounded-xl border border-slate-150">
                                  {ex.observacoes}
                                </p>
                              )}
                            </div>
                            
                            {ex.arquivo_url && (
                              <a
                                href={ex.arquivo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 mt-4 self-start text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Visualizar Laudo Técnico</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Receitas */}
                {activeTab === 'prescriptions' && (
                  <div className="space-y-4">
                    {patientData.prescriptions.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-10">Nenhuma receita compartilhada disponível.</p>
                    ) : (
                      <div className="space-y-4">
                        {patientData.prescriptions.map((p: any) => (
                          <div key={p.id} className="border border-slate-150 bg-slate-50 p-5 rounded-2xl">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 mb-3">
                              <div>
                                <p className="text-xs font-bold text-slate-800">Receita por: {p.medico || 'Médico não informado'}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Documento de Prescrição</p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Medicamentos Ministrados</p>
                                <p className="text-slate-800 font-black mt-1 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-150">
                                  {p.medicamentos}
                                </p>
                              </div>
                              {p.observacoes && (
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Observações/Instruções</p>
                                  <p className="text-slate-600 mt-1 leading-relaxed">{p.observacoes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Bioimpedância */}
                {activeTab === 'bioimpedance' && (
                  <div className="space-y-4">
                    {patientData.bioimpedance.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-10">Nenhum registro de bioimpedância disponível.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-150">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase border-b border-slate-150">
                            <tr>
                              <th className="px-4 py-2.5">Data</th>
                              <th className="px-4 py-2.5">Peso</th>
                              <th className="px-4 py-2.5">IMC</th>
                              <th className="px-4 py-2.5">Gordura %</th>
                              <th className="px-4 py-2.5">Músculo %</th>
                              <th className="px-4 py-2.5">Água %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold">
                            {patientData.bioimpedance.map((b: any) => (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">{new Date(b.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3 text-slate-800">{b.peso} kg</td>
                                <td className="px-4 py-3">{b.imc}</td>
                                <td className="px-4 py-3 text-red-500">{b.gordura_perc}%</td>
                                <td className="px-4 py-3 text-emerald-500">{b.massa_muscular}%</td>
                                <td className="px-4 py-3 text-blue-500">{b.agua_perc}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      )}

      {showAnamnesisModal && patientData && (
        <PatientAnamnesisCustomizerModal
          companyId={companyId!}
          patientId={patientData.patient.id}
          onClose={() => setShowAnamnesisModal(false)}
          onSuccess={() => {
            setShowAnamnesisModal(false);
            alert('Anamnese enviada com sucesso!');
            // Ideally we refresh the requests list here
          }}
        />
      )}
    </div>
  );
};
