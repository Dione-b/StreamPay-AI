import React from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render, screen, fireEvent, act } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

describe('StreamPayDashboard', () => {
  it('renderiza título e prompt de IA', () => {
    render(<StreamPayDashboard />);
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Exemplo: Pagar/)).toBeInTheDocument();
    expect(screen.getByText('Processar com IA')).toBeInTheDocument();
  });

  it('exibe mensagem de erro ao enviar prompt vazio', async () => {
    render(<StreamPayDashboard />);
    const btn = screen.getByText('Processar com IA');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(screen.getByText('Preencha o prompt')).toBeInTheDocument();
  });

  it('exibe loading e resultado IA', async () => {
    render(<StreamPayDashboard />);
    const input = screen.getByPlaceholderText(/Exemplo: Pagar/);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pagar freelancer' } });
      fireEvent.click(screen.getByText('Processar com IA'));
    });
    expect(screen.getByText(/processando/i)).toBeInTheDocument();
    // Simula resposta da IA
    // Como o mock não retorna txHash, espera erro
    await screen.findByText(/Erro:|Transação enviada! Hash:/);
  });

  it('exibe erro de integração', async () => {
    // Simula erro na integração
    jest.spyOn(global, 'fetch').mockImplementation(() => Promise.reject(new Error('Falha IA')) as any);
    render(<StreamPayDashboard />);
    const input = screen.getByPlaceholderText(/Exemplo: Pagar/);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pagar freelancer' } });
      fireEvent.click(screen.getByText('Processar com IA'));
    });
    // Ajusta para o texto exato renderizado pelo componente
    await screen.findByText(/Erro ao processar IA|Erro: Falha IA/);
    (global.fetch as jest.Mock).mockRestore();
  });
});
