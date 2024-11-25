import { MintForm } from "@/components/mint-form";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { ConnectButton } from "@/components/ui/connectWalletButton";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Link from "next/link";

import * as StellarSdk from "stellar-sdk";

import { SorobanRpc } from "stellar-sdk";

export const server = new SorobanRpc.Server(
  "https://soroban-testnet.stellar.org"
); // soroban testnet server

const account = "CAJTWAV32QMUBUURZFVTMPIA4SHG3LJQVS2ASFBFIEWU7XQORYW7LHKF";

const transaction = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET, // Use appropriate network
});

export default function Home() {
  const words = [
    {
      text: "Mint",
    },
    {
      text: "awesome",
    },
    {
      text: "NFTs",
    },
    {
      text: "on",
    },
    {
      text: "STELLAR.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <>
      <div className="flex items-center lg:flex-row h-screen flex-col">
        <div className="flex flex-col h-1/3 w-3/4">
          <TypewriterEffect words={words} />
          <div className="flex flex-col justify-center items-center md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 z-10 h-full mb-0 lg:mb-32 py-5 lg:p-0">
            <ConnectButton label="Connect Wallet" />
            <Link href="/explore">
              <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
                Explore my NFTs →
              </button>
            </Link>
          </div>
        </div>
        <MintForm className="my-5"/>
      </div>
      <BackgroundBeams />
    </>
  );
}
