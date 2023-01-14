import React from "react";

const History = () => {
    return (
        <div className="mt-16 mb-32 flex flex-col gap-y-4 xs:px-4 md:px-16">
            <div className="grid lg:grid-cols-1 md:grid-cols-1 gap-6">
                <div className="border-slate-600 p-6 flex flex-1 justify-start items-center flex-col mf:mr-10 blue-glassmorphism">
                    <h1 className="sm_text-5xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-3xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        Historial de loterías
                    </h1>
                    <h1 className="sm_text-3xl py-1 uppercase font-roboto bg-gradient-to-r bg-clip-text text-2xl text-transparent from-cyan-300 to-indigo-500 font-light">
                        Disponible próximamente
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default History;