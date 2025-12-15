/**
 * Dashboard Page
 * Página principal do StreamPay
 */

'use client';

import { WalletButton } from '@/components/WalletButton';
import { ChatBox } from '@/components/ChatBox';
import { StreamCard } from '@/components/StreamCard';
import { useAuth } from '@/hooks/useAuth';
import { useStreams } from '@/hooks/useStreams';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { isAuthenticated, wallet } = useAuth();
  const { streams, isLoading, createStream, claimStream, pauseStream, cancelStream } = useStreams(
    wallet?.address,
    isAuthenticated
  );
  const [loadingStreamId, setLoadingStreamId] = useState<string | null>(null);

  const activeStreams = streams.filter((s) => s.status === 'active');
  const completedStreams = streams.filter((s) => s.status !== 'active');

  const handleClaim = async (streamId: string) => {
    setLoadingStreamId(streamId);
    try {
      await claimStream(streamId);
    } catch (error) {
      console.error('Erro ao reivindicar stream:', error);
    } finally {
      setLoadingStreamId(null);
    }
  };

  const handlePause = async (streamId: string) => {
    setLoadingStreamId(streamId);
    try {
      await pauseStream(streamId);
    } catch (error) {
      console.error('Erro ao pausar stream:', error);
    } finally {
      setLoadingStreamId(null);
    }
  };

  const handleCancel = async (streamId: string) => {
    setLoadingStreamId(streamId);
    try {
      await cancelStream(streamId);
    } catch (error) {
      console.error('Erro ao cancelar stream:', error);
    } finally {
      setLoadingStreamId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">StreamPay</h1>
              <p className="text-gray-600 text-sm mt-1">Pagamentos em streaming com IA</p>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          // Not Authenticated
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mb-4 text-6xl">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conecte sua Carteira</h2>
            <p className="text-gray-600 mb-6">
              Você precisa conectar sua carteira MetaMask para usar o StreamPay
            </p>
            <p className="text-sm text-gray-500">
              Clique no botão "Conectar Carteira" no canto superior direito para começar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chat Box */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <ChatBox />
              </div>

              {/* Streams */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Meus Streams ({activeStreams.length} ativos)
                </h2>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-500 mt-2">Carregando streams...</p>
                  </div>
                ) : activeStreams.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded">
                    <p className="text-gray-500">Nenhum stream ativo</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Use o chat para criar um novo stream
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStreams.map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        isLoading={loadingStreamId === stream.id}
                        onClaim={() => handleClaim(stream.id)}
                        onPause={() => handlePause(stream.id)}
                        onCancel={() => handleCancel(stream.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Streams */}
              {completedStreams.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Histórico ({completedStreams.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedStreams.map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        isLoading={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-blue-600 font-semibold">STREAMS ATIVOS</p>
                    <p className="text-2xl font-bold text-blue-900">{activeStreams.length}</p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-xs text-green-600 font-semibold">COMPLETOS</p>
                    <p className="text-2xl font-bold text-green-900">
                      {completedStreams.filter((s) => s.status === 'completed').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
                    <p className="text-2xl font-bold text-gray-900">{streams.length}</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Comandos Rápidos</h3>
                <div className="space-y-2 text-xs">
                  <p className="bg-gray-50 rounded p-2">
                    💰 "Criar stream de 1000 USDC para 0x..."
                  </p>
                  <p className="bg-gray-50 rounded p-2">📊 "Qual meu saldo?"</p>
                  <p className="bg-gray-50 rounded p-2">💹 "Preço do ETH?"</p>
                  <p className="bg-gray-50 rounded p-2">
                    ✓ "Reivindicar do stream 1"
                  </p>
                </div>
              </div>

              {/* About */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md p-4 text-white">
                <h3 className="font-bold mb-2">StreamPay AI</h3>
                <p className="text-xs opacity-90">
                  Gerencie seus pagamentos em streaming com comandos em linguagem natural,
                  potenciados por IA.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
          StreamPay © 2025 • Desenvolvido com ❤️ por StreamPay Team
        </div>
      </footer>
    </div>
  );
}
