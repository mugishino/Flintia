// Utils
import "~/main.css";
import "~/global/array";
import "~/global/json";
import "~/global/map";
import "~/global/math";
import "~/global/number";
import "~/global/string";
// React
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
// Flintia
import MainWindow from "./window/MainWindow";

if (process.env.NODE_ENV == "development") {
    document.body.style.border = "thin solid #800";
}



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <MainWindow/>
        </BrowserRouter>
    </React.StrictMode>,
);
