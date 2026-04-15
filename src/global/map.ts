export {};

declare global {
    interface Map<K, V> {
        /**
         * データを全て処理し、配列として返します。
         * @param call データ処理内容
         */
        map<T>(call: (k: K, v: V) => T): T[];

        /**
         * データをJson文字列にします。
         * @returns json文字列
         */
        toJson(space?: number): string;

        /**
         * 値をフィルターして返します。
         * @param call trueが返れば保持、falseが返ればなし
         */
        filter(call: (k: K, v: V) => boolean): Map<K, V>;
    }
}

Map.prototype.map = function<K, V, T>(call: (k: K, v: V) => T) {
    const result: T[] = [];
    this.forEach((v, k) => result.push(call(k, v)));
    return result;
}

Map.prototype.toJson = function(space?: number) {
    return JSON.stringify(Object.fromEntries(this), undefined, space);
}

Map.prototype.filter = function<K, V>(call: (k: K, v: V) => boolean) {
    const result = new Map<K, V>();
    this.forEach((v, k) => {
        const r = call(k, v);
        if (r) result.set(k, v);
    });
    return result;
}
