import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "./InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";

const tauriWin = getCurrentWindow();
unregisterAll().then(() => {
    register("Shift+Ctrl+Alt+Q", e => {
        if (e.state != "Pressed") return;
        tauriWin.isVisible().then(visible => {
            visible ? WInvoke.hide() : WInvoke.show();
        });
    });
});

tauriWin.onFocusChanged(({payload}) => {
    if (!payload) WInvoke.hide();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
