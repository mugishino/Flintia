export {};

declare global {
    interface Array<T> {
        /**
         * 破壊的に配列からデータを削除します。
         * @param index 配列から削除するデータのインデックス
         * @returns 削除した値
         */
        remove(index: number): T;
        /**
         * xとyの値を交換します。
         * @param x 交換する値1
         * @param y 交換する値2
         */
        swap(x: number, y: number): void;
        /**
         * indexの位置に値を追加します。
         * @param index 追加位置
         * @param value 追加する値
         */
        insert(index: number, value: T): void;
        /**
         * データをインデックスから取得します。
         * 空配列から取得しようとした場合、undefinedが返ります。
         * @param index マイナス値も使用可能
         */
        get(index: number): T|undefined;
        /**
         * 値が配列に含まれているかを確認します。readonly arrayでも使用できます。
         * @param value 含まれているか確認する値
         * @returns 含まれていればtrue
         */
        contains(value: unknown): boolean;
        /**
         * 配列からFalsyな値を削除します。
         */
        nullFilter(): NonNullable<T>[];
    }
}

Array.prototype.remove = function(index: number) {
    return this.splice(index, 1);
}

Array.prototype.swap = function(x: number, y: number) {
    [this[x], this[y]] = [this[y], this[x]];
}

Array.prototype.insert = function<T>(index: number, value: T) {
    this.splice(index, 0, value);
}

Array.prototype.get = function(index: number) {
    const array = [...this];
    return array.splice(index)[0];
}

Array.prototype.contains = function(value: unknown) {
    for (const v of this) {
        if (v == value) return true;
    }
    return false;
}

Array.prototype.nullFilter = function() {
    return this.filter(v => !!v);
}
