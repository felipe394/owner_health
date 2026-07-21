const fs = require('fs');

let content = fs.readFileSync('src/pages/Client/ClientAnamnesis.tsx', 'utf8');

// 1. Add currentRequest state
content = content.replace(
  "const [responses, setResponses] = useState<AnamnesisResponse[]>([]);",
  "const [responses, setResponses] = useState<AnamnesisResponse[]>([]);\n  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);"
);

// 2. Change loadData
const regexLoadData = /const loadData = async \(\) => \{.*?finally \{ setLoading\(false\); \}\n  \};/s;
const newLoadData = `const loadData = async () => {
    setLoading(true);
    try {
      const respRes = await fetch(\`\${API_URL}/api/patient-anamnesis/client/\${clienteId}/requests\`, { headers });
      if (respRes.ok) {
        const data = await respRes.json();
        setResponses(Array.isArray(data) ? data : []);
      }
    } catch {
      setResponses([]);
    } finally { setLoading(false); }
  };`;
content = content.replace(regexLoadData, newLoadData);

// 3. Change startForm
const regexStartForm = /const startForm = \(\) => \{.*?\n  \};/s;
const newStartForm = `const startForm = async (reqId: number) => {
    try {
      const res = await fetch(\`\${API_URL}/api/patient-anamnesis/request/\${reqId}/form\`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSections(data);
        setCurrentRequestId(reqId);
        setAnswers({});
        setErrors({});
        setCurrentSection(0);
        setSubmitError('');
        setMode('form');
      }
    } catch {
      alert("Erro ao carregar formulário");
    }
  };`;
content = content.replace(regexStartForm, newStartForm);

// 4. Change handleSubmit
const regexHandleSubmit = /const handleSubmit = async \(\) => \{.*?finally \{ setSubmitting\(false\); \}\n  \};/s;
const newHandleSubmit = `const handleSubmit = async () => {
    if (!currentRequestId) return;
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch(\`\${API_URL}/api/patient-anamnesis/request/\${currentRequestId}/submit\`, {
        method: 'POST', headers,
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      setMode('done');
      loadData();
    } catch (e) {
      setSubmitError('Erro ao enviar as respostas. Tente novamente.');
    } finally { setSubmitting(false); }
  };`;
content = content.replace(regexHandleSubmit, newHandleSubmit);

// 5. Add pending requests banner
const banner = `{responses.filter(r => r.status === 'aguardando').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Solicitações Pendentes
            </h3>
            <p className="text-xs font-semibold text-amber-700/80 mt-1">Você tem formulários de anamnese aguardando preenchimento.</p>
          </div>
          <div className="flex flex-col gap-2">
            {responses.filter(r => r.status === 'aguardando').map(r => (
              <button key={r.id} onClick={() => startForm(r.id)} className="flex items-center gap-2 px-6 py-2.5 font-bold text-white rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <ClipboardList className="w-4 h-4" /> Responder Anamnese
              </button>
            ))}
          </div>
        </div>
      )}`;

content = content.replace(
  '{responses.filter(r => r.status === \'concluido\').length === 0 ? (',
  `${banner}\n\n            {responses.filter(r => r.status === 'concluido').length === 0 ? (`
);

// 6. Remove startForm from the old spot
content = content.replace(
  "{responses.length > 0 ? 'Nova anamnese' : 'Iniciar preenchimento'}",
  ""
);
content = content.replace(
  /<button onClick=\{startForm\}.*?<\/button>/s,
  ""
);

fs.writeFileSync('src/pages/Client/ClientAnamnesis.tsx', content);
console.log("Restored client anamnesis changes successfully!");
