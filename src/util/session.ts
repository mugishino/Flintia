/**
 * sessionStorageのラッパー
 */
export namespace SessionData {
    /**
     * キーが存在するか確認します。
     * @param key 存在を確認するキー
     * @returns 存在していた場合true
     */
    export function exists(key: string) {
        return sessionStorage.getItem(key) != null;
    }

    /**
     * 値を設定します。
     * @param key 取得する際に使用するキー
     * @param value 自動でJSONにパースされます
     */
    export function set(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * 値を取得します。
     * ジェネリクスは型補完を補助するものであり、型を保証するものではありません。
     * @param key 取得したいデータのキー
     * @returns 取得したデータ。見つからなかった場合undefined
     */
    export function get<T = any>(key: string): T|undefined {
        const data = sessionStorage.getItem(key);
        if (data == null) return undefined;

        const json = JSON.parse(data);
        return json;
    }



    export function setIfAbsent(key: string, value: any) {
        if (exists(key)) return;
        set(key, value);
    }
}
