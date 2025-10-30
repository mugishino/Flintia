import { invoke } from "@tauri-apps/api/core";

export const WInvoke = {
    /**
     * ウィンドウを閉じたのち、Ctrl+Vを押します。
     * @param enter ペースト後にEnterを押すか
     */
    async paste(enter: boolean=false) {
        await invoke("paste", {enter});
    },

    /**
     * エクスプローラーを開きます。
     * @param path 開くパス
     */
    async openExplorer(path: string) {
        await this.runProcess("explorer", path);
    },

    /**
     * プロセスを起動します。終了を待ちません。
     * @param file 実行ファイル
     * @param args 引数リスト(ファイルパス等のクオーテーション禁止)
     */
    async runProcess(file: string, ...args: string[]) {
        await invoke("run_process", {file: file, args: args});
    },

    /**
     * PCの起動時間を取得します。
     * @returns 秒
     */
    async getSystemUptime(): Promise<number> {
        return await invoke("get_system_uptime");
    },

    /**
     * コマンドが存在するか確認します。
     * @param cmd 存在を確認するコマンド
     * @returns 存在すればtrue
     */
    async commandExists(cmd: string): Promise<boolean> {
        return await invoke("command_exists", {cmd: cmd});
    },
}
