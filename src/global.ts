export {}; // モジュール扱いにする

declare global {
    interface StringConstructor {
        empty: string;
        space: string;
    }
}
String.empty = "";
String.space = " ";



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



declare global {
    interface Number {
        /**
         * 数値を整数にします。
         */
        toInt(): number;
    }
}
Number.prototype.toInt = function() {
    return Math.trunc(this.valueOf());
}
