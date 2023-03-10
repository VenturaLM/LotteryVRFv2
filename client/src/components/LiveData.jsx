import React, { useEffect, useState } from "react";
import { useContract } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import Web3 from "web3";

import { contractAddress } from "../utils/costants";

const LiveData = () => {
    const web3 = new Web3(window.ethereum);
    const { contract } = useContract(contractAddress);

    // Supply.
    const [isSupplyLoading, setIsSupplyLoading] = useState(false);
    const [totalSupply, setTotalSupply] = useState("");

    // Balance.
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);
    const [balance, setBalance] = useState("");

    const getTotalSupply = async () => {
        const supply = await contract.call("totalSupply");
        return supply.toString();
    }

    const getBalance = async () => {
        const rawBalance = (await web3.eth.getBalance(contractAddress)).toString();
        const balance = web3.utils.fromWei(rawBalance, "ether");
        return balance;
    }

    const fetchTotalSupply = async () => {
        setIsSupplyLoading(true);
        const supply = await getTotalSupply();
        setTotalSupply(supply);
        setIsSupplyLoading(false);
    }

    const fetchBalance = async () => {
        setIsBalanceLoading(true);
        const balance = await getBalance();
        setBalance(balance);
        setIsBalanceLoading(false);
    }

    useEffect(() => {
        if (contract) {
            fetchTotalSupply();
            fetchBalance();
        }
    }, [contractAddress, contract]);

    return (
        <div className="mt-16 mb-32 flex flex-col gap-y-4 xs:px-4 md:px-16">
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6">
                <div className="border-slate-600 p-6 flex flex-1 justify-start items-center flex-col mf:mr-10 blue-glassmorphism">
                    <h1 className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        Boletos en circulación
                    </h1>
                    <div className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        {isSupplyLoading && (
                            <h1>Cargando...</h1>
                        )}
                        {!isSupplyLoading && (
                            totalSupply
                        )}
                    </div>
                </div>

                <div className="border-slate-600 p-6 flex flex-1 justify-start items-center flex-col mf:mr-10 blue-glassmorphism">
                    <h1 className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        Bote actual (MATIC)
                    </h1>
                    <div className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        {isBalanceLoading && (
                            <h1>Cargando...</h1>
                        )}
                        {!isBalanceLoading && (
                            balance
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default LiveData;