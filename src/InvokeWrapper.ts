import { invoke } from "@tauri-apps/api/core";
import { IS_DEVELOP_MODE } from "./Data";
import { Result } from "./util/class/Result";

export interface DiskInfo {
    name: string;
    total_size: number;
    available_space: number;
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

export interface UWPAppInfo {
    display_name: string|null,
    description: string|null,
    aumid: string
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

interface GenerateFontPreviewArgs {
    font_path: string,
    output_path: string,
    text: string,
    font_size: number,
    canvas_width: number,
    canvas_height: number,
    base_x: number,
    base_y: number,
    padding: number,
}

export class WInvoke {
    /**
     * ウィンドウを閉じたのち、Ctrl+Vを押します。
     * @param enter ペースト後にEnterを押すか
     */
    public static async paste(enter: boolean=false) {
        await invoke("paste", {enter});
    }

    /**
     * ディスク上のファイルをクリップボードにコピーします。
     * @param path コピーするファイル
     * @returns 失敗時にエラー文が戻ります
     */
    public static async clipboardCopyfile(path: string) {
        return await Result.fromPromise<undefined, string>(invoke("clipboard_copyfile", {path: path}));
    }

    /**
     * PCの起動時間を取得します。
     * @returns 秒
     */
    public static async getSystemUptime(): Promise<number> {
        return await invoke("get_system_uptime");
    }

    /**
     * 全てのディスクの情報を取得します。
     * @returns 取得した全てのディスク情報
     */
    public static async getAllDiskInfo(): Promise<DiskInfo[]> {
        return await invoke("get_all_disk_info");
    }

    /**
     * インストールされているWindowsHotfixを取得します。
     * @returns 取得したHotfixリスト
     */
    public static async getWindowsHotfix(): Promise<Result<{HotFixID: string}[], string>> {
        return await invoke<string>("get_windows_hotfix")
        .then(v => Result.Ok(JSON.parse(v)))
        .catch((v: string) => Result.Err(v))
        ;
    }

    /**
     * ファイルのアイコンをBase64で取得します。
     * @param mime mineタイプを先頭につける
     * @returns base64
     */
    public static async getFileIconBase64(path: string, size=32, mime: boolean=true): Promise<Result<string, string>> {
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
    public static async isDirectory(path: string): Promise<boolean> {
        return await invoke("is_directory", {path: path});
    }

    /**
     * ファイルを実行します。
     * @param path 実行するファイル
     * @param args 実行引数
     * @returns エラーまたは成功
     */
    public static async runExe(path: string, args?: string): Promise<Result<undefined, string>> {
        return await Result.fromPromise<undefined, string>(invoke("run_exe", {path: path, args: args ?? String.empty}));
    }

    /**
     * コンソールにログを出力します。
     * @param msg 出力するメッセージ
     */
    public static async consoleLog(msg: string) {
        await invoke("console_log", {msg: msg});
    }

    /**
     * Windowsのアクセントカラーを取得します。
     * @returns 取得したアクセントカラーまたはエラー
     */
    public static async getWindowsAccentColor(): Promise<Result<{R: number, G: number, B: number, A: number}, string>> {
        return await Result.fromPromise(invoke("get_windows_accent_color"));
    }

    /**
     * ウィンドウのDevtoolsを開きます。
     * @param label Devtoolsを開くウィンドウのLabel
     */
    public static async openDevtools(label: string) {
        if (!IS_DEVELOP_MODE) return;
        await invoke("open_devtools", {label: label});
    }

    /**
     * ファイルをゴミ箱に送る
     * @param files ゴミ箱に送るファイルリスト
     */
    public static async fileTrash(files: string[]): Promise<Result<undefined, string>> {
        return await Result.fromPromise(invoke("file_trash", {files: files}));
    }

    /**
     * lnkファイルを解析します。
     * @param path 解析するlnkファイル
     * @returns 解析データ
     */
    public static async parseLnk(path: string): Promise<Result<LinkData, string>> {
        return await Result.fromPromise<LinkData, string>(invoke("parse_lnk", {path: path}));
    }

    /**
     * UWPのアプリを全て取得します。
     * @returns 取得したUWPのアプリ
     */
    public static async getUwpApps(): Promise<Result<UWPAppInfo[], string>> {
        return await Result.fromPromise<UWPAppInfo[], string>(invoke("get_uwp_apps"));
    }

    /**
     * ホットキーを登録します。
     * @param hotkey 登録するホットキー
     * @param id listen時に返ってくる識別用ID
     */
    public static async registerHotkey(hotkey: string, id: string): Promise<Result<string, string>> {
        return await Result.fromPromise<string, string>(invoke("register_hotkey", {hotkey, id}));
    }

    /**
     * 再帰的にファイルを取得します。
     * ### 深い階層があると時間がかかりフリーズする可能性があります。
     * @param path 取得するディレクトリ
     * @returns 取得したファイル
     */
    public static async getRecursiveFiles(path: string): Promise<string[]> {
        return await invoke("get_recursive_files", {path}) as string[];
    }

    /**
     * フォントファイルを解析し、メタデータを取得します。
     * @param path フォントファイルのパス
     * @returns Result<データ, エラー>
     */
    public static async parseFontMetadata(path: string): Promise<Result<FontMetadata, string>> {
        return await Result.fromPromise<FontMetadata, string>(invoke("parse_font_metadata", {path}));
    }

    /**
     * フォントのプレビュー画像を生成します。
     * @param fontPath フォントファイルのパス
     * @param outputPath 画像出力パス
     * @param text 描画するテキスト
     * @param fontSize 描画するフォントの大きさ
     * @param canvasHeight 内部で使用するキャンバスの縦幅(クリッピングされます)
     * @param canvasWidth 内部で使用するキャンバスの横幅(クリッピングされます)
     * @param baseX X座標の描画基準点
     * @param baseY Y座標の描画基準点
     * @param padding クリッピング後につける余白
     * @returns Result<undefined, エラー文>
     */
    public static async generateFontPreview(
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
        const args: GenerateFontPreviewArgs = {
            font_path: fontPath,
            output_path: outputPath,
            text,
            font_size: fontSize,
            // option
            canvas_width: Math.max(option?.canvasWidth ?? 1024, 1),
            canvas_height: Math.max(option?.canvasHeight ?? 128, 1),
            base_x: option?.baseX ?? 16,
            base_y: option?.baseY ?? 8,
            padding: Math.max(option?.padding ?? 8, 0),
        };
        return await Result.fromPromise<undefined, string>(invoke("generate_font_preview", {args: args}));
    }

    /**
     * フォントを登録します。
     * @param fonts 登録するフォントファイルのパスリスト
     * @returns Result<成功したフォントのパスリスト, エラー文>
     */
    public static async registerFonts(fonts: string[]) {
        return await Result.fromPromise<string[], string>(invoke("register_fonts", {fonts}));
    }

    /**
     * フォントの登録を解除します。
     * @param fonts 登録解除するフォントファイルのパスリスト
     * @returns Result<undefined, エラー文>
     */
    public static async unregisterFonts(fonts: string[]) {
        return await Result.fromPromise<undefined, string>(invoke("unregister_fonts", {fonts}));
    }

    /**
     * 読み込み済みのフォントファイルのパスを取得します。
     * @returns Result<読込済フォントファイルパス, エラー文>
     */
    public static async getActiveFonts() {
        return await Result.fromPromise<string[], string>(invoke("get_active_fonts"));
    }
}
