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
     * @param args 引数
     */
    async runProcess(file: string, ...args: string[]) {
        await invoke("run_process", {file: file, args: args});
    },
}
