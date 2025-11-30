import React from 'react';
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x123', isConnected: true })),
  useWriteContract: jest.fn(() => ({ writeContract: jest.fn() })),
}));
jest.mock('viem', () => ({
  parseEther: jest.fn(() => '1000000000000000000'),
}));
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StreamPayDashboard from '../app/page';
import LoginPage from '../app/login/page';
import CadastroPage from '../app/cadastro/page';

expect.extend(toHaveNoViolations);

describe('Acessibilidade das páginas principais', () => {
  it('dashboard não possui violações de acessibilidade', async () => {
    const { container } = render(<StreamPayDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('login não possui violações de acessibilidade', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('cadastro não possui violações de acessibilidade', async () => {
    const { container } = render(<CadastroPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
