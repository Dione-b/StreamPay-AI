"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { useAuth } from "@/app/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, address, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" padding="lg">
          <p className="text-center">Carregando...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Dashboard
            </h1>
            <p className="text-secondary">
              Bem-vindo ao StreamPay AI
            </p>
          </div>
          <Button
            onClick={logout}
            variant="outlined"
          >
            Desconectar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">Informações da Conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">Carteira:</p>
                <p className="font-mono text-lg">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Não conectada"}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Email:</p>
                <p className="font-mono text-sm">
                  {user?.email || "Carregando..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Função:</p>
                <p className="capitalize">
                  {user?.role || "Carregando..."}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary">Streams Criadas:</p>
                <p className="text-2xl font-bold text-gradient">0</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Total Transacionado:</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Status:</p>
                <p className="text-green-500">✅ Ativa</p>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-bold mb-4">Ações Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="neon" fullWidth>
              Criar Stream
            </Button>
            <Button variant="neon" fullWidth>
              Streams Recebidas
            </Button>
            <Button variant="neon" fullWidth>
              Histórico
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
