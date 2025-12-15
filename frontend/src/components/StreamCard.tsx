/**
 * StreamCard Component
 * Card para exibir informações de um stream
 */

'use client';

import { Stream } from '@/hooks/useStreams';

export interface StreamCardProps {
  stream: Stream;
  onClaim?: () => void;
  onPause?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function StreamCard({ stream, onClaim, onPause, onCancel, isLoading = false }: StreamCardProps) {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num > 1000000 ? (num / 1000000).toFixed(2) + 'M' : (num / 1000).toFixed(2) + 'K';
  };

  const claimedPercent = (parseFloat(stream.claimed_amount) / parseFloat(stream.deposit)) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {stream.token} → {formatAddress(stream.recipient)}
          </p>
          <p className="text-xs text-gray-500 mt-1">ID: {stream.id.slice(0, 8)}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[stream.status]}`}>
          {stream.status.toUpperCase()}
        </span>
      </div>

      {/* Amounts */}
      <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold">{formatAmount(stream.deposit)} {stream.token}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Reclamado:</span>
          <span className="font-semibold text-green-600">{formatAmount(stream.claimed_amount)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${Math.min(claimedPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{claimedPercent.toFixed(1)}% completo</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-gray-600">Taxa/seg</p>
          <p className="font-mono text-gray-900">{stream.rate_per_second}</p>
        </div>
        <div>
          <p className="text-gray-600">Duração</p>
          <p className="font-mono text-gray-900">{(parseInt(stream.duration) / 86400).toFixed(1)}d</p>
        </div>
        <div>
          <p className="text-gray-600">Criado</p>
          <p className="font-mono text-gray-900">{new Date(stream.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-600">De</p>
          <p className="font-mono text-gray-900">{formatAddress(stream.sender)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        {stream.status === 'active' && onClaim && (
          <button
            onClick={onClaim}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '...' : '✓ Reivindicar'}
          </button>
        )}

        {stream.status === 'active' && onPause && (
          <button
            onClick={onPause}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {isLoading ? '...' : '⏸ Pausar'}
          </button>
        )}

        {(stream.status === 'active' || stream.status === 'paused') && onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? '...' : '✕ Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}
