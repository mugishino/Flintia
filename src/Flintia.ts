import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { currentMonitor, getCurrentWindow, LogicalPosition, LogicalSize, Window, WindowOptions } from "@tauri-apps/api/window";
import { SessionData } from "./util/session";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { WInvoke } from "./InvokeWrapper";

export type HotkeyMainKeys = (typeof HOTKEY_MAINKEYS)[number];
export const HOTKEY_MAINKEYS = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
    "PageUp", "PageDown", "Home", "End", "Delete", "Insert",
    "Up", "Down", "Left", "Right",
    "Space", "-", "[", "]", ",", ".", "/",
] as const;

export type TaskbarDirection = "Left"|"Top"|"Right"|"Bottom";

export class FlintiaWindow {
    private readonly windowSizeKey: string;
    private readonly windowPositionKey: string;

    readonly rawWindow: Window;

    /**
     * ### 直でコンストラクタを触らず、FlintaWindow.initを使用してください
     * @param win ラップするWindow
     */
    private constructor(win: Window) {
        this.rawWindow = win;

        this.windowSizeKey = "WINDOW_SIZE_" + win.label;
        this.windowPositionKey = "WINDOW_POSITION_" + win.label;
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
     * ウィンドウを取得または作成します。
     * @param label ウィンドウのラベル
     * @param url ウィンドウの初期URL
     * @param created ウィンドウ作成時のコールバック
     * @param error ウィンドウエラー時のコールバック
     * @returns 取得または作成したFlintiaWindow
     */
    public static async getOrCreateWindow(
        label: string,
        url: string,
        option?: WindowOptions,
        created?: (win: WebviewWindow) => void,
        error?: (win: WebviewWindow) => void
    ): Promise<FlintiaWindow> {
        return new Promise(async resolve => {
            let win = await WebviewWindow.getByLabel(label);
            if (win) return this.init(win);

            win = new WebviewWindow(label, {...option, url: url});

            win.once("tauri://created", () => {
                this.init(win).then(v => resolve(v));
                if (created) created(win);
            });

            win.once("tauri://error", () => {
                if (error) error(win);
            });
        });
    }



    /** WindowLabel: Hotkey */
    private static activeHotkey: Map<string, string> = new Map();
    /**
     * このウィンドウにホットキーを設定します。前のホットキーは自動的に解除されます。
     * @param shift Shiftが必要か
     * @param ctrl Ctrlが必要か
     * @param alt Altが必要か
     * @param win Windowsが必要か
     * @param main メインのキー
     * @param callback 押された場合に実行する関数
     * @returns 登録に成功した場合true
     */
    public async registerHotkey(shift: boolean, ctrl: boolean, alt: boolean, win: boolean, main: HotkeyMainKeys, callback: () => Promise<void> | void): Promise<boolean> {
        // ホットキー文字列の作成
        const keyArray: string[] = [];
        if (shift) keyArray.push("Shift");
        if (ctrl ) keyArray.push("Ctrl" );
        if (alt  ) keyArray.push("Alt"  );
        if (win  ) keyArray.push("Super");
        keyArray.push(main);
        const hotkey = keyArray.join("+");

        // 今と同じホットキーであればキャンセル(完全に同じものとみなしtrueを返す)
        const old = FlintiaWindow.activeHotkey.get(this.rawWindow.label);
        if (old == hotkey) return true;

        // 既に存在するホットキーであればキャンセル
        const alreadyHotkeys = Array.from(FlintiaWindow.activeHotkey.values()).includes(hotkey);
        if (alreadyHotkeys) return false;

        return await new Promise(async resolve => {
            // Rust側のコールバックIDと合わせるため、F5前に登録済みの物を消す。
            // 登録されていないものを消そうとしたときにエラーが出るのでcatchで消す
            await unregister(hotkey).catch(() => {});
            // 新しいホットキーを登録
            await register(hotkey, async e => {
                if (e.state != "Pressed") return;
                callback();
            }).then(async () => {
                // ホットキーの状態管理を更新し、前のホットキーを解除
                FlintiaWindow.activeHotkey.set(this.rawWindow.label, hotkey);
                if (old) await unregister(old).catch(() => {});
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    public async toggleVisible() {
        await this.rawWindow.isVisible() ? this.hide() : this.show();
    }

    /**
     * このウィンドウを表示します。
     * @param pos ウィンドウを表示する位置。未指定の場合デフォルト値
     */
    public async show(pos?: LogicalPosition) {
        if (pos) await this.rawWindow.setPosition(pos);
        else {
            const defaultPos = this.getDefaultPosition();
            if (!defaultPos) await this.rawWindow.center();
            else this.rawWindow.setPosition(defaultPos);
        }

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
     * このウィンドウのデフォルト位置を設定します。
     * @param pos デフォルトにしたいウィンドウ位置。
     */
    public async setDefaultPosition(pos?: LogicalPosition) {
        const key = this.windowPositionKey;
        if (!pos) pos = await this.getWindowPosition();
        SessionData.set(key, pos);
    }

    /**
     * このウィンドウのデフォルト位置を取得します。
     * @returns 未指定の場合undefinedが返ります。
     */
    public getDefaultPosition() {
        const data = SessionData.get<{x: number, y: number}>(this.windowPositionKey);
        if (!data) return;
        return new LogicalPosition(data.x, data.y);
    }

    /**
     * 現在のウィンドウ位置を取得します。
     * @returns innerPosition()の返り値をLogicalPositionに直した物
     */
    public async getWindowPosition() {
        const physical = await this.rawWindow.innerPosition();
        const scaleFactor = await this.rawWindow.scaleFactor();
        return physical.toLogical(scaleFactor);
    }

    /**
     * 現在のウィンドウサイズを取得します。
     * @returns innerSize()の返り値をLogicalSizeに直した物
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
        const key = this.windowSizeKey;
        if (!size) {
            // サイズ未指定かつ、既にデフォルトサイズが保存済みの場合はreturn
            if (SessionData.exists(key)) return;
            size = await this.getWindowSize();
        }
        SessionData.set(key, size);
    }

    /**
     * このウィンドウのデフォルトサイズを取得します。
     * @returns デフォルトウィンドウサイズ。指定されていなかった場合nullが返ります。
     */
    public getDefaultWindowSize() {
        const data = SessionData.get<{width: number, height: number}>(this.windowSizeKey);
        if (data == null) return null;
        return new LogicalSize({
            width: data.width,
            height: data.height
        });
    }

    /**
     * タスクバーの方向を取得します。
     * @returns タスクバーの方向
     */
    public async getTaskbarDirection(): Promise<TaskbarDirection | undefined> {
        const monitor = await currentMonitor();
        if (monitor == null) return;

        const pos = monitor.workArea.position;
        if (pos.x != 0) return "Left";
        if (pos.y != 0) return "Top";
        const size = monitor.size;
        const workSize = monitor.workArea.size;
        if (size.height != workSize.height) return "Bottom";
        if (size.width != workSize.width) return "Right";
        return undefined;
    }

    /**
     * Devtoolsを開きます
     */
    public async openDevtools() {
        await WInvoke.openDevtools(this.rawWindow.label);
    }
}
