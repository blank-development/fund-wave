import { useWriteContract, useTransaction } from "wagmi";
import { parseUnits } from "viem";
import { ethers } from "ethers";

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useTokenApproval(tokenAddress: string, spenderAddress: string) {
  const { writeContractAsync: approve, data: approveData } = useWriteContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
  });

  const { isLoading, isSuccess } = useTransaction({
    hash: approveData,
  });

  const approveToken = async (amount: string) => {
    const hash = await approve({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.waitForTransaction(hash);
  };

  return {
    approveToken,
    isLoading,
    isSuccess,
  };
}
