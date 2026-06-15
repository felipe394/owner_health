import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, User, Calendar, MapPin, Phone, Hash, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';

export const RegisterClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    email: '',
    celular: '',
    plano_empresa: '',
    plano_nome: '',
    plano_produto: '',
    plano_numero_carteirinha: '',
    senha: '',
    confirmar_senha: '',
    acceptLGPD: false
  });
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepBlur = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }));
      }
    } catch {}
    finally { setCepLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações básicas
    if (form.senha !== form.confirmar_senha) {
      setError('As senhas não coincidem');
      return;
    }

    if (!form.acceptLGPD) {
      setError('Você deve aceitar os termos de LGPD para se cadastrar');
      return;
    }

    // Validação de maior de 18 anos
    const birth = new Date(form.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('O cliente titular deve possuir mais de 18 anos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro');
      }

      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
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
            
            <h3 className="text-2xl font-black leading-tight">Faça parte da nossa plataforma</h3>
            <p className="text-xs text-blue-100 mt-3 font-semibold leading-relaxed">
              Ao cadastrar-se no Plano Free, você gerencia seus dados médicos com facilidade e pode adicionar até dois dependentes gratuitamente.
            </p>
          </div>

          <div className="relative z-10 text-[10px] text-blue-200 font-bold uppercase tracking-wider">
            Plano Free • Sem cobranças
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cadastro de Cliente</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Preencha os dados abaixo para criar sua conta gratuita</p>
            <div className="w-12 h-1 bg-blue-600 mt-3 rounded-full" />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
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
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CPF</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={e => setForm({...form, cpf: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Data Nascimento */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Data de Nascimento (Titular +18)</label>
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

              {/* Celular */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Celular</label>
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

              {/* Endereço - Seção */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Endereço</h4>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CEP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </span>
                  <input
                    type="text" required placeholder="00000-000"
                    value={form.cep}
                    onChange={e => setForm({...form, cep: e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').slice(0,9)})}
                    onBlur={handleCepBlur}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                    maxLength={9}
                  />
                </div>
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
                    value={form.numero}
                    onChange={e => setForm({...form, numero: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Logradouro */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Logradouro</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text" required placeholder="Rua, Avenida..."
                    value={form.logradouro}
                    onChange={e => setForm({...form, logradouro: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Estado (UF)</label>
                <input
                  type="text" required placeholder="Ex: SP"
                  value={form.estado}
                  onChange={e => setForm({...form, estado: e.target.value.toUpperCase().slice(0,2)})}
                  maxLength={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Complemento */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Complemento <span className="text-slate-400 font-normal">(opcional)</span></label>
                <input
                  type="text" placeholder="Apto, Sala..."
                  value={form.complemento}
                  onChange={e => setForm({...form, complemento: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Bloco Plano Saúde */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Plano de Saúde (Opcional)</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Operadora / Empresa</label>
                <input
                  type="text" placeholder="Ex: Bradesco, Unimed"
                  value={form.plano_empresa}
                  onChange={e => setForm({...form, plano_empresa: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Plano</label>
                <input
                  type="text" placeholder="Ex: Nacional Flex"
                  value={form.plano_nome}
                  onChange={e => setForm({...form, plano_nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Produto</label>
                <input
                  type="text" placeholder="Ex: Enfermaria"
                  value={form.plano_produto}
                  onChange={e => setForm({...form, plano_produto: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Número da Carteirinha</label>
                <input
                  type="text" placeholder="Ex: 00000000000"
                  value={form.plano_numero_carteirinha}
                  onChange={e => setForm({...form, plano_numero_carteirinha: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Credenciais de Login */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-slate-700 mt-2 border-b border-slate-100 pb-2">Credenciais de Acesso</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">E-mail (Login)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email" required placeholder="seu@email.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div />

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

            {/* Aceite LGPD */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox" required
                  checked={form.acceptLGPD}
                  onChange={e => setForm({...form, acceptLGPD: e.target.checked})}
                  className="mt-0.5"
                />
                <span className="text-[11px] font-semibold text-slate-600 leading-normal">
                  Li e concordo com os Termos de Proteção de Dados e a Política de Privacidade (LGPD) da plataforma Owner Health.
                </span>
              </label>
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
