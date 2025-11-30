import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import NotificacoesPage from "../app/notificacoes/page";

// Mock global fetch
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("NotificacoesPage", () => {
  it("exibe mensagem de carregando", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<NotificacoesPage />);
    expect(screen.getByText(/Carregando notificações/i)).toBeInTheDocument();
  });

  it("exibe mensagem de nenhuma notificação", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ notificacoes: [] })
    });
    render(<NotificacoesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma notificação encontrada/i)).toBeInTheDocument();
    });
  });

  it("exibe lista de notificações", async () => {
    const notificacoes = [
      { titulo: "Alerta", mensagem: "Você recebeu um pagamento.", data: "2025-11-29" },
      { titulo: "Aviso", mensagem: "Stream finalizado.", data: "2025-11-28" }
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ notificacoes })
    });
    render(<NotificacoesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Alerta/)).toBeInTheDocument();
      expect(screen.getByText(/Você recebeu um pagamento/)).toBeInTheDocument();
      expect(screen.getByText(/2025-11-29/)).toBeInTheDocument();
      expect(screen.getByText(/Aviso/)).toBeInTheDocument();
      expect(screen.getByText(/Stream finalizado/)).toBeInTheDocument();
      expect(screen.getByText(/2025-11-28/)).toBeInTheDocument();
    });
  });
});
