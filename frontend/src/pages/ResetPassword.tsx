import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, HeartPulse, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação ausente ou inválido na URL.');
    }
  }, [token]);

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
  }, [success, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token inválido. Solicite uma nova recuperação de senha.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, senha, confirmarSenha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha.');
      }

      setSuccess('Sua senha foi redefinida com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decoratives */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Owner Health</h2>
        <p className="mt-2 text-sm text-slate-400 font-medium">Cadastrar Nova Senha</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-700/50 rounded-[2rem] sm:px-10">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 mb-6 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">Senha Redefinida!</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {success}
              </p>
              <p className="text-xs text-slate-500 font-bold">
                Redirecionando para a tela de login em <span className="text-blue-400">{countdown}</span> segundos...
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  Fazer Login Agora
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                  Insira e confirme sua nova senha abaixo. Lembramos que ela deve ser diferente da sua senha anterior.
                </p>

                {/* Nova Senha */}
                <div className="mb-4">
                  <label htmlFor="senha" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Nova Senha
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="senha"
                      name="senha"
                      type={showSenha ? 'text' : 'password'}
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="block w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showSenha ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label htmlFor="confirmarSenha" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showConfirmarSenha ? 'text' : 'password'}
                      required
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="block w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmarSenha ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span>Definir Nova Senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-8 border-t border-slate-700/50 pt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
