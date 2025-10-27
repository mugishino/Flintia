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
        contains: <T extends string>(this: T, ...arg: ReadonlyArray<T>) => boolean;

        /**
         * 条件式が全てtrueなら文字列をそのまま返し、違うならundefinedを返します。
         * @param v 条件式
         * @returns 文字列またはundefined
         */
        where: <T extends string>(this: T, ...v: boolean[]) => T|undefined;
    }
}

String.empty = "";
String.space = " ";

String.prototype.insert = function(text: string, pos: number) {
    const x = this.slice(0, pos);
    const y = this.slice(pos);
    return x + text + y;
}

String.prototype.contains = function(this, ...arg) {
    return arg.includes(this);
}

String.prototype.where = function(this, ...v) {
    return !v.includes(false) ? this : undefined;
}
