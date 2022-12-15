// import { HiMenuAlt4 } from "react-icons/hi";
// import { AiOutlineClose } from "react-icons/ai";
import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";


const Navbar = () => {
    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="md:flex-[0.75] flex-initial justify-center, items-center">
                <img src="../../images/sunglasses_white.png" alt="logo" className="w-32 cursor-pointer" />
            </div>

            <ConnectWallet
                accentColor="#94a3b8a1"
                colorMode="dark"
                auth={{
                    loginOptional: false,
                }}
            />;
        </nav>
    );
}

export default Navbar;