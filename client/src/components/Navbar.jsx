import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";

import { contractAddress } from "../utils/costants";

const Navbar = () => {

    const contractReference = "https://mumbai.polygonscan.com/address/" + contractAddress;

    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="flex lg:grid-cols-3 md:grid-cols-1 gap-6">
                <div className="md:flex-[0.75] flex-initial justify-center items-center">
                    <img src="../../images/sunglasses_white.png" alt="logo" className="w-32 cursor-pointer" />
                </div>

                <div className="md:flex-[0.75] sm_text-5xl py-1 font-roboto bg-gradient-to-r bg-clip-text text-transparent from-cyan-300 to-indigo-500 font-light">
                    Contrato: <a href={contractReference} target="_blank">{contractAddress}</a>
                </div>

                <ConnectWallet
                    accentColor="#94a3b8a1"
                    colorMode="dark"
                    auth={{
                        loginOptional: false,
                    }}
                />;
            </div>
        </nav>
    );
}

export default Navbar;