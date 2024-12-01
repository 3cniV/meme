import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { useState, useEffect } from "react";
// Basic ERC-20 ABI for token balance queries
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];
export async function fetchTokenBalance({
  tokenContractAddress,
  walletAddress,
  providerUrl = "https://mainnet.infura.io/v3/3e5e15fb091841239f800025e20ecfcb",
}: {
  tokenContractAddress: string;
  walletAddress: string;
  providerUrl?: string;
}) {
  try {
    // Create provider
    const provider = new JsonRpcProvider(providerUrl);

    // Create contract instance
    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      ERC20_ABI,
      provider
    );

    // Fetch balance, decimals, and symbol concurrently
    const [balanceRaw, decimals, symbol] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals(),
      tokenContract.symbol(),
    ]);

    // Convert balance to human-readable format
    const balance = formatUnits(balanceRaw, decimals);

    return {
      address: tokenContractAddress,
      balance,
      symbol,
      decimals,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Token balance fetch error:", error);
      throw new Error(`Failed to fetch token balance: ${error.message}`);
    } else {
      console.error("Token balance fetch error:", error);
      throw new Error("Failed to fetch token balance: Unknown error");
    }
  }
}

interface TokenBalance {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}

export function NotFoundPage() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);

  useEffect(() => {
    async function getBalance() {
      try {
        const result = await fetchTokenBalance({
          tokenContractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC contract address
          walletAddress: "0x4adb6f22ae2b16ba538840bcb01bd8bbb0803e03", // User's wallet address
        });
        setTokenBalance(result);
      } catch (error) {
        console.error(error);
      }
    }

    getBalance();
  }, []);

  return (
    <div>
      {tokenBalance && (
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          Balance: {tokenBalance.balance} {tokenBalance.symbol}
        </div>
      )}
    </div>
  );
}

export default NotFoundPage;