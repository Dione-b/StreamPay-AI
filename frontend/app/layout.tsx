"use client";

import './globals.css';

import { WagmiConfig, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import "./globals.css";

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="logo-topo-clean">
          <img src="/logo-streampay.png" alt="Logo StreamPay AI" className="logo-streampay neon-glow" />
        </div>
        <WagmiConfig config={wagmiConfig}>
          <nav className="nav-futurista">
            <ul>
              <li><a href="/" className="nav-link">Dashboard</a></li>
              <li><a href="/cadastro" className="nav-link">Register</a></li>
              <li><a href="/historico" className="nav-link">History</a></li>
              <li><a href="/compliance" className="nav-link">Compliance</a></li>
            </ul>
          </nav>
          <main>{children}</main>
        </WagmiConfig>
      </body>
    </html>
  );
}
