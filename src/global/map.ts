import { Pair } from "~/util/class/Pair";

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

        /**
         * このMapにそのkeyが存在するか確認します。
         * @param key 存在を確認するキー
         * @returns 存在していればtrue
         */
        containsKey(key: unknown): boolean;

        /**
         * 値からKeyを逆引きします。
         * @param value キーを探す値
         */
        reverseLookup(value: V): K|undefined;

        /**
         * 条件式がtrueであれば値をsetします。
         * @param key 設定するキー
         * @param value 設定する値
         * @param conditional 条件式
         */
        setIf(key: K, value: V, conditional: boolean): this;
    }

    interface MapConstructor {
        /**
         * 連想配列からMapオブジェクトを作ります。
         * @param data 連想配列
         */
        fromObject<T extends Record<string|number|symbol, any>>(data: T): Map<string, T[keyof T]>;

        /**
         * マップを作成します。new Map().set()のチェーンより高度な作成が可能です。
         * @param proc 作成処理
         */
        create<K, V>(proc: (map: Map<K, V>) => void): Map<K, V>;
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

Map.prototype.containsKey = function(key: unknown) {
    return this.keys().toArray().contains(key);
}

Map.prototype.reverseLookup = function<V>(value: V) {
    for (const [k, v] of this.entries()) {
        if (value == v) return k;
    }
    return undefined;
}

Map.prototype.setIf = function<K, V>(key: K, value: V, conditional: boolean) {
    if (conditional) {
        this.set(key, value);
    }
    return this;
}

Map.fromObject = function<T extends Record<string | number | symbol, any>>(data: T): Map<string, T[keyof T]> {
    return new Map(Object.entries(data));
}

Map.create = function<K, V>(proc: (map: Map<K, V>) => void) {
    const map = new Map<K, V>();
    proc(map);
    return map;
}
