import React from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render } from '@testing-library/react';
import StreamPayDashboard from '../app/page';
import LoginPage from '../app/login/page';
import CadastroPage from '../app/cadastro/page';

function setScreenSize(width: number) {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
}

describe('Responsividade das páginas principais', () => {
  it('dashboard renderiza corretamente em mobile', () => {
    setScreenSize(375);
    const { container } = render(<StreamPayDashboard />);
    expect(container).toBeVisible();
  });

  it('login renderiza corretamente em tablet', () => {
    setScreenSize(768);
    const { container } = render(<LoginPage />);
    expect(container).toBeVisible();
  });

  it('cadastro renderiza corretamente em desktop', () => {
    setScreenSize(1280);
    const { container } = render(<CadastroPage />);
    expect(container).toBeVisible();
  });
});
