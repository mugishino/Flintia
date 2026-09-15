import { AppStorage } from "~/module/AppStorage";
import { Config } from "~/Config";
import { FlintiaWindow } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { Logger } from "~/module/Logger";
import { Routing } from "~/Routing";
import { Sidebar } from "~/window/main/Sidebar";
import { FileConverter } from "./FileConverter";
import { getCursorMonitorCenterWidnowPosition } from "~/util/util";
import { Route, Routes } from "react-router";

export function MainWindow() {
    useEffectAsync(async() => {
        const mainWindow = await FlintiaWindow.get();
        if (!mainWindow) {
            Logger.error("Failed to get main window");
            return;
        }

        AppStorage.load(new Config()).then(async config => {
            await mainWindow.registerHotkey(
                config.hotkey_shift,
                config.hotkey_ctrl,
                config.hotkey_alt,
                config.hotkey_win,
                config.hotkey_main,
                async () => {
                    const pos = await getCursorMonitorCenterWidnowPosition(mainWindow);
                    mainWindow.toggleVisible(pos);
                }
            );
        });

        document.addEventListener("keydown", e => {
            if (e.code == "Escape") {
                mainWindow.hide();
            }
        });

        mainWindow.rawWindow.onFocusChanged(({payload}) => {
            if (!payload) mainWindow.hide();
        }).catch(v => Logger.warning("Failed to register onFocusChanged event: " + v));
    }, []);



    return (
        <>
            <Sidebar/>
            <main className="flex flex-col grow min-w-0">
                <Routes>
                    {Routing.Data.map((k, v) => <Route key={k} path={k} element={v.element}/>)}
                </Routes>
            </main>
            <FileConverter/>
        </>
    );
}
