export {};

declare global {
    interface StringConstructor {
        empty: string;
        space: string;
    }

    interface String {
        /**
         * 文字列を指定の位置に差し込みます。
         * @param text 差し込む文字列
         * @param pos 位置
         * @returns 文字列を差し込んだ文字列
         */
        insert: (text: string, pos: number) => string;

        /**
         * 値が含まれるか確認します。
         * @param this 型拡張補完用(使用側では出ない)
         * @param arg 確認リスト
         * @returns 含まれる場合true
         */
        include: <T extends string>(this: T, ...arg: ReadonlyArray<T>) => boolean
    }
}

String.empty = "";
String.space = " ";

String.prototype.insert = function(text: string, pos: number) {
    const x = this.slice(0, pos);
    const y = this.slice(pos);
    return x + text + y;
}

String.prototype.include = function(this, ...arg) {
    return arg.includes(this);
}
