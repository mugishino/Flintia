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
import { CreateLauncherWindow, Launcher } from "./window/launcher/Launcher";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NotFoundPage } from "./window/main/pages/404";
import { IS_DEVELOP_MODE } from "./Data";
import { AppStorage } from "./module/AppStorage";
import { Config } from "./Config";
import { SVGDefinitions } from "./components/SVGIcon";

const config = await AppStorage.load(new Config());
const windowLabel = getCurrentWindow().label;

// ウィンドウラベルごとにスタイルを与える
document.body.classList.add(windowLabel);

// 右クリックを無効化 - index.htmlでもしているが効かない状況があった為
window.addEventListener("contextmenu", e => e.preventDefault());

// デバッグ時にわかりやすいようにスタイル設定
if (IS_DEVELOP_MODE) {
    document.body.style.borderColor = "#800";
}



if (config.enable_launcher) {
    CreateLauncherWindow();
}



const page = {
    "main": <MainWindow/>,
    "launcher": <Launcher/>,
}[windowLabel];



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <SVGDefinitions/>
            {page ?? <NotFoundPage/>}
        </BrowserRouter>
    </React.StrictMode>,
);
