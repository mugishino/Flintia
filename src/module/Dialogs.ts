import * as dialog from "@tauri-apps/plugin-dialog";
import { DialogFilter } from "@tauri-apps/plugin-dialog"
import { DESKTOP_DIR } from "~/Data";
import { FlintiaWindow } from "~/Flintia";

export const ALL_EXTENSIONS  : DialogFilter = {name: "Any"  , extensions: ["*"]};
export const VIDEO_EXTENSIONS: DialogFilter = {name: "Video", extensions: ["mp4", "mkv", "avi", "mov", "webm"]};
export const AUDIO_EXTENSIONS: DialogFilter = {name: "Audio", extensions: ["mp3", "wav", "flac", "ogg", "opus"]};
export const IMAGE_EXTENSIONS: DialogFilter = {name: "Image", extensions: ["jpg", "jpeg", "png", "tif", "tiff", "webp", "avif", "bmp", "jxl"]};

export class Dialogs {
    // 大本のラップ関数
    private static async openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: false, defaultPath?: string): Promise<string  |null>;
    private static async openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: true , defaultPath?: string): Promise<string[]|null>;
    private static async openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: boolean, defaultPath?: string) {
        const result = await dialog.open({
            title: title,
            filters: extensions,
            directory: directory,
            multiple: multiple,
            defaultPath: defaultPath ?? DESKTOP_DIR,
        }) as string[] | string | null;
        FlintiaWindow.getCurrentWindow().then(v => v.show());
        return result;
    }



    /**
     * 1ファイルのみ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 対応拡張子
     * @param defaultPath デフォルトで開くパス。未指定の場合デスクトップ
     * @returns 選択されたファイル
     */
    public static async openSingleFile(title: string, extensions: DialogFilter[], defaultPath?: string) {
        return this.openWrapper(title, extensions, false, false, defaultPath);
    }

    /**
     * 1ディレクトリのみ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param defaultPath デフォルトで開くパス。未指定の場合デスクトップ
     * @returns 選択されたディレクトリ
     */
    public static async openSingleDirectory(title: string, defaultPath?: string) {
        return this.openWrapper(title, undefined, true, false, defaultPath);
    }

    /**
     * 複数ファイル選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 対応拡張子
     * @param defaultPath デフォルトで開くパス。未指定の場合デスクトップ
     * @returns 選択されたファイルリスト
     */
    public static async openMultiFile(title: string, extensions: DialogFilter[], defaultPath?: string) {
        return this.openWrapper(title, extensions, false, true, defaultPath);
    }

    /**
     * 複数ディレクトリ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param defaultPath デフォルトで開くパス。未指定の場合デスクトップ
     * @returns 選択されたディレクトリリスト
     */
    public static async openMultiDirectory(title: string, defaultPath?: string) {
        return this.openWrapper(title, undefined, true, true, defaultPath);
    }

    /**
     * 保存ダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 保存可能拡張子
     * @param defaultPath デフォルトで開くパス。未指定の場合デスクトップ
     * @returns 指定されたファイル
     */
    public static async save(title: string, extensions?: DialogFilter[], defaultPath?: string) {
        const result = await dialog.save({
            title: title,
            filters: extensions,
            defaultPath: defaultPath ?? DESKTOP_DIR,
        });
        FlintiaWindow.getCurrentWindow().then(v => v.show());
        return result;
    }
}
