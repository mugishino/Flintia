import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export type HotkeyMainKey = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";

const SessionDataKey = {
    DefaultWindowSize: "DEFAULT_WINDOW_SIZE",
};

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
        mainWindow.center();
        mainWindow.show();
        mainWindow.setFocus();
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

    export function getDefaultWindowSize() {
        const raw = sessionStorage.getItem(SessionDataKey.DefaultWindowSize);
        if (raw == null) return null;
        const data = JSON.parse(raw);
        return new LogicalSize({
            width: data.width,
            height: data.height
        });
    }
}

// SessionStorageに存在しないキーだったら情報を入れる
Object.entries({
    // キー: 値
    [SessionDataKey.DefaultWindowSize]: await Flintia.getWindowSize()
}).forEach(([k, v]) => {
    if (sessionStorage.getItem(k) == null) {
        sessionStorage.setItem(k, JSON.stringify(v));
    }
})
