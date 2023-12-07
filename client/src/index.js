import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App.js';
import Navbar from './Navbar.js';
import { AuthProvider } from "./context.js";

const mainbox = ReactDOM.createRoot(document.getElementById('mainbox'));
mainbox.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);

const navbar = ReactDOM.createRoot(document.getElementById('nav'));
navbar.render(
    <AuthProvider>
        <Navbar />
    </AuthProvider>
);
