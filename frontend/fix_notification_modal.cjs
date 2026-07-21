const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationBell.tsx', 'utf8');

// 1. Import X from lucide-react if not present
if (!content.includes('X,')) {
  content = content.replace("import { Bell, Check, Info } from 'lucide-react';", "import { Bell, Check, Info, X } from 'lucide-react';");
}

// 2. Add selectedNotification state
if (!content.includes('selectedNotification')) {
  content = content.replace("const [selectedIds, setSelectedIds] = useState<number[]>([]);", "const [selectedIds, setSelectedIds] = useState<number[]>([]);\n  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);");
}

// 3. Modify onClick of the notification item
const regexOnClick = /onClick=\{\(\) => \{\s*if \(notif.lida === 0\) markAsRead\(notif.id\);\s*\}\}/;
const replacementOnClick = `onClick={() => {
                      if (notif.lida === 0) markAsRead(notif.id);
                      setSelectedNotification(notif);
                    }}`;
content = content.replace(regexOnClick, replacementOnClick);

// 4. Add the modal rendering at the end of the return statement
const regexReturn = /    <\/div>\n  \);\n};\n/;
const modalJSX = `
      {/* Modal da Notificação */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedNotification(null)} />
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-[70] animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Detalhes da Notificação</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(selectedNotification.criado_em).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedNotification(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {selectedNotification.mensagem}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setSelectedNotification(null)} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-700 transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;
content = content.replace(regexReturn, modalJSX);

fs.writeFileSync('src/components/NotificationBell.tsx', content);
