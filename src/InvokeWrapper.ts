import { invoke } from "@tauri-apps/api/core";

export class WInvoke {
    public static async show() {
        await invoke("show");
    }

    public static async hide() {
        await invoke("hide");
    }

    public static async paste() {
        await invoke("paste");
    }

    // 互換性維持のために残してください
    public static async openExplorer(path: string) {
        await this.runProcess("explorer", path);
    }

    public static async runProcess(file: string, ...args: string[]) {
        await invoke("run_process", {file: file, args: args});
    }
}
