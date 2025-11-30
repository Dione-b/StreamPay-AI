import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CadastroPage from '../app/cadastro/page';

describe('CadastroPage', () => {
  it('renderiza formulário de cadastro', () => {
    render(<CadastroPage />);
    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Cadastrar')).toBeInTheDocument();
  });

  it('exibe status ao tentar cadastro', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ sucesso: true })
    })) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    expect(await screen.findByText(/Cadastro realizado/)).toBeInTheDocument();
  });

  it('exibe erro de cadastro (API retorna erro)', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'E-mail já cadastrado' })
    })) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    expect(await screen.findByText(/Erro: E-mail já cadastrado/)).toBeInTheDocument();
  });

  it('exibe erro de rede ao cadastrar', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Falha de rede'))) as jest.Mock;
    render(<CadastroPage />);
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    expect(await screen.findByText(/Erro: Falha de rede/)).toBeInTheDocument();
  });
});
