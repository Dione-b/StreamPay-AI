import { NextResponse } from 'next/server';

export async function GET() {
  // Exemplo de resposta mockada
  return NextResponse.json({
    status: 'aprovado',
    motivo: 'KYC verificado com sucesso.'
  });
}
