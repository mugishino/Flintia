import { invoke } from "@tauri-apps/api/core";

export const WInvoke = {
    async show() {
        await invoke("show");
    },

    async hide() {
        await invoke("hide");
    },

    async paste() {
        await invoke("paste");
    },

    // 互換性維持のために残してください
    async openExplorer(path: string) {
        await this.runProcess("explorer", path);
    },

    async runProcess(file: string, ...args: string[]) {
        await invoke("run_process", {file: file, args: args});
    },
}
