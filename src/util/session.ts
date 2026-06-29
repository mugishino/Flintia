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
        return this.setIfAbsentFn(key, () => value);
    }

    /**
     * キーが存在していた場合なにもしません。でなければ、キーに値取得関数の戻り値を設定します。
     * @param key 確認・設定するキー
     * @param value 値取得関数
     * @returns データがあった場合falseが戻り、データが無く新しくセットされた場合trueが戻ります。
     */
    public static setIfAbsentFn(key: string, valueFn: () => any): boolean {
        if (SessionData.exists(key)) return false;
        SessionData.set(key, valueFn());
        return true;
    }

    /**
     * キーが存在していた場合なにもしません。でなければ、キーに値取得関数の戻り値を設定します。
     * @param key 確認・設定するキー
     * @param value 非同期の値取得関数
     * @returns データがあった場合falseが戻り、データが無く新しくセットされた場合trueが戻ります。
     */
    public static async setIfAbsentFnAsync(key: string, valueFn: () => Promise<any>): Promise<boolean> {
        if (SessionData.exists(key)) return false;
        SessionData.set(key, await valueFn());
        return true;
    }

    /**
     * キーが存在していた場合はそのキーの値を戻します。でなければ、デフォルトの値を設定します。
     * ジェネリクスは型保管補助であり、正確性は保証しません。
     * @param key 取得・設定するキー
     * @param fallback データが存在しなかった場合に設定する値
     * @returns 取得したデータまたはデフォルトの値
     */
    public static getOrPut<T>(key: string, fallback: T): T {
        const data = SessionData.get(key);
        if (data) return data;
        SessionData.set(key, fallback);
        return fallback;
    }

    /**
     * キーが存在していた場合はそのキーの値を戻します。でなければ、デフォルトの値を関数から取得して設定します。
     * ジェネリクスは型保管補助であり、正確性は保証しません。
     * @param key 取得・設定するキー
     * @param fallback データが存在しなかった場合に設定する値を取得する関数
     * @returns 取得したデータまたはデフォルトの値
     */
    public static getOrPutFn<T>(key: string, fallback: () => T): T {
        const data = SessionData.get(key);
        if (data) return data;
        const fb = fallback();
        SessionData.set(key, fb);
        return fb;
    }

    /**
     * キーが存在していた場合はそのキーの値を戻します。でなければ、デフォルトの値を非同期関数から取得して設定します。
     * ジェネリクスは型保管補助であり、正確性は保証しません。
     * @param key 取得・設定するキー
     * @param fallback データが存在しなかった場合に設定する値を取得する非同期関数
     * @returns 取得したデータまたはデフォルトの値
     */
    public static async getOrPutFnAsync<T>(key: string, fallback: () => Promise<T>): Promise<T> {
        const data = SessionData.get(key);
        if (data) return data;
        const fb = await fallback();
        SessionData.set(key, fb);
        return fb;
    }
}
