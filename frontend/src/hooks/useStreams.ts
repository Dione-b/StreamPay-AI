/**
 * useStreams Hook
 * Gerenciar streams de pagamento
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { streamsApi } from '@/services/api';
import useSWR from 'swr';

export interface Stream {
  id: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  deposit: string;
  rate_per_second: string;
  duration: number;
  claimed_amount: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  claimed_at?: string;
  paused_at?: string;
  cancelled_at?: string;
}

export interface CreateStreamInput {
  recipient: string;
  token: string;
  amount: string;
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
}

export function useStreams(userAddress?: string, enabled?: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lista de streams
  const { data: streams = [], mutate: mutateStreams, isLoading: isLoadingStreams } = useSWR<Stream[]>(
    enabled !== false ? '/streams' : null,
    async (url) => {
      const response = await streamsApi.list();
      return response.success ? (response.data as Stream[]) : [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const createStream = useCallback(
    async (input: CreateStreamInput) => {
      setIsLoading(true);
      setError(null);

      try {
        // Converter duração para segundos
        const durationSeconds = convertDurationToSeconds(input.duration, input.durationUnit);

        const response = await streamsApi.create({
          recipient: input.recipient,
          token: input.token,
          deposit: input.amount,
          duration: durationSeconds,
        });

        if (!response.success) {
          throw new Error(response.error?.message || 'Erro ao criar stream');
        }

        // Atualizar lista de streams
        await mutateStreams();

        return response.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateStreams]
  );

  const claimStream = useCallback(
    async (streamId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await streamsApi.claim(streamId);

        if (!response.success) {
          throw new Error(response.error?.message || 'Erro ao reivindicar stream');
        }

        // Atualizar lista de streams
        await mutateStreams();

        return response.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateStreams]
  );

  const pauseStream = useCallback(
    async (streamId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await streamsApi.pause(streamId);

        if (!response.success) {
          throw new Error(response.error?.message || 'Erro ao pausar stream');
        }

        // Atualizar lista de streams
        await mutateStreams();

        return response.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateStreams]
  );

  const cancelStream = useCallback(
    async (streamId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await streamsApi.cancel(streamId);

        if (!response.success) {
          throw new Error(response.error?.message || 'Erro ao cancelar stream');
        }

        // Atualizar lista de streams
        await mutateStreams();

        return response.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateStreams]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Filtrar streams do usuário
  const userStreams = streams.filter(
    (stream) => stream.sender.toLowerCase() === userAddress?.toLowerCase() ||
                 stream.recipient.toLowerCase() === userAddress?.toLowerCase()
  );

  return {
    streams: userStreams,
    allStreams: streams,
    isLoading: isLoading || isLoadingStreams,
    error,
    createStream,
    claimStream,
    pauseStream,
    cancelStream,
    clearError,
    mutate: mutateStreams,
  };
}

function convertDurationToSeconds(duration: number, unit: 'hours' | 'days' | 'weeks' | 'months'): number {
  const multipliers = {
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000,
  };
  return duration * multipliers[unit];
}
