import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, Paths } from "./util/path";

export interface AppSavedata {
    /**
     * "config.json"のような形で指定した場合、"%AppData%\<App>\config.json"の形になります。
     */
    filename: string;
}

export namespace AppStorage {
    /**
     * このアプリのセーブデータを読み込みます。
     * @param fallback デフォルトデータを入れてください。ファイル名はこのオブジェクトから取得されます。
     * @returns 読み込まれたデータ
     */
    export async function load<T extends AppSavedata>(fallback: T): Promise<T> {
        const file = await getAppdataDirFile(fallback.filename);

        if (await Paths.notExists(file)) {
            await writeTextFile(file, JSON.stringify(fallback, undefined, 4));
            return fallback;
        }
        const raw = await readTextFile(file);
        const json = JSON.parse(raw);
        const result = Object.assign(fallback, json);
        return result;
    }

    /**
     * このアプリのセーブデータを保存します。
     * @param data 保存するデータ
     */
    export async function save(data: AppSavedata) {
        const file = await getAppdataDirFile(data.filename);
        await writeTextFile(file, JSON.stringify(data, undefined, 4));
    }
}
