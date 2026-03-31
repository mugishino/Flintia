import { invoke } from "@tauri-apps/api/core";

interface DiskInfo {
    name: string;
    total_size: number;
    available_space: number;
}

export const WInvoke = {
    /**
     * ウィンドウを閉じたのち、Ctrl+Vを押します。
     * @param enter ペースト後にEnterを押すか
     */
    async paste(enter: boolean=false) {
        await invoke("paste", {enter});
    },

    /**
     * PCの起動時間を取得します。
     * @returns 秒
     */
    async getSystemUptime(): Promise<number> {
        return await invoke("get_system_uptime");
    },

    /**
     * 全てのディスクの情報を取得します。
     * @returns 取得した全てのディスク情報
     */
    async getAllDiskInfo(): Promise<DiskInfo[]> {
        return await invoke("get_all_disk_info");
    },

    /**
     * インストールされているWindowsHotfixを取得します。
     * @returns 取得したHotfixリスト
     */
    async getWindowsHotfix(): Promise<{HotFixID: string}[]> {
        const data = await invoke("get_windows_hotfix");
        return JSON.parse(data as string);
    },

    /**
     * ファイルのアイコンをBase64で取得します。
     * @param mime mineタイプを先頭につける
     * @returns base64
     */
    async getFileIconBase64(path: string, size=32, mime: boolean=true): Promise<string> {
        const base64 = await invoke("get_file_icon_base64", {path: path, size: size}) as string;
        return (mime ? "data:image/png;base64," : String.empty) + base64;
    },

    /**
     * パスがディレクトリか判別します。
     * @param path 判別したいパス
     * @returns ディレクトリであればtrue
     */
    async isDirectory(path: string): Promise<boolean> {
        return await invoke("is_directory", {path: path});
    },

    /**
     * ファイルを実行します。
     * @param path 実行するファイル
     * @param args 実行引数
     * @returns エラーまたは成功
     */
    async runExe(path: string, args?: string): Promise<string> {
        return await invoke("run_exe", {path: path, args: args ?? String.empty});
    },
}
