import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import CompliancePage from '../app/compliance/page';

global.fetch = jest.fn((url) => {
  if (url === '/api/kyc-status') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'aprovado', motivo: '', data: '2025-11-29' })
    });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
}) as jest.Mock;

describe('CompliancePage integração', () => {
  it('exibe status aprovado de KYC', async () => {
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText(/aprovado/)).toBeInTheDocument();
      expect(screen.getByText(/Última verificação:/)).toBeInTheDocument();
    });
  });

  it('exibe motivo de reprovação', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'reprovado', motivo: 'documento inválido', data: '2025-11-29' }) }));
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Motivo:/)).toBeInTheDocument();
      expect(screen.getByText(/documento inválido/)).toBeInTheDocument();
    });
  });

  it('exibe data de verificação', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'aprovado', motivo: '', data: '2025-11-29' }) }));
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Última verificação:/)).toBeInTheDocument();
      expect(screen.getByText(/2025-11-29/)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro ao falhar', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar status de KYC/)).toBeInTheDocument();
    });
  });

  it('exibe erro de rede', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar status de KYC/)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de carregando', async () => {
    render(<CompliancePage />);
    expect(screen.getByText(/Carregando status de KYC/)).toBeInTheDocument();
  });

  it('exibe mensagem de erro ao falhar', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar status de KYC/)).toBeInTheDocument();
    });
  });
});
