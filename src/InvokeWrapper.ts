import { invoke } from "@tauri-apps/api/core";

export const WInvoke = {
    /**
     * ウィンドウを閉じたのち、Ctrl+Vを押します。
     */
    async paste() {
        await invoke("paste");
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
     * @param args 引数
     */
    async runProcess(file: string, ...args: string[]) {
        await invoke("run_process", {file: file, args: args});
    },
}
