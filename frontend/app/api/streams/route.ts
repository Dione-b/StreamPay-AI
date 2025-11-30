import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import StreamPayCoreAbi from '../../../../smart-contracts/artifacts/contracts/StreamPayCore.sol/StreamPayCore.json';

const CONTRACT_ADDRESS = 'COLOQUE_O_ENDERECO_DO_CONTRATO_MAINNET_AQUI';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  if (!address) {
    return NextResponse.json({ streams: [] });
  }

  // Conecta ao contrato na mainnet
  const client = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  // Busca eventos StreamCreated para o address conectado
  const logs = await client.getLogs({
    address: CONTRACT_ADDRESS,
    event: StreamPayCoreAbi.abi.find(e => e.name === 'StreamCreated'),
    fromBlock: 0n,
    toBlock: 'latest',
    args: { sender: address }
  });

  // Monta lista de streams reais
  const streams = logs.map(log => ({
    id: log.args.streamId,
    sender: log.args.sender,
    recipient: log.args.recipient,
    token: log.args.token,
    ratePerSecond: log.args.ratePerSecond,
    duration: log.args.duration
  }));

  return NextResponse.json({ streams });
}
