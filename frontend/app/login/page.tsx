"use client";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Authenticating...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("Login successful!\n" + JSON.stringify(data, null, 2));
        // Aqui pode redirecionar para dashboard ou salvar token
      } else {
        setStatus("Error authenticating user.\n" + JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setStatus("Erro: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00eaff] animate-fade-in">
      <div className="bg-slate-900/80 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-cyan-500/30 neon-glow">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 neon-glow">StreamPay Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-4 rounded-xl bg-slate-800 text-cyan-100 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-4 rounded-xl bg-slate-800 text-cyan-100 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition" />
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl neon-btn font-bold text-lg shadow hover:scale-105 transition-transform">
            <span className="glow-text">Sign In</span>
          </button>
        </form>
        {status && (
          <div
            className="mt-6 text-cyan-300 animate-pulse text-left"
            style={{
              whiteSpace: "pre-wrap",
              background: "#222c",
              padding: 12,
              borderRadius: 8,
              maxWidth: 600,
              maxHeight: 300,
              overflowY: "auto",
              wordBreak: "break-word"
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import React from 'react';
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Autenticando...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setStatus("Login realizado!");
        // Salvar token/localStorage, redirecionar, etc.
      } else {
        setStatus("Erro: " + (data.error || "Falha na autenticação"));
      }
    } catch (err: any) {
      setStatus("Erro: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Login StreamPay</h1>
        {/* Formulário de login */}
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full mb-4 p-3 rounded bg-slate-700 text-white" />
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" className="w-full mb-6 p-3 rounded bg-slate-700 text-white" />
          <button type="submit" className="w-full py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600">Entrar</button>
        </form>
        {status && <div className="mt-4 text-cyan-300">{status}</div>}
      </div>
    </div>
  );
}