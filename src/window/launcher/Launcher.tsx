import { LogicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { FlintiaWindow } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import LaunchPanel from "./LaunchPanel";

export default function Launcher() {
    useEffectAsync(async() => {
        const win = await FlintiaWindow.get("launcher");
        if (!win) return;

        // ウィンドウ設定
        await win.setDefaultPosition(new LogicalPosition(0, 0));
        await win.rawWindow.setSize(new PhysicalSize(screen.width, screen.height));
        await win.rawWindow.setPosition(await win.getDefaultPosition() ?? new LogicalPosition(100, 100));

        await win.registerHotkey(true, true, true, false, "A", async() => await win.toggleVisible());
        win.rawWindow.onFocusChanged(({payload}) => {
//            if (!payload) win.hide();
        });
    }, []);

    return (
        <LaunchPanel/>
    );
}
