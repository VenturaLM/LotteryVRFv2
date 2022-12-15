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
            {/* <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 space-y-10"> */}
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6">
                <div className="flex flex-1 justify-start items-center flex-col mf:mr-10">
                    <h1 className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 text-white font-light">
                        Lorem<br />ipsum
                    </h1>
                    <p className="text-left mt-5 text-white font-inter text-xs tracking-widest text-slateus-200 font-light md:w-7/12 w-11/12">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                </div>

                <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                    <form>
                        <div className="mt-[5px] bg-gradient-to-r bg-clip-text text-center font-roboto text-3xl font-light text-transparent from-orange-400 to-yellow-300">
                            {amount}
                        </div>
                        <input
                            type="range"
                            placeholder="Cantidad"
                            className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-gradient-to-l from-cyan-300 to-indigo-500"
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