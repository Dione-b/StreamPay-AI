"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StreamDetalhePage() {
  const router = useRouter();
  const { id } = router.query;
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/streams/${id}`)
      .then(res => res.json())
      .then(data => {
        setStream(data.stream);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Detalhes do Stream</h1>
      <div className="bg-slate-800/50 rounded-lg p-6">
        {loading && <p className="text-cyan-300">Carregando detalhes...</p>}
        {!loading && !stream && <p className="text-red-400">Stream não encontrado.</p>}
        {!loading && stream && (
          <div>
            <div><strong>Destinatário:</strong> {stream.recipient}</div>
            <div><strong>Token:</strong> {stream.token}</div>
            <div><strong>Taxa/hora:</strong> {stream.rate}</div>
            <div><strong>Duração:</strong> {stream.duration} horas</div>
            <div><strong>Status:</strong> {stream.active ? "Ativo" : "Finalizado"}</div>
            <div className="text-xs text-gray-400 mt-1">Criado em: {stream.criadoEm}</div>
            {stream.finalizadoEm && <div className="text-xs text-gray-400">Finalizado em: {stream.finalizadoEm}</div>}
          </div>
        )}
      </div>
    </div>
  );
}