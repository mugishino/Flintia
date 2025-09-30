export {};

declare global {
    interface Map<K, V> {
        /**
         * データを全て処理し、配列として返します。
         * @param call データ処理内容
         */
        map<T>(call: (k: K, v: V) => T): T[];
    }
}

Map.prototype.map = function<K, V, T>(call: (k: K, v: V) => T) {
    const result: T[] = [];
    this.forEach((v, k) => result.push(call(k, v)));
    return result;
}
