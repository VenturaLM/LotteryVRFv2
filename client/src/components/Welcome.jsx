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
        <div className="flex w-full justify-center items-center">
            <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 space-y-10">
                <div className="flex flex-1 justify-start flex-col mf:mr-10">
                    <h1 className="text-3xl sm_text-5xl text-sky-400 text-gradient py-1">
                        Lotería<br />comunitaria
                    </h1>
                    <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
                        Subtítulo
                    </p>
                </div>
                <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                    <form>
                        <input
                            type="number"
                            placeholder="Cantidad en tickets"
                            className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
                            min={1}
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