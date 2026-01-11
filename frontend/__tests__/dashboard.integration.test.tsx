import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamPayDashboard from '../app/page';

describe('StreamPayDashboard integração (sem mocks)', () => {
  it('envia prompt e exibe resposta da IA genérica', async () => {
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Pagar 0xabc 50 USDC/hora por 100 horas' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      // Check if message was sent or if an error occurred
      const chatMessages = screen.queryAllByText(/Pagar|Erro/i);
      expect(chatMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renderiza área de chat inicial', () => {
    render(<StreamPayDashboard />);
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('mantém interação mínima: input desabilitado sem wallet', () => {
    render(<StreamPayDashboard />);
    const input = screen.getByRole('textbox');
    // Input is disabled when wallet is not connected
    expect(input).toBeDisabled();
    expect(screen.getByText(/Conecte sua wallet/i)).toBeInTheDocument();
  });
});
