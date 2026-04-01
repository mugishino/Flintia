import Config from "~/Config";
import { FlintiaWindow } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { Logger } from "~/Logger";
import { Routing } from "~/Routing";
import Sidebar from "~/window/main/Sidebar";

export default function MainWindow() {
    useEffectAsync(async() => {
        const mainWindow = await FlintiaWindow.get();
        if (!mainWindow) {
            Logger.error("Failed to get main window");
            return;
        }

        Config.load().then(async config => {
            await mainWindow.registerHotkey(config.hotkey_shift, config.hotkey_ctrl, config.hotkey_alt, config.hotkey_win, config.hotkey_main, async () => mainWindow.toggleVisible());
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
                {Routing.getRoutes()}
            </main>
        </>
    );
}
