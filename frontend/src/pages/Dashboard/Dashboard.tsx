import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  Plus,
  Trash2,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  User,
  Loader2,
  Hash,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_URL } from '../../config';

const maskCpf = (v: string) =>
  v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);

const validateCpf = (v: string) => v.replace(/\D/g, '').length === 11;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : { id: 0, name: 'Usuário', email: '', roles: ['client'] };
  const activeRole = localStorage.getItem('activeRole') || user.roles[0];
  const token = localStorage.getItem('token');

  // Estados gerais
  const [stats, setStats] = useState({ clients: 0, companies: 0, professionals: 0, plans: 0 });
  const [loading, setLoading] = useState(true);

  // Estados específicos de Cliente / Dependente
  const [clientData, setClientData] = useState<any>(null);
  const [dependents, setDependents] = useState<any[]>([]);
  const [showDepModal, setShowDepModal] = useState(false);
  const [depForm, setDepForm] = useState({
    nome: '', cpf: '', data_nascimento: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    email: '', celular: '',
    plano_empresa: '', plano_nome: '', plano_produto: '', plano_numero_carteirinha: '', senha: ''
  });
  const [depError, setDepError] = useState('');
  const [depSuccess, setDepSuccess] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [showDepSenha, setShowDepSenha] = useState(false);

  const handleCepBlur = async () => {
    const cep = depForm.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError('');
      return;
    }
    setCepLoading(true);
    setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
      } else {
        setCepError('');
        setDepForm(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }));
      }
    } catch {
      setCepError('Não foi possível consultar o CEP. Verifique sua conexão.');
    } finally {
      setCepLoading(false);
    }
  };

  // Estados específicos de Empresa
  const [companyData, setCompanyData] = useState<any>(null);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [companyPlans, setCompanyPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlanProcedures, setSelectedPlanProcedures] = useState('');
  const [showPlanSim, setShowPlanSim] = useState(false);
  const [simulatedPaymentSuccess, setSimulatedPaymentSuccess] = useState(false);

  // Buscar dados
  useEffect(() => {
    fetchDashboardData();
  }, [activeRole]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Dados de Estatísticas para Admin
      if (activeRole === 'admin') {
        const [resC, resCo, resP, resPl] = await Promise.all([
          fetch(`${API_URL}/api/clients`, { headers }),
          fetch(`${API_URL}/api/companies`, { headers }),
          fetch(`${API_URL}/api/professionals`, { headers }),
          fetch(`${API_URL}/api/health-plans`, { headers }),
        ]);

        const clients = await resC.json();
        const companies = await resCo.json();
        const professionals = await resP.json();
        const plans = await resPl.json();

        setStats({
          clients: Array.isArray(clients) ? clients.length : 0,
          companies: Array.isArray(companies) ? companies.length : 0,
          professionals: Array.isArray(professionals) ? professionals.length : 0,
          plans: Array.isArray(plans) ? plans.length : 0,
        });
      }

      // Dados para Perfil Cliente
      if (activeRole === 'client') {
        const res = await fetch(`${API_URL}/api/clients`, { headers });
        const clients = await res.json();
        if (Array.isArray(clients)) {
          const currentClient = clients.find(c => c.email.toLowerCase() === user.email.toLowerCase());
          if (currentClient) {
            setClientData(currentClient);
            // Buscar dependentes
            const resD = await fetch(`${API_URL}/api/dependents/client/${currentClient.id}`, { headers });
            const deps = await resD.json();
            setDependents(Array.isArray(deps) ? deps : []);
          }
        }
      }

      // Dados para Perfil Empresa
      if (activeRole === 'company') {
        const res = await fetch(`${API_URL}/api/companies`, { headers });
        const companies = await res.json();
        if (Array.isArray(companies)) {
          const currentCompany = companies.find(c => c.email.toLowerCase() === user.email.toLowerCase());
          if (currentCompany) {
            const resDetail = await fetch(`${API_URL}/api/companies/${currentCompany.id}`, { headers });
            const detail = await resDetail.json();
            setCompanyData(detail);
            setCompanyPlans(detail.health_plans || []);
          }
        }
        const resPlans = await fetch(`${API_URL}/api/health-plans`, { headers });
        const allPlans = await resPlans.json();
        setPlansList(Array.isArray(allPlans) ? allPlans : []);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cadastrar Dependente
  const handleAddDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepError('');
    setDepSuccess('');

    if (!clientData || !clientData.id) {
      setDepError('Erro: dados do cliente não carregados. Recarregue a página e tente novamente.');
      return;
    }

    if (cpfError) {
      setDepError('Corrija o CPF antes de continuar.');
      return;
    }
    if (!validateCpf(depForm.cpf)) {
      setCpfError('CPF inválido.');
      setDepError('Corrija o CPF antes de continuar.');
      return;
    }

    if (cepError) {
      setDepError('Corrija o CEP antes de continuar.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/dependents/client/${clientData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(depForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar dependente');
      }

      setDepSuccess('Dependente cadastrado com sucesso!');
      setDepForm({
        nome: '', cpf: '', data_nascimento: '',
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
        email: '', celular: '',
        plano_empresa: '', plano_nome: '', plano_produto: '', plano_numero_carteirinha: '', senha: ''
      });
      setCpfError('');
      setCepError('');
      setShowDepSenha(false);
      fetchDashboardData();
      setTimeout(() => setShowDepModal(false), 1500);
    } catch (err: any) {
      setDepError(err.message);
    }
  };

  // Excluir Dependente
  const handleDeleteDependent = async (id: number) => {
    if (!confirm('Deseja realmente remover este dependente?')) return;
    try {
      const response = await fetch(`${API_URL}/api/dependents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Empresa vincula plano de saúde que atende
  const handleLinkPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    try {
      const response = await fetch(`${API_URL}/api/companies/${companyData.id}/health-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          health_plan_id: selectedPlanId,
          procedures: selectedPlanProcedures
        })
      });

      if (response.ok) {
        setSelectedPlanId('');
        setSelectedPlanProcedures('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCompanyPlan = async (relationId: number) => {
    if (!confirm('Remover este plano de saúde da sua lista de atendimento?')) return;
    try {
      const response = await fetch(`${API_URL}/api/companies/health-plans/${relationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies/${companyData.id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paid: true })
      });
      if (response.ok) {
        setSimulatedPaymentSuccess(true);
        setTimeout(() => {
          setSimulatedPaymentSuccess(false);
          setShowPlanSim(false);
          fetchDashboardData();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // --- VIEW ADMIN ---
  if (activeRole === 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Olá, Administrador!</h2>
            <p className="text-blue-100 text-sm mt-1">Gerencie a plataforma Owner Health e acompanhe os indicadores em tempo real.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
            <HeartPulse className="w-6 h-6 text-blue-300" />
            <span className="text-sm font-bold">Painel Master Ativo</span>
          </div>
        </div>

        {/* Ações Rápidas de Cadastro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ações Rápidas de Cadastro</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/clients?add=true')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Cliente</span>
            </button>
            <button
              onClick={() => navigate('/companies?add=true')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Clínica</span>
            </button>
            <button
              onClick={() => navigate('/professionals?add=true')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-teal-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Profissional</span>
            </button>
          </div>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clientes</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.clients}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clínicas / Hospitais</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.companies}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Profissionais</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.professionals}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Planos Cadastrados</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.plans}</h3>
            </div>
          </div>
        </div>

        {/* Resumo e LGPD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h4 className="text-md font-bold text-slate-800 mb-4">Monitoramento de Atividades</h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 grid grid-cols-3">
                <span>Evento</span>
                <span>Origem</span>
                <span>Data</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                <div className="px-4 py-3.5 grid grid-cols-3">
                  <span className="text-emerald-600">Cadastro de Cliente</span>
                  <span>Carlos Silva</span>
                  <span>Hoje às 11:30</span>
                </div>
                <div className="px-4 py-3.5 grid grid-cols-3">
                  <span className="text-blue-600">Aceite LGPD</span>
                  <span>Carlos Silva</span>
                  <span>Hoje às 11:30</span>
                </div>
                <div className="px-4 py-3.5 grid grid-cols-3">
                  <span className="text-indigo-600">Parceria Clínica</span>
                  <span>Clínica Saúde Total</span>
                  <span>Ontem às 18:15</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-md font-bold text-slate-800 mb-4">Segurança e LGPD</h4>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 mb-4">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
              <div>
                <p className="text-xs font-bold">Conformidade Ativa</p>
                <p className="text-[11px] leading-relaxed mt-0.5 opacity-90">
                  Todos os titulares cadastrados assinaram digitalmente os termos de privacidade antes de acessar a plataforma.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-2">
                <span className="text-slate-500">Versão dos Termos</span>
                <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">v1.0</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Total Aceites Registrados</span>
                <span className="text-slate-800">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW CLIENTE ---
  if (activeRole === 'client') {
    // Nenhum perfil de cliente encontrado para este usuário
    if (!clientData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Perfil de cliente não encontrado</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              O usuário <span className="font-bold text-slate-700">{user.email}</span> não possui um perfil de cliente cadastrado.
            </p>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
              Para testar o painel de cliente, faça login diretamente com uma conta que possua um cadastro na área de clientes.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Olá, {clientData?.nome || user.name}!</h2>
            <p className="text-blue-100 text-sm mt-1">Seja bem-vindo à sua área de saúde integrada.</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start md:self-center">
            Plano Free Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Pessoais */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Meus Dados</span>
            </h3>
            <div className="space-y-2.5 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPF</p>
                <p className="text-slate-800 font-bold mt-0.5">{clientData?.cpf}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Data de Nascimento</p>
                <p className="text-slate-800 font-bold mt-0.5">
                  {clientData?.data_nascimento ? new Date(clientData.data_nascimento).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Endereço</p>
                <p className="text-slate-800 font-bold mt-0.5">{clientData?.endereco}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contato</p>
                <p className="text-slate-800 font-bold mt-0.5">{clientData?.celular} | {clientData?.email}</p>
              </div>
            </div>
          </div>

          {/* Plano de Saúde */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Plano de Saúde</span>
            </h3>
            {clientData?.plano_empresa ? (
              <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operadora / Empresa</p>
                  <p className="text-slate-800 font-bold mt-0.5">{clientData?.plano_empresa}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plano</p>
                  <p className="text-slate-800 font-bold mt-0.5">{clientData?.plano_nome}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produto</p>
                  <p className="text-slate-800 font-bold mt-0.5">{clientData?.plano_produto}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Número da Carteirinha</p>
                  <p className="text-slate-800 font-bold mt-0.5">{clientData?.plano_numero_carteirinha}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Você não cadastrou nenhum plano de saúde.</p>
            )}
          </div>

          {/* Segurança LGPD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Termos da LGPD</span>
              </h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Suas informações estão seguras conosco e em total conformidade com a Lei Geral de Proteção de Dados. Você aceitou nossos termos para utilizar a plataforma.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-6 text-xs text-slate-500 font-bold">
              <div className="flex justify-between items-center mb-1">
                <span>Status de Aceite</span>
                <span className="text-emerald-600">Sim</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span>Data do Aceite</span>
                <span>{clientData?.lgpd_aceito_em ? new Date(clientData.lgpd_aceito_em).toLocaleString() : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dependentes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-800">Dependentes Cadastrados</h3>
              <p className="text-xs text-slate-500 font-medium">Cadastre até 2 dependentes no Plano Free</p>
            </div>
            <button
              onClick={() => {
                if (dependents.length >= 2) {
                  alert('Você atingiu o limite de 2 dependentes para o plano Free.');
                  return;
                }
                setShowDepModal(true);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Dependente ({dependents.length}/2)</span>
            </button>
          </div>

          {dependents.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-bold">Nenhum dependente cadastrado ainda.</p>
              <p className="text-[10px] text-slate-400 mt-1">Adicione seus familiares para gerenciar a saúde deles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dependents.map((dep) => (
                <div key={dep.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50 relative flex flex-col justify-between">
                  <button
                    onClick={() => handleDeleteDependent(dep.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{dep.nome}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Dependente</p>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 text-xs font-semibold text-slate-600">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPF</p>
                        <p className="text-slate-800 font-bold mt-0.5">{dep.cpf}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nascimento</p>
                        <p className="text-slate-800 font-bold mt-0.5">
                          {new Date(dep.data_nascimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plano</p>
                        <p className="text-slate-800 font-bold mt-0.5">
                          {dep.plano_empresa ? `${dep.plano_empresa} - ${dep.plano_nome} (${dep.plano_numero_carteirinha})` : 'Sem plano associado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Dependente */}
        {showDepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowDepModal(false)} />
            <div className="bg-white rounded-[2rem] w-full max-w-xl p-6 md:p-8 relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-lg font-black text-slate-800 mb-6">Cadastrar Dependente</h3>
              
              {depError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4">{depError}</div>}
              {depSuccess && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold mb-4">{depSuccess}</div>}

              <form onSubmit={handleAddDependent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo</label>
                    <input
                      type="text" required
                      value={depForm.nome}
                      onChange={e => setDepForm({...depForm, nome: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">CPF</label>
                    <input
                      type="text" required placeholder="000.000.000-00"
                      value={depForm.cpf}
                      onChange={e => { setDepForm({...depForm, cpf: maskCpf(e.target.value)}); setCpfError(''); }}
                      onBlur={() => { if (depForm.cpf && !validateCpf(depForm.cpf)) setCpfError('CPF inválido. Informe os 11 dígitos.'); else setCpfError(''); }}
                      maxLength={14}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 ${cpfError ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {cpfError && <p className="text-red-500 text-[10px] font-bold mt-1">⚠ {cpfError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Data de Nascimento</label>
                    <input
                      type="date" required
                      value={depForm.data_nascimento}
                      onChange={e => setDepForm({...depForm, data_nascimento: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  {/* CEP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">CEP</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        {cepLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <MapPin className={`w-4.5 h-4.5 ${cepError ? 'text-red-400' : ''}`} />}
                      </span>
                      <input
                        type="text" required placeholder="00000-000"
                        value={depForm.cep}
                        onChange={e => { setDepForm({...depForm, cep: e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').slice(0,9)}); setCepError(''); }}
                        onBlur={handleCepBlur}
                        className={`w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 ${cepError ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`}
                        maxLength={9}
                      />
                    </div>
                    {cepError && (
                      <p className="text-red-500 text-[10px] font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {cepError}
                      </p>
                    )}
                  </div>

                  {/* Número */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Número</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Hash className="w-4 h-4" />
                      </span>
                      <input
                        type="text" required placeholder="Ex: 123"
                        value={depForm.numero}
                        onChange={e => setDepForm({...depForm, numero: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Logradouro */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Logradouro</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        type="text" required placeholder="Rua, Avenida..."
                        value={depForm.logradouro}
                        onChange={e => setDepForm({...depForm, logradouro: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Bairro</label>
                    <input
                      type="text" required placeholder="Bairro"
                      value={depForm.bairro}
                      onChange={e => setDepForm({...depForm, bairro: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Cidade</label>
                    <input
                      type="text" required placeholder="Cidade"
                      value={depForm.cidade}
                      onChange={e => setDepForm({...depForm, cidade: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Estado (UF)</label>
                    <input
                      type="text" required placeholder="Ex: SP"
                      value={depForm.estado}
                      onChange={e => setDepForm({...depForm, estado: e.target.value.toUpperCase().slice(0,2)})}
                      maxLength={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Complemento <span className="text-slate-400 font-normal">(opcional)</span></label>
                    <input
                      type="text" placeholder="Apto, Sala..."
                      value={depForm.complemento}
                      onChange={e => setDepForm({...depForm, complemento: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Plano de Saúde (Opcional)</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Operadora / Empresa</label>
                    <input
                      type="text"
                      value={depForm.plano_empresa}
                      onChange={e => setDepForm({...depForm, plano_empresa: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Plano</label>
                    <input
                      type="text"
                      value={depForm.plano_nome}
                      onChange={e => setDepForm({...depForm, plano_nome: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Produto</label>
                    <input
                      type="text"
                      value={depForm.plano_produto}
                      onChange={e => setDepForm({...depForm, plano_produto: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Carteirinha</label>
                    <input
                      type="text"
                      value={depForm.plano_numero_carteirinha}
                      onChange={e => setDepForm({...depForm, plano_numero_carteirinha: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Login do dependente (opcional) */}
                <div className="col-span-2 border-t border-slate-100 pt-3 mt-2">
                  <h4 className="text-xs font-black text-slate-700 mb-1">Acesso ao Portal <span className="text-slate-400 font-normal">(opcional)</span></h4>
                  <p className="text-[10px] text-amber-600 font-semibold mb-3">Se preenchido, um e-mail com a senha temporária será enviado ao dependente.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">E-mail do Dependente</label>
                      <input
                        type="email" placeholder="dependente@email.com"
                        value={depForm.email}
                        onChange={e => setDepForm({...depForm, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Senha Temporária</label>
                      <div className="relative">
                        <input
                          type={showDepSenha ? 'text' : 'password'} placeholder="senha temporária"
                          value={depForm.senha}
                          onChange={e => setDepForm({...depForm, senha: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDepSenha(v => !v)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showDepSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDepModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 transition-colors"
                  >
                    Salvar Dependente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW EMPRESA (HOSPITAL / CLÍNICA) ---
  if (activeRole === 'company') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">{companyData?.razao_social || user.name}</h2>
            <p className="text-blue-100 text-sm mt-1">{companyData?.nome_fantasia}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-bold border text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider ${
              companyData?.pago 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {companyData?.pago ? 'Licença Corporativa Paga' : 'Licença Corporativa Pendente'}
            </span>
            {!companyData?.pago && (
              <button
                onClick={() => setShowPlanSim(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-blue-700 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/20"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simular Pagamento</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Planos de Saúde que Atende */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Planos de Saúde Atendidos</span>
              <span className="text-xs font-medium text-slate-500">Vincule os planos que a clínica aceita</span>
            </h3>

            {/* Formulário de Associação */}
            <form onSubmit={handleLinkPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selecione o Plano</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {plansList.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.operadora} - {plan.plano} ({plan.produto})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Procedimentos (Separados por vírgula)</label>
                  <input
                    type="text" placeholder="Consultas, Exames de Sangue..."
                    value={selectedPlanProcedures}
                    onChange={e => setSelectedPlanProcedures(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-primary-600/10 whitespace-nowrap h-[36px]"
                >
                  Vincular
                </button>
              </div>
            </form>

            {/* Listagem */}
            {companyPlans.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum plano associado ainda.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {companyPlans.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.company_name} - {item.plan_name}</p>
                      <p className="text-slate-500 mt-0.5"><span className="font-semibold">Procedimentos:</span> {item.procedures || 'Todos'}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCompanyPlan(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dados Corporativos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Dados da Empresa</span>
            </h3>
            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CNPJ</p>
                <p className="text-slate-800 font-bold mt-0.5">{companyData?.cnpj}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Responsável</p>
                <p className="text-slate-800 font-bold mt-0.5">{companyData?.nome_responsavel} ({companyData?.cargo_responsavel})</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contato</p>
                <p className="text-slate-800 font-bold mt-0.5">{companyData?.celular} | {companyData?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profissionais da Clínica */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-800">Profissionais Vinculados</h3>
              <p className="text-xs text-slate-500 font-medium">Médicos e terapeutas que atendem na instituição</p>
            </div>
          </div>

          {(!companyData?.professionals || companyData.professionals.length === 0) ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-bold">Nenhum profissional vinculado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {companyData.professionals.map((prof: any) => (
                <div key={prof.id} className="border border-slate-100 bg-slate-50 rounded-2xl p-5 relative flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{prof.nome}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{prof.numero_conselho}</p>
                    <p className="text-[10px] text-slate-400 mt-2">{prof.celular} | {prof.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Simulação de Pagamento */}
        {showPlanSim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowPlanSim(false)} />
            <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 relative z-10 text-center shadow-2xl">
              <h3 className="text-lg font-black text-slate-800 mb-2">Checkout Licença</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">Checkout integrado para liberar o Plano Empresa completo</p>

              {simulatedPaymentSuccess ? (
                <div className="space-y-3 py-6 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-slate-800">Pagamento Confirmado!</p>
                  <p className="text-xs text-slate-500">Parabéns! Sua clínica já está totalmente operacional.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 border-b border-slate-100 pb-2">
                      <span>Assinatura Anual</span>
                      <span>R$ 1.199,00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-slate-800 pt-2">
                      <span>Total</span>
                      <span className="text-blue-700">R$ 1.199,00</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-600/20"
                  >
                    Simular Cartão de Crédito (Sucesso)
                  </button>
                  <button
                    onClick={() => setShowPlanSim(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW PROFISSIONAL ---
  if (activeRole === 'professional') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Olá, Profissional!</h2>
            <p className="text-blue-100 text-sm mt-1">Gerencie seus vínculos a clínicas e planos de saúde aceitos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hospitais / Clínicas Vinculados */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Clínicas e Hospitais Vinculados</span>
            </h3>
            <p className="text-xs text-slate-500">
              Você está associado às seguintes instituições e pode aceitar atendimentos nelas.
            </p>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-xs font-bold text-slate-600">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                <span>Instituição</span>
                <span>Contato</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-semibold">
                <span>Clínica Saúde Total</span>
                <span>(11) 4567-8901</span>
              </div>
            </div>
          </div>

          {/* Planos Atendidos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Meus Planos de Saúde</span>
            </h3>
            <div className="text-xs font-semibold text-slate-600 space-y-2">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-800">
                <p className="font-bold">Unimed - Nacional Flex</p>
                <p className="text-[10px] mt-0.5">Procedimentos: Consulta Cardiológica, Eletrocardiograma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
