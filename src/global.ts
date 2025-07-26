export {}; // モジュール扱いにする

declare global {
    interface StringConstructor {
        empty: string;
        space: string;
    }

    interface String {
        inject: (text: string, pos: number) => string;
    }
}
String.empty = "";
String.space = " ";

String.prototype.inject = function(text: string, pos: number) {
    const x = this.slice(0, pos);
    const y = this.slice(pos);
    return x + text + y;
}



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
         * @param index マイナス値も使用可能
         */
        get(index: number): T;
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



declare global {
    interface Math {
        /**
         * 小数点台digit位以下の値を切り捨てます。
         * @param value 切り捨て元の数字
         * @param digit 残す小数点桁数
         */
        floorEx(value: number, digit: number): void;
    }
}
Math.floorEx = function(value: number, digit: number) {
    const x = 10**digit;
    return Math.floor(value*x)/x;
}
