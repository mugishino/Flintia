import "~/main.css";
// Utils
import "~/global/date";
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
import { MainWindow } from "./window/main/MainWindow";
import { Launcher } from "./window/launcher/Launcher";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NotFoundPage } from "./window/main/pages/404";
import { FlintiaWindow } from "./Flintia";
import { Logger } from "./Logger";
import { IS_DEVELOP_MODE } from "./Data";
import { AppStorage } from "./AppStorage";
import { Config } from "./Config";

const config = await AppStorage.load(new Config());
const windowLabel = getCurrentWindow().label;

// ウィンドウラベルごとにスタイルを与える
document.body.classList.add(windowLabel);

// デバッグ時にわかりやすいようにスタイル設定
if (IS_DEVELOP_MODE) {
    document.body.style.borderColor = "#800";
}



if (config.enable_launcher) {
    FlintiaWindow.getOrCreateWindow("launcher", "/Launcher", {
        decorations: false,
        skipTaskbar: true,
        resizable: false,
        shadow: false,
        visible: false,
        focus: false,
        transparent: true,
    }).catch(v => Logger.errorTrace("Window create failed:" + v));
}



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
