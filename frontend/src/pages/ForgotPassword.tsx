import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, HeartPulse, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação de recuperação.');
      }

      setSuccess('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      setEmail('');
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
        <p className="mt-2 text-sm text-slate-400 font-medium">Recuperação de Acesso</p>
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
              <h3 className="text-lg font-black text-white">Verifique seu e-mail</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {success}
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                  Insira o endereço de e-mail associado à sua conta. Enviaremos um link seguro para você redefinir sua senha.
                </p>
                <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Endereço de E-mail
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@ownerhealth.com.br"
                    className="block w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Link de Recuperação</span>
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o Login</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
