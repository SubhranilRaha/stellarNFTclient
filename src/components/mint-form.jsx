"use client";
import { cn } from "@/lib/utils";
import { getAddress, signTransaction } from "@stellar/freighter-api";
import { useEffect, useState } from "react";
import { FileUpload } from "./ui/file-uplod";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
import axios from "axios";

export const CONTRACT_ID = "CAJTWAV32QMUBUURZFVTMPIA4SHG3LJQVS2ASFBFIEWU7XQORYW7LHKF";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";

export function MintForm() {
  const [imgData, setImgData] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState("GXXX...");
  const [loading, setLoading] = useState(false);
  const [mintedHash, setMintedHash] = useState("");
  const [imageHash, setImageHash] = useState("");

  useEffect(() => {
    const retrievePublicKey = async () => {
      try {
        const addressObj = await getAddress();
        if (addressObj.error) {
          console.error("Error getting address:", addressObj.error);
          return addressObj.error;
        } else {
          setOwnerAddress(addressObj.address);
          return addressObj.address;
        }
      } catch (error) {
        console.error("Error retrieving public key:", error);
      }
    };
    retrievePublicKey();
  }, []);

  const handleMint = async () => {
    console.log("minting start");
    if (!ownerAddress) {
      alert("Wallet not connected");
      return;
    }

    setLoading(true);

    const formData = new FormData(); //creating a new object of form data
    formData.append("file", imgData); //appending the files with key "file" and values file to the object formData

    const resFile = await axios({
      //code for uploading the file to pinata
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: `
            227563abeb8fd7e92ea8`,
        pinata_secret_api_key: `
            08505f77c805fce6437535d44c0f52dead21cc76ffbfebef1709950d2e613092`,
        "Content-Type": "multipart/form-data",
      },
    });
    const ImgHash = `${resFile.data.IpfsHash}`; //method to get the hashno stored in pinata
    console.log(ImgHash);
    setImageHash(ImgHash);

    // Validate image hash
    // if (!imageHash) {
    //   alert("Please upload an image first");
    //   return;
    // }

    try {
      const server = new SorobanRpc.Server(SOROBAN_URL);
      const account = await server.getAccount(ownerAddress);

      const contract = new Contract(CONTRACT_ID);

      // Convert address to ScVal
      const addressScVal = new Address(ownerAddress).toScVal();

      // Convert imageHash to ScVal string
      const imageHashScVal = xdr.ScVal.scvString(
        imageHash
      );

      console.log("Minting parameters:", {
        ownerAddress,
        imageHash,
        addressScVal: addressScVal.toString(),
        imageHashScVal: imageHashScVal.toString(),
      });

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("mint", addressScVal, imageHashScVal))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);

      const signedTransaction = await signTransaction(
        preparedTx.toEnvelope().toXDR("base64"),
        {
          networkPassphrase: Networks.TESTNET,
        }
      );

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

      console.log("Transaction sent successfully:", txResult.hash);

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

      if (getResponse.status === "SUCCESS") {
        if (!getResponse.resultMetaXdr) {
          throw new Error("Empty resultMetaXDR in getTransaction response");
        }
        const returnValue = getResponse.resultMetaXdr
          .v3()
          .sorobanMeta()
          ?.returnValue();

        if (returnValue) {
          console.log("Return value:", returnValue);

          // Uncomment and modify if needed
          const mintedImageHash = scValToNative(returnValue);
          setMintedHash(mintedImageHash);
          setImageHash(""); // Clear the input
          alert(`Successfully minted image with hash: ${mintedImageHash}`);
        }
      } else {
        // Log more detailed error information
        console.error("Transaction error details:", {
          status: getResponse.status,
          resultXdr: getResponse.resultXdr,
        });

        throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error message:", error.message);

      // Add more detailed error logging
      if (error.response) {
        console.error("Response error:", error.response);
      }

      alert(`Error minting: ${error.message || "Unknown error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  console.log(imgData);

  return (
    <div className="max-w-lg mx-10 rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black relative z-10 lg:py-10">
      <form className="">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          {/* <LabelInputContainer>
            <Label htmlFor="firstname">NFT name</Label>
            <Input id="firstname" placeholder="CyberMonk" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">NFT symbol</Label>
            <Input id="lastname" placeholder="CMK" type="text" />
          </LabelInputContainer> */}
        </div>
        {/* <LabelInputContainer className="mb-4">
          <Label htmlFor="nftname">NFT Name</Label>
          <Input id="lastname" placeholder="CyberMonk" type="text" />
        </LabelInputContainer> */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="address">Wallet Address</Label>
          <Input
            id="email"
            value={ownerAddress}
            readOnly
            type="text"
            className="bg-gray-50 dark:bg-gray-800"
          />
        </LabelInputContainer>
        <FileUpload
          onChange={(fileData) => {
            console.log(fileData);
            if (fileData && fileData[0]) {
              setImgData(fileData[0]);
            }
          }}
        />
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <button
          className={cn(
            "bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]",
            loading && "opacity-50 cursor-not-allowed"
          )}
          onClick={(e) => {
            e.preventDefault();
            if (!loading) handleMint();
          }}
          disabled={loading}
        >
          {loading ? "Minting..." : "Mint Now"} {!loading && "→"}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
