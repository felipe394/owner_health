import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Trash2, Mail, Lock, User, Calendar, MapPin, Phone } from 'lucide-react';
import { API_URL } from '../../config';

export const ProfessionalList: React.FC = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Perfil Ativo
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : { email: '', roles: ['client'] };
  const activeRole = localStorage.getItem('activeRole') || user.roles[0];
  const token = localStorage.getItem('token');

  // Identificar dados da empresa se for perfil empresa
  const [myCompany, setMyCompany] = useState<any>(null);

  // Form para novo profissional
  const [form, setForm] = useState({
    nome: '', cpf: '', data_nascimento: '', endereco: '', numero_conselho: '',
    email: '', celular: '', senha: '', company_id: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [activeRole]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      let companyInfo = null;
      if (activeRole === 'company') {
        const resCo = await fetch(`${API_URL}/api/companies`, { headers });
        const allCos = await resCo.json();
        if (Array.isArray(allCos)) {
          companyInfo = allCos.find(c => c.email.toLowerCase() === user.email.toLowerCase());
          setMyCompany(companyInfo);
        }
      }

      // Buscar profissionais
      const url = activeRole === 'company' && companyInfo 
        ? `${API_URL}/api/professionals?companyId=${companyInfo.id}` 
        : `${API_URL}/api/professionals`;
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      setProfessionals(Array.isArray(data) ? data : []);

      if (activeRole === 'admin') {
        const resCompanies = await fetch(`${API_URL}/api/companies`, { headers });
        const dataCos = await resCompanies.json();
        setCompanies(Array.isArray(dataCos) ? dataCos : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Definir empresa de vínculo se for cadastro feito por uma clínica
    const payload = {
      ...form,
      company_id: activeRole === 'company' ? myCompany?.id : form.company_id
    };

    try {
      const response = await fetch(`${API_URL}/api/professionals/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar profissional');
      }

      setSuccess('Profissional cadastrado e vinculado com sucesso!');
      setForm({
        nome: '', cpf: '', data_nascimento: '', endereco: '', numero_conselho: '',
        email: '', celular: '', senha: '', company_id: ''
      });
      fetchInitialData();
      setTimeout(() => setShowAddModal(false), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnlink = async (profId: number) => {
    if (!confirm('Deseja realmente desvincular este profissional da instituição?')) return;
    try {
      const response = await fetch(`${API_URL}/api/professionals/${profId}/unlink-company?companyId=${myCompany.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Corpo Clínico</h2>
          <p className="text-xs text-slate-500 font-medium">
            {activeRole === 'company' 
              ? 'Gerencie os profissionais de saúde vinculados à sua clínica' 
              : 'Lista global de profissionais de saúde cadastrados'}
          </p>
        </div>
        
        {/* Clínicas podem criar e gerir profissionais vinculados */}
        {activeRole === 'company' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Profissional</span>
          </button>
        )}
      </div>

      {professionals.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Nenhum profissional vinculado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4">Nome</th>
                <th className="p-4">CPF / Conselho</th>
                <th className="p-4">Nascimento</th>
                <th className="p-4">Contato</th>
                {activeRole === 'company' && <th className="p-4 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
              {professionals.map(prof => (
                <tr key={prof.id} className="hover:bg-slate-50/50">
                  <td className="p-4">{prof.nome}</td>
                  <td className="p-4">
                    <p>{prof.cpf}</p>
                    <p className="text-[10px] text-blue-700 mt-0.5">{prof.numero_conselho}</p>
                  </td>
                  <td className="p-4">{new Date(prof.data_nascimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <p>{prof.celular}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{prof.email}</p>
                  </td>
                  {activeRole === 'company' && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleUnlink(prof.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-transparent font-bold transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Desvincular</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cadastrar Profissional */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-2xl p-6 md:p-8 relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-6">Cadastrar Profissional</h3>
            
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold mb-4">{success}</div>}

            <form onSubmit={handleAddProfessional} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text" required
                      value={form.nome}
                      onChange={e => setForm({...form, nome: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">CPF</label>
                  <input
                    type="text" required placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={e => setForm({...form, cpf: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Número do Conselho Regional</label>
                  <input
                    type="text" required placeholder="CRM-SP 123456"
                    value={form.numero_conselho}
                    onChange={e => setForm({...form, numero_conselho: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Data de Nascimento</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date" required
                      value={form.data_nascimento}
                      onChange={e => setForm({...form, data_nascimento: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Celular / Telefone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text" required placeholder="(00) 00000-0000"
                      value={form.celular}
                      onChange={e => setForm({...form, celular: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Endereço Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text" required
                      value={form.endereco}
                      onChange={e => setForm({...form, endereco: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-xs font-black text-slate-700 mb-3">Dados de Acesso (Login)</h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">E-mail (Login)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email" required placeholder="medico@clinica.com"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Senha de Acesso</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password" required placeholder="senha temporária"
                      value={form.senha}
                      onChange={e => setForm({...form, senha: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 transition-colors"
                >
                  Salvar e Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
