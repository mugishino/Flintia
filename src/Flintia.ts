import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow, LogicalPosition, LogicalSize, Window } from "@tauri-apps/api/window";

export type HotkeyMainKey = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";

export class FlintiaWindow {
    readonly rawWindow: Window;

    /**
     * ### 直でコンストラクタを触らず、FlintaWindow.initを使用してください
     * @param win ラップするWindow
     */
    private constructor(win: Window) {
        this.rawWindow = win;
    }
    /**
     * コンストラクタのラッパー。一部保存する必要のあるデータが非同期な為。
     * @param win ラップするWindow
     * @returns 初期化したFlintiaWindow
     */
    private static async init(win: Window) {
        const fw = new FlintiaWindow(win);
        await fw.setDefaultWindowSize();
        return fw;
    }

    /**
     * FlintiaWindowを取得します。
     * @param identifer 取得するWindowのLabel。未指定でmainを取得します。
     * @returns 取得したFlintiaWindowまたはundefined
     */
    public static async get(identifer?: string) {
        const w = await Window.getByLabel(identifer ?? "main");
        if (w == null) return undefined;

        return await this.init(w);
    }

    /**
     * このスクリプトが動作しているFlintiaWindowを取得します。
     * @returns スクリプト動作中のFlintiaWindow
     */
    public static async getCurrentWindow() {
        return await this.init(getCurrentWindow());
    }



    /**
     * このウィンドウにホットキーを設定します。
     * @param shift Shiftが必要か
     * @param ctrl Ctrlが必要か
     * @param alt Altが必要か
     * @param win Windowsが必要か
     * @param main メインのキー
     * @param callback 押された場合に実行する関数
     * @returns 登録に成功した場合true
     */
    public async registerHotkey(shift: boolean, ctrl: boolean, alt: boolean, win: boolean, main: HotkeyMainKey, callback: () => Promise<void> | void): Promise<boolean> {
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
                callback();
            })
            .then (() => resolve(true ))
            .catch(() => resolve(false));
        });
    }

    /**
     * このウィンドウを表示します。
     * @param pos ウィンドウを表示する位置。未指定の場合中央
     */
    public async show(pos?: LogicalPosition) {
        if (pos) await this.rawWindow.setPosition(pos);
        else await this.rawWindow.center();

        await this.rawWindow.show();
        await this.rawWindow.setFocus();
    }

    /**
     * ウィンドウを非表示にします。
     */
    public async hide() {
        await this.rawWindow.hide();
    }

    /**
     * 現在のウィンドウサイズを取得します。
     * @returns 取得したサイズ
     */
    public async getWindowSize() {
        const physicalSize = await this.rawWindow.innerSize();
        const scaleFactor  = await this.rawWindow.scaleFactor();
        return physicalSize.toLogical(scaleFactor);
    }

    /**
     * ウィンドウのサイズを変更します。
     * @param size 変更したいサイズ
     */
    public async setWindowSize(size: LogicalSize) {
        // FHDの画面サイズを基本とし、その他の画面サイズとの差異を補正する
        const fhdHeightGap = window.screen.height / 1080;
        const fhdWidthGap = window.screen.width / 1920;
        const fixSize = new LogicalSize(size.width * fhdWidthGap, size.height * fhdHeightGap);

        await this.rawWindow.setSize(fixSize);
        await this.rawWindow.center();
    }

    /**
     * このウィンドウのデフォルトサイズを設定します。
     * @param size デフォルトにしたいウィンドウサイズ。未指定の場合は現在のウィンドウサイズで保存され、既に指定されている場合は上書きされません。
     */
    private async setDefaultWindowSize(size?: LogicalSize) {
        const key = this.rawWindow.label + "_WINDOW_SIZE";
        if (!size) {
            // サイズ未指定かつ、既にデフォルトサイズが保存済みの場合はreturn
            if (sessionStorage.getItem(key) != null) return;
            size = await this.getWindowSize();
        }
        sessionStorage.setItem(key, JSON.stringify(size));
    }

    /**
     * このウィンドウのデフォルトサイズを取得します。
     * @returns デフォルトウィンドウサイズ
     */
    public getDefaultWindowSize() {
        const raw = sessionStorage.getItem(this.rawWindow.label + "_WINDOW_SIZE");
        if (raw == null) return null;
        const data = JSON.parse(raw);
        return new LogicalSize({
            width: data.width,
            height: data.height
        });
    }
}

/**
 * @deprecated
 * マルチウィンドウ用のFlintiaWindowに移行してください。
 * 参照がなくなり次第、廃止されます。
 */
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
        // FHDの画面サイズを基本とし、その他の画面サイズとの差異を補正する
        const fhdHeightGap = window.screen.height / 1080;
        const fhdWidthGap = window.screen.width / 1920;
        const fixSize = new LogicalSize(size.width * fhdWidthGap, size.height * fhdHeightGap);

        await mainWindow.setSize(fixSize);
        await mainWindow.center();
    }

    export function getDefaultWindowSize() {
        const raw = sessionStorage.getItem("WINDOW_DEFAULT_SIZE");
        if (raw == null) return null;
        const data = JSON.parse(raw);
        return new LogicalSize({
            width: data.width,
            height: data.height
        });
    }
}
