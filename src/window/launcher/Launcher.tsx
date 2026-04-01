import { LogicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { FlintiaWindow } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import LaunchPanel from "./LaunchPanel";
import { currentMonitor } from "@tauri-apps/api/window";
import { Logger } from "~/Logger";

const FULLSCREEN = false;

export default function Launcher() {
    useEffectAsync(async() => {
        const win = await FlintiaWindow.get("launcher");
        if (!win) {
            Logger.error("Failed to get launcher window");
            return;
        }

        // ウィンドウ設定
        const monitor = await currentMonitor();
        if (monitor == null) {
            Logger.warningTrace("Failed to get current monitor data.");
        }

        if (!FULLSCREEN && monitor) {
            const workareaPos = monitor.workArea.position;
            const scaleFactor = await win.rawWindow.scaleFactor();
            await win.setDefaultPosition(workareaPos.toLogical(scaleFactor));
        }
        const phySize = FULLSCREEN ? new PhysicalSize(screen.width, screen.height) : new PhysicalSize(screen.availWidth, screen.availHeight);
        await win.rawWindow.setSize(phySize);
        await win.rawWindow.setPosition(win.getDefaultPosition() ?? new LogicalPosition(100, 100));

        await win.registerHotkey(false, false, true, false, "Space", async() => await win.toggleVisible());

        win.rawWindow.onFocusChanged(({payload}) => {
            if (!payload) win.hide();
        });
    }, []);

    return (
        <LaunchPanel/>
    );
}
