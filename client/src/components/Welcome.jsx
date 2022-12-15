import React, { useState } from "react";
import { ethers } from "ethers";
import { Web3Button, useContract, useContractWrite, useAddress } from "@thirdweb-dev/react";

import { contractOwner, contractAddress, contractCOST } from "../utils/costants";

const Welcome = () => {
    const [amount, setAmount] = useState("");
    const { contract } = useContract(contractAddress);
    const { mutateAsync: mint, isLoading } = useContractWrite(contract, "mint")
    const currentAddress = useAddress();

    const call = async () => {
        try {
            const parsedAmount = currentAddress != contractOwner
                ? ethers.utils.parseEther((amount * contractCOST).toString())
                : ethers.utils.parseEther("0");

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentAddress,
                    to: contractAddress,
                    gas: "0x5208", // Estimar gas.
                    value: parsedAmount._hex
                }]
            });

            const data = await mint([amount]);
            console.info("contract call successs", data);
        } catch (err) {
            console.error("contract call failure", err);
        }
    }

    return (
        <div className="mt-16 mb-32 flex flex-col gap-y-4 xs:px-4 md:px-16">
            <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 space-y-10">
                <div className="flex flex-1 justify-start flex-col mf:mr-10">
                    <h1 className="text-3xl sm_text-5xl text-sky-400 text-gradient py-1">
                        Lotería<br />comunitaria
                    </h1>
                    <p className="text-left mt-5 text-white font-light md:w-7/12 w-11/12 text-base">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                    </p>
                </div>
                <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                    <form>
                        <input
                            type="number"
                            placeholder="Cantidad"
                            className="bg-gray-400 border w-64 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            min={1}
                            max={10}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </form>

                    <div className="h-[1px] w-full bg-gray-400 my-2" />

                    <Web3Button
                        contractAddress={contractAddress}
                        action={call}
                        accentColor="#94a3b8a1"
                        colorMode="dark"
                    >
                        Mint tickets
                    </Web3Button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;