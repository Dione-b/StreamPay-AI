"use client";
import React from 'react';
import { useState, useEffect } from "react";

export default function MonitoramentoPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/monitoramento-status")
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Monitoramento</h1>
      <div className="bg-slate-800/50 rounded-lg p-6">
        {loading && <p className="text-cyan-300">Carregando status...</p>}
        {!loading && status && (
          <ul>
            {Object.entries(status).map(([servico, info]: any) => (
              <li key={servico} className="mb-4">
                <strong className="text-cyan-400">{servico}:</strong> <span className={info.status === 'ok' ? 'text-green-400' : 'text-red-400'}>{info.status}</span>
                {info.alert && <span className="ml-2 text-yellow-400">{info.alert}</span>}
              </li>
            ))}
          </ul>
        )}
        {!loading && !status && <p className="text-red-400">Falha ao carregar status dos serviços.</p>}
      </div>
    </div>
  );
}