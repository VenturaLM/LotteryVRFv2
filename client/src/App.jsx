import React from 'react'
import { Route, Routes } from "react-router-dom";

import { Navbar, Welcome } from "./components";

const App = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Welcome />
        </div>
    )
}

export default App;