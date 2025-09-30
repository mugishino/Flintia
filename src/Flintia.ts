import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export type HotkeyMainKey = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";

export namespace Flintia {
    export const mainWindow = getCurrentWindow();

    export async function registerHotkey(shift: boolean, ctrl: boolean, alt: boolean, win: boolean, main: HotkeyMainKey): Promise<boolean> {
        await unregisterAll();

        const key: string[] = [];
        if (shift) key.push("Shift");
        if (ctrl ) key.push("Ctrl" );
        if (alt  ) key.push("Alt"  );
        if (win  ) key.push("Super");
        key.push(main);

        return new Promise(resolve => {
            // 成功時はtrueが返る
            register(key.join("+"), async e => {
                if (e.state != "Pressed") return;
                await mainWindow.isVisible() ? hide() : show();
            })
            .then (() => resolve(true ))
            .catch(() => resolve(false));
        });
    }

    export async function show() {
        mainWindow.show();
    }

    export async function hide() {
        mainWindow.hide();
    }

    export async function getWindowSize() {
        const physicalSize = await mainWindow.innerSize();
        const scaleFactor  = await mainWindow.scaleFactor();
        return physicalSize.toLogical(scaleFactor);
    }

    export async function setWindowSize(size: LogicalSize) {
        await mainWindow.setSize(size);
        await mainWindow.center();
    }
}

export const DEFAULT_WINDOW_SIZE = await Flintia.getWindowSize();
