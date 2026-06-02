import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

export const HealthPlanList: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : { roles: ['client'] };
  const activeRole = localStorage.getItem('activeRole') || user.roles[0];

  const [form, setForm] = useState({
    operadora: '',
    plano: '',
    produto: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/health-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar plano de saúde');
      }

      setSuccess('Plano de saúde criado com sucesso!');
      setForm({ operadora: '', plano: '', produto: '' });
      fetchPlans();
      setTimeout(() => setShowAddModal(false), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este plano de saúde?')) return;
    try {
      const response = await fetch(`${API_URL}/api/health-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPlans();
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
          <h2 className="text-xl font-black text-slate-800">Planos de Saúde do Sistema</h2>
          <p className="text-xs text-slate-500 font-medium">
            {activeRole === 'admin' 
              ? 'Gerencie o catálogo global de planos que hospitais e clínicas aceitam' 
              : 'Lista de planos de saúde suportados pela plataforma'}
          </p>
        </div>
        {activeRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano</span>
          </button>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Nenhum plano cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4">Operadora / Empresa</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Produto</th>
                {activeRole === 'admin' && <th className="p-4 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{plan.operadora}</td>
                  <td className="p-4">{plan.plano}</td>
                  <td className="p-4">{plan.produto}</td>
                  {activeRole === 'admin' && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar Plano */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 relative z-10 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-6">Criar Plano de Saúde</h3>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-4">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold mb-4">{success}</div>}

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Operadora / Empresa</label>
                <input
                  type="text" required placeholder="Ex: Bradesco, Unimed"
                  value={form.operadora}
                  onChange={e => setForm({...form, operadora: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Plano</label>
                <input
                  type="text" required placeholder="Ex: Top Nacional"
                  value={form.plano}
                  onChange={e => setForm({...form, plano: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Produto</label>
                <input
                  type="text" required placeholder="Ex: Enfermaria Coparticipativo"
                  value={form.produto}
                  onChange={e => setForm({...form, produto: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                />
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
                  Criar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
