import React from "react";
import ReactDOM from "react-dom/client";
import Password from "~/Password/Password";
import "~/main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "~/InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initConfig } from "~/Config";
import { BrowserRouter, Route, Routes } from "react-router";
import Sidebar from "~/Sidebar";
import Tools from "~/Tools/Tools";
import FFmpeg from "~/FFmpeg/FFmpeg";
import Note from "./Note/Note";
import QRCode from "./QRCode/QRCode";
import Auth from "./Auth/Auth";

if (process.env.NODE_ENV == "development") {
    document.body.style.border = "thin solid #800";
}

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
            <Sidebar/>
            <main className="flex flex-col grow min-w-0">
                <Routes>
                    {Object.entries({
                        "/"      : <Password/>,
                        "/Tools" : <Tools/>,
                        "/FFmpeg": <FFmpeg/>,
                        "/Note"  : <Note/>,
                        "/QRCode": <QRCode/>,
                        "/Auth"  : <Auth/>,
                    }).map(([k, v]) => <Route key={k} path={k} element={v}/>)}
                </Routes>
            </main>
        </BrowserRouter>
    </React.StrictMode>,
);
