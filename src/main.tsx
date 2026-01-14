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
import { Flintia } from "./Flintia";
import { Routing } from "./Routing";
import Sidebar from "~/Sidebar";
import Config from "./Config";

if (process.env.NODE_ENV == "development") {
    document.body.style.border = "thin solid #800";
}



Config.load().then(async config => {
    await Flintia.registerHotkey(config.hotkey_shift, config.hotkey_ctrl, config.hotkey_alt, config.hotkey_win, config.hotkey_main);
});

document.addEventListener("keydown", e => {
    if (e.code == "Escape") {
        Flintia.hide();
    }
});

Flintia.mainWindow.onFocusChanged(({payload}) => {
    if (!payload) Flintia.hide();
});



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Sidebar/>
            <main className="flex flex-col grow min-w-0">
                {Routing.getRoutes()}
            </main>
        </BrowserRouter>
    </React.StrictMode>,
);
