import { invoke } from "@tauri-apps/api/core";

export class WInvoke {
    public static async Show() {
        await invoke("show");
    }
}
