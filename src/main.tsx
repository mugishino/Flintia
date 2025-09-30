// Utils
import "~/main.css";
import "~/global/array";
import "~/global/json";
import "~/global/map";
import "~/global/math";
import "~/global/number";
import "~/global/string";
// Core
import { Flintia } from "./Flintia";
// React
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
// Pages
import Sidebar from "~/Sidebar";
import NotFoundPage from "./pages/404";
import Password from "~/pages/Password";
import Tools from "~/pages/Tools";
import CmdGen from "./pages/CmdGen";
import Note from "./pages/Note";
import ToDo from "./pages/ToDo";
import QRCode from "./pages/QRCode";
import Auth from "./pages/Auth";
import System from "./pages/System";
// その他と未分類

if (process.env.NODE_ENV == "development") {
    document.body.style.border = "thin solid #800";
}



await Flintia.registerHotkey(true, true, true, false, "Q");

document.addEventListener("keydown", e => {
    if (e.code == "Escape") {
        Flintia.hide();
    }
});

Flintia.mainWindow.onFocusChanged(({payload}) => {
    if (!payload) Flintia.hide();
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
