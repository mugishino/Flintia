import { invoke } from "@tauri-apps/api/core";
import { IS_DEVELOP_MODE } from "./Data";
import { Result } from "./util/clazz";

interface DiskInfo {
    name: string;
    total_size: number;
    available_space: number;
}

export namespace WInvoke {
    /**
     * ウィンドウを閉じたのち、Ctrl+Vを押します。
     * @param enter ペースト後にEnterを押すか
     */
    export async function paste(enter: boolean=false) {
        await invoke("paste", {enter});
    }

    /**
     * PCの起動時間を取得します。
     * @returns 秒
     */
    export async function getSystemUptime(): Promise<number> {
        return await invoke("get_system_uptime");
    }

    /**
     * 全てのディスクの情報を取得します。
     * @returns 取得した全てのディスク情報
     */
    export async function getAllDiskInfo(): Promise<DiskInfo[]> {
        return await invoke("get_all_disk_info");
    }

    /**
     * インストールされているWindowsHotfixを取得します。
     * @returns 取得したHotfixリスト
     */
    export async function getWindowsHotfix(): Promise<{HotFixID: string}[]> {
        const data = await invoke("get_windows_hotfix");
        return JSON.parse(data as string);
    }

    /**
     * ファイルのアイコンをBase64で取得します。
     * @param mime mineタイプを先頭につける
     * @returns base64
     */
    export async function getFileIconBase64(path: string, size=32, mime: boolean=true): Promise<Result<string, string>> {
        return invoke("get_file_icon_base64", {path: path, size: size}).then(base64 => {
            return Result.Ok((mime ? "data:image/png;base64," : String.empty) + base64);
        }).catch(reason => {
            return Result.Err(reason);
        });
    }

    /**
     * パスがディレクトリか判別します。
     * @param path 判別したいパス
     * @returns ディレクトリであればtrue
     */
    export async function isDirectory(path: string): Promise<boolean> {
        return await invoke("is_directory", {path: path});
    }

    /**
     * ファイルを実行します。
     * @param path 実行するファイル
     * @param args 実行引数
     * @returns エラーまたは成功
     */
    export async function runExe(path: string, args?: string): Promise<string> {
        return await invoke("run_exe", {path: path, args: args ?? String.empty});
    }

    /**
     * コンソールにログを出力します。
     * @param msg 出力するメッセージ
     */
    export async function consoleLog(msg: string) {
        await invoke("console_log", {msg: msg});
    }

    /**
     * Windowsのアクセントカラーを取得します。
     * @returns 取得したアクセントカラーまたはエラー
     */
    export async function getWindowsAccentColor(): Promise<{R: number, G: number, B: number, A: number}> {
        return await invoke("get_windows_accent_color");
    }

    /**
     * ウィンドウのDevtoolsを開きます。
     * @param label Devtoolsを開くウィンドウのLabel
     */
    export async function openDevtools(label: string) {
        if (!IS_DEVELOP_MODE) return;
        await invoke("open_devtools", {label: label});
    }

    /**
     * ファイルをゴミ箱に送る
     * @param files ゴミ箱に送るファイルリスト
     */
    export async function fileTrash(files: string[]) {
        await invoke("file_trash", {files: files});
    }

    export interface LinkData {
        link_info: {
            local_base_path: string,
        },
        string_data: {
            command_line_arguments: string|null,
            workingDir: string|null,
        }
    }

    /**
     * lnkファイルを解析します。
     * @param path 解析するlnkファイル
     * @returns 解析データ
     */
    export async function parseLnk(path: string) {
        const data = await invoke("parse_lnk", {path: path});
        return data as LinkData;
    }

    export interface UWPAppInfo {
        display_name: string|null,
        description: string|null,
        aumid: string
    }

    /**
     * UWPのアプリを全て取得します。
     * @returns 取得したUWPのアプリ
     */
    export async function getUwpApps() {
        return await invoke("get_uwp_apps") as UWPAppInfo[];
    }

    /**
     * ホットキーを登録します。
     * @param hotkey 登録するホットキー
     * @param id listen時に返ってくる識別用ID
     */
    export async function registerHotkey(hotkey: string, id: string) {
        return await Result.fromPromise<string, string>(invoke("register_hotkey", {hotkey, id}));
    }

    /**
     * 再帰的にファイルを取得します。
     * ### 深い階層があると時間がかかりフリーズする可能性があります。
     * @param path 取得するディレクトリ
     * @returns 取得したファイル
     */
    export async function getRecursiveFiles(path: string) {
        return await invoke("get_recursive_files", {path}) as string[];
    }

    export interface FontMetadata {
        family_name: string | undefined,
        post_script_name: string | undefined,
        full_name: string | undefined,
        subfamily_name: string | undefined,
        version: string | undefined,
        license: string | undefined,
        copyright: string | undefined,
        monospaced: boolean,
        variable: boolean,
    }
    /**
     * フォントファイルを解析し、メタデータを取得します。
     * @param path フォントファイルのパス
     * @returns Result<データ, エラー>
     */
    export async function parseFontMetadata(path: string) {
        return await Result.fromPromise<FontMetadata, string>(invoke("parse_font_metadata", {path}));
    }

    /**
     * フォントのプレビュー画像を生成します。
     * @param fontPath フォントファイルのパス
     * @param outputPath 画像出力パス(拡張子なし)
     * @param text 描画するテキスト
     * @param fontSize 描画するフォントの大きさ
     * @param canvasHeight 内部で使用するキャンバスの縦幅(クリッピングされます)
     * @param canvasWidth 内部で使用するキャンバスの横幅(クリッピングされます)
     * @param baseX X座標の描画基準点
     * @param baseY Y座標の描画基準点
     * @param padding クリッピング後につける余白
     * @returns Result<出力画像パス(拡張子あり), エラー文>
     */
    export async function generateFontPreview(
        fontPath: string,
        outputPath: string,
        text: string,
        fontSize: number,
        option?: {
            canvasWidth?: number,
            canvasHeight?: number,
            baseX?: number,
            baseY?: number,
            padding?: number,
        }
    ) {
        return await Result.fromPromise<undefined, string>(invoke("generate_font_preview", {
            fontPath,
            outputPath,
            text,
            fontSize,
            // option
            canvasWidth: Math.max(option?.canvasWidth ?? 1024, 1),
            canvasHeight: Math.max(option?.canvasHeight ?? 128, 1),
            baseX: option?.baseX ?? 16,
            baseY: option?.baseY ?? 8,
            padding: Math.max(option?.padding ?? 8, 0),
        }));
    }
}
