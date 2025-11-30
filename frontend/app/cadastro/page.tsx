"use client";
import React from 'react';

import { useState } from "react";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Registering...");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Registration successful!\n" + JSON.stringify(data, null, 2));
      } else {
        let msg = "Error registering user.\n" + JSON.stringify(data, null, 2);
        setStatus(msg);
      }
    } catch (err: any) {
      setStatus("Erro: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00eaff] animate-fade-in">
      <div className="bg-slate-900/80 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-cyan-500/30 neon-glow">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 neon-glow">StreamPay Registration</h1>
        <form onSubmit={handleCadastro} className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full p-4 rounded-xl bg-slate-800 text-cyan-100 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-4 rounded-xl bg-slate-800 text-cyan-100 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-4 rounded-xl bg-slate-800 text-cyan-100 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition" />
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl neon-btn font-bold text-lg shadow hover:scale-105 transition-transform">
            <span className="glow-text">Register</span>
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