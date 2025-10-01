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
    }
}

String.empty = "";
String.space = " ";

String.prototype.insert = function(text: string, pos: number) {
    const x = this.slice(0, pos);
    const y = this.slice(pos);
    return x + text + y;
}
