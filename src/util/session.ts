/**
 * sessionStorageのラッパー
 */
export class SessionData {
    /**
     * キーが存在するか確認します。
     * @param key 存在を確認するキー
     * @returns 存在していた場合true
     */
    public static exists(key: string) {
        return sessionStorage.getItem(key) != null;
    }

    /**
     * 値を設定します。
     * @param key 取得する際に使用するキー
     * @param value 自動でJSONにパースされます
     */
    public static set(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * 値を取得します。
     * ジェネリクスは型補完を補助するものであり、型を保証するものではありません。
     * @param key 取得したいデータのキー
     * @returns 取得したデータ。見つからなかった場合undefined
     */
    public static get<T = any>(key: string): T|undefined {
        const data = sessionStorage.getItem(key);
        if (data == null) return undefined;

        const json = JSON.parse(data);
        return json;
    }



    /**
     * キーが存在していた場合なにもしません。でなければ、キーと値を設定します。
     * @param key 確認・設定するキー
     * @param value 設定する値
     * @returns データがあった場合falseが戻り、データが無く新しくセットされた場合trueが戻ります。
     */
    public static setIfAbsent(key: string, value: any): boolean {
        if (SessionData.exists(key)) return false;
        SessionData.set(key, value);
        return true;
    }
}
