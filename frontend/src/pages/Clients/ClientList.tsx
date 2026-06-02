import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { API_URL } from '../../config';

export const ClientList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-black text-slate-800">Clientes Cadastrados</h2>
          <p className="text-xs text-slate-500 font-medium">Lista de usuários titulares da plataforma</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4">Nome</th>
                <th className="p-4">CPF</th>
                <th className="p-4">Nascimento</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Plano de Saúde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50/50">
                  <td className="p-4">{client.nome}</td>
                  <td className="p-4">{client.cpf}</td>
                  <td className="p-4">{new Date(client.data_nascimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <p>{client.celular}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{client.email}</p>
                  </td>
                  <td className="p-4">
                    {client.plano_empresa ? (
                      <div>
                        <p className="font-bold text-blue-700">{client.plano_empresa}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{client.plano_nome} - {client.plano_numero_carteirinha}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Não informado</span>
                    )}
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
