import React from "react";
import ReactDOM from "react-dom/client";
import Password from "./Password/Password";
import "./main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "./InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initConfig } from "./Config";
import { BrowserRouter, Route, Routes } from "react-router";

const tauriWin = getCurrentWindow();
unregisterAll().then(() => {
    register("Shift+Ctrl+Alt+Q", e => {
        if (e.state != "Pressed") return;
        tauriWin.isVisible().then(visible => {
            visible ? WInvoke.hide() : WInvoke.show();
        });
    });
});

document.addEventListener("keydown", e => {
    if (e.code == "Escape") {
        WInvoke.hide();
    }
});

tauriWin.onFocusChanged(({payload}) => {
    if (!payload) WInvoke.hide();
});

await initConfig();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Password/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
