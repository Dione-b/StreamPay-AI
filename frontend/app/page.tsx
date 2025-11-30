"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function StreamsList({ address }: { address?: string }) {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/streams?address=${address}`)
      .then(res => res.json())
      .then(data => {
        setStreams(data.streams || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  if (!address) return <div className="text-gray-400">Conecte sua wallet para ver seus streams.</div>;
  if (loading) return <div className="text-cyan-400">Carregando streams...</div>;
  if (streams.length === 0) return <div className="text-gray-400">Nenhum stream ativo encontrado.</div>;

  return (
    <div className="bg-slate-900/60 rounded-xl p-6 mt-6 shadow border border-cyan-500/20">
      <h2 className="text-2xl text-cyan-300 mb-4 neon-glow">Streams Ativos</h2>
      <ul>
        {streams.map((stream, idx) => (
          <li key={idx} className="mb-4 p-4 rounded-lg bg-slate-800/80 border border-cyan-500/10 shadow hover:scale-105 transition-transform">
            <div><strong>Destinatário:</strong> <span className="text-cyan-400">{stream.recipient}</span></div>
            <div><strong>Token:</strong> <span className="text-cyan-300">{stream.token}</span></div>
            <div><strong>Taxa/hora:</strong> <span className="text-cyan-200">{stream.rate}</span></div>
            <div><strong>Duração:</strong> <span className="text-cyan-200">{stream.duration} horas</span></div>
            <div><strong>Status:</strong> <span className={stream.active ? "text-green-400" : "text-red-400"}>{stream.active ? "Ativo" : "Finalizado"}</span></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StreamPayDashboard() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [prompt, setPrompt] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConnectWallet = () => {
    if (connectors && connectors.length > 0) {
      connect({ connector: connectors[0] });
    } else {
      alert('Nenhum conector de wallet disponível.');
    }
  };

  const handleAIPrompt = async () => {
    if (!prompt.trim()) {
      setTxStatus("Preencha o prompt");
      return;
    }
    setTxStatus("processando...");
    try {
      const response = await fetch("/api/eliza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `${address}:123`
        },
        body: JSON.stringify({ prompt, userAddress: address })
      });
      const data = await response.json();
      if (response.ok && data.txHash) {
        setTxStatus("Transação enviada! Hash: " + data.txHash);
      } else {
        setTxStatus("Erro: " + (data.error || "Falha ao criar stream"));
      }
    } catch (err: any) {
      setTxStatus("Erro: " + err.message);
    }
  };

  if (!isMounted) {
    // Evita renderização do conteúdo dependente de hooks antes do mount
    return <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00eaff] animate-fade-in" />;
  }

  return (
    <main>
      <div className="dashboard-glass-card">
        <h1 className="text-4xl font-bold neon-glow mb-2 text-center">StreamPay AI</h1>
        <div className="wallet-actions">
          {!isConnected ? (
            <button className="neon-btn" onClick={handleConnectWallet}>Conectar Wallet</button>
          ) : (
            <button className="neon-btn" onClick={disconnect}>Desconectar</button>
          )}
        </div>
        <div className="ai-prompt-section">
          <label htmlFor="prompt" className="text-cyan-300 font-semibold">Prompt IA</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Exemplo: Pagar 0x123... 50"
            className="ai-prompt neon-glow"
            rows={2}
          />
          <button className="neon-btn mt-2" onClick={handleAIPrompt}>Processar com IA</button>
        </div>
        {!isConnected && (
          <div className="mt-4 text-cyan-200 text-center">Conecte sua wallet para ver seus streams.</div>
        )}
        {isConnected && <StreamsList address={address} />}
      </div>
    </main>
  );
}
