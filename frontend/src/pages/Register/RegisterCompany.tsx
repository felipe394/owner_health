import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Building2, User, FileText, Phone } from 'lucide-react';
import { API_URL } from '../../config';

export const RegisterCompany: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    nome_responsavel: '',
    cpf_responsavel: '',
    cargo_responsavel: '',
    email: '',
    celular: '',
    senha: '',
    confirmar_senha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.senha !== form.confirmar_senha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro corporativo');
      }

      setSuccess('Cadastro corporativo realizado com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] animate-fadeIn">
        
        {/* Lado Esquerdo - Info */}
        <div className="hidden md:flex w-1/3 relative text-white flex-col justify-between p-10" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,58,138,0.95) 0%, rgba(29,78,216,0.3) 60%, transparent 100%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-md">Owner Health</span>
            </div>
            
            <h3 className="text-2xl font-black leading-tight">Painel Corporativo Clínico</h3>
            <p className="text-xs text-blue-100 mt-3 font-semibold leading-relaxed">
              Associe sua clínica ou hospital, controle os profissionais do seu corpo clínico, os planos aceitos e otimize seus pré-atendimentos.
            </p>
          </div>

          <div className="relative z-10 text-[10px] text-blue-200 font-bold uppercase tracking-wider">
            Plano Empresa • Corporativo
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cadastro de Hospital / Clínica</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Preencha os dados organizacionais abaixo para iniciar</p>
            <div className="w-12 h-1 bg-blue-600 mt-3 rounded-full" />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 border-b border-slate-100 pb-2">Dados da Instituição</h4>
              </div>

              {/* Razão Social */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Razão Social</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required
                    value={form.razao_social}
                    onChange={e => setForm({...form, razao_social: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    placeholder="Razão Social Ltda"
                  />
                </div>
              </div>

              {/* Nome Fantasia */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome Fantasia</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required
                    value={form.nome_fantasia}
                    onChange={e => setForm({...form, nome_fantasia: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    placeholder="Nome Fantasia da Clínica"
                  />
                </div>
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CNPJ</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={e => setForm({...form, cnpj: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Celular / Telefone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Telefone Comercial</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="(00) 0000-0000"
                    value={form.celular}
                    onChange={e => setForm({...form, celular: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Dados do Responsável</h4>
              </div>

              {/* Nome Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Responsável</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required
                    value={form.nome_responsavel}
                    onChange={e => setForm({...form, nome_responsavel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    placeholder="Nome completo"
                  />
                </div>
              </div>

              {/* CPF Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CPF do Responsável</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="000.000.000-00"
                    value={form.cpf_responsavel}
                    onChange={e => setForm({...form, cpf_responsavel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Cargo Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cargo do Responsável</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="Diretor, Administrador..."
                    value={form.cargo_responsavel}
                    onChange={e => setForm({...form, cargo_responsavel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div />

              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Credenciais de Acesso</h4>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">E-mail Corporativo (Login)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email" required placeholder="clinica@empresa.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div />

              {/* Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password" required placeholder="sua senha"
                    value={form.senha}
                    onChange={e => setForm({...form, senha: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password" required placeholder="sua senha"
                    value={form.confirmar_senha}
                    onChange={e => setForm({...form, confirmar_senha: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-600/10"
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
