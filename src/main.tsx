// Utils
import "~/main.css";
import "~/global/array";
import "~/global/json";
import "~/global/map";
import "~/global/math";
import "~/global/number";
import "~/global/string";
// Tauri
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WInvoke } from "~/InvokeWrapper";
// React
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
// Sidebar
import Sidebar from "~/Sidebar";
import Password from "~/pages/Password";
import Tools from "~/pages/Tools";
import CmdGen from "./pages/CmdGen";
import Note from "./pages/Note";
import ToDo from "./pages/ToDo";
import QRCode from "./pages/QRCode";
import Auth from "./pages/Auth";
import System from "./pages/System";
// その他と未分類
import NotFoundPage from "./404";

if (process.env.NODE_ENV == "development") {
    document.body.style.border = "thin solid #800";
}

export type HOTKEY_MAINKEY = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";
export async function registerHotkey(shift: boolean, ctrl: boolean, alt: boolean, win: boolean, main: HOTKEY_MAINKEY): Promise<boolean> {
    await unregisterAll();

    const key: string[] = [];
    if (shift) key.push("Shift");
    if (ctrl ) key.push("Ctrl" );
    if (alt  ) key.push("Alt"  );
    if (win  ) key.push("Super");
    key.push(main);

    return new Promise(resolve => {
        // 成功時はtrueが返る
        register(key.join("+"), async e => {
            if (e.state != "Pressed") return;
            await tauriWin.isVisible() ? WInvoke.hide() : WInvoke.show();
        })
        .then (() => resolve(true ))
        .catch(() => resolve(false));
    });
}



const tauriWin = getCurrentWindow();
await registerHotkey(true, true, true, false, "Q");

document.addEventListener("keydown", e => {
    if (e.code == "Escape") {
        WInvoke.hide();
    }
});

tauriWin.onFocusChanged(({payload}) => {
    if (!payload) WInvoke.hide();
});

// default window size
const physicalSize = await tauriWin.innerSize();
const scaleFactor  = await tauriWin.scaleFactor();
export const WINDOW_DEFAULT_SIZE  = physicalSize.toLogical(scaleFactor);



function LandingPage() {
    const navigate = useNavigate();
    useEffect(() => {
        // useEffect後にしないと正常に動作しない
        navigate("/Password");
    }, []);
    return <></>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Sidebar/>
            <main className="flex flex-col grow min-w-0">
                <Routes>
                    {Object.entries({
                        "*"         : <NotFoundPage/>,
                        "/"         : <LandingPage/>,
                        "/Password" : <Password/>,
                        "/Tools"    : <Tools/>,
                        "/CmdGen"   : <CmdGen/>,
                        "/Note"     : <Note/>,
                        "/QRCode"   : <QRCode/>,
                        "/Auth"     : <Auth/>,
                        "/System"   : <System/>,
                        "/ToDo"     : <ToDo/>,
                    }).map(([k, v]) => <Route key={k} path={k} element={v}/>)}
                </Routes>
            </main>
        </BrowserRouter>
    </React.StrictMode>,
);
