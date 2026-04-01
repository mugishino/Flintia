import * as dialog from "@tauri-apps/plugin-dialog";
import { DialogFilter } from "@tauri-apps/plugin-dialog"
import { FlintiaWindow } from "~/Flintia";

export const ALL_EXTENSIONS  : DialogFilter = {name: "Any"  , extensions: ["*"]};
export const VIDEO_EXTENSIONS: DialogFilter = {name: "Video", extensions: ["mp4", "mkv", "avi", "mov", "webm"]};
export const AUDIO_EXTENSIONS: DialogFilter = {name: "Audio", extensions: ["mp3", "wav", "flac", "ogg", "opus"]};
export const IMAGE_EXTENSIONS: DialogFilter = {name: "Image", extensions: ["jpg", "jpeg", "png", "tif", "tiff", "webp", "avif"]};

export namespace Dialogs {

    async function openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: false, defaultPath?: string): Promise<string  |null>;
    async function openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: true , defaultPath?: string): Promise<string[]|null>;

    // 大本のラップ関数
    async function openWrapper(title: string, extensions: DialogFilter[]|undefined, directory: boolean, multiple: boolean, defaultPath?: string) {
        const result = await dialog.open({
            title: title,
            filters: extensions,
            directory: directory,
            multiple: multiple,
            defaultPath: defaultPath,
        }) as string[] | string | null;
        FlintiaWindow.getCurrentWindow().then(v => v.show());
        return result;
    }



    /**
     * 1ファイルのみ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 対応拡張子
     * @returns 選択されたファイル
     */
    export async function openSingleFile(title: string, extensions: DialogFilter[], defaultPath?: string) {
        return openWrapper(title, extensions, false, false, defaultPath);
    }

    /**
     * 1ディレクトリのみ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @returns 選択されたディレクトリ
     */
    export async function openSingleDirectory(title: string, defaultPath?: string) {
        return openWrapper(title, undefined, true, false, defaultPath);
    }

    /**
     * 複数ファイル選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 対応拡張子
     * @returns 選択されたファイルリスト
     */
    export async function openMultiFile(title: string, extensions: DialogFilter[], defaultPath?: string) {
        return openWrapper(title, extensions, false, true, defaultPath);
    }

    /**
     * 複数ディレクトリ選択可能なopenダイアログを開きます。
     * @param title ダイアログのタイトル
     * @returns 選択されたディレクトリリスト
     */
    export async function openMultiDirectory(title: string, defaultPath?: string) {
        return openWrapper(title, undefined, true, true, defaultPath);
    }

    /**
     * 保存ダイアログを開きます。
     * @param title ダイアログのタイトル
     * @param extensions 保存可能拡張子
     * @returns 指定されたファイル
     */
    export async function save(title: string, extensions?: DialogFilter[], defaultPath?: string) {
        const result = await dialog.save({
            title: title,
            filters: extensions,
            defaultPath: defaultPath,
        });
        FlintiaWindow.getCurrentWindow().then(v => v.show());
        return result;
    }
}
