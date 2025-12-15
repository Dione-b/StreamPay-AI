/**
 * ChatBox Component
 * Interface de chat com o agente ElizaOS
 */

'use client';

import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

export function ChatBox() {
  const { wallet, authToken } = useAuth();
  const { messages, isLoading, error, sendMessage, clearError } = useChat(wallet?.address, authToken || undefined);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');

    await sendMessage(message);
  };

  if (!wallet) {
    return (
      <div className="h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Conecte sua carteira para usar o chat</p>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col bg-white border border-gray-200 rounded-lg">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h3 className="font-semibold text-gray-800">StreamPay Agent</h3>
        <p className="text-xs text-gray-600">Faça comandos em linguagem natural</p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-gray-500">
              <p className="text-lg font-semibold mb-2">👋 Bem-vindo!</p>
              <p className="text-sm">Exemplos de comandos:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>"Criar stream de 1000 USDC para 0x..."</li>
                <li>"Qual meu saldo?"</li>
                <li>"Preço do ETH?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.data && (
                <div className="text-xs mt-2 opacity-75">
                  <p>📊 {JSON.stringify(msg.data).slice(0, 50)}...</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-sm text-red-600">❌ {error}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
            >
              Descartar
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite um comando..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
