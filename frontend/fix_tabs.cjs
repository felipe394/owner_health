const fs = require('fs');

let content = fs.readFileSync('src/pages/Client/ClientAnamnesis.tsx', 'utf8');

if (!content.includes('activeTab')) {
  content = content.replace(
    "const [mode, setMode] = useState<'history' | 'form' | 'done'>('history');",
    "const [mode, setMode] = useState<'history' | 'form' | 'done'>('history');\n  const [activeTab, setActiveTab] = useState<'pendentes' | 'historico'>('pendentes');"
  );
}

const regexGrid = /\{\/\* Removido o EmptyState.*?\{\/\* Info card \*\/\}/s;
const replacementGrid = `{/* Tabs de Navegação */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pendentes')}
          className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'pendentes' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
        >
          Solicitações Pendentes
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'historico' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
        >
          Histórico de Respostas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'pendentes' && (
            <>
              {responses.filter(r => r.status === 'aguardando').length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Solicitações Pendentes
                    </h3>
                    <p className="text-xs font-semibold text-amber-700/80 mt-1">Você tem formulários de anamnese aguardando preenchimento.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {responses.filter(r => r.status === 'aguardando').map(r => (
                      <button key={r.id} onClick={() => startForm(r.id)} className="flex items-center gap-2 px-6 py-3 font-bold text-white rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 justify-center"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <ClipboardList className="w-4 h-4" /> Responder Anamnese #{r.id}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 bg-slate-50">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-lg font-black text-slate-700">Tudo certo por aqui!</h2>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    Você não possui nenhuma solicitação de anamnese pendente no momento.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'historico' && (
            <>
              {responses.filter(r => r.status === 'concluido').length === 0 ? (
                <div className="rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 bg-slate-50">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-lg font-black text-slate-700">Nenhum formulário respondido</h2>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    Você ainda não respondeu nenhuma anamnese. Suas respostas ficarão salvas aqui para consulta futura.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Formulários Respondidos
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      {responses.filter(r => r.status === 'concluido').length} registro(s)
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {responses.filter(r => r.status === 'concluido').map((r) => (
                      <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Anamnese #{r.id}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Respondido em: {new Date(r.respondido_em || r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => {}} className="px-4 py-2 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 rounded-xl text-xs font-bold text-slate-600 transition shadow-sm">
                          Visualizar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" /> Minhas Anamneses
            </h3>
            <div className="text-center p-4">
              <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Nesta seção você pode visualizar solicitações pendentes enviadas pelo seu médico, e acessar o histórico de tudo que já respondeu.
              </p>
            </div>
          </div>

          {/* Info card */}`;

content = content.replace(regexGrid, replacementGrid);
fs.writeFileSync('src/pages/Client/ClientAnamnesis.tsx', content);
