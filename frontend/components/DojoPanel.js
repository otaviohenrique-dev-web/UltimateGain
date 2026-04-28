import React, { useState } from 'react';
import { Brain, Key, Database, Upload } from 'lucide-react';
import { backendHttpBase } from '../utils/config';

export default function DojoPanel({ state }) {
  const [senha, setSenha] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const API_URL = backendHttpBase();

  const handleDownload = async () => {
    if (!senha) { setMensagem('⚠️ Digite a senha Admin.'); return; }
    setMensagem('⏳ Gerando arquivo...');
    try {
      const res = await fetch(`${API_URL}/download-dados`, {
        method: 'GET',
        headers: { 'x-admin-password': senha }
      });
      if (!res.ok) throw new Error('Senha incorreta ou arquivo inexistente.');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historico_bot_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMensagem('✅ Download Concluído!');
    } catch (err) {
      setMensagem(`❌ Erro: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!senha || !file) { setMensagem('⚠️ Chave ou arquivo ausente.'); return; }
    setLoading(true);
    setMensagem('⏳ Injetando...');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_URL}/upload-cerebro`, { 
        method: 'POST', 
        headers: { 'x-admin-password': senha },
        body: formData 
      });
      if (res.ok) { setMensagem('✅ Geração Injetada!'); setFile(null); } 
      else { setMensagem('❌ Acesso Negado (Senha Incorreta).'); }
    } catch (err) { 
      setMensagem('❌ Erro de Conexão.'); 
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/30 shadow-lg mt-6">
      <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2 border-b border-purple-900/50 pb-3">
        <Brain size={24} /> Laboratório Neural (Dojo)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-widest"><Key size={14}/> Chave de Autorização</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white font-mono text-sm" placeholder="••••••••" />
          {mensagem && <div className="text-[10px] font-mono text-center p-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">{mensagem}</div>}
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col justify-between min-h-[140px]">
           <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-widest"><Database size={14}/> Coleta de Dados</label>
           <button onClick={handleDownload} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 py-2 rounded text-xs font-bold transition-all mt-auto">EXPORTAR HISTÓRICO (CSV)</button>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col justify-between min-h-[140px]">
           <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-widest"><Upload size={14}/> Nova Geração</label>
           <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="text-[10px] text-slate-400 mb-2" />
           <button onClick={handleUpload} disabled={loading || !file} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded text-xs font-bold shadow-lg shadow-purple-500/20 transition-all mt-auto">APLICAR CÉREBRO</button>
        </div>
      </div>
    </div>
  );
}