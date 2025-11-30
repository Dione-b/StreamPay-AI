import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import HistoricoPage from '../app/historico/page';

global.fetch = jest.fn((url) => {
  if (url === '/api/streams?finalizados=true') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ streams: [
        { recipient: '0xabc', token: 'USDC', rate: '50', duration: 100, active: false, finalizadoEm: '2025-11-29' }
      ] })
    });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
}) as jest.Mock;

describe('HistoricoPage integração', () => {
  it('exibe histórico de streams finalizados', async () => {
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Histórico de Streams/)).toBeInTheDocument();
      expect(screen.getByText(/Destinatário:/)).toBeInTheDocument();
      expect(screen.getByText(/Finalizado em:/)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de nenhum stream', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ streams: [] }) }));
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum stream finalizado encontrado/)).toBeInTheDocument();
    });
  });

  it('exibe erro de rede', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum stream finalizado encontrado/)).toBeInTheDocument();
    });
  });

  it('exibe erro de dados nulos', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum stream finalizado encontrado/)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de carregando', async () => {
    render(<HistoricoPage />);
    expect(screen.getByText(/Carregando histórico/)).toBeInTheDocument();
  });

  it('exibe mensagem de nenhum stream', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ streams: [] }) }));
    render(<HistoricoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum stream finalizado encontrado/)).toBeInTheDocument();
    });
  });
});
