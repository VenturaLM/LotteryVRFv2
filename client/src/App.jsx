import React from 'react'
import { Route, Routes } from "react-router-dom";

import { Navbar, Welcome, LiveData, History } from "./components";

const App = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Welcome />
            <LiveData />
            <History />
        </div>
    )
}

export default App;