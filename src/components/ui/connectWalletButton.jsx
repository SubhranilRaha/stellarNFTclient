"use client";
import React from "react";
import { useEffect, useState } from "react";
import { setAllowed } from "@stellar/freighter-api";
import { getAddress, signTransaction } from "@stellar/freighter-api";


export function ConnectButton({ label }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const retrievePublicKey = async () => {
      try {
        const addressObj = await getAddress();
        if (addressObj.error) {
          console.error("Error getting address:", addressObj.error);
          return addressObj.error;
        } else {
          setIsConnected(true)
          return addressObj.address;
        }
      } catch (error) {
        console.error("Error retrieving public key:", error);
      }
    };
    retrievePublicKey();
  },[])

  return (
    <button
      className={`" w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm"`}
      onClick={setAllowed}
      disabled={isConnected}
    >
      {isConnected ? "Wallet Connected": "Connect Wallet"}
    </button>
  );
}
