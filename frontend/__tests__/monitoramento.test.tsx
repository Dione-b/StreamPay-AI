import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import MonitoramentoPage from '../app/monitoramento/page';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
});

describe('MonitoramentoPage', () => {
  it('renderiza título e status', () => {
    (useRouter as jest.Mock).mockReturnValue({ query: {} });
    render(<MonitoramentoPage />);
    expect(screen.getByText('Monitoramento')).toBeInTheDocument();
    expect(screen.getByText(/Carregando status|Falha ao carregar status/)).toBeInTheDocument();
  });

  it('exibe erro de rede', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    render(<MonitoramentoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar status dos serviços/)).toBeInTheDocument();
    });
  });

  it('exibe erro de dados nulos', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(<MonitoramentoPage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar status dos serviços/)).toBeInTheDocument();
    });
  });
});
