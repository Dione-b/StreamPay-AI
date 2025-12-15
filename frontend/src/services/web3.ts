/**
 * Web3 Service
 * Integração com Ethers.js para operações blockchain
 */

import { BrowserProvider, Contract, ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}

export interface SignMessageResult {
  message: string;
  signature: string;
  address: string;
}

class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: any = null;

  async connectWallet(): Promise<WalletInfo> {
    if (!window.ethereum) {
      throw new Error('MetaMask não encontrada');
    }

    try {
      // Solicitar conexão com carteira
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('Nenhuma conta encontrada');
      }

      const address = accounts[0];

      // Obter provider e signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Obter balance
      const balance = await this.provider.getBalance(address);
      const chainId = (await this.provider.getNetwork()).chainId;

      return {
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(chainId),
        isConnected: true,
      };
    } catch (error: any) {
      throw new Error(`Erro ao conectar carteira: ${error.message}`);
    }
  }

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!window.ethereum) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        return null;
      }

      const address = accounts[0];
      this.provider = new BrowserProvider(window.ethereum);
      const balance = await this.provider.getBalance(address);
      const chainId = (await this.provider.getNetwork()).chainId;

      return {
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(chainId),
        isConnected: true,
      };
    } catch (error) {
      return null;
    }
  }

  async signMessage(message: string, address: string): Promise<SignMessageResult> {
    if (!this.signer) {
      throw new Error('Signer não inicializado');
    }

    try {
      const signature = await this.signer.signMessage(message);

      return {
        message,
        signature,
        address,
      };
    } catch (error: any) {
      throw new Error(`Erro ao assinar mensagem: ${error.message}`);
    }
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer não inicializado');
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
      });

      return tx.hash;
    } catch (error: any) {
      throw new Error(`Erro ao enviar transação: ${error.message}`);
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async switchToPolygon(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask não encontrada');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon mainnet
      });
    } catch (error: any) {
      // Se a chain não existe, adicionar
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon',
              rpcUrls: ['https://polygon-rpc.com/'],
              nativeCurrency: {
                name: 'Polygon',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }
}

export const web3Service = new Web3Service();

// Declarar tipo global para window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
