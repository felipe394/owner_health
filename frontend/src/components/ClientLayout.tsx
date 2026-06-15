import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  User,
  Users,
  LogOut,
  Menu,
  X,
  HeartPulse,
  RefreshCw
} from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeProfileName = localStorage.getItem('activeProfileName') || 'Usuário';
  const activeProfileRole = localStorage.getItem('activeProfileRole') || 'client';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/client/login');
  };

  const handleSwitchProfile = () => {
    navigate('/client/profiles');
  };

  const menuItems = [
    { label: 'Minha Carteirinha', path: '/client/dashboard', icon: CreditCard },
    { label: 'Meus Dados', path: '/client/profile', icon: User },
    { label: 'Dependentes', path: '/client/dependents', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white tracking-wide text-md">Owner Health</span>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
          {/* Active Profile Info */}
          <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-900/40 rounded-lg border border-slate-800/60 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white">
              {activeProfileName[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{activeProfileName}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                {activeProfileRole === 'client' ? 'Titular' : 'Dependente'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSwitchProfile}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-left cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Alternar Perfil</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-md md:text-lg font-black text-slate-800 tracking-tight">
              Portal do Beneficiário
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Perfil ativo: </span>
            <span className="text-xs font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full capitalize">
              {activeProfileName} ({activeProfileRole === 'client' ? 'Titular' : 'Dependente'})
            </span>
          </div>
        </header>

        {/* Mobile Sidebar - Drawer Layout */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setMobileMenuOpen(false)} />

            {/* Menu Drawer */}
            <div className="relative flex flex-col w-64 bg-slate-900 text-slate-300 h-full p-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-white text-md">Owner Health</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                        isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 mt-auto flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white">
                    {activeProfileName[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">{activeProfileName}</p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{activeProfileRole === 'client' ? 'Titular' : 'Dependente'}</p>
                  </div>
                </div>

                <button
                  onClick={handleSwitchProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-left cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Alternar Perfil</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
