import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CadastroPage from '../app/cadastro/page';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ sucesso: true })
  })
) as jest.Mock;

describe('CadastroPage integração', () => {
  it('realiza cadastro e exibe sucesso', async () => {
    render(<CadastroPage />);
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Cadastrar'));
    await waitFor(() => {
      expect(screen.getByText(/Cadastro realizado/)).toBeInTheDocument();
    });
  });
});
