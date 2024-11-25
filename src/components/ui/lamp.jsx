"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FocusCards } from "./focus-cards";
import { getAddress, signTransaction } from "@stellar/freighter-api";
import axios from "axios";
import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  scValToNative,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";

export const CONTRACT_ID = "CAJTWAV32QMUBUURZFVTMPIA4SHG3LJQVS2ASFBFIEWU7XQORYW7LHKF";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";


export const LampContainer = ({ children, className }) => {
  const cards = [
    {
      title: "Forest Adventure",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Valley of life",
      src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "behta hi jayega",
      src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Camping is for pros",
      src: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "The road not taken",
      src: "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "The First Rule",
      src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Forest Adventure123",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const getImageHashes = async () => {
    try {
      // Ensure wallet is connected
      if (!ownerAddress) {
        alert("Wallet not connected");
        return [];
      }
  
      const server = new SorobanRpc.Server(SOROBAN_URL);
      const account = await server.getAccount(ownerAddress);
  
      const contract = new Contract(CONTRACT_ID);
  
      // Convert address to ScVal
      const addressScVal = new Address(ownerAddress).toScVal();
  
      // Build the transaction to call the contract method
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("get_image_hashes", addressScVal))
        .setTimeout(30)
        .build();
  
      const preparedTx = await server.prepareTransaction(tx);
  
      const signedTransaction = await signTransaction(preparedTx.toEnvelope().toXDR("base64"), {
        networkPassphrase: Networks.TESTNET,
      });
  
      const parsedTransaction = TransactionBuilder.fromXDR(
        signedTransaction.signedTxXdr,
        Networks.TESTNET
      );
    
      const txResult = await server.sendTransaction(parsedTransaction);
  
      if (!txResult || txResult.status !== "PENDING") {
        throw new Error(
          `Transaction failed with status: ${txResult?.status || "Unknown"}`
        );
      }
  
      const hash = txResult.hash;
      let getResponse = await server.getTransaction(hash);
      let retryCount = 0;
      const maxRetries = 30;
  
      while (getResponse.status === "NOT_FOUND" && retryCount < maxRetries) {
        console.log(
          `Waiting for transaction confirmation... Attempt ${retryCount + 1}`
        );
        getResponse = await server.getTransaction(hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryCount++;
      }
  
      if (retryCount >= maxRetries) {
        throw new Error("Transaction confirmation timed out");
      }
  
      // Comprehensive error logging
      if (getResponse.status !== "SUCCESS") {
        console.error("Full transaction response:", {
          status: getResponse.status,
          resultXdr: getResponse.resultXdr,
          diagnosticEvents: getResponse.diagnosticEvents
        });
  
        throw new Error(`Transaction failed: ${getResponse.status}`);
      }
  
      if (!getResponse.resultMetaXdr) {
        throw new Error("Empty resultMetaXDR in getTransaction response");
      }
  
      const returnValue = getResponse.resultMetaXdr
        .v3()
        .sorobanMeta()
        ?.returnValue();
  
      if (returnValue) {
        console.log("Return value:", returnValue);
        
        // Convert ScVal to native JavaScript array of strings
        const imageHashes = scValToNative(returnValue);
        
        // Optional: set to state if you want to display in UI
        // setImageHashes(imageHashes);
        
        return imageHashes;
      }
  
      return []; // Return empty array if no return value
    } catch (error) {
      console.error("Error getting image hashes:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        errorObject: error
      });
  
      alert(`Error getting image hashes: ${error.message || "Unknown error occurred"}`);
      return []; // Return empty array in case of error
    }
  };
  
  // Example usage
  const fetchUserImageHashes = async () => {
    try {
      const hashes = await getImageHashes();
      console.log("User's image hashes:", hashes);
      // Do something with the hashes
    } catch (error) {
      console.error("Failed to fetch image hashes", error);
    }
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen h-full flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0 pt-[175px]",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-150 items-center justify-center isolate z-0 ">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute  w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute  w-40 h-[100%] left-0 bg-slate-950  bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute  w-40 h-[100%] right-0 bg-slate-950  bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute  w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400 "
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950 "></div>
      </div>
      <div className="relative z-50 flex flex-col items-center px-5 w-full">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 1, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-center text-6xl font-bold tracking-tight md:text-7xl lg:text-7xl absolute top-14"
      >
        Market Place
      </motion.div>
      <FocusCards cards={cards} />
    </div>
  );
};
