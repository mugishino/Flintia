import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "./InvokeWrapper";

unregisterAll().then(() => {
    register("Shift+Ctrl+Alt+Q", () => {
        WInvoke.Show();
    });
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
