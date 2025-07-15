import React from "react";
import ReactDOM from "react-dom/client";
import Password from "~/Password/Password";
import "~/main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "~/InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BrowserRouter, Route, Routes } from "react-router";
import Sidebar from "~/Sidebar";
import Tools from "~/Tools/Tools";
import Note from "./Note/Note";
import QRCode from "./QRCode/QRCode";
import Auth from "./Auth/Auth";
import System from "./System/System";
import ToDo from "./ToDo/ToDo";
import "~/global";
import CmdGen from "./CmdGen/CmdGen";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Sidebar/>
            <main className="flex flex-col grow min-w-0">
                <Routes>
                    {Object.entries({
                        "/"      : <Password/>,
                        "/Tools" : <Tools/>,
                        "/CmdGen": <CmdGen/>,
                        "/Note"  : <Note/>,
                        "/QRCode": <QRCode/>,
                        "/Auth"  : <Auth/>,
                        "/System": <System/>,
                        "/ToDo"  : <ToDo/>,
                    }).map(([k, v]) => <Route key={k} path={k} element={v}/>)}
                </Routes>
            </main>
        </BrowserRouter>
    </React.StrictMode>,
);
