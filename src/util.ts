import { exists } from "@tauri-apps/plugin-fs";

export async function notExists(path: string) {
    return !(await exists(path));
}
