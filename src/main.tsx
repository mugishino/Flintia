import "~/main.css";
// Utils
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
import MainWindow from "./window/main/MainWindow";
import Launcher from "./window/launcher/Launcher";
import { getCurrentWindow } from "@tauri-apps/api/window";
import NotFoundPage from "./window/main/pages/404";
import { FlintiaWindow } from "./Flintia";

const windowLabel = getCurrentWindow().label;

// ウィンドウラベルごとにスタイルを与える
document.body.classList += windowLabel

// デバッグ時にわかりやすいようにスタイル設定
if (process.env.NODE_ENV == "development") {
    document.body.style.borderColor = "#800";
}



FlintiaWindow.getOrCreateWindow("launcher", "/Launcher", {
    decorations: false,
    resizable: false,
    shadow: false,
    transparent: true,
    focus: false,
    skipTaskbar: true,
});



const page = {
    "main": <MainWindow/>,
    "launcher": <Launcher/>,
}[windowLabel];



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            {page ?? <NotFoundPage/>}
        </BrowserRouter>
    </React.StrictMode>,
);
