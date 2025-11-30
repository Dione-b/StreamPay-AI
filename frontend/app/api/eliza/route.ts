import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  // Exemplo de resposta mockada
  return NextResponse.json({
    resposta: `Prompt recebido: ${body.prompt}`
  });
}
