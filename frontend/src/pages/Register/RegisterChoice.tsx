import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, User, Building2 } from 'lucide-react';

export const RegisterChoice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Decorativos */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-5 bg-blue-600" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-5 bg-blue-600" />

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-135 from-blue-600 to-blue-800" style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
          <HeartPulse className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Criar uma Conta</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">Selecione o tipo de perfil para cadastrar-se no sistema Owner Health</p>
        <div className="w-12 h-1 mx-auto mt-4 rounded-full bg-blue-600" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Opção Cliente */}
          <button
            onClick={() => navigate('/register/client')}
            className="border-2 border-slate-100 hover:border-blue-500 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all bg-slate-50 hover:bg-blue-50/20 group hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-4 transition-colors">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Sou Cliente</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed max-w-[200px]">
              Cadastre seu perfil pessoal, gerencie sua saúde e adicione até 2 dependentes no Plano Free gratuito.
            </p>
          </button>

          {/* Opção Empresa */}
          <button
            onClick={() => navigate('/register/company')}
            className="border-2 border-slate-100 hover:border-blue-500 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all bg-slate-50 hover:bg-blue-50/20 group hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-4 transition-colors">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-slate-800">Sou Clínica / Hospital</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed max-w-[200px]">
              Cadastre sua instituição corporativa, gerencie seus profissionais vinculados e planos atendidos.
            </p>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Já tem uma conta? Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
