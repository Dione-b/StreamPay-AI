"use client";
"use client";
import React from 'react';
import { useEffect, useState } from "react";

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streams?finalizados=true")
      .then(res => res.json())
      .then(data => {
        setHistorico(data.streams || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00eaff] p-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8 neon-glow">Histórico de Streams</h1>
      <div className="bg-slate-900/80 rounded-2xl p-8 shadow-2xl border border-cyan-500/30">
        {loading && <p className="text-cyan-300 animate-pulse">Carregando histórico...</p>}
        {!loading && historico.length === 0 && <p className="text-gray-400">Nenhum stream finalizado encontrado.</p>}
        {!loading && historico.length > 0 && (
          <ul>
            {historico.map((stream, idx) => (
              <li key={idx} className="mb-6 p-6 rounded-xl bg-slate-800/80 border border-cyan-500/10 shadow hover:scale-105 transition-transform">
                <div><strong>Destinatário:</strong> <span className="text-cyan-400">{stream.recipient}</span></div>
                <div><strong>Token:</strong> <span className="text-cyan-300">{stream.token}</span></div>
                <div><strong>Taxa/hora:</strong> <span className="text-cyan-200">{stream.rate}</span></div>
                <div><strong>Duração:</strong> <span className="text-cyan-200">{stream.duration} horas</span></div>
                <div><strong>Status:</strong> <span className={stream.active ? "text-green-400" : "text-red-400"}>{stream.active ? "Ativo" : "Finalizado"}</span></div>
                <div className="text-xs text-gray-400 mt-1">Finalizado em: {stream.finalizadoEm}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}