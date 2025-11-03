import { invoke } from "@tauri-apps/api/core";

type DiskInfo = {
    name: string,
    total_size: number,
    available_space: number,
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
}
