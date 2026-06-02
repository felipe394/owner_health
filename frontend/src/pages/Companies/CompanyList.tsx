import React, { useState, useEffect } from 'react';
import { Building2, CreditCard } from 'lucide-react';
import { API_URL } from '../../config';

export const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/companies/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paid: !currentStatus })
      });
      if (response.ok) {
        fetchCompanies();
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
      <div>
        <h2 className="text-xl font-black text-slate-800">Instituições de Saúde</h2>
        <p className="text-xs text-slate-500 font-medium">Clínicas e Hospitais parceiros ativos</p>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Nenhuma instituição cadastrada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4">Razão Social / Nome Fantasia</th>
                <th className="p-4">CNPJ</th>
                <th className="p-4">Responsável</th>
                <th className="p-4">Status Licença</th>
                <th className="p-4 text-center">Ações Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
              {companies.map(company => (
                <tr key={company.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{company.razao_social}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{company.nome_fantasia}</p>
                  </td>
                  <td className="p-4">{company.cnpj}</td>
                  <td className="p-4">
                    <p>{company.nome_responsavel}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{company.cargo_responsavel} | {company.celular}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      company.pago 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {company.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleTogglePayment(company.id, company.pago)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 rounded-lg border border-slate-200 hover:border-primary-100 text-slate-500 font-bold transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{company.pago ? 'Marcar Pendente' : 'Marcar Pago'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
