import { LogicalSize } from "@tauri-apps/api/dpi";
import { Route, Routes, useNavigate } from "react-router";
import { FlintiaWindow } from "./Flintia";
import NotFoundPage from "./window/main/pages/404";
import LandingPage from "./window/main/pages/Landing";
import Tools from "./window/main/pages/Tools";
import Password from "./window/main/pages/Password";
import CmdGen from "./window/main/pages/CmdGen";
import Note from "./window/main/pages/Note";
import ToDo from "./window/main/pages/ToDo";
import QRCode from "./window/main/pages/QRCode";
import Auth from "./window/main/pages/Auth";
import System from "./window/main/pages/System/System";
import MemeStock from "./window/main/pages/MemeStock";
import VideoCut from "./window/main/pages/VideoCut";
import Reminder from "./window/main/pages/Reminder";
import Launcher from "./window/launcher/Launcher";
import { Logger } from "./Logger";
import { Roulette } from "./window/main/pages/Roulette";



export namespace Routing {
    export const DEFAULT_PAGE = "/Password";

    type SidebarPosition = "Top"|"Bottom";
    interface Page {
        element: JSX.Element;
        size?: LogicalSize;
        sidebar?: {
            label: string;
            pos: SidebarPosition;
        },
    }



    export const Data: {[_:string]:Page} = {
        "*"             :{element: <NotFoundPage/>},
        "/"             :{element: <LandingPage />},
        "/Password"     :{element: <Password    />, sidebar: {pos: "Top", label: "Password"}},
        "/Tools"        :{element: <Tools       />, sidebar: {pos: "Top", label: "Tools"}},
        "/CmdGen"       :{element: <CmdGen      />, sidebar: {pos: "Top", label: "CmdGen"}},
        "/Note"         :{element: <Note        />, sidebar: {pos: "Top", label: "Note"}},
        "/ToDo"         :{element: <ToDo        />, sidebar: {pos: "Top", label: "ToDo"}},
        "/QRCode"       :{element: <QRCode      />, sidebar: {pos: "Top", label: "QRCode"}},
        "/Auth"         :{element: <Auth        />, sidebar: {pos: "Top", label: "Auth"}},
        "/MemeStock"    :{element: <MemeStock   />, sidebar: {pos: "Top", label: "MemeStock"}, size: new LogicalSize(1280, 720)},
        "/VideoCut"     :{element: <VideoCut    />, sidebar: {pos: "Top", label: "VideoCut"}, size: new LogicalSize(1280, 720)},
        "/Reminder"     :{element: <Reminder    />, sidebar: {pos: "Top", label: "Reminder"}},
        "/Roulette"     :{element: <Roulette    />, sidebar: {pos: "Top", label: "Roulette"}},
        "/System"       :{element: <System      />, sidebar: {pos: "Bottom", label: "System"}},

        "/Launcher"     :{element: <Launcher    />},
    };

    /**
     * ルーティング要素を返します。
     * @returns \<Routes>を返すので直接使えます。
     */
    export function getRoutes() {
        const value = Object.entries(Data).map(([k, v]) => <Route key={k} path={k} element={v.element}/>);
        return <Routes>{value}</Routes>;
    }
}



export function useFlintiaNavigate() {
    const navi = useNavigate();
    return async (path: string) => {
        const win = await FlintiaWindow.getCurrentWindow();
        const data = Routing.Data[path];
        await navi(path);
        const windowSize = data.size ?? win.getDefaultWindowSize();
        if (windowSize) {
            await win.setWindowSize(windowSize);
        } else Logger.warning("Failed to get page window size and flintia default window size");
    };
}
