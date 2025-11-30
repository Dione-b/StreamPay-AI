import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/login/page';

describe('LoginPage', () => {
  it('renderiza formulário de login', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('exibe status ao tentar login', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Entrar'));
    expect(await screen.findByText(/Autenticando|Login realizado|Erro/)).toBeInTheDocument();
  });
});
