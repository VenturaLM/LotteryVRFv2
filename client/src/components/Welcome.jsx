import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import { Web3Button, useContract, useAddress } from "@thirdweb-dev/react";

import { contractOwner, contractAddress, contractCOST } from "../utils/costants";
import contractABI from "../../../web3/artifacts/contracts/Lottery.sol/Lottery.json";



const Welcome = () => {
    const web3 = new Web3(window.ethereum);
    const Lottery = new web3.eth.Contract(contractABI.abi, contractAddress);

    const [amount, setAmount] = useState("");
    const { contract } = useContract(contractAddress);
    const currentAddress = useAddress();
    const [isPausedLoading, setIsPausedLoading] = useState(false);
    const [isPaused, setIsPaused] = useState("");

    const getIsPaused = async () => {
        const paused = await contract.call("_isPaused");
        return paused;
    }

    const fetchIsPaused = async () => {
        setIsPausedLoading(true);
        const paused = await getIsPaused();
        setIsPaused(paused);
        setIsPausedLoading(false);
    }

    useEffect(() => {
        if (contract) fetchIsPaused();
    }, [contractAddress, contract]);

    const call = async () => {
        try {
            const parsedAmount = currentAddress != contractOwner
                ? ethers.utils.parseEther((amount * contractCOST).toString())
                : ethers.utils.parseEther("0");

            Lottery.methods.mint(amount).send({ from: currentAddress, value: parsedAmount });
            console.info("Contract call successs.");
        } catch (err) {
            console.error("Contract call failure.", err);
        }
    }

    return (
        <div className="mt-16 mb-32 flex flex-col gap-y-4 xs:px-4 md:px-16">
            {/* <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 space-y-10"> */}
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6">
                <div className="flex flex-1 justify-start items-center flex-col mf:mr-10">
                    <h1 className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        Bienvenido a la <br />lotería
                    </h1>
                    <p className="text-left mt-5 text-white font-inter text-xs tracking-widest text-slateus-200 font-light md:w-7/12 w-11/12">
                        En esta lotería podrás competir con miembros de otras comunidades por el bote en juego.
                    </p>
                </div>

                <div className="border-slate-600 p-4 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                    <form>
                        <div className="mt-[5px] bg-gradient-to-r bg-clip-text text-center font-roboto text-3xl font-light text-transparent from-orange-400 to-yellow-300">
                            {amount}
                        </div>
                        <input
                            type="range"
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
                        isDisabled={isPaused}
                    >
                        Mint tickets
                    </Web3Button>
                </div>
            </div>
        </div >
    );
}

export default Welcome;