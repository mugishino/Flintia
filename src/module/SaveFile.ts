import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Logger } from "./Logger";
import { getAppdataDirFile, Paths } from "~/util/path";

export interface Savedata {
    /**
     * "config.json"のような形で指定した場合、"%AppData%\<App>\config.json"の形になります。
     */
    filename: string;
}

export class SaveFile<T extends Savedata> {
    private data: T;
    constructor(data: T) {
        this.data = data;
    }

    /**
     * このアプリのセーブデータを読み込みます。
     * @param fallback デフォルトデータを入れてください。ファイル名はこのオブジェクトから取得されます。
     * @returns 読み込まれたデータ
     */
    public static async load<T extends Savedata>(fallback: T): Promise<SaveFile<T>> {
        const file = await getAppdataDirFile(fallback.filename);

        if (await Paths.notExists(file)) {
            await writeTextFile(file, JSON.stringify(fallback, undefined, 4));
            return new SaveFile(fallback);
        }
        const raw = await readTextFile(file);
        try {
            const json = JSON.parse(raw);
            const result = Object.assign(fallback, json);
            return new SaveFile(result);
        } catch (e) {
            Logger.error("Failed to parse json file: " + file);
            throw e;
        }
    }

    /**
     * データを編集します。
     * @param fn 操作
     * @returns チェーン用
     */
    public edit(fn: (data: T) => void) {
        fn(this.data);
        return this;
    }

    /**
     * このデータを保存します。
     */
    public async save() {
        const file = await getAppdataDirFile(this.data.filename);
        await writeTextFile(file, JSON.stringify(this.data, undefined, 4));
    }

    /**
     * データを読み取ります。
     * structuredCloneした物なので変形しても問題ありません。
     */
    public read() {
        return structuredClone(this.data);
    }



    private listenerId = 0;
    private listener = new Map<number, (data: T) => void>();
    /**
     * データ編集時に実行される関数を追加します。
     * @param fn 追加する関数
     * @returns 削除用id
     */
    public addEditListener(fn: (data: T) => void) {
        const id = this.listenerId++;
        this.listener.set(id, fn);
        return id;
    }

    /**
     * データ編集時に実行される関数を削除します。
     * @param id 削除するlistenerのid
     */
    public removeEditListener(id: number) {
        this.listener.delete(id);
    }
}
