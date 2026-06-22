import { LogicalSize } from "@tauri-apps/api/dpi";
import { Route, Routes, useNavigate as useReactRouterNavigate } from "react-router";
import { FlintiaWindow } from "./Flintia";
import { NotFoundPage } from "./window/main/pages/404";
import { LandingPage } from "./window/main/pages/Landing";
import { Tools } from "./window/main/pages/Tools";
import { Password } from "./window/main/pages/Password";
import { CmdGen } from "./window/main/pages/CmdGen";
import { Note } from "./window/main/pages/Note";
import { ToDo } from "./window/main/pages/ToDo";
import { QRCode } from "./window/main/pages/QRCode";
import { Auth } from "./window/main/pages/Auth";
import { System } from "./window/main/pages/System/System";
import { MemeStock } from "./window/main/pages/MemeStock";
import { VideoCut } from "./window/main/pages/VideoCut";
import { Reminder } from "./window/main/pages/Reminder";
import { Launcher } from "./window/launcher/Launcher";
import { Logger } from "./module/Logger";
import { Roulette } from "./window/main/pages/Roulette";
import { FontManager } from "./window/main/pages/FontManager";
import { JSX } from "react/jsx-runtime";

type SidebarPosition = "Top"|"Bottom";
interface Page {
    element: JSX.Element;
    size?: LogicalSize;
    sidebar?: {
        label: string;
        pos: SidebarPosition;
    },
}

window.addEventListener("popstate", () => {
    Routing.adaptWindow();
});

export class Routing {
    public static readonly DEFAULT_PAGE = "/Password";

    public static readonly Data = new Map<string, Page>()
        .set("*"             , {element: <NotFoundPage/>})
        .set("/"             , {element: <LandingPage />})
        .set("/Password"     , {element: <Password    />, sidebar: {pos: "Top", label: "Password"}})
        .set("/Tools"        , {element: <Tools       />, sidebar: {pos: "Top", label: "Tools"}})
        .set("/CmdGen"       , {element: <CmdGen      />, sidebar: {pos: "Top", label: "CmdGen"}})
        .set("/Note"         , {element: <Note        />, sidebar: {pos: "Top", label: "Note"}})
        .set("/ToDo"         , {element: <ToDo        />, sidebar: {pos: "Top", label: "ToDo"}})
        .set("/QRCode"       , {element: <QRCode      />, sidebar: {pos: "Top", label: "QRCode"}})
        .set("/Auth"         , {element: <Auth        />, sidebar: {pos: "Top", label: "Auth"}})
        .set("/MemeStock"    , {element: <MemeStock   />, sidebar: {pos: "Top", label: "MemeStock"}, size: new LogicalSize(1280, 720)})
        .set("/VideoCut"     , {element: <VideoCut    />, sidebar: {pos: "Top", label: "VideoCut"}, size: new LogicalSize(1280, 720)})
        .set("/Reminder"     , {element: <Reminder    />, sidebar: {pos: "Top", label: "Reminder"}})
        .set("/Roulette"     , {element: <Roulette    />, sidebar: {pos: "Top", label: "Roulette"}})
        .set("/FontManager"  , {element: <FontManager />, sidebar: {pos: "Top", label: "FontManager"}, size: new LogicalSize(1280, 720)})
        .set("/System"       , {element: <System      />, sidebar: {pos: "Bottom", label: "System"}})

        .set("/Launcher"     , {element: <Launcher    />})
        ;

    /**
     * ルーティング要素を返します。
     * @returns \<Routes>を返すので直接使えます。
     */
    public static getRoutes() {
        const value = this.Data.map((k, v) => <Route key={k} path={k} element={v.element}/>);
        return <Routes>{value}</Routes>;
    }

    public static useNavigate() {
        const navi = useReactRouterNavigate();
        return async (path: string) => {
            //? アロー関数内なのでthisではなくRoutingと記述してください。
            await navi(path);
            // navi時にすぐpathnameは変更される
            Routing.routingEvents.forEach(v => v(location.pathname));
            // change window size
            const data = Routing.Data.get(path);
            if (!data) Logger.error("[Routing] Page not found: " + path);
            Routing.adaptWindow(data ?? {element: <NotFoundPage/>});
        };
    }

    /**
     * ウィンドウをページの情報に適応させます。
     * @param page 適応させるページ。未指定の場合現在のページ。
     */
    public static async adaptWindow(page?: Page) {
        const data = page ?? this.Data.get(location.pathname);
        // 適応
        const win = await FlintiaWindow.getCurrentWindow();
        const windowSize = data?.size ?? win.getDefaultWindowSize();
        if (windowSize) {
            await win.setWindowSize(windowSize);
        } else Logger.warning("Failed to get page window size and flintia default window size");
    }

    public static routingEvents: ((pathname: string) => void)[] = [];
    public static addRoutingEvent(fun: (pathname: string) => void) {
        this.routingEvents.push(fun);
    }
}

// 互換性維持
export const useFlintiaNavigate = Routing.useNavigate;
