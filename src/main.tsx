import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "./InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";

unregisterAll().then(() => {
    register("Shift+Ctrl+Alt+Q", e => {
        if (e.state != "Pressed") return;
        getCurrentWindow().isVisible().then(visible => {
            visible ? WInvoke.hide() : WInvoke.show();
        });
    });
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
