import { LogicalSize } from "@tauri-apps/api/dpi";
import { Route, Routes, useNavigate } from "react-router";
import { DEFAULT_WINDOW_SIZE, Flintia } from "./Flintia";
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



export namespace Routing {
    export const DEFAULT_PAGE = "/Password";

    type SidebarPosition = "Top"|"Bottom";
    type Page = {
        element: JSX.Element,
        size?: LogicalSize,
        sidebar?: {
            label: string,
            pos: SidebarPosition,
        },
    };



    export const Data: {[_:string]:Page} = {
        "*"         :{element: <NotFoundPage/>},
        "/"         :{element: <LandingPage />},
        "/Password" :{element: <Password    />, sidebar: {pos: "Top", label: "Password"}},
        "/Tools"    :{element: <Tools       />, sidebar: {pos: "Top", label: "Tools"}},
        "/CmdGen"   :{element: <CmdGen      />, sidebar: {pos: "Top", label: "CmdGen"}},
        "/Note"     :{element: <Note        />, sidebar: {pos: "Top", label: "Note"}},
        "/ToDo"     :{element: <ToDo        />, sidebar: {pos: "Top", label: "ToDo"}},
        "/QRCode"   :{element: <QRCode      />, sidebar: {pos: "Top", label: "QRCode"}},
        "/Auth"     :{element: <Auth        />, sidebar: {pos: "Top", label: "Auth"}},
        "/System"   :{element: <System      />, sidebar: {pos: "Bottom", label: "System"}},
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
        await Flintia.setWindowSize(data.size ?? DEFAULT_WINDOW_SIZE);
    };
}
