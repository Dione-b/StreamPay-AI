import React from 'react';
// Mocks globais antes dos imports
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0xmock', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
  // Adicione outros hooks se necessário
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

const defaultFetchMock = (url: string, options?: any) => {
  if (url === '/api/eliza' && options && options.method === 'POST') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ txHash: '0x123' })
    });
  }
  if (url.startsWith('/api/streams')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ streams: [{ recipient: '0xabc', token: 'USDC', rate: '50', duration: 100, active: true }] })
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
};
global.fetch = jest.fn(defaultFetchMock) as jest.Mock;

describe('StreamPayDashboard integração', () => {
  afterEach(() => {
    global.fetch = jest.fn(defaultFetchMock) as jest.Mock;
  });
  it('cria stream via IA e exibe status', async () => {
    render(<StreamPayDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/Exemplo: Pagar/), { target: { value: 'Pagar 0xabc 50 USDC/hora por 100 horas' } });
    fireEvent.click(screen.getByText('Processar com IA'));
    await waitFor(() => {
      expect(screen.getByText(/Transação enviada/)).toBeInTheDocument();
    });
  });

  it('exibe lista de streams ativos', async () => {
    render(<StreamPayDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Destinatário:/)).toBeInTheDocument();
      expect(screen.getByText(/USDC/)).toBeInTheDocument();
    });
  });

  it('exibe erro ao criar stream via IA', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Erro de validação' })
    }));
    render(<StreamPayDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/Exemplo: Pagar/), { target: { value: 'Pagar 0xabc 50 USDC/hora por 100 horas' } });
    fireEvent.click(screen.getByText('Processar com IA'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Erro de validação/)).toBeInTheDocument();
    });
  });

  it('exibe erro de requisição ao criar stream via IA', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.reject(new Error('Falha de rede')));
    render(<StreamPayDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/Exemplo: Pagar/), { target: { value: 'Pagar 0xabc 50 USDC/hora por 100 horas' } });
    fireEvent.click(screen.getByText('Processar com IA'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Falha de rede/)).toBeInTheDocument();
    });
  });

  it('exibe lista vazia de streams', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ streams: undefined })
    }));
    render(<StreamPayDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum stream ativo encontrado/)).toBeInTheDocument();
    });
  });

  it('exibe stream finalizado', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ streams: [{ recipient: '0xdef', token: 'DAI', rate: '10', duration: 24, active: false }] })
    }));
    render(<StreamPayDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Finalizado/)).toBeInTheDocument();
      expect(screen.getByText(/DAI/)).toBeInTheDocument();
    });
  });
});
