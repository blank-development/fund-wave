import { ethers } from "hardhat";
import { BigNumberish } from "ethers";

export interface Event {
  event: string;
  args: {
    campaign?: string;
    owner?: string;
    goal?: bigint;
    duration?: number;
    [key: string]: any;
  };
}

export const parseEther = (amount: string): bigint => {
  return ethers.parseEther(amount);
};

export const findEvent = (
  receipt: any,
  eventName: string
): Event | undefined => {
  return receipt.events?.find((e: Event) => e.event === eventName);
};

export const getAddress = (address: string): string => {
  return `0x${address.slice(26)}`;
};

export const increaseTime = async (seconds: number): Promise<void> => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};

export const ZeroAddress = "0x0000000000000000000000000000000000000000";
