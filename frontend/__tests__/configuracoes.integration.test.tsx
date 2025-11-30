import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfiguracoesPage from '../app/configuracoes/page';

global.fetch = jest.fn((url, options) => {
  if (options && options.method === 'PUT') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ sucesso: true })
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ nome: 'Usuário Teste', email: 'user@email.com' })
  });
}) as jest.Mock;

describe('ConfiguracoesPage integração', () => {
    it('exibe campos vazios quando nome/email são falsy', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: '', email: '' }) }));
      render(<ConfiguracoesPage />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nome')).toHaveValue('');
        expect(screen.getByPlaceholderText('E-mail')).toHaveValue('');
      });
    });

    it('exibe campos nulos quando nome/email são nulos', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: null, email: null }) }));
      render(<ConfiguracoesPage />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nome')).toHaveValue('');
        expect(screen.getByPlaceholderText('E-mail')).toHaveValue('');
      });
    });

    it('exibe status de erro genérico quando não há mensagem de erro', async () => {
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (options && options.method === 'PUT') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: 'Usuário Teste', email: 'user@email.com' }) });
      });
      render(<ConfiguracoesPage />);
      await waitFor(() => {
        expect(screen.getByText('Salvar')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Salvar'));
      await waitFor(() => {
        expect(screen.getByText(/Erro: Falha ao atualizar perfil/)).toBeInTheDocument();
      });
    });
  it('carrega perfil e salva edição', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'PUT') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sucesso: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: 'Usuário Teste', email: 'user@email.com' }) });
    });
    render(<ConfiguracoesPage />);
    expect(await screen.findByDisplayValue('Usuário Teste')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('user@email.com')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Usuário Teste'), { target: { value: 'Novo Nome' } });
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => {
      expect(screen.getByText(/Perfil atualizado/)).toBeInTheDocument();
    });
  });

  it('exibe erro ao salvar perfil', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'PUT') {
        return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Falha ao atualizar perfil' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: 'Usuário Teste', email: 'user@email.com' }) });
    });
    render(<ConfiguracoesPage />);
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Falha ao atualizar perfil/)).toBeInTheDocument();
    });
  });

  it('exibe erro de rede ao salvar perfil', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'PUT') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ nome: 'Usuário Teste', email: 'user@email.com' }) });
    });
    render(<ConfiguracoesPage />);
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => {
      expect(screen.getByText(/Erro: Network error/)).toBeInTheDocument();
    });
  });

  it('exibe erro ao carregar perfil', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(<ConfiguracoesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar perfil do usuário/)).toBeInTheDocument();
    });
  });
});
