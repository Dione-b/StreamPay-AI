import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import HistoricoPage from '../app/historico/page';

jest.mock('@/app/lib/api', () => ({
  fetchWithAuth: jest.fn(),
}));

import { fetchWithAuth } from '@/app/lib/api';

beforeEach(() => {
  (fetchWithAuth as jest.Mock).mockResolvedValue({
    streams: [
      { id: 1, recipient: '0xabc', token: 'USDC', rate: '50', duration: 100, active: false, finalizadoEm: '2025-11-29' }
    ]
  });
});

describe('HistoricoPage integração', () => {
  it('renderiza a página de histórico', async () => {
    render(<HistoricoPage />);
    // Check for the main heading
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Histórico');
  });

  it('renderiza a página mesmo com erro de autenticação', async () => {
    (fetchWithAuth as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
    render(<HistoricoPage />);
    // Page should still render the main heading even if auth fails
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Histórico');
  });
});
