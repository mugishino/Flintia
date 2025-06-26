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
         */
        remove(index: number): void;
    }
}
Array.prototype.remove = function(index: number) {
    this.splice(index, 1);
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
