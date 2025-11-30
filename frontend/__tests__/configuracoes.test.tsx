import React from 'react';

import { render, screen } from '@testing-library/react';
import ConfiguracoesPage from '../app/configuracoes/page';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
});

describe('ConfiguracoesPage', () => {
  it('renderiza título e formulário de perfil', () => {
    (useRouter as jest.Mock).mockReturnValue({ query: {} });
    render(<ConfiguracoesPage />);
    expect(screen.getByText('Configurações do Usuário')).toBeInTheDocument();
    expect(screen.getByText(/Carregando perfil|Falha ao carregar perfil/)).toBeInTheDocument();
  });
});
