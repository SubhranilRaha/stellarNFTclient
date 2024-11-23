import { MintForm } from "@/components/mint-form";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Link from "next/link";

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
          <div className="flex flex-col justify-center items-center h-1/3 md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 z-10">
            <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
              Connect Wallet
            </button>
            <Link href="/explore">
            <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
              Explore NFTs
            </button>
            </Link>
          </div>
        </div>
        <MintForm />
      </div>
      <BackgroundBeams />
    </>
  );
}
