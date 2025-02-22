'use client';

import Image from "next/image";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";
import { createWallet, inAppWallet } from "thirdweb/wallets";


export default function Home() {
  const account = useActiveAccount();
  const wallets = [
    createWallet("io.metamask"),
    createWallet("app.phantom"),
  ];
  // Replace the chain with the chain you want to connect to
  const chain = defineChain({
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: { name: "Monad Testnet", symbol: "MON", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://testnet-rpc.monad.xyz"],
      },
    },
    blockExplorers: {
      default: {
        name: "Monad testnet Blockscout",
        url: "https://testnet.monadexplorer.com/",
      },
    },
  });

  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x8B96d8a3dB6148eb2c75E7F249637A2A76728f7E"
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } = useReadContract(getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract(getTotalClaimedSupply,
    { contract: contract }
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }
  console.log(contractMetadata?.image);

  return (
    <main className="p-4 pb-10 min-h-[10vh] flex items-center justify-center container max-w-(--breakpoint-lg) mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton
          client={client}
          chain={chain}
          wallets={wallets}
        />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLaoding ? (
            <p>Loading...</p>
          ) : (
            <>
              <Image
                src="/purple_cat.jpeg" alt={"purple cat"} width={200}
                height={200} />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">
                {contractMetadata?.description}
              </p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Supply: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          <TransactionButton
            transaction={() => claimTo({
              contract: contract,
              to: account?.address || "",
              quantity: BigInt(quantity),
            })}
            onTransactionConfirmed={async () => {
              alert("NFT Claimed!");
              setQuantity(1);
            }}
          >
            {`Claim NFT (${getPrice(quantity)} ETH)`}
          </TransactionButton>
        </div>
      </div>
    </main >
  );
}

function Header() {
  return (
    <header className="flex flex-row items-center">


      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Purple CAT NFT
      </h1>
    </header>
  );
}