import { Pair } from "~/util/clazz";

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

        /**
         * Mapをソートします。
         * @param call ソートメソッド
         */
        sort(call: (a: Pair<K, V>, b: Pair<K, V>) => number): Map<K, V>;

        /**
         * このMapが空かどうか
         * @returns 空ならtrue
         */
        isEmpty(): boolean;

        /**
         * 値があればそれを取得し、なければデフォルト値を挿入してそれを返します。
         * @param key 取得または挿入するキー
         * @param put 負荷軽減のため遅延生成
         */
        getOrPut(key: K,put: () => V): V;
    }

    interface MapConstructor {
        /**
         * 連想配列からMapオブジェクトを作ります。
         * @param data 連想配列
         */
        fromObject<T extends Record<string|number|symbol, any>>(data: T): Map<string, T[keyof T]>;
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

Map.prototype.sort = function<K, V>(call: (a: Pair<K, V>, b: Pair<K, V>) => number) {
    const data = this.map((k, v) => new Pair(k, v));
    const sorted = data.sort((a, b) => call(a, b));

    const result = new Map<K, V>();
    sorted.forEach(v => result.set(v.left, v.right));
    return result;
}

Map.prototype.isEmpty = function() {
    return this.size == 0;
}

Map.prototype.getOrPut = function<K, V>(key: K, put: () => V) {
    const data = this.get(key);
    if (data) return data;
    const gen = put();
    this.set(key, gen);
    return gen;
}

Map.fromObject = function<T extends Record<string | number | symbol, any>>(data: T): Map<string, T[keyof T]> {
    return new Map(Object.entries(data));
}
