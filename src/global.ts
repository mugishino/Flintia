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
        /**
         * 数値がNaNだった場合にデフォルトの値を返します。
         */
        orDefault(default_: number): number;
    }
}
Number.prototype.toInt = function() {
    return Math.trunc(this.valueOf());
}
Number.prototype.orDefault = function(default_: number) {
    return isNaN(this.valueOf()) ? default_ : this.valueOf();
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



declare global {
    interface JSON {
        /**
         * JSON文字列をMapにします。
         * 内部でJSON.parseを使用しています。
         * 正確な型は保証されません。
         * @param stringJson 変換するJSON文字列
         */
        toMap<KT, VT>(stringJson: string): Map<KT, VT>;
    }
}
JSON.toMap = function<KT, VT>(stringJson: string) {
    const raw = JSON.parse(stringJson);
    const obj = Object.entries(raw);
    return new Map<KT, VT>(obj as any);
}
