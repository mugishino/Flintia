import { LogicalSize } from "@tauri-apps/api/dpi";
import { Route, Routes, useNavigate } from "react-router";
import { Flintia } from "./Flintia";
import NotFoundPage from "./pages/404";
import LandingPage from "./pages/Landing";
import Tools from "./pages/Tools";
import Password from "./pages/Password";
import CmdGen from "./pages/CmdGen";
import Note from "./pages/Note";
import ToDo from "./pages/ToDo";
import QRCode from "./pages/QRCode";
import Auth from "./pages/Auth";
import System from "./pages/System";
import MemeStock from "./pages/MemeStock";
import { Logger } from "./Logger";
import VideoCut from "./pages/VideoCut";
import Reminder from "./pages/Reminder";



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
        "/System"       :{element: <System      />, sidebar: {pos: "Bottom", label: "System"}},
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
        const data = Routing.Data[path];
        await navi(path);
        const windowSize = data.size ?? Flintia.getDefaultWindowSize();
        if (windowSize) {
            await Flintia.setWindowSize(windowSize);
        } else Logger.failed("get page window size and flintia default window size");
    };
}
