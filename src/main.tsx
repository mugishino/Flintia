import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Password from "~/Password/Password";
import "~/main.css";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { WInvoke } from "~/InvokeWrapper";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import Sidebar from "~/Sidebar";
import Tools from "~/Tools/Tools";
import Note from "./Note/Note";
import QRCode from "./QRCode/QRCode";
import Auth from "./Auth/Auth";
import System from "./System/System";
import ToDo from "./ToDo/ToDo";
import "~/global";
import CmdGen from "./CmdGen/CmdGen";
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
