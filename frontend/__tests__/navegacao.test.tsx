import React from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StreamPayDashboard from '../app/page';
import LoginPage from '../app/login/page';
import CadastroPage from '../app/cadastro/page';

describe('Navegação entre páginas', () => {
  it('navega para login e dashboard', () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Login StreamPay')).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <StreamPayDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('StreamPay AI')).toBeInTheDocument();
  });

  it('navega para cadastro', () => {
    render(
      <MemoryRouter initialEntries={["/cadastro"]}>
        <CadastroPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Cadastro StreamPay')).toBeInTheDocument();
  });
});
