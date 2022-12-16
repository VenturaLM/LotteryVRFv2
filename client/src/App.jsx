import React from 'react'
import { Route, Routes } from "react-router-dom";

import { Navbar, Welcome, LiveData } from "./components";

const App = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Welcome />
            <LiveData />
        </div>
    )
}

export default App;