import { invoke } from "@tauri-apps/api/core";

export class WInvoke {
    public static async show() {
        await invoke("show");
    }

    public static async hide() {
        await invoke("hide");
        location.reload();
    }
}
