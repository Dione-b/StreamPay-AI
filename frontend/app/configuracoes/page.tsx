"use client";
import React, { useState, useEffect } from "react";

export default function ConfiguracoesPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usuario/perfil")
      .then(res => res.json())
      .then(data => {
        setPerfil(data);
        setNome(data.nome || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Salvando...");
    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email })
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setStatus("Perfil atualizado!");
      } else {
        setStatus("Erro: " + (data.error || "Falha ao atualizar perfil"));
      }
    } catch (err: any) {
      setStatus("Erro: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Configurações do Usuário</h1>
      <div className="bg-slate-800/50 rounded-lg p-6">
        {loading && <p className="text-cyan-300">Carregando perfil...</p>}
        {!loading && perfil && (
          <form onSubmit={handleSalvar}>
            <label className="block mb-2 text-cyan-300">Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className="w-full mb-4 p-3 rounded bg-slate-700 text-white" />
            <label className="block mb-2 text-cyan-300">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full mb-6 p-3 rounded bg-slate-700 text-white" />
            <button type="submit" className="w-full py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600">Salvar</button>
          </form>
        )}
        {status && <div className="mt-4 text-cyan-300">{status}</div>}
        {!loading && !perfil && <p className="text-red-400">Falha ao carregar perfil do usuário.</p>}
      </div>
    </div>
  );
}