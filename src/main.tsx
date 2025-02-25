import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import Sidebar from "./Sidebar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Sidebar/>
        <App />
    </React.StrictMode>,
);
